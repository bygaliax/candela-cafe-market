"""Comprueba el QR de la carta leyéndolo de verdad, como pide el estándar de QR de Galiax (cerebro: procesos/qr-codes).

python qr/verificar.py             → lee los 9 archivos de qr/ (SVG y PDF pintados con MuPDF, PNG tal cual) con los dos
                                      lectores de OpenCV, a tamaños grandes (hasta 2050 px: un móvil no analiza
                                      fotogramas mayores de 1920) y degradados, y mira que los PDF sean vectoriales y
                                      de 60 mm. Sale con 1 si algo falla.
python qr/verificar.py --mascaras  → puntúa las 8 máscaras de cada versión con las mismas pruebas, para elegir MASK.
El tercer lector, jsQR, va aparte: node qr/verificar-jsqr.mjs, y qr/verificar.html en Chrome.
"""
import sys
from pathlib import Path

import cv2
import fitz  # PyMuPDF
import numpy as np

from generar import N, QUIET, URL, VARIANTES, matriz

HERE = Path(__file__).resolve().parent
LECTORES = {"opencv": cv2.QRCodeDetector(), "aruco": cv2.QRCodeDetectorAruco()}
GRANDES = (410, 600, 820, 1000, 1230, 1435, 1640, 1845, 2050)  # un móvil analiza fotogramas de ≤1920 px
S = N + 2 * QUIET


def lee(img):
    """Qué lectores leen la URL exacta. Si alguno lee otra cosa, falla en el acto."""
    out = {}
    for nombre, d in LECTORES.items():
        try:
            txt = d.detectAndDecode(img)[0]
        except cv2.error:
            txt = ""
        assert txt in ("", URL), f"{nombre} leyó otra cosa: {txt!r}"
        out[nombre] = txt == URL
    return out


def pinta(path, px):
    pg = fitz.open(path)[0]
    z = px / pg.rect.width
    pix = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False, colorspace=fitz.csGRAY)
    return np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width).copy()


def desde_matriz(M, hueco, px=8):
    img = np.array([[255 if (not v or hueco(r, c)) else 0 for c, v in enumerate(fila)] for r, fila in enumerate(M)], np.uint8)
    return np.kron(np.pad(img, QUIET, constant_values=255), np.ones((px, px), np.uint8))


def degradaciones(base, semilla=7):
    """El QR como lo vería un móvil: pequeño, borroso, en JPEG, girado, en perspectiva, con ruido o con poca luz."""
    rs = lambda im, s: cv2.resize(im, (s, s), interpolation=cv2.INTER_AREA)
    jpg = lambda im, q: cv2.imdecode(cv2.imencode(".jpg", im, [cv2.IMWRITE_JPEG_QUALITY, q])[1], cv2.IMREAD_GRAYSCALE)
    rng = np.random.default_rng(semilla)
    for s in (164, 123, 110, 103, 96, 90):
        yield f"pequeño {s}px", rs(base, s)
    for s in (164, 123):
        for k in (3, 5):
            yield f"desenfoque k{k} a {s}px", cv2.GaussianBlur(rs(base, s), (k, k), 0)
        yield f"desenfoque y JPEG a {s}px", jpg(cv2.GaussianBlur(rs(base, s), (3, 3), 0), 25)
    p = cv2.copyMakeBorder(base, 60, 60, 60, 60, cv2.BORDER_CONSTANT, value=255)
    h, w = p.shape
    for ang in (15, 45, 90):
        yield f"giro {ang}°", rs(cv2.warpAffine(p, cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1), (w, h), borderValue=255), 220)
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    for i in range(8):  # perspectiva, giro y tamaño al azar, como un móvil mal apuntado
        j = rng.uniform(0, 0.12, (4, 2)) * [w, h]
        dst = np.float32([[j[0][0], j[0][1]], [w - j[1][0], j[1][1]], [w - j[2][0], h - j[2][1]], [j[3][0], h - j[3][1]]])
        im = cv2.warpPerspective(p, cv2.getPerspectiveTransform(src, dst), (w, h), borderValue=255)
        im = cv2.warpAffine(im, cv2.getRotationMatrix2D((w / 2, h / 2), rng.uniform(-40, 40), 1), (w, h), borderValue=255)
        im = cv2.GaussianBlur(rs(im, int(rng.uniform(150, 230))), (3, 3), rng.uniform(0.4, 1.1))
        im = np.clip(im.astype(np.float32) * rng.uniform(.55, 1) + rng.normal(0, 18, im.shape) + rng.uniform(0, 70), 0, 255)
        yield f"móvil al azar {i + 1}", im.astype(np.uint8)
    for s in (164, 123):
        b = rs(base, s)
        yield f"ruido a {s}px", np.clip(b.astype(np.int16) + rng.normal(0, 45, b.shape), 0, 255).astype(np.uint8)
        yield f"poca luz a {s}px", (b.astype(np.float32) * .4 + 130).astype(np.uint8)


def puntua(M, hueco):
    """Lecturas buenas en las degradaciones (3 semillas, 2 lectores) y tamaños grandes y nítidos que no se leen."""
    base = desde_matriz(M, hueco)
    imgs = [im for s in (7, 11, 23) for _, im in degradaciones(base, s)]
    buenas = sum(sum(lee(im).values()) for im in imgs)
    fallan = [px for px in GRANDES if not all(lee(cv2.resize(desde_matriz(M, hueco, max(1, round(px / S))), (px, px),
                                                             interpolation=cv2.INTER_NEAREST)).values())]
    return buenas, 2 * len(imgs), fallan


def mascaras():
    print(f"URL: {URL}")
    for nombre, hueco in VARIANTES:
        print(f"\n{nombre}")
        for m in range(8):
            buenas, total, fallan = puntua(matriz(m), hueco)
            print(f"  máscara {m}: {buenas}/{total} lecturas degradadas · grandes que fallan: {fallan or 'ninguno'}")
    print("\nRegla: la que no falle en ningún tamaño grande en las tres versiones y, entre esas, la que más lecturas "
          "sume en las dos versiones con hueco.")


def verificar():
    fallos = 0
    for nombre, _ in VARIANTES:
        for ext, px in (("svg", 1200), ("svg", 410), ("pdf", 1200), ("pdf", 300)):
            ok = all(lee(pinta(HERE / f"{nombre}.{ext}", px)).values())
            fallos += not ok
            print(f"  {'OK ' if ok else 'MAL'} {nombre}.{ext} a {px} px")
        ok = all(lee(cv2.imread(str(HERE / f"{nombre}.png"), cv2.IMREAD_GRAYSCALE)).values())
        fallos += not ok
        print(f"  {'OK ' if ok else 'MAL'} {nombre}.png")
        grandes = [px for px in GRANDES if not all(lee(pinta(HERE / f"{nombre}.svg", px)).values())]
        fallos += bool(grandes)
        print(f"  {'OK ' if not grandes else 'MAL'} {nombre}.svg grande y nítido, de 410 a 2460 px"
              f"{f': fallan {grandes}' if grandes else ''}")
        degr = list(degradaciones(pinta(HERE / f"{nombre}.svg", 8 * S)))
        print(f"  ··· {nombre}: {sum(any(lee(im).values()) for _, im in degr)} de {len(degr)} degradadas leídas por algún lector")
        doc = fitz.open(HERE / f"{nombre}.pdf")
        pg = doc[0]
        ok = len(doc) == 1 and abs(pg.rect.width / 72 * 25.4 - 60) < 0.01 and not pg.get_images() and bool(pg.get_drawings())
        fallos += not ok
        print(f"  {'OK ' if ok else 'MAL'} {nombre}.pdf: 1 página de 60 mm, vectorial")
    print(f"\nFALLOS: {fallos}")
    return fallos


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if "--mascaras" in sys.argv:
        mascaras()
    else:
        sys.exit(1 if verificar() else 0)

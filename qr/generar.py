"""QR de la carta de Candela y Café: https://menu.candelaycafe.com (la carta de menu-qr/), según el
estándar de QR de Galiax (cerebro: procesos/qr-codes). Adaptado del de Vitalis (vitalis-animal-hospital/qr/generar.py).

Va impreso en el local, así que la URL no puede cambiar nunca: el sitio de Netlify «candela-cafe-menu» no puede
perder el dominio, ni Squarespace el registro DNS «menu». Lo vigila tests/qr-menu.test.mjs. Se comprueba leyéndolo
con qr/verificar.py, qr/verificar-jsqr.mjs y qr/verificar.html.

Genera en esta carpeta, cada uno en .svg y .pdf (vectoriales; el PDF mide 60 mm) y .png (2050 px):
- qr-candela-menu-bn: el QR limpio, en negro sobre blanco.
- qr-candela-menu-hueco-cuadrado: con el centro en blanco para el logo (9x9 módulos).
- qr-candela-menu-hueco-circular: lo mismo con un círculo de radio 5 sin sus 4 puntas (77 módulos).
Uso: python qr/generar.py

Corrección H: la URL cabe en la versión 4 (33x33), con 4 bloques que corrigen 8 codewords cada uno;
los huecos pisan como mucho 5 por bloque. Máscara 1 fija en las tres, que así son el mismo dibujo.
Elegida el 2026-10-09 para https://menu.candelaycafe.com con `python qr/verificar.py --mascaras` (los
dos lectores de OpenCV; degradaciones con 3 semillas y tamaños grandes y nítidos de 410 a 2460 px):
- Es la que más lee degradada en las tres versiones: 138/162 sin hueco y 111/162 con cada hueco. La 4,
  la única que no falla en ningún tamaño grande, se queda en 131, 78 y 96.
- Sin hueco no falla en ningún tamaño. Con hueco, OpenCV no la lee a 2460 px (60 px por módulo), un
  tamaño que no cabe en el fotograma que analiza un móvil (≤1920 px); hasta 2050 px la lee siempre.
  La 2, que valía para la URL anterior, aquí falla ya a 1435 px.
- Elegirla por los codewords que estropea el hueco no sirve: escoge de las peores. jsQR lee igual
  todas las máscaras.
"""
from pathlib import Path

import fitz  # PyMuPDF
import qrcode
from qrcode.constants import ERROR_CORRECT_H

URL = "https://menu.candelaycafe.com"
MASK = 1  # ver arriba
QUIET = 4  # margen blanco estándar, en módulos
HERE = Path(__file__).resolve().parent
N = 33  # módulos de la versión 4
C = N / 2
S = N + 2 * QUIET


def cuadrado(r, c):
    return 12 <= r < 21 and 12 <= c < 21  # 9x9 módulos


def circular(r, c):  # sin las 4 puntas del círculo: con ellas, el bloque 0 pierde 6 de 8
    return cuadrado(r, c) and (r + 0.5 - C) ** 2 + (c + 0.5 - C) ** 2 <= 25


def nada(r, c):
    return False


VARIANTES = [  # nombre, hueco
    ("qr-candela-menu-bn", nada),
    ("qr-candela-menu-hueco-cuadrado", cuadrado),
    ("qr-candela-menu-hueco-circular", circular),
]


def is_function(r, c):
    return (
        (r < 9 and c < 9) or (r < 9 and c >= N - 8) or (r >= N - 8 and c < 9)
        or r == 6 or c == 6 or (24 <= r <= 28 and 24 <= c <= 28)
    )


# Orden de colocación de los bits de datos (ISO 18004, v4): dice qué codeword cae en cada módulo.
ORDER, col, up = [], N - 1, True
while col > 0:
    if col == 6:
        col -= 1
    for r in range(N - 1, -1, -1) if up else range(N):
        ORDER += [(r, c) for c in (col, col - 1) if not is_function(r, c)]
    up, col = not up, col - 2
CODEWORD = {rc: i // 8 for i, rc in enumerate(ORDER[:800])}  # 100 codewords; el resto son relleno


def por_bloque(codewords):  # v4-H: 4 bloques de 9 codewords de datos + 16 de corrección, intercalados
    cuenta = [0] * 4
    for k in codewords:
        cuenta[k % 4 if k < 36 else (k - 36) % 4] += 1
    return cuenta


def matriz(mask=MASK):
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=0, mask_pattern=mask)
    q.add_data(URL)
    q.make(fit=True)
    assert q.version == 4, "el cálculo de bloques es el de la versión 4-H"
    return q.get_matrix()


def dano(M, hueco):  # codewords que pierden algún módulo negro bajo el hueco, por bloque
    return por_bloque({k for rc, k in CODEWORD.items() if hueco(*rc) and M[rc[0]][rc[1]]})


def generar():
    for nombre, hueco in VARIANTES:
        M = matriz()
        if hueco is not nada:
            peor = por_bloque({k for rc, k in CODEWORD.items() if hueco(*rc)})
            assert max(peor) <= 5, peor
            print(f"{nombre}: el hueco estropea {dano(M, hueco)} codewords por bloque "
                  f"(peor caso {peor}; cada bloque corrige 8)")

        runs = []
        for r, row in enumerate(M):
            c = 0
            while c < N:
                if row[c] and not hueco(r, c):
                    start = c
                    while c < N and row[c] and not hueco(r, c):
                        c += 1
                    runs.append(f"M{start + QUIET} {r + QUIET}h{c - start}v1h-{c - start}z")
                else:
                    c += 1

        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S * 10}" height="{S * 10}">\n'
            f"<title>Candela y Café Market - carta - {URL}</title>\n"
            f'<rect width="{S}" height="{S}" fill="#FFFFFF"/>\n'
            f'<path fill="#000000" shape-rendering="crispEdges" d="{"".join(runs)}"/>\n'
            "</svg>\n"
        )
        out = HERE / nombre
        out.with_suffix(".svg").write_text(svg, encoding="utf-8", newline="\n")

        doc = fitz.open(out.with_suffix(".svg"))
        doc[0].get_pixmap(matrix=fitz.Matrix(5, 5), alpha=False).save(out.with_suffix(".png"))  # 410 pt x 5
        pdf = fitz.open()
        side = 60 / 25.4 * 72  # 60 mm
        page = pdf.new_page(width=side, height=side)
        page.show_pdf_page(page.rect, fitz.open("pdf", doc.convert_to_pdf()), 0)
        pdf.set_metadata({"title": f"QR {URL}", "author": "Galiax"})
        pdf.save(out.with_suffix(".pdf"))


if __name__ == "__main__":
    generar()

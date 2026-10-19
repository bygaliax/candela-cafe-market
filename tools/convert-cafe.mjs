// Fotos del Coffee Bar (PDF «Candela Coffee Bar» del cliente, 19-oct) → WebP 4:3 en web/assets/img.
// Las 18 salen de la hoja de 1024×1536 que lleva el PDF: 3 columnas y 6 filas de alto desigual. Qué celda es cada
// bebida se sacó de los recortes del propio PDF (no del orden de la hoja) y se comprobó a ojo. Son ilustrativas.
// Originales en _material (fuera del repo).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/coffee-bar-2026-10-19';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const COLS = [0, 341, 683, 1024];
const ROWS = [0, 225, 448, 681, 913, 1167, 1536];
// [slug, fila, columna]
const CELLS = [
  ['cafe-americano', 0, 0], ['cafe-cappuccino', 0, 1], ['cafe-coffee-latte', 0, 2],
  ['cafe-colada', 1, 0], ['cafe-cortadito', 1, 1], ['cafe-double-espresso', 1, 2],
  ['cafe-espresso', 2, 0], ['cafe-hot-chocolate', 2, 1], ['cafe-iced-latte', 2, 2],
  ['cafe-macchiato', 3, 0], ['cafe-regular-tea', 3, 1], ['cafe-matcha-latte', 3, 2],
  ['cafe-strawberry-matcha', 4, 0], ['cafe-dirty-matcha', 4, 1], ['cafe-passion-matcha', 4, 2],
  ['cafe-pumpkin-spice-latte', 5, 0], ['cafe-pistachio-latte', 5, 1], ['cafe-dulce-de-leche-latte', 5, 2],
];
const INSET = 3; // las celdas se tocan: sin los 3 px del borde no entra el fondo de la vecina

for (const [slug, r, c] of CELLS) {
  const cell = { left: COLS[c] + INSET, top: ROWS[r] + INSET, width: COLS[c + 1] - COLS[c] - 2 * INSET, height: ROWS[r + 1] - ROWS[r] - 2 * INSET };
  const w43 = Math.round(cell.height * 4 / 3);
  // celda más ancha que 4:3: se recorta a lo ancho; en las 4 primeras filas, pegado a la derecha, porque el asa de la taza
  // queda a la derecha y la carta del QR enseña el cuadrado central. Más alta (los vasos de papel): se alarga el fondo.
  const left = cell.left + (r <= 3 ? cell.width - w43 : Math.floor((cell.width - w43) / 2));
  const crop = w43 <= cell.width ? { ...cell, left, width: w43 } : cell;
  const pad = Math.max(0, w43 - cell.width);
  const base = await sharp(path.join(SRC, 'coffee-bar-hoja.png')).extract(crop)
    .extend({ left: Math.floor(pad / 2), right: Math.ceil(pad / 2), extendWith: 'copy' })
    .toBuffer();
  for (const w of [480, 960]) {
    const info = await sharp(base).resize({ width: w, height: w * 3 / 4, fit: 'fill' }).webp({ quality: 76 })
      .toFile(path.join(OUT, `${slug}-${w}.webp`));
    console.log(`${slug}-${w}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}

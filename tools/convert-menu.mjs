// Fotos de la carta «Carta de papel» (2026-09-24) → WebP responsive en web/assets/img.
// Solo las nuevas: las demás ya las convirtió convert-un-dia.mjs y se reutilizan (spec del menú, §5.1).
// Originales en _material (fuera del repo). Solo genera anchos ≤ al original (sin ampliar).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/fotos-2026-09-24';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const IMAGES = {
  'menu-central-park-club': 'descargas-24-sep/01 (11).png',
  'menu-california-turkey': 'descargas-24-sep/01 (12).png',
  'menu-greek-salad':       'descargas-24-sep/01 (10).png',
  'menu-quesadilla':        'zip-18-sep/F-1.jpg',
  'menu-candela-burger':    'zip-18-sep/E-2.jpg',
  'menu-sopa':              'zip-18-sep/B-1.jpg',
};
const WIDTHS = [480, 960, 1440];

for (const [slug, rel] of Object.entries(IMAGES)) {
  const src = path.join(SRC, rel);
  const { width } = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then(r => r.info);
  for (const w of WIDTHS.filter(w => w <= width)) {
    const info = await sharp(src).rotate().resize({ width: w }).webp({ quality: 76 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
    console.log(`${slug}-${w}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}

// Fotos del rediseño «Un día en Candela» (2026-09-24) → WebP responsive en web/assets/img.
// Originales en _material (fuera del repo). Solo genera anchos ≤ al original (sin ampliar).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/fotos-2026-09-24';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const IMAGES = {
  'manana-fachada':         'descargas-24-sep/01 (2).png',
  'manana-tres-golpes':     'descargas-24-sep/01 (9).png',
  'manana-jugo':            'descargas-24-sep/01 (17).png',
  'manana-pastelitos':      'descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.08.jpeg',
  'mediodia-sancocho':      'descargas-24-sep/01 (14).png',
  'mediodia-mesa-caliente': 'descargas-24-sep/01 (7).png',
  'deli-ruben':             'zip-18-sep/A-1.jpg',
  'deli-candela-burger':    'zip-18-sep/E-1.jpg',
  'deli-chopped-cheese':    'zip-18-sep/D-1.jpg',
  'deli-chicken-panini':    'zip-18-sep/C-1.jpg',
  'noche-neon':             'descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.31.jpeg',
  'lugar-neon-sub':         'descargas-24-sep/01 (13).png',
  'lugar-terraza':          'descargas-24-sep/01 (16).png',
  'lugar-interior':         'descargas-24-sep/01 (15).png',
  'lugar-flan':             'descargas-24-sep/01 (18).png',
};
const WIDTHS = [480, 960, 1440];
// Los stickers se ven a ≤200 px: llevan además una variante de 240.
const STICKERS = new Set(['manana-tres-golpes', 'manana-jugo', 'manana-pastelitos']);

for (const [slug, rel] of Object.entries(IMAGES)) {
  const src = path.join(SRC, rel);
  const { width } = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then(r => r.info);
  for (const w of [...(STICKERS.has(slug) ? [240] : []), ...WIDTHS].filter(w => w <= width)) {
    const info = await sharp(src).rotate().resize({ width: w }).webp({ quality: 76 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
    console.log(`${slug}-${w}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}

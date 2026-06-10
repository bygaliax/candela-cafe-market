// Convierte los assets del hero (assets/banner → web/assets/img) a WebP con alpha
import sharp from 'sharp';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets', 'banner');
const OUT = path.join(ROOT, 'web', 'assets', 'img');

// fondo de fuego (JPEG, sin alpha) en 2 tamaños
for (const w of [960, 1440]) {
  await sharp(path.join(SRC, 'candela.jpg')).resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 72 }).toFile(path.join(OUT, `hero-fire-${w}.webp`));
}
console.log('ok hero-fire');

// PNGs con transparencia → trim de márgenes transparentes + tamaño opcional
const PNGS = {
  'hero-grill':       ['freepik_br_af889fe0-dcd0-4c71-bed7-d32edaf809be 1.png', null],
  'hero-grill-480':   ['freepik_br_af889fe0-dcd0-4c71-bed7-d32edaf809be 1.png', 480],
  'hero-burger':      ['delicioso-desayuno-huevos-fritos-tocino-crujiente-sarten 1.png', null],
  'hero-burger-ring': ['Image.png', null],
  'hero-drink':       ['pngegg - 2024-07-22T230546.778 1.png', null],
  'hero-chips-a':     ['pngegg - 2024-07-22T225850.223 1.png', null],
  'hero-chips-b':     ['pngegg - 2024-07-22T225850.223 2.png', null],
  'hero-leaf-a':      ['ghkluilo.png', null],
  'hero-leaf-b':      ['ghkluilo-1.png', null],
};
for (const [slug, [file, w]] of Object.entries(PNGS)) {
  let p = sharp(path.join(SRC, file)).trim();
  if (w) p = p.resize({ width: w, withoutEnlargement: true });
  const info = await p.webp({ quality: 82 }).toFile(path.join(OUT, `${slug}.webp`));
  console.log('ok', slug, `${info.width}x${info.height}`);
}

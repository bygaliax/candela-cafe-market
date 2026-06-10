// Genera WebP del skyline de Miami (fondo del menú) y de los productos placeholder del market.
import sharp from 'sharp';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'web/assets/img');

const JOBS = {
  'miami-skyline': 'tools/miami.jpg',
  'mk-cafe':     'tools/prod/p5.jpg',
  'mk-aceite':   'tools/prod/p7.jpg',
  'mk-frutas':   'tools/prod/p8.jpg',
  'mk-cereal':   'tools/prod/p9.jpg',
  'mk-despensa': 'tools/prod/p6.jpg',
  'mk-verdes':   'tools/prod/p10.jpg',
};

for (const [slug, rel] of Object.entries(JOBS)) {
  const widths = slug === 'miami-skyline' ? [960, 1440] : [480, 960];
  for (const w of widths) {
    await sharp(path.join(ROOT, rel)).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 74 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  console.log('ok', slug);
}

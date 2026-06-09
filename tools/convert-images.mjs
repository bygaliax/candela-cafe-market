import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'wetransfer_4-fold_2026-06-04_1950', '4 Fold', 'Candela');
const OUT = path.join(ROOT, 'web', 'assets', 'img');
mkdirSync(OUT, { recursive: true });

// slug → archivo fuente (fotos REALES del cliente, seleccionadas)
// Swaps vs original spec:
//   breakfast-platter: IMG_3565.jpg (fruit pancakes, clean) instead of IMG_0483.jpg (heavy Instagram overlay)
//   local-interior: Nuevas/IMG-20250425-WA0011.jpg (grilled chicken + colorful venue bokeh) instead of IMG_0829.jpg (was catering platter, wrong slug)
//   gal-4: WhatsApp Image ...16.15.43_d9427121.jpg (burger+fries, venue windows) instead of WA0008.jpg (duplicate salmon)
//   gal-5: WhatsApp Image ...16.11.02_8a4ee87e.jpg (Dominican fritura board) instead of WA0009.jpg (logo collage, not a food photo)
//   food-1: IMG_0829.jpg (charcuterie spread) instead of IMG_3565.jpg (moved to breakfast-platter)
const IMAGES = {
  'hero-sandwich':      'IMG_7266.jpg',
  'breakfast-platter':  'IMG_3565.jpg',
  'caesar-salad':       path.join('Nuevas', 'IMG-20250425-WA0013.jpg'),
  'local-interior':     path.join('Nuevas', 'IMG-20250425-WA0011.jpg'),
  'pastrami':           'new-york-deli-pastrami-sandwich.jpg',
  'catering':           'WhatsApp Image 2025-03-25 at 16.10.24_59503bed.jpg',
  'gal-1':              path.join('Nuevas', 'IMG-20250425-WA0005.jpg'),
  'gal-2':              path.join('Nuevas', 'IMG-20250425-WA0006.jpg'),
  'gal-3':              path.join('Nuevas', 'IMG-20250425-WA0007.jpg'),
  'gal-4':              'WhatsApp Image 2025-03-25 at 16.15.43_d9427121.jpg',
  'gal-5':              'WhatsApp Image 2025-03-25 at 16.11.02_8a4ee87e.jpg',
  'gal-6':              path.join('Nuevas', 'IMG-20250425-WA0010.jpg'),
  'food-1':             'IMG_0829.jpg',
  'food-2':             path.join('Nuevas', 'IMG-20250425-WA0014.jpg'),
  'food-3':             path.join('Nuevas', 'IMG-20250425-WA0015.jpg'),
};

const WIDTHS = [480, 960, 1440];
for (const [slug, rel] of Object.entries(IMAGES)) {
  const src = path.join(SRC, rel);
  for (const w of WIDTHS) {
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  console.log('ok', slug);
}

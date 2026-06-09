import sharp from 'sharp';
import path from 'path';
import { createRequire } from 'module';

const ROOT = path.resolve(import.meta.dirname, '..');
const src = path.join(ROOT, 'web', 'assets', 'img', 'hero-sandwich-1440.webp');
const outWebp = path.join(ROOT, 'web', 'assets', 'img', 'og-image.webp');
const outJpg = path.join(ROOT, 'web', 'assets', 'img', 'og-image.jpg');

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .webp({ quality: 80 })
  .toFile(outWebp);
console.log('ok og-image.webp');

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 80 })
  .toFile(outJpg);
console.log('ok og-image.jpg');

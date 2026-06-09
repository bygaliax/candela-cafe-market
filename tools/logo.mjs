import sharp from 'sharp';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const src = path.join(ROOT, 'assets', 'branding', 'logopng.png');
const out = path.join(ROOT, 'web', 'assets', 'img', 'logo-96.webp');

await sharp(src)
  .resize({ width: 96, withoutEnlargement: true })
  .webp({ quality: 90 })
  .toFile(out);

console.log('ok logo-96.webp');

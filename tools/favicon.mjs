import sharp from 'sharp';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const src = path.join(ROOT, 'web', 'assets', 'img', 'logo.png');
const out = path.join(ROOT, 'web', 'favicon.png');

await sharp(src)
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(out);

console.log('ok favicon.png');

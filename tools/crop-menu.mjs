import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'wetransfer_4-fold_2026-06-04_1950', '4 Fold', 'OUTPUT');
const OUT = path.join(ROOT, 'tools', 'crops');
mkdirSync(OUT, { recursive: true });

for (const f of ['FourFold Menu-01.jpg', 'FourFold Menu-02.jpg']) {
  const img = sharp(path.join(DIR, f));
  const { width, height } = await img.metadata();
  const cols = 4, rows = 2; // 8 recortes por archivo, con solape del 6%
  const cw = Math.floor(width / cols), ch = Math.floor(height / rows);
  const ov = Math.floor(cw * 0.06);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const left = Math.max(0, c * cw - ov), top = Math.max(0, r * ch - ov);
    await sharp(path.join(DIR, f))
      .extract({ left, top,
        width: Math.min(cw + 2 * ov, width - left),
        height: Math.min(ch + 2 * ov, height - top) })
      .resize({ width: 1400 })
      .jpeg({ quality: 85 })
      .toFile(path.join(OUT, `${path.parse(f).name}-r${r}c${c}.jpg`));
  }
  console.log('cropped', f);
}

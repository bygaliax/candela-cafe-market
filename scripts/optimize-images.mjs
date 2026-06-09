// Optimiza las imágenes de public/img: las redimensiona (lado mayor <= MAX)
// y las recomprime como JPEG. Reutilizable al añadir fotos nuevas.
// Uso: npm run optimize:img
import sharp from 'sharp';
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'img');
const MAX = 1100;
const QUALITY = 82;

const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

for (const file of files) {
  const full = path.join(dir, file);
  const input = await readFile(full);
  const out = await sharp(input)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  const target = full.replace(/\.(png|jpeg|webp)$/i, '.jpg');
  await writeFile(target, out);
  if (target !== full) await unlink(full); // limpia el original si cambió de extensión

  const before = (input.length / 1024).toFixed(0);
  const after = (out.length / 1024).toFixed(0);
  console.log(`${file} -> ${path.basename(target)}: ${before}KB -> ${after}KB`);
}

console.log(`\nListo: ${files.length} imágenes optimizadas en public/img.`);

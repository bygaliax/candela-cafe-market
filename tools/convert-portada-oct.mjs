// Fotos de los cambios de la portada (2026-10-13, notas de Robert) → WebP responsive en web/assets/img.
// Originales en _material (fuera del repo).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/fotos-2026-10-13';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const IMAGES = {
  // «Sabor Dominicano»: el collage cuadrado de la comida dominicana.
  'mediodia-sabor-dominicano': { file: 'sabor-dominicano-collage.jpg', widths: [480, 960, 1440] },
  // El patio un viernes por la noche, recortado del flyer sin el logo ni los textos (4:3).
  // El flyer solo da 895 px de foto: la de 960 se amplía un 7 %.
  'noche-patio': { file: 'viernes-en-el-patio-flyer.jpg', crop: { left: 400, top: 50, width: 895, height: 671 }, widths: [480, 960] },
};

for (const [slug, { file, crop, widths }] of Object.entries(IMAGES)) {
  for (const w of widths) {
    let img = sharp(path.join(SRC, file)).rotate();
    if (crop) img = img.extract(crop);
    const info = await img.resize({ width: w }).webp({ quality: 76 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
    console.log(`${slug}-${w}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}

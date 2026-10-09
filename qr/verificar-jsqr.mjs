// Tercer lector del QR: jsQR (el mismo que en Chrome), sobre los SVG pintados por sharp a varios tamaños y los PNG.
// Uso: node qr/verificar-jsqr.mjs   (usa sharp y jsqr de tools/node_modules). Sale con 1 si algo no se lee.
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../tools/package.json', import.meta.url));
const sharp = require('sharp'), jsQR = require('jsqr');
const dir = new URL('./', import.meta.url);
const URL_QR = readFileSync(new URL('generar.py', dir), 'utf8').match(/^URL = "([^"]+)"/m)[1];

let fallos = 0;
for (const f of readdirSync(dir).filter(f => /^qr-.*\.(svg|png)$/.test(f)).sort()) {
  const buf = readFileSync(new URL(f, dir));
  for (const size of f.endsWith('.svg') ? [160, 300, 600, 1200] : [null]) {
    const img = size ? sharp(buf, { density: 72 * size / 410 }) : sharp(buf);   // el SVG mide 410 px
    const { data, info } = await img.flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const r = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
    const ok = !!r && r.data === URL_QR;
    fallos += !ok;
    console.log(`${ok ? 'OK ' : 'MAL'} ${f} a ${info.width} px → ${r ? r.data : 'sin lectura'}`);
  }
}
console.log(`\nFALLOS: ${fallos}`);
process.exit(fallos ? 1 : 0);

// Empaqueta la carta del QR (menu-qr/) para el sitio de Netlify «candela-cafe-menu» (menu.candelaycafe.com).
// Uso: node tools/build-menu-qr.mjs  →  dist-menu-qr/ (ignorada en git)
// La página usa rutas ../web/…: aquí se replica en dist-menu-qr/web/ solo lo que usa, así valen igual en el repo y publicadas.
import { rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, MENU } from '../web/js/menu-data.js';

const root = new URL('../', import.meta.url);
const out = new URL('dist-menu-qr/', root);
const from = p => new URL(p, root);
const to = p => new URL(p, out);

// Se vacía dist-menu-qr/ en vez de borrarla: si un proceso la tiene como carpeta actual (p. ej. tras publicar entrando
// en ella), Windows no deja borrar la carpeta, pero sí lo que hay dentro. Y un archivo recién creado o publicado puede
// estar abierto un momento (antivirus, netlify CLI): EPERM, que el rmSync de Node 24 no reintenta. Se reintenta aquí.
const borrar = p => {
  for (let i = 0; ; i++) {
    try { rmSync(p, { recursive: true, force: true }); return; } catch (e) {
      if (i >= 20 || !['EPERM', 'EBUSY', 'ENOTEMPTY'].includes(e.code)) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);   // espera 250 ms (hasta ~5 s en total)
    }
  }
};
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) borrar(join(fileURLToPath(out), entry));
cpSync(from('menu-qr/'), out, { recursive: true });
cpSync(from('web/js/'), to('web/js/'), { recursive: true });

const fotos = new Set(['logo-96.webp']);
for (const c of CATEGORIES) {
  if (c.cover) c.cover.w.forEach(w => fotos.add(`${c.cover.img}-${w}.webp`));
  for (const i of MENU[c.id] || []) if (i.img) fotos.add(`${i.img}-480.webp`);
}
for (const f of fotos) cpSync(from(`web/assets/img/${f}`), to(`web/assets/img/${f}`));
cpSync(from('web/assets/fonts/dm-sans-latin.woff2'), to('web/assets/fonts/dm-sans-latin.woff2'));
for (const f of ['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png']) cpSync(from(`web/${f}`), to(`web/${f}`));
cpSync(from('web/favicon.ico'), to('favicon.ico'));   // los navegadores lo piden en la raíz
console.log(`dist-menu-qr/ listo: ${fotos.size} imágenes, DM Sans, iconos y web/js/`);

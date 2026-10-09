// Empaqueta la carta del QR (menu-qr/) para el sitio de Netlify «candela-cafe-menu» (menu.candelaycafe.com).
// Uso: node tools/build-menu-qr.mjs  →  dist-menu-qr/ (ignorada en git)
// La página usa rutas ../web/…: aquí se replica en dist-menu-qr/web/ solo lo que usa, así valen igual en el repo y publicadas.
import { rmSync, mkdirSync, cpSync } from 'node:fs';
import { CATEGORIES, MENU } from '../web/js/menu-data.js';

const root = new URL('../', import.meta.url);
const out = new URL('dist-menu-qr/', root);
const from = p => new URL(p, root);
const to = p => new URL(p, out);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
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

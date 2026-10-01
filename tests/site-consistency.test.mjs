import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { DICT, langToggleLabel } from '../web/js/i18n.js';
import { HOURS, GOOGLE, FAVORITES } from '../web/js/site-data.js';
import { findItem } from '../web/js/sections.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const INDEX = read('web/index.html'), MENUP = read('web/menu.html');
const IMG_DIR = new URL('../web/assets/img/', import.meta.url);
const SOURCES = [INDEX, MENUP,
  ...readdirSync(new URL('../web/js/', import.meta.url)).map(f => read(`web/js/${f}`)),
  ...readdirSync(new URL('../web/css/', import.meta.url)).map(f => read(`web/css/${f}`))].join('\n');

test('JSON-LD: el horario coincide con HOURS', () => {
  const ld = JSON.parse(INDEX.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const seen = new Set();
  for (const spec of ld.openingHoursSpecification) for (const day of spec.dayOfWeek) {
    const i = names.indexOf(day);
    assert.deepEqual({ open: spec.opens, close: spec.closes }, HOURS[i], day);
    seen.add(i);
  }
  assert.equal(seen.size, 7);
  assert.equal(ld.hasMenu, 'https://candelaycafe.com/menu');
  assert.ok(ld.geo && ld.url && ld.priceRange);
});

test('La nota de Google del HTML (sin JS) es la de site-data', () => {
  assert.match(INDEX, new RegExp(`id="gRating">${GOOGLE.rating}<`));
  assert.match(INDEX, new RegExp(`id="gReviews">${GOOGLE.count}<`));
});

test('i18n: toda clave usada existe en EN y en ES', () => {
  const keys = new Set();
  for (const html of [INDEX, MENUP]) for (const m of html.matchAll(/data-i18n(?:-alt|-aria|-placeholder|-title)?="([^"]+)"/g)) keys.add(m[1]);
  for (const f of readdirSync(new URL('../web/js/', import.meta.url))) {
    for (const m of read(`web/js/${f}`).matchAll(/\b(?:t|tx)\('([\w.-]+)'/g)) keys.add(m[1]);
  }
  const missing = [...keys].filter(k => !DICT[k] || !DICT[k].en || !DICT[k].es);
  assert.deepEqual(missing, []);
});

test('Cada favorito existe en la carta y lleva la foto de ESE plato', () => {
  // Emparejado verificado a ojo con las fotos del cliente (24-sep): D-1 es un Chopped Cheese, no un Philly.
  const PHOTO_OF = {
    'ny-the-ruben-sandwich': 'deli-ruben',
    'bg-candela-burger': 'deli-candela-burger',
    'ny-chopped-cheese': 'deli-chopped-cheese',
    'pn-grilled-chicken-panini': 'deli-chicken-panini',
  };
  for (const f of FAVORITES) {
    assert.ok(findItem(f.id), `${f.id} no está en MENU`);
    assert.equal(f.img, PHOTO_OF[f.id], `${f.id} lleva la foto ${f.img}`);
    for (const w of [480, 960]) // renderFavorites pide las dos en el srcset
      assert.ok(existsSync(new URL(`../web/assets/img/${f.img}-${w}.webp`, import.meta.url)), `falta ${f.img}-${w}.webp`);
  }
});

test('La portada ya no carga Swiper ni tiene reseñas de ejemplo', () => {
  assert.doesNotMatch(INDEX, /swiper/i);
  assert.doesNotMatch(INDEX, /Jonathan R\.|Carla M\.|Luis D\./);
});

test('Barra y pie nuevos en la portada y en la carta', () => {
  for (const [name, html] of [['index', INDEX], ['menu', MENUP]]) {
    assert.match(html, /<div class="nav-menu" id="navMenu"[^>]*hidden>/, `${name}: menú de la hamburguesa`);
    assert.match(html, /aria-controls="navMenu"/, `${name}: la hamburguesa lo controla`);
    assert.equal(html.split('class="lang-toggle"').length - 1, 2, `${name}: selector en la barra y en el menú`);
    assert.match(html, /class="btn btn-p nav-go" href="https:\/\/www\.google\.com\/maps\/dir\//, `${name}: «Cómo llegar» en la barra`);
    assert.doesNotMatch(html, /data-i18n="nav\.order"/, `${name}: la barra ya no lleva «Order Now»`);
    assert.match(html, /<p class="footer-tag">Born in NY, raised Dominican,<br>served in Miami\.<\/p>/, `${name}: frase en el pie`);
    assert.match(html, /id="footWa"/, `${name}: WhatsApp en el pie`);
  }
});

test('En español, el enlace de la carta dice «Carta»', () => {
  assert.equal(DICT['nav.menu'].es, 'Carta');
});

test('La portada: hero de fuego del banner (vuelve el 1-oct), sin ScrollTrigger ni las franjas viejas', () => {
  assert.match(INDEX, /<link rel="stylesheet" href="css\/home\.css">/);
  for (const gone of [/ScrollTrigger/, /mk-(despensa|aceite|cereal|frutas|verdes|cafe)/,
    /landing\.css/, /sections\.css/, /class="dawn"/, /class="dusk"/, /id="cartas"/, /class="now"/])
    assert.doesNotMatch(INDEX, gone, String(gone));
  // la imagen precargada es la que el hero pide con prioridad alta: si no, se baja dos veces y el LCP espera
  const pre = INDEX.match(/<link rel="preload" as="image" href="([^"]+)"/)[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hero = INDEX.match(/<header[^>]*id="hero"[^>]*>([\s\S]*?)<\/header>/)[1];
  assert.match(hero, new RegExp(`<img[^>]*src="${pre}"[^>]*fetchpriority="high"`));
  // solo el núcleo de GSAP, servido desde el propio sitio (sin conexión a un CDN) y antes del módulo: hero.js lo necesita al arrancar
  const gsap = INDEX.match(/<script src="(assets\/vendor\/gsap-[\d.]+\.min\.js)" defer><\/script>/);
  assert.ok(gsap, 'GSAP desde el propio sitio');
  assert.ok(existsSync(new URL(`../web/${gsap[1]}`, import.meta.url)), `falta web/${gsap[1]}`);
  assert.ok(INDEX.indexOf(gsap[1]) < INDEX.indexOf('src="js/landing.js"'), 'GSAP va antes de landing.js');
  assert.doesNotMatch(INDEX, /cdn\.jsdelivr\.net/);
  // las decoraciones no le quitan ancho de banda a la imagen del plato (el LCP)
  const decs = hero.match(/<img[^>]*class="dec [^"]*"[^>]*>/g);
  assert.equal(decs.length, 6);
  for (const img of decs) assert.match(img, /fetchpriority="low"/, img);
});

test('Todo id que buscan los scripts existe en su página (uno que falta rompe el resto del módulo)', () => {
  for (const f of ['hero.js', 'share.js']) assert.ok(existsSync(new URL(`../web/js/${f}`, import.meta.url)), `falta js/${f}`);
  const ids = f => [...read(`web/js/${f}`).matchAll(/(?:\$|getElementById)\('([\w-]+)'\)/g)].map(m => m[1]);
  for (const [f, pages] of [['landing.js', [INDEX]], ['hero.js', [INDEX]], ['nav.js', [INDEX, MENUP]], ['share.js', [INDEX, MENUP]]])
    for (const id of ids(f)) for (const html of pages) assert.match(html, new RegExp(`id="${id}"`), `${f}: falta #${id}`);
});

test('La portada: un solo h1 y las anclas de siempre', () => {
  assert.equal(INDEX.split('<h1').length - 1, 1);
  for (const id of ['hero', 'market', 'noche', 'visit']) assert.match(INDEX, new RegExp(`id="${id}"`), id);
});

test('La portada: barra fija del móvil y modal de reserva en papel', () => {
  assert.match(INDEX, /<nav class="mbar" id="mbar"/);
  assert.match(INDEX, /<div class="modal" id="resModal" aria-hidden="true">/);
  assert.match(INDEX, /<h2 id="resTitle" class="modal-title" data-i18n="res\.title">/);
  assert.match(INDEX, /data-open-res/);
  assert.doesNotMatch(INDEX, /modal-seal/);
});

test('Toda imagen que citan las páginas existe', () => {
  const refs = new Set([...(INDEX + MENUP).matchAll(/assets\/img\/([\w-]+\.(?:webp|jpg|png))/g)].map(m => m[1]));
  assert.deepEqual([...refs].filter(f => !existsSync(new URL(f, IMG_DIR))), []);
});

test('No quedan imágenes que no use nadie', () => {
  const base = f => f.replace(/-(?:96|240|480|960|1440)(?=\.)/, '').replace(/\.(?:webp|jpg|png)$/, '');
  const images = readdirSync(IMG_DIR).filter(f => /\.(?:webp|jpg|png)$/.test(f));
  assert.deepEqual(images.filter(f => !SOURCES.includes(base(f))), []);
});

test('Toda clave de i18n se usa en alguna página o módulo', () => {
  const used = new Set();
  for (const m of (INDEX + MENUP).matchAll(/data-i18n(?:-alt|-aria|-placeholder|-title)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of SOURCES.matchAll(/\b(?:t|tx)\('([\w.-]+)'|DICT\['([\w.-]+)'\]/g)) used.add(m[1] || m[2]);
  assert.deepEqual(Object.keys(DICT).filter(k => !used.has(k)), []);
});

test('Una sola tipografía, DM Sans, servida desde el propio sitio y precargada (B-01, Robert 1-oct)', () => {
  const css = read('web/css/base.css');
  const PRIV = read('web/privacy.html');
  for (const [name, html] of [['index', INDEX], ['menu', MENUP], ['privacy', PRIV]]) {
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, `${name}: no pide Google Fonts`);
    assert.match(html, /<link rel="preload" as="font" type="font\/woff2" href="assets\/fonts\/dm-sans-latin\.woff2" crossorigin>/, `${name}: precarga DM Sans`);
    assert.deepEqual([...html.matchAll(/as="font"[^>]*href="([^"]+)"/g)].map(m => m[1]), ['assets/fonts/dm-sans-latin.woff2'], `${name}: no precarga otras fuentes`);
  }
  const faces = [...css.matchAll(/@font-face\{font-family:'([^']+)'[^}]*url\("\.\.\/assets\/fonts\/([\w-]+\.woff2)"\)/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(faces, [['DM Sans', 'dm-sans-latin.woff2']]);
  assert.deepEqual(readdirSync(new URL('../web/assets/fonts/', import.meta.url)), ['dm-sans-latin.woff2'], 'no quedan fuentes sueltas');
  assert.match(css, /--body:'DM Sans',system-ui,sans-serif/);
});

test('Ninguna hoja usa otra letra: toda declaración de fuente va a var(--body)', () => {
  // el @font-face declara la familia, no la usa: fuera del recuento
  const sheets = readdirSync(new URL('../web/css/', import.meta.url)).map(f => [f, read(`web/css/${f}`).replace(/@font-face\{[^}]*\}/g, '')]);
  for (const [f, css] of sheets) {
    for (const m of css.matchAll(/(?<![-\w])font(-family)?:([^;}]+)/g)) {
      const value = m[2].trim();
      if (m[1]) assert.ok(['var(--body)', 'inherit'].includes(value), `${f}: font-family:${value}`);
      else assert.ok(/ var\(--body\)$/.test(value) || value === 'inherit', `${f}: font:${value}`);
    }
  }
});

test('El título del mapa pasa por i18n', () => {
  assert.match(INDEX, /<iframe class="map"[^>]*data-i18n-title="visit.map"/);
});

test('El selector de idioma lleva en su nombre accesible el texto que se ve (WCAG 2.5.3)', () => {
  assert.equal(langToggleLabel('en'), 'EN / ES · Ver en español');
  assert.equal(langToggleLabel('es'), 'EN / ES · View in English');
});

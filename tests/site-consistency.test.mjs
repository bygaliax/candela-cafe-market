import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { DICT } from '../web/js/i18n.js';
import { HOURS, GOOGLE, FAVORITES } from '../web/js/site-data.js';
import { findItem } from '../web/js/sections.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const INDEX = read('web/index.html'), MENUP = read('web/menu.html');

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
  for (const html of [INDEX, MENUP]) for (const m of html.matchAll(/data-i18n(?:-alt|-aria|-placeholder)?="([^"]+)"/g)) keys.add(m[1]);
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
    assert.ok(existsSync(new URL(`../web/assets/img/${f.img}-480.webp`, import.meta.url)), `falta ${f.img}-480.webp`);
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

test('La portada nueva: su hoja, sin GSAP, sin hero de fuego ni market de banco de imágenes', () => {
  assert.match(INDEX, /<link rel="stylesheet" href="css\/home\.css">/);
  for (const gone of [/gsap/i, /ScrollTrigger/, /hero-(fire|grill|burger|chips|drink|leaf)/, /mk-(despensa|aceite|cereal|frutas|verdes|cafe)/,
    /landing\.css/, /sections\.css/, /class="dawn"/, /class="dusk"/, /id="cartas"/, /class="now"/, /Order Now/])
    assert.doesNotMatch(INDEX, gone, String(gone));
  assert.match(INDEX, /<link rel="preload" as="image" href="assets\/img\/manana-fachada-960\.webp"/);
  assert.match(INDEX, /<img class="hero-photo"[^>]*fetchpriority="high"/);
});

test('La portada: un solo h1 y las anclas de siempre', () => {
  assert.equal(INDEX.split('<h1').length - 1, 1);
  for (const id of ['hero', 'market', 'noche', 'visit']) assert.match(INDEX, new RegExp(`id="${id}"`), id);
});

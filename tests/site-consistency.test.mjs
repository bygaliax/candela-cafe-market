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
  for (const html of [INDEX, MENUP]) for (const m of html.matchAll(/data-i18n(?:-alt|-aria)?="([^"]+)"/g)) keys.add(m[1]);
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

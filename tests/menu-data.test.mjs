import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CATEGORIES, MENU, PARTS, DAILY_SPECIAL } from '../web/js/menu-data.js';

const file = (slug, w) => new URL(`../web/assets/img/${slug}-${w}.webp`, import.meta.url);
const allItems = () => CATEGORIES.flatMap(c => MENU[c.id]);

test('Momentos: mañana, café y jugos, mediodía; cada categoría en uno y sin mezclarse', () => {
  const order = PARTS.map(p => p.id);
  assert.deepEqual(order, ['morning', 'coffee', 'midday']);
  const seq = CATEGORIES.map(c => order.indexOf(c.part));
  assert.ok(seq.every(i => i >= 0), 'hay una categoría sin momento válido');
  assert.deepEqual(seq, [...seq].sort((a, b) => a - b), 'las categorías de un momento no van seguidas');
  assert.deepEqual(CATEGORIES.map(c => c.id), [
    'breakfast', 'avocado-toast', 'bakery',
    'coffee', 'juices', 'smoothies', 'shakes',
    'ny-signature', 'signature', 'panini', 'burgers', 'dominican-spot', 'salads-wraps', 'soups', 'appetizers',
  ]);
});

test('Siguen los mismos 79 platos y precios; ningún id se repite ni choca con una categoría', () => {
  const items = allItems();
  assert.equal(items.length, 79);
  assert.equal(items.reduce((s, i) => s + i.price, 0).toFixed(2), '889.84');
  const ids = items.map(i => i.id);
  assert.equal(new Set(ids).size, 79);
  const catIds = new Set(CATEGORIES.map(c => c.id));
  assert.deepEqual(ids.filter(id => catIds.has(id)), []);
  assert.deepEqual(Object.keys(MENU).sort(), [...catIds].sort());
});

test('Cada foto de la carta es la de ESE plato (parejas aprobadas por Robert el 24-sep)', () => {
  const PHOTO_OF = {
    'ny-the-ruben-sandwich': 'deli-ruben',
    'ny-chopped-cheese': 'deli-chopped-cheese',
    'ny-phili-cheese-steak': 'lugar-terraza',
    'ny-central-park-club-sandwiches': 'menu-central-park-club',
    'ny-manhattan-hero': 'lugar-neon-sub',
    'sg-prosciutto-sandwich': 'lugar-interior',
    'sg-california-turkey-sandwich': 'menu-california-turkey',
    'pn-grilled-chicken-panini': 'deli-chicken-panini',
    'bg-candela-burger': 'menu-candela-burger',
    'sw-chicken-steak-quesadilla': 'menu-quesadilla',
    'sw-greek-salad': 'menu-greek-salad',
    'bk-pancakes-french-toast-wafles': 'manana-fachada',
    // de las fotos que ya tenía la carta solo coincide la César: las del Downtown Platter,
    // la Fritura Mixta y el Italian Panini eran tortitas, una quesadilla y costillas (visto el 24-sep)
    'sw-chicken-caesar-salad': 'caesar-salad',
  };
  const withImg = Object.fromEntries(allItems().filter(i => i.img).map(i => [i.id, i.img]));
  assert.deepEqual(withImg, PHOTO_OF);
});

test('Cabeceras: Panadería, Barra de Café, Rincón Dominicano (con el aviso del especial) y Sopas', () => {
  const covers = Object.fromEntries(CATEGORIES.filter(c => c.cover).map(c => [c.id, c.cover.img]));
  assert.deepEqual(covers, {
    bakery: 'manana-pastelitos',
    coffee: 'noche-neon',
    'dominican-spot': 'mediodia-mesa-caliente',
    soups: 'menu-sopa',
  });
  assert.equal(CATEGORIES.find(c => c.id === 'dominican-spot').note, DAILY_SPECIAL);
});

test('Cada foto existe en 480 y 960, y cada cabecera en los anchos que declara', () => {
  for (const it of allItems().filter(i => i.img)) {
    for (const w of [480, 960]) assert.ok(existsSync(file(it.img, w)), `falta ${it.img}-${w}.webp`);
  }
  for (const c of CATEGORIES.filter(c => c.cover)) {
    assert.ok(c.cover.w.includes(480) && c.cover.w.includes(960), `${c.id}: la cabecera necesita 480 y 960`);
    for (const w of c.cover.w) assert.ok(existsSync(file(c.cover.img, w)), `falta ${c.cover.img}-${w}.webp`);
  }
});

test('Los encuadres tienen formato «X% Y%»', () => {
  const foci = [...allItems().map(i => i.focus), ...CATEGORIES.map(c => c.cover && c.cover.focus)].filter(Boolean);
  assert.ok(foci.length > 0);
  for (const f of foci) assert.match(f, /^\d{1,3}% \d{1,3}%$/);
});

test('Las fotos viejas del Ruben y del Prosciutto ya no están', () => {
  for (const s of ['pastrami', 'hero-sandwich']) {
    for (const w of [480, 960, 1440]) assert.ok(!existsSync(file(s, w)), `sigue ${s}-${w}.webp`);
  }
});

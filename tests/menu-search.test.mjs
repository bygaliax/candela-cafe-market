import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, MENU } from '../web/js/menu-data.js';
import { normalize, matches, filterMenu, searchStatus, askUrl } from '../web/js/menu-render.js';

const ny = CATEGORIES.find(c => c.id === 'ny-signature');
const ruben = MENU['ny-signature'].find(i => i.id === 'ny-the-ruben-sandwich');

test('normalize: minúsculas, sin tildes y sin espacios sobrantes', () => {
  assert.equal(normalize('  Café CON Leche '), 'cafe con leche');
  assert.equal(normalize('Jalapeño'), 'jalapeno');
});

test('matches: por nombre, por descripción en los dos idiomas y por categoría', () => {
  assert.ok(matches(ruben, ny, 'ruben'));
  assert.ok(matches(ruben, ny, 'pastrami'));        // descripción EN y ES
  assert.ok(matches(ruben, ny, 'queso suizo'));     // descripción ES
  assert.ok(matches(ruben, ny, 'sandwiches ny'));   // categoría ES, sin tilde
  assert.ok(matches(ruben, ny, 'PASTRAMI ruben'));  // varias palabras, en cualquier orden
  assert.ok(!matches(ruben, ny, 'pizza'));
});

test('matches: con menos de 2 letras no filtra', () => {
  assert.ok(matches(ruben, ny, ''));
  assert.ok(matches(ruben, ny, ' x '));
});

test('filterMenu: sin búsqueda está todo y las anchas son las de la carta', () => {
  const f = filterMenu(CATEGORIES, MENU, '');
  assert.equal(f.count, 79);
  assert.equal(f.cats.size, 15);
  assert.equal(f.parts.size, 3);
  assert.deepEqual([...f.wide].sort(), ['bg-candela-burger', 'dm-fritura-mixta-2ps', 'ny-the-ruben-sandwich', 'sw-chicken-steak-quesadilla']);
});

test('filterMenu: «cafe» trae la Barra de Café entera', () => {
  const f = filterMenu(CATEGORIES, MENU, 'cafe');
  assert.ok(f.cats.has('coffee') && f.parts.has('coffee'));
  assert.equal(MENU.coffee.filter(i => f.items.has(i.id)).length, MENU.coffee.length);
});

test('filterMenu: «burger» trae las hamburguesas y su única tarjeta va ancha', () => {
  const f = filterMenu(CATEGORIES, MENU, 'burger');
  for (const it of MENU.burgers) assert.ok(f.items.has(it.id), it.id);
  assert.ok(f.wide.has('bg-candela-burger'));
});

test('filterMenu: la tarjeta ancha se recalcula con las que se ven', () => {
  const f = filterMenu(CATEGORIES, MENU, 'chopped');
  assert.ok(f.items.has('ny-chopped-cheese'));
  assert.ok(f.wide.has('ny-chopped-cheese'));
  assert.ok(!f.wide.has('ny-the-ruben-sandwich'));
});

test('filterMenu: sin resultados', () => {
  const f = filterMenu(CATEGORIES, MENU, 'xyzzy');
  assert.equal(f.count, 0);
  assert.equal(f.cats.size, 0);
  assert.equal(f.parts.size, 0);
});

test('searchStatus: 0, 1 y varios, en los dos idiomas', () => {
  assert.equal(searchStatus(0, 'es'), 'No lo encontramos.');
  assert.equal(searchStatus(1, 'es'), '1 plato');
  assert.equal(searchStatus(12, 'es'), '12 platos');
  assert.equal(searchStatus(12, 'en'), '12 dishes');
});

test('askUrl: WhatsApp de Candela con lo buscado', () => {
  const url = askUrl(' empanadas de queso ', 'es');
  assert.ok(url.startsWith('https://wa.me/17862547577?text='));
  assert.equal(decodeURIComponent(url.split('text=')[1]), '¡Hola Candela & Café! ¿Tienen empanadas de queso?');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCart, buildWaUrl } from '../web/js/cart-core.js';

const ITEM_A = { id: 'bk-downtown', name: 'Downtown Platter', price: 8.49 };
const ITEM_B = { id: 'bg-candela', name: 'Candela Burger', price: 12.99 };

test('add acumula cantidades del mismo item', () => {
  const c = createCart();
  c.add(ITEM_A); c.add(ITEM_A); c.add(ITEM_B);
  assert.equal(c.count(), 3);
  assert.equal(c.lines().length, 2);
  assert.equal(c.lines()[0].qty, 2);
});

test('setQty a 0 elimina la línea', () => {
  const c = createCart();
  c.add(ITEM_A); c.setQty('bk-downtown', 0);
  assert.equal(c.count(), 0);
  assert.deepEqual(c.lines(), []);
});

test('total suma precio*qty con 2 decimales', () => {
  const c = createCart();
  c.add(ITEM_A); c.add(ITEM_A); c.add(ITEM_B);
  assert.equal(c.total(), 29.97);
});

test('serialización ida y vuelta (localStorage)', () => {
  const c = createCart();
  c.add(ITEM_B);
  const c2 = createCart(c.serialize());
  assert.equal(c2.total(), 12.99);
});

test('buildWaUrl genera wa.me con número correcto y mensaje legible', () => {
  const c = createCart();
  c.add(ITEM_A); c.add(ITEM_A);
  const url = buildWaUrl(c, '17862547577', 'Hi! I\'d like to order:');
  assert.ok(url.startsWith('https://wa.me/17862547577?text='));
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.match(msg, /2x Downtown Platter — \$16\.98/);
  assert.match(msg, /Total: \$16\.98/);
});

import { buildReservationUrl } from '../web/js/cart-core.js';

test('buildReservationUrl arma wa.me con día, hora, personas, nombre y teléfono', () => {
  const url = buildReservationUrl(
    { day: 'vie, 13 jun', time: '8:00 PM', guests: 4, name: 'Ana', phone: '786-000-0000' },
    '17862547577',
    'es'
  );
  assert.ok(url.startsWith('https://wa.me/17862547577?text='));
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.match(msg, /vie, 13 jun/);
  assert.match(msg, /8:00 PM/);
  assert.match(msg, /4 personas/);
  assert.match(msg, /Ana/);
  assert.match(msg, /786-000-0000/);
});

test('buildReservationUrl omite nombre y teléfono vacíos', () => {
  const url = buildReservationUrl({ day: 'vie', time: '9:00 PM', guests: 2, name: '', phone: '' }, '17862547577', 'es');
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.ok(!/Nombre:/.test(msg));
  assert.ok(!/Tel:/.test(msg));
});

import { waUrl } from '../web/js/cart-core.js';

test('createCart ignora un JSON guardado que no sea una lista (#17)', () => {
  const c = createCart('{"bk-downtown-platter":2}');
  assert.equal(c.count(), 0);
  assert.equal(c.total(), 0);
});

test('createCart descarta líneas mal formadas', () => {
  const c = createCart(JSON.stringify([
    { id: 'ok', name: 'Ok', price: 5, qty: 2 },
    { id: 'sin-precio', name: 'X', qty: 1 },
    { id: 'qty-cero', name: 'Y', price: 3, qty: 0 },
    null,
  ]));
  assert.deepEqual(c.lines().map(l => l.id), ['ok']);
});

test('load() sustituye el contenido por lo guardado (otra pestaña / volver atrás) (#5)', () => {
  const c = createCart();
  c.add(ITEM_A);
  const other = createCart(); other.add(ITEM_A); other.add(ITEM_B);
  c.load(other.serialize());
  assert.equal(c.count(), 2);
});

test('revalidate() actualiza precios y quita lo que ya no está en la carta', () => {
  const c = createCart(JSON.stringify([
    { id: 'bg-candela', name: 'Viejo nombre', price: 1, qty: 1 },
    { id: 'mk-cafe', name: 'Café del market', price: 14.99, qty: 1 },
  ]));
  c.revalidate(id => (id === 'bg-candela' ? { name: 'Candela Burger', price: 15.99 } : null));
  assert.deepEqual(c.lines(), [{ id: 'bg-candela', name: 'Candela Burger', price: 15.99, qty: 1 }]);
});

test('waUrl codifica acentos, & y saltos de línea', () => {
  const url = waUrl('17862547577', 'Café & té —\n¿tienen?');
  assert.equal(decodeURIComponent(url.split('text=')[1]), 'Café & té —\n¿tienen?');
  assert.ok(!url.includes(' '));
});

test('buildReservationUrl en inglés no mezcla español (#11)', () => {
  const url = buildReservationUrl({ day: 'Fri, Sep 25', time: '8:00 PM', guests: 3, name: 'Ann', phone: '' }, '17862547577', 'en');
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.match(msg, /on Fri, Sep 25 at 8:00 PM, for 3 people\./);
  assert.match(msg, /Name: Ann\./);
  assert.doesNotMatch(msg, /del |a las |personas|Nombre/);
});

test('buildReservationUrl usa singular con 1 persona', () => {
  const es = decodeURIComponent(buildReservationUrl({ day: 'vie', time: '9:00 PM', guests: 1 }, '1', 'es').split('text=')[1]);
  const en = decodeURIComponent(buildReservationUrl({ day: 'Fri', time: '9:00 PM', guests: 1 }, '1', 'en').split('text=')[1]);
  assert.match(es, /para 1 persona\./);
  assert.match(en, /for 1 person\./);
});

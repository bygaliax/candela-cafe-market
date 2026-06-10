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
    'Hola! reservo para música en vivo'
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
  const url = buildReservationUrl({ day: 'vie', time: '9:00 PM', guests: 2, name: '', phone: '' }, '17862547577', 'Hola');
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.ok(!/Nombre:/.test(msg));
  assert.ok(!/Tel:/.test(msg));
});

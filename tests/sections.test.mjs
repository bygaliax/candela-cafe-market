import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, findItem, renderFavorites, renderMarketList, renderBoard, renderHours, renderStatus, statusHTML } from '../web/js/sections.js';
import { FAVORITES, HOURS } from '../web/js/site-data.js';
import { MARKET_CATEGORIES } from '../web/js/market-data.js';
import { DAILY_SPECIAL } from '../web/js/menu-data.js';

const count = (html, needle) => html.split(needle).length - 1;

test('esc escapa HTML', () => {
  assert.equal(esc('<b>"x" & \'y\'</b>'), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
});

test('findItem encuentra el plato y su categoría', () => {
  assert.deepEqual(findItem('bg-candela-burger').cat, 'burgers');
  assert.equal(findItem('no-existe'), null);
});

test('renderFavorites: 4 tarjetas como las de la carta, con enlace a su plato', () => {
  const html = renderFavorites(FAVORITES, 'es');
  assert.equal(count(html, '<a class="fav"'), 4);
  assert.equal(count(html, '<h3 class="fav-n">'), 4);
  assert.match(html, /<h3 class="fav-n">The Ruben Sandwich<\/h3>/);
  assert.match(html, /<p class="fav-p">\$15\.49<\/p>/);
  assert.match(html, /href="menu\.html#ny-the-ruben-sandwich"/);
  assert.match(html, /deli-ruben-480\.webp 480w, assets\/img\/deli-ruben-960\.webp 960w/);
  assert.match(html, /Pastrami, queso suizo/);
  assert.equal(count(html, 'alt=""'), 4);
});

test('renderFavorites: un id que no está en la carta no pinta nada', () => {
  assert.equal(renderFavorites([{ id: 'no-existe', img: 'x', h: 1 }], 'es'), '');
});

test('renderBoard: sin platos, el aviso del especial escrito a mano y ninguna lista', () => {
  assert.equal(renderBoard({}, 3, 'es'), `<p class="note">${esc(DAILY_SPECIAL.es)}</p>`);
  assert.equal(renderBoard({ 3: [] }, 3, 'en'), `<p class="note">${esc(DAILY_SPECIAL.en)}</p>`);
});

test('renderBoard: con platos de hoy, título y lista escapada', () => {
  assert.equal(renderBoard({ 3: [{ en: 'Stew', es: 'Guiso <casero>' }] }, 3, 'es'),
    '<p class="board-h">Hoy en la mesa caliente:</p><ul class="board-list"><li>Guiso &lt;casero&gt;</li></ul>');
});

test('renderHours: 7 días desde el lunes y solo «hoy» marcado', () => {
  const es = renderHours(HOURS, 4, 'es');
  assert.equal(count(es, 'class="today"'), 1);
  assert.match(es, /Hoy · Jueves/);
  assert.match(es, /8 am – 11:30 pm/);
  assert.ok(es.indexOf('Lunes') < es.indexOf('Domingo'));
  assert.match(es, /Viernes · música en vivo/);
  assert.match(renderHours(HOURS, 4, 'en'), /Today · Thursday/);
});

test('renderStatus: abierto, cierra pronto y cerrado en ES y EN', () => {
  assert.deepEqual(renderStatus({ open: true, soon: false, closesAt: '23:30', day: 4 }, 'es'), { cls: 'is-open', text: 'Abierto ahora · hasta las 11:30 pm' });
  assert.deepEqual(renderStatus({ open: true, soon: true, closesAt: '22:00', day: 2 }, 'en'), { cls: 'is-soon', text: 'Closing soon · at 10 pm' });
  assert.deepEqual(renderStatus({ open: false, opensAt: '08:00', opensDay: 3, day: 2 }, 'es'), { cls: 'is-closed', text: 'Cerrado · abrimos mañana a las 8 am' });
  assert.deepEqual(renderStatus({ open: false, opensAt: '08:00', opensDay: 2, day: 2 }, 'en'), { cls: 'is-closed', text: 'Closed · opens today at 8 am' });
});

test('renderMarketList: 6 filas con nombre y ejemplos, sin precios', () => {
  const es = renderMarketList(MARKET_CATEGORIES, 'es');
  assert.equal(count(es, '<li>'), 6);
  assert.match(es, /<li><b>Despensa<\/b><span>arroz, habichuelas, pasta<\/span><\/li>/);
  assert.doesNotMatch(es, /\$/);
  assert.match(renderMarketList(MARKET_CATEGORIES, 'en'), /<li><b>Pantry<\/b><span>rice, beans, pasta<\/span><\/li>/);
});

test('renderMarketList: escapa los textos', () => {
  assert.equal(renderMarketList([{ id: 'x', name: { es: '<b>' }, examples: { es: 'a & b' } }], 'es'),
    '<li><b>&lt;b&gt;</b><span>a &amp; b</span></li>');
});

test('statusHTML: la primera parte en negrita y el resto separado por puntos', () => {
  assert.deepEqual(statusHTML({ open: true, soon: false, closesAt: '23:30', day: 5 }, 'es', '507 N Miami Ave'),
    { cls: 'is-open', html: '<b>Abierto ahora</b> · hasta las 11:30 pm · 507 N Miami Ave' });
  assert.deepEqual(statusHTML({ open: true, soon: true, closesAt: '22:00', day: 2 }, 'es'),
    { cls: 'is-soon', html: '<b>Cierra pronto</b> · a las 10 pm' });
  assert.deepEqual(statusHTML({ open: false, opensAt: '08:00', opensDay: 3, day: 2 }, 'en'),
    { cls: 'is-closed', html: '<b>Closed</b> · opens tomorrow at 8 am' });
});

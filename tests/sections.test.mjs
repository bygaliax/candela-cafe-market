import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, findItem, renderFavorites, renderMarket, renderArches, renderBoard, renderHours, renderStatus, burstSvg } from '../web/js/sections.js';
import { FAVORITES, DAY_NIGHT, HOURS } from '../web/js/site-data.js';
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

test('renderFavorites: 4 tarjetas con nombre, precio real y enlace a su plato en la carta', () => {
  const html = renderFavorites(FAVORITES, 'es');
  assert.equal(count(html, 'class="fav"'), 4);
  assert.match(html, /The Ruben Sandwich/);
  assert.match(html, /\$15\.49/);
  assert.match(html, /href="menu\.html#ny-the-ruben-sandwich"/);
  assert.match(html, /deli-ruben-480\.webp/);
  assert.match(html, /Pastrami, queso suizo/);
});

test('renderMarket: 6 baldas sin precios', () => {
  const html = renderMarket(MARKET_CATEGORIES, 'es');
  assert.equal(count(html, '<figure class="tile">'), 6);
  assert.match(html, /Despensa/);
  assert.doesNotMatch(html, /\$/);
});

test('renderArches: dos cartas con su franja', () => {
  const html = renderArches(DAY_NIGHT, 'es');
  assert.match(html, /Coffee now/);
  assert.match(html, /Wine later/);
  assert.match(html, /7 pm – cierre/);
  assert.match(html, /Cervezas frías/);
});

test('renderBoard: sin datos muestra el especial del día y ningún plato', () => {
  const html = renderBoard({}, 3, 'es');
  assert.match(html, new RegExp(DAILY_SPECIAL.es.replace(/[¡!]/g, '.')));
  assert.doesNotMatch(html, /<li>/);
});

test('renderBoard: con datos del día pinta la lista escapada', () => {
  assert.match(renderBoard({ 3: [{ en: 'Stew', es: 'Guiso <casero>' }] }, 3, 'es'), /<li>Guiso &lt;casero&gt;<\/li>/);
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

test('burstSvg: estrella de 44 vértices con el color escapado', () => {
  const svg = burstSvg('#ED3B2F');
  assert.equal(svg.match(/points="([^"]+)"/)[1].split(' ').length, 44);
  assert.match(svg, /fill="#ED3B2F"/);
  assert.match(burstSvg('"><x'), /fill="&quot;&gt;&lt;x"/);
});

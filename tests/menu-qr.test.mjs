import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MENU, CATEGORIES, PARTS, PHONE } from '../web/js/menu-data.js';
import { esc } from '../web/js/sections.js';
import { EMOJI, MARQUEE, money, itemsLabel, pickLang, renderMarquee, renderTabs, renderCard, renderSections,
  findInMenu, renderCartLines, searchHits, orderText, orderUrl } from '../menu-qr/js/qr-render.js';

// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): los platos son los de la web; nada propio ni inventado.
const ALL = CATEGORIES.flatMap(c => MENU[c.id].map(item => ({ item, cat: c.id })));
const item = id => findInMenu(CATEGORIES, MENU, id).item;
const count = (s, needle) => s.split(needle).length - 1;
const RULE = '━'.repeat(12);
const LINES = [
  { id: 'bk-downtown-platter', name: 'Downtown Platter', price: 11.49, qty: 2 },
  { id: 'ny-the-ruben-sandwich', name: 'The Ruben Sandwich', price: 15.49, qty: 1 },
];

test('La carta del QR pinta los platos de la web: 15 categorías y 79 platos, en su orden', () => {
  assert.equal(CATEGORIES.length, 15);
  assert.equal(ALL.length, 79);
  for (const lang of ['es', 'en']) {
    const html = renderSections(CATEGORIES, MENU, PARTS, lang);
    assert.equal(count(html, 'class="menu-section"'), 15);
    assert.equal(count(html, '<article class="menu-card'), 79);
    assert.deepEqual([...html.matchAll(/id="sec-([^"]+)"/g)].map(m => m[1]), CATEGORIES.map(c => c.id));
    assert.deepEqual([...html.matchAll(/<article class="menu-card[^"]*" data-id="([^"]+)"/g)].map(m => m[1]),
      ALL.map(a => a.item.id));
  }
});

test('Cada categoría tiene su emoji y su pestaña, en el orden de la carta', () => {
  for (const c of CATEGORIES) assert.ok(EMOJI[c.id], `falta el emoji de ${c.id}`);
  const tabs = renderTabs(CATEGORIES, 'es');
  assert.deepEqual([...tabs.matchAll(/data-cat="([^"]+)"/g)].map(m => m[1]), CATEGORIES.map(c => c.id));
  assert.equal(count(tabs, 'cat-tab active'), 1);
  assert.match(tabs, /Desayunos/);
  assert.match(renderTabs(CATEGORIES, 'en'), /Breakfast/);
});

test('Foto solo si el plato la tiene (13), con su etiqueta escapada', () => {
  const withImg = ALL.filter(a => a.item.img);
  assert.equal(withImg.length, 13);
  for (const { item: i } of ALL) {
    const html = renderCard(i, 'es');
    if (i.img) assert.ok(html.includes(`../web/assets/img/${i.img}-480.webp`), i.id);
    else assert.ok(!html.includes('<img') && html.includes('menu-card no-img'), i.id);
  }
  const boars = withImg.find(a => a.item.badge === "Boar's Head");
  assert.ok(boars, "hay platos con la etiqueta Boar's Head");
  assert.ok(renderCard(boars.item, 'es').includes('Boar&#39;s Head'));
});

test('Sin precio: «Pregunta en tienda» y sin botón; con precio, con céntimos', () => {
  const free = ALL.filter(a => !(a.item.price > 0));
  assert.equal(free.length, 13);
  for (const { item: i } of free) {
    const es = renderCard(i, 'es'), en = renderCard(i, 'en');
    assert.ok(es.includes('Pregunta en tienda') && en.includes('Ask in store'), i.id);
    assert.ok(!es.includes('data-action'), i.id);
  }
  assert.equal(money(11.49), '$11.49');
  assert.equal(money(13), '$13.00');
  assert.equal(money(11.49 * 2), '$22.98');
  assert.ok(renderCard(item('bk-downtown-platter'), 'es').includes('<span class="card-price">$11.49</span>'));
});

test('Con el plato en el pedido, el «+» pasa a contador', () => {
  const dp = item('bk-downtown-platter');
  const html = renderCard(dp, 'es', 2);
  assert.ok(html.includes('data-action="dec"') && html.includes('data-action="inc"'));
  assert.ok(html.includes('<span class="step-qty">2</span>') && !html.includes('data-action="add"'));
  const all = renderSections(CATEGORIES, MENU, PARTS, 'es', id => (id === dp.id ? 3 : 0));
  assert.equal(count(all, 'class="step-qty"'), 1);
  assert.ok(all.includes('<span class="step-qty">3</span>'));
});

test('Descripciones y momentos del día en el idioma elegido', () => {
  const dp = item('bk-downtown-platter');
  assert.ok(renderCard(dp, 'es').includes(esc(dp.desc.es)));
  assert.ok(renderCard(dp, 'en').includes(esc(dp.desc.en)));
  assert.match(renderSections(CATEGORIES, MENU, PARTS, 'es'), /class="sec-label">Mañana</);
  assert.match(renderSections(CATEGORIES, MENU, PARTS, 'en'), /class="sec-label">Morning</);
});

test('Las 4 categorías con portada llevan su foto, y Rincón Dominicano la nota de especiales', () => {
  const html = renderSections(CATEGORIES, MENU, PARTS, 'es');
  const covers = CATEGORIES.filter(c => c.cover);
  assert.equal(covers.length, 4);
  for (const c of covers) assert.ok(html.includes(`../web/assets/img/${c.cover.img}-${c.cover.w[0]}.webp`), c.id);
  assert.ok(html.includes('¡Pregunta por nuestros especiales del día!'));
});

test('Idioma: el guardado; si no, el del móvil; si no es español, inglés', () => {
  assert.equal(pickLang('en', 'es-US'), 'en');
  assert.equal(pickLang('es', 'en-US'), 'es');
  assert.equal(pickLang(null, 'es-419'), 'es');
  assert.equal(pickLang(null, 'ES'), 'es');
  assert.equal(pickLang(null, 'en-US'), 'en');
  assert.equal(pickLang('fr', undefined), 'en');
  assert.equal(itemsLabel(1, 'es'), '1 plato');
  assert.equal(itemsLabel(3, 'en'), '3 items');
});

test('Franja: los 5 avisos reales, una tanda para leer y otra oculta para el bucle', () => {
  assert.equal(MARQUEE.length, 5);
  for (const lang of ['es', 'en']) {
    const html = renderMarquee(lang);
    for (const m of MARQUEE) assert.equal(count(html, esc(m[lang])), 2, m[lang]);
    assert.match(html, /<span class="mq-dup" aria-hidden="true">/);
  }
});

test('Buscador: sin tildes, en las dos lenguas y con todas las palabras', () => {
  assert.equal(searchHits(CATEGORIES, MENU, '').items.size, 79);
  assert.ok(searchHits(CATEGORIES, MENU, 'aguacate').cats.has('avocado-toast'));
  assert.ok(searchHits(CATEGORIES, MENU, 'CAFE').cats.has('coffee'));
  const none = searchHits(CATEGORIES, MENU, 'zzqxw');
  assert.equal(none.items.size, 0);
  assert.equal(none.cats.size, 0);
});

test('Pedido para comer aquí, en español, con mesa y nota', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: '  Ana ', table: ' 4 ', note: 'Sin cebolla' }, 'es'),
    `¡Hola! 🍽️ Pedido *Para comer aquí* · *Ana* · Mesa *4*:\n\n*Candela & Café Market*\n${RULE}\n`
    + `• Downtown Platter x2 — $22.98\n• The Ruben Sandwich x1 — $15.49\n${RULE}\n*Total: $38.47*\n\n📝 _Sin cebolla_`);
});

test('Para llevar, en inglés: sin mesa aunque se haya escrito y sin nota si está vacía', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'llevar', name: 'Ana', table: '7', note: '  ' }, 'en'),
    `Hi! 🥡 Order *Takeout* · *Ana*:\n\n*Candela & Café Market*\n${RULE}\n`
    + `• Downtown Platter x2 — $22.98\n• The Ruben Sandwich x1 — $15.49\n${RULE}\n*Total: $38.47*`);
  assert.match(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: 'Ana', table: '', note: '' }, 'en'),
    /^Hi! 🍽️ Order \*Dine in\* · \*Ana\*:\n/);
});

test('Sin nombre o sin platos no hay pedido; con pedido, va al WhatsApp del local', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: '   ' }, 'es'), null);
  assert.equal(orderUrl({ lines: [], total: 0, type: 'aqui', name: 'Ana' }, 'es'), null);
  assert.equal(PHONE, '17862547577');
  const u = new URL(orderUrl({ lines: LINES, total: 38.47, type: 'aqui', name: 'Ana', table: '4' }, 'es'));
  assert.equal(u.origin + u.pathname, 'https://wa.me/17862547577');
  assert.match(u.searchParams.get('text'), /\*Total: \$38\.47\*$/);
});

test('Líneas del pedido: la foto del plato o, si no tiene, el emoji de su categoría', () => {
  const lookup = id => findInMenu(CATEGORIES, MENU, id);
  const withImg = ALL.find(a => a.item.img && a.item.price > 0).item;
  const html = renderCartLines([LINES[0], { id: withImg.id, name: withImg.name, price: withImg.price, qty: 1 }], 'es', lookup);
  assert.ok(html.includes(`<span class="ci-emoji" aria-hidden="true">${EMOJI.breakfast}</span>`));
  assert.ok(html.includes(`../web/assets/img/${withImg.img}-480.webp`));
  assert.ok(html.includes('$22.98'));
  assert.ok(renderCartLines([{ id: 'ya-no-existe', name: 'X', price: 1, qty: 1 }], 'es', lookup).includes('🍽️'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MENU, CATEGORIES, PARTS, PHONE } from '../web/js/menu-data.js';
import { esc } from '../web/js/sections.js';
import { createCart } from '../web/js/cart-core.js';
import { MARQUEE, money, itemsLabel, pickLang, renderMarquee, renderTabs, renderCard, renderSections,
  findInMenu, renderCartLines, searchHits, orderText, orderUrl, variants } from '../menu-qr/js/qr-render.js';
import { TXT } from '../menu-qr/js/qr-render.js';

// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): los platos son los de la web; nada propio ni inventado.
const ALL = CATEGORIES.flatMap(c => MENU[c.id].map(item => ({ item, cat: c.id })));
const item = id => findInMenu(CATEGORIES, MENU, id).item;
const count = (s, needle) => s.split(needle).length - 1;
const RULE = '━'.repeat(12);
const LINES = [
  { id: 'bk-downtown-platter', name: 'Downtown Platter', price: 11.49, qty: 2 },
  { id: 'ny-the-ruben-sandwich', name: 'The Ruben Sandwich', price: 15.49, qty: 1 },
];

test('La carta del QR pinta los platos de la web: 19 categorías y 97 platos, en su orden', () => {
  assert.equal(CATEGORIES.length, 19);
  assert.equal(ALL.length, 97);
  for (const lang of ['es', 'en']) {
    const html = renderSections(CATEGORIES, MENU, PARTS, lang);
    assert.equal(count(html, 'class="menu-section"'), 19);
    assert.equal(count(html, '<article class="menu-card'), 97);   // una tarjeta por bebida, no por tamaño
    assert.deepEqual([...html.matchAll(/id="sec-([^"]+)"/g)].map(m => m[1]), CATEGORIES.map(c => c.id));
    assert.deepEqual([...html.matchAll(/<article class="menu-card[^"]*" data-id="([^"]+)"/g)].map(m => m[1]),
      ALL.map(a => a.item.id));
  }
});

test('Cada categoría tiene su pestaña, solo con su nombre, en el orden de la carta', () => {
  const tabs = renderTabs(CATEGORIES, 'es');
  assert.deepEqual([...tabs.matchAll(/data-cat="([^"]+)"/g)].map(m => m[1]), CATEGORIES.map(c => c.id));
  assert.equal(count(tabs, 'cat-tab active'), 1);
  assert.ok(tabs.includes('data-cat="breakfast">Desayunos</button>'));
  assert.ok(renderTabs(CATEGORIES, 'en').includes('data-cat="daily-buffet">Daily Buffet</button>'));
});

// Robert (19-oct): «en el menú no quiero que salgan emojis». Las banderas se escriben con letras regionales y
// el U+FE0F convierte un símbolo en emoji: también cuentan. ✦ (franja), ✕ (cerrar) y ━ (WhatsApp) no son emojis.
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}|️/u;

test('Sin emojis en la carta: pestañas, secciones, franja, pedido, texto de WhatsApp ni la página', () => {
  const lookup = id => findInMenu(CATEGORIES, MENU, id);
  const lines = [...ALL.map(a => ({ id: a.item.id, name: a.item.name, price: a.item.price, qty: 1 })),
    { id: 'ya-no-existe', name: 'X', price: 1, qty: 1 }];
  for (const lang of ['es', 'en']) {
    const shown = {
      tabs: renderTabs(CATEGORIES, lang),
      sections: renderSections(CATEGORIES, MENU, PARTS, lang, () => 1),
      marquee: renderMarquee(lang),
      cart: renderCartLines(lines, lang, lookup),
      textos: Object.values(TXT).map(t => t[lang]).join(' '),
      aqui: orderText({ lines: LINES, total: 38.47, type: 'aqui', name: 'Ana', table: '4', note: 'Sin cebolla' }, lang),
      llevar: orderText({ lines: LINES, total: 38.47, type: 'llevar', name: 'Ana', note: 'x' }, lang),
    };
    for (const [k, v] of Object.entries(shown)) assert.doesNotMatch(v, EMOJI_RE, `${k} (${lang})`);
  }
  for (const f of ['menu-qr/index.html', 'menu-qr/js/qr-render.js', 'menu-qr/js/menu-qr.js', 'menu-qr/css/menu-qr.css']) {
    assert.doesNotMatch(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), EMOJI_RE, f);
  }
  assert.doesNotMatch(renderSections(CATEGORIES, MENU, PARTS, 'es'), /sec-icon/);
});

test('Foto solo si el plato la tiene (31: 13 platos y 18 de las 19 bebidas del Coffee Bar), con su etiqueta escapada', () => {
  const withImg = ALL.filter(a => a.item.img);
  assert.equal(withImg.length, 31);
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
  // Make Your Own Breakfast y la panadería no tienen precio en el impreso; el café sí (PDF, 19-oct)
  assert.deepEqual(free.map(a => a.cat), ['breakfast', 'bakery', 'bakery', 'bakery']);
  for (const { item: i } of free) {
    const es = renderCard(i, 'es'), en = renderCard(i, 'en');
    assert.ok(es.includes('Pregunta en tienda') && en.includes('Ask in store'), i.id);
    assert.ok(!es.includes('data-action'), i.id);
  }
  assert.equal(money(11.49), '$11.49');
  assert.equal(money(13), '$13.00');
  assert.equal(money(11.49 * 2), '$22.98');
  assert.ok(renderCard(item('bk-downtown-platter'), 'es').includes('<span class="card-price">$12.49</span>'));
});

test('Con el plato en el pedido, el «+» pasa a contador', () => {
  const dp = item('bk-downtown-platter');
  const html = renderCard(dp, 'es', id => (id === dp.id ? 2 : 0));
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

test('Las 5 categorías con portada llevan su foto; el Daily Buffet, la mesa caliente y su nota, sin platos', () => {
  const html = renderSections(CATEGORIES, MENU, PARTS, 'es');
  const covers = CATEGORIES.filter(c => c.cover);
  assert.equal(covers.length, 5);
  for (const c of covers) assert.ok(html.includes(`../web/assets/img/${c.cover.img}-${c.cover.w[0]}.webp`), c.id);
  const sec = id => html.slice(html.indexOf(`id="sec-${id}"`), html.indexOf('</section>', html.indexOf(`id="sec-${id}"`)));
  const buffet = sec('daily-buffet');
  assert.ok(buffet.includes('mediodia-mesa-caliente-480.webp'));
  assert.ok(buffet.includes('<p class="sec-note">Comida fresca, cocinada cada día y con sabor auténtico. Pregunta qué hay hoy.</p>'));
  assert.equal(count(buffet, '<article'), 0);
  assert.ok(renderSections(CATEGORIES, MENU, PARTS, 'en').includes("Cooked fresh every day, with authentic flavor. Ask what&#39;s on today."));
  // Rincón Dominicano ya no lleva la foto de la mesa caliente («esa es la comida del daily», Robert) ni el aviso del día
  const dom = sec('dominican-spot');
  assert.ok(dom.includes('mediodia-dominican-spot-480.webp') && !dom.includes('mediodia-mesa-caliente'));
  assert.ok(!dom.includes('sec-note'));
  // el buffet abre el mediodía
  const midday = CATEGORIES.filter(c => c.part === 'midday').map(c => c.id);
  assert.equal(midday[0], 'daily-buffet');
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

test('Buscador: sin búsqueda se ven todas las secciones, también el Daily Buffet, que no tiene platos', () => {
  for (const q of ['', ' ', 'a']) {
    const all = searchHits(CATEGORIES, MENU, q);
    assert.equal(all.items.size, 97, JSON.stringify(q));
    assert.deepEqual([...all.cats], CATEGORIES.map(c => c.id), JSON.stringify(q));
  }
  // con búsqueda, la sección sin platos sale si coinciden su nombre o su nota
  assert.deepEqual([...searchHits(CATEGORIES, MENU, 'buffet').cats], ['daily-buffet']);
  assert.ok(searchHits(CATEGORIES, MENU, 'comida fresca').cats.has('daily-buffet'));
  assert.ok(!searchHits(CATEGORIES, MENU, 'reuben').cats.has('daily-buffet'));
});

test('Buscador: sin tildes, en las dos lenguas y con todas las palabras', () => {
  assert.equal(searchHits(CATEGORIES, MENU, '').items.size, 97);
  assert.ok(searchHits(CATEGORIES, MENU, 'aguacate').cats.has('avocado-toast'));
  assert.ok(searchHits(CATEGORIES, MENU, 'CAFE').cats.has('coffee'));
  assert.deepEqual([...searchHits(CATEGORIES, MENU, 'matcha').cats], ['matcha']);
  assert.equal([...searchHits(CATEGORIES, MENU, 'latte').items].filter(id => id.startsWith('lt-')).length, 3);
  const none = searchHits(CATEGORIES, MENU, 'zzqxw');
  assert.equal(none.items.size, 0);
  assert.equal(none.cats.size, 0);
});

test('Pedido para comer aquí, en español, con mesa y nota', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: '  Ana ', table: ' 4 ', note: 'Sin cebolla' }, 'es'),
    `¡Hola! Pedido *Para comer aquí* · *Ana* · Mesa *4*:\n\n*Candela & Café Market*\n${RULE}\n`
    + `• Downtown Platter x2 — $22.98\n• The Ruben Sandwich x1 — $15.49\n${RULE}\n*Total: $38.47*\n\nNota: _Sin cebolla_`);
});

test('Para llevar, en inglés: sin mesa aunque se haya escrito y sin nota si está vacía', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'llevar', name: 'Ana', table: '7', note: '  ' }, 'en'),
    `Hi! Order *Takeout* · *Ana*:\n\n*Candela & Café Market*\n${RULE}\n`
    + `• Downtown Platter x2 — $22.98\n• The Ruben Sandwich x1 — $15.49\n${RULE}\n*Total: $38.47*`);
  assert.match(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: 'Ana', table: '', note: '' }, 'en'),
    /^Hi! Order \*Dine in\* · \*Ana\*:\n/);
  assert.match(orderText({ lines: LINES, total: 38.47, type: 'llevar', name: 'Ana', note: 'No onions' }, 'en'),
    /\n\nNote: _No onions_$/);
});

test('Sin nombre o sin platos no hay pedido; con pedido, va al WhatsApp del local', () => {
  assert.equal(orderText({ lines: LINES, total: 38.47, type: 'aqui', name: '   ' }, 'es'), null);
  assert.equal(orderUrl({ lines: [], total: 0, type: 'aqui', name: 'Ana' }, 'es'), null);
  assert.equal(PHONE, '17862547577');
  const u = new URL(orderUrl({ lines: LINES, total: 38.47, type: 'aqui', name: 'Ana', table: '4' }, 'es'));
  assert.equal(u.origin + u.pathname, 'https://wa.me/17862547577');
  assert.match(u.searchParams.get('text'), /\*Total: \$38\.47\*$/);
});

test('Líneas del pedido: la foto del plato o, si no tiene, el logo del local', () => {
  const lookup = id => findInMenu(CATEGORIES, MENU, id);
  const withImg = ALL.find(a => a.item.img && a.item.price > 0).item;
  const logo = '<img class="ci-logo" src="../web/assets/img/logo-96.webp" alt=""';
  const html = renderCartLines([LINES[0], { id: withImg.id, name: withImg.name, price: withImg.price, qty: 1 }], 'es', lookup);
  assert.equal(count(html, logo), 1);   // el Downtown Platter no tiene foto
  assert.ok(html.includes(`../web/assets/img/${withImg.img}-480.webp`));
  assert.ok(html.includes('$22.98'));
  assert.ok(renderCartLines([{ id: 'ya-no-existe', name: 'X', price: 1, qty: 1 }], 'es', lookup).includes(logo));
});

// Coffee Bar (PDF del cliente, 19-oct): las bebidas con MEDIUM / LARGE son una tarjeta con una línea por tamaño.
const capu = () => item('cf-cappuccino');

test('Tamaños: una línea por tamaño, con su precio y su «+», en el idioma elegido', () => {
  const es = renderCard(capu(), 'es'), en = renderCard(capu(), 'en');
  assert.equal(count(es, '<div class="size">'), 2);
  assert.ok(es.includes('<span class="size-name">Mediano</span><span class="card-price">$3.99</span>'));
  assert.ok(es.includes('<span class="size-name">Grande</span><span class="card-price">$4.99</span>'));
  assert.ok(en.includes('<span class="size-name">Medium</span>') && en.includes('<span class="size-name">Large</span>'));
  assert.deepEqual([...es.matchAll(/data-action="add" data-id="([^"]+)"/g)].map(m => m[1]), ['cf-cappuccino:md', 'cf-cappuccino:lg']);
  assert.ok(es.includes('aria-label="Añadir: Cappuccino (Mediano)"') && en.includes('aria-label="Add: Cappuccino (Large)"'));
  // sin tamaños, como siempre: un precio y un «+»
  const espresso = renderCard(item('cf-espresso'), 'es');
  assert.ok(!espresso.includes('class="size"') && espresso.includes('<span class="card-price">$3.25</span>'));
  assert.equal(count(espresso, 'data-action="add"'), 1);
});

test('Tamaños: el contador sale solo en el tamaño que está en el pedido', () => {
  const html = renderCard(capu(), 'es', id => (id === 'cf-cappuccino:lg' ? 2 : 0));
  assert.ok(html.includes('data-action="add" data-id="cf-cappuccino:md"'));
  assert.ok(html.includes('data-action="dec" data-id="cf-cappuccino:lg"') && html.includes('<span class="step-qty">2</span>'));
  assert.ok(!html.includes('data-action="add" data-id="cf-cappuccino:lg"'));
  const all = renderSections(CATEGORIES, MENU, PARTS, 'es', id => (id === 'cf-cappuccino:md' ? 1 : 0));
  assert.equal(count(all, 'class="step-qty"'), 1);
});

test('Tamaños: cada uno es un plato del pedido, con id «:md» / «:lg» y el nombre en inglés, como la carta impresa', () => {
  assert.deepEqual(variants(capu()), [
    { id: 'cf-cappuccino:md', size: 'md', name: 'Cappuccino (Medium)', price: 3.99, img: 'cafe-cappuccino' },
    { id: 'cf-cappuccino:lg', size: 'lg', name: 'Cappuccino (Large)', price: 4.99, img: 'cafe-cappuccino' },
  ]);
  const lg = findInMenu(CATEGORIES, MENU, 'cf-cappuccino:lg');
  assert.equal(lg.cat, 'coffee');
  assert.equal(lg.parent.id, 'cf-cappuccino');
  assert.deepEqual([lg.item.name, lg.item.price], ['Cappuccino (Large)', 4.99]);
  assert.equal(findInMenu(CATEGORIES, MENU, 'lt-pistachio-latte:md').item.price, 5.99);
  assert.equal(findInMenu(CATEGORIES, MENU, 'cf-cappuccino:xl'), null);   // tamaño que no existe
  assert.equal(findInMenu(CATEGORIES, MENU, 'cf-espresso:md'), null);     // el espresso no tiene tamaños
  assert.equal(findInMenu(CATEGORIES, MENU, 'cf-cappuccino').item.id, 'cf-cappuccino');
  // 19 bebidas: 14 con dos tamaños y 5 de un solo precio
  const drinks = ALL.filter(a => ['coffee', 'matcha', 'lattes'].includes(a.cat));
  assert.equal(drinks.length, 19);
  assert.equal(drinks.filter(a => a.item.sizes).length, 14);
});

test('Tamaños en el pedido: el carrito los guarda aparte, revalida nombre y precio, y van así por WhatsApp', () => {
  const lookup = id => findInMenu(CATEGORIES, MENU, id);
  const cart = createCart();
  cart.add(lookup('cf-cappuccino:md').item);
  cart.add(lookup('cf-cappuccino:md').item);
  cart.add(lookup('cf-cappuccino:lg').item);
  assert.deepEqual(cart.lines().map(l => [l.id, l.qty]), [['cf-cappuccino:md', 2], ['cf-cappuccino:lg', 1]]);
  assert.equal(cart.total(), 12.97);
  // lo guardado con otro precio o un tamaño que ya no existe se corrige o se quita al abrir la carta
  const old = createCart(JSON.stringify([
    { id: 'cf-cappuccino:lg', name: 'Cappuccino', price: 0.5, qty: 1 },
    { id: 'cf-espresso:md', name: 'Espresso (Medium)', price: 3.25, qty: 1 },
  ]));
  old.revalidate(id => lookup(id)?.item);
  assert.deepEqual(old.lines(), [{ id: 'cf-cappuccino:lg', name: 'Cappuccino (Large)', price: 4.99, qty: 1 }]);
  assert.match(orderText({ lines: cart.lines(), total: cart.total(), type: 'llevar', name: 'Ana' }, 'es'),
    /• Cappuccino \(Medium\) x2 — \$7\.98\n• Cappuccino \(Large\) x1 — \$4\.99\n/);
  // en la hoja del pedido, cada tamaño con la foto de su bebida
  assert.equal(count(renderCartLines(cart.lines(), 'es', lookup), '../web/assets/img/cafe-cappuccino-480.webp'), 2);
});

const url = p => new URL(`../${p}`, import.meta.url);
const read = p => readFileSync(url(p), 'utf8');
const SRC = ['menu-qr/index.html', 'menu-qr/css/menu-qr.css', 'menu-qr/js/menu-qr.js', 'menu-qr/js/qr-render.js', 'menu-qr/netlify.toml'];

test('La página tiene todo lo que usa el JS, y sus textos existen en ES y EN', () => {
  const html = read('menu-qr/index.html');
  for (const id of ['appHeader', 'searchBtn', 'searchBack', 'searchInput', 'marqueeStrip', 'marqueeTrack', 'catTabs',
    'menuSections', 'emptyState', 'cartFab', 'fabCount', 'fabTotal', 'overlay', 'cartSheet', 'cartClose', 'cartCountLabel',
    'cartLines', 'cartEmpty', 'orderForm', 'guestName', 'nameError', 'tableField', 'tableNum', 'orderNote', 'sheetFtr',
    'cartTotalAmt', 'waBtn']) {
    assert.ok(html.includes(`id="${id}"`), `falta #${id}`);
  }
  assert.ok(html.includes('data-lang="en"') && html.includes('data-lang="es"'));
  assert.ok(html.includes('data-type="aqui"') && html.includes('data-type="llevar"'));
  for (const m of html.matchAll(/data-t(?:-ph|-aria)?="([^"]+)"/g)) {
    assert.ok(TXT[m[1]] && TXT[m[1]].es && TXT[m[1]].en, `falta el texto ${m[1]}`);
  }
});

test('La página: sale en Google con su URL canónica (Robert, 13-oct), sin scripts en línea ni CDNs, y con los datos reales del local', () => {
  const html = read('menu-qr/index.html');
  assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.doesNotMatch(html, /noindex/);
  assert.match(html, /<link rel="canonical" href="https:\/\/menu\.candelaycafe\.com\/">/);
  // al compartirla (o compartir candelaycafe.com/menu, que redirige aquí) sale con foto, como salía /menu
  assert.match(html, /<meta property="og:url" content="https:\/\/menu\.candelaycafe\.com\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/candelaycafe\.com\/assets\/img\/og-image\.jpg">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.equal([...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)].length, 0, 'sin <script> en línea');
  assert.match(html, /<script type="module" src="js\/menu-qr\.js"><\/script>/);
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com|cdnjs|unpkg|jsdelivr/);
  assert.deepEqual([...html.matchAll(/as="font"[^>]*href="([^"]+)"/g)].map(m => m[1]), ['../web/assets/fonts/dm-sans-latin.woff2']);
  assert.ok(html.includes('507 N Miami Ave') && html.includes('tel:+17862547577') && html.includes('https://candelaycafe.com/'));
});

test('Solo DM Sans: una @font-face y toda declaración de fuente va a var(--body)', () => {
  const css = read('menu-qr/css/menu-qr.css');
  const faces = [...css.matchAll(/@font-face\{font-family:'([^']+)'[^}]*url\("([^"]+)"\)/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(faces, [['DM Sans', '../../web/assets/fonts/dm-sans-latin.woff2']]);
  assert.match(css, /--body:'DM Sans',system-ui,sans-serif/);
  for (const m of css.replace(/@font-face\{[^}]*\}/g, '').matchAll(/(?<![-\w])font(-family)?:([^;}]+)/g)) {
    const value = m[2].trim();
    if (m[1]) assert.ok(['var(--body)', 'inherit'].includes(value), `font-family:${value}`);
    else assert.ok(/ var\(--body\)$/.test(value) || value === 'inherit', `font:${value}`);
  }
});

test('Nada inventado en la carta del QR', () => {
  for (const f of SRC.filter(f => existsSync(url(f)))) {
    const s = read(f);
    for (const bad of ['555', 'Coral Way', 'unsplash', 'Sancocho de los domingos', 'Trío Buenos Aires', 'Semana Santa',
      'Mangú', 'Mamajuana', 'cookie']) {
      assert.ok(!s.includes(bad), `${f} contiene «${bad}»`);
    }
  }
});

test('El paquete de publicación lleva todo lo que la página pide', () => {
  execFileSync(process.execPath, [fileURLToPath(url('tools/build-menu-qr.mjs'))], { stdio: 'pipe' });
  const dist = p => url(`dist-menu-qr/${p}`);
  for (const f of ['index.html', 'favicon.ico', 'netlify.toml', 'css/menu-qr.css', 'js/menu-qr.js', 'js/qr-render.js',
    'web/js/menu-data.js', 'web/js/cart-core.js', 'web/js/menu-render.js', 'web/js/sections.js', 'web/js/focus-trap.js',
    'web/assets/fonts/dm-sans-latin.woff2', 'web/assets/img/logo-96.webp', 'web/favicon-32x32.png', 'web/apple-touch-icon.png']) {
    assert.ok(existsSync(dist(f)), `falta ${f}`);
  }
  // cada foto que pinta la carta (filas, portadas de categoría y líneas del pedido) está en el paquete
  const priced = ALL.filter(a => a.item.price > 0).map(a => ({ id: a.item.id, name: a.item.name, price: a.item.price, qty: 1 }));
  const html = renderSections(CATEGORIES, MENU, PARTS, 'es') + renderCartLines(priced, 'es', id => findInMenu(CATEGORIES, MENU, id));
  const fotos = new Set([...html.matchAll(/\.\.\/web\/assets\/img\/([\w-]+\.webp)/g)].map(m => m[1]));
  assert.ok(fotos.size >= 17);
  for (const f of fotos) assert.ok(existsSync(dist(`web/assets/img/${f}`)), `falta la foto ${f}`);
  // los imports de la página resuelven dentro del paquete publicado en la raíz
  for (const f of ['js/menu-qr.js', 'js/qr-render.js']) {
    for (const m of read(`dist-menu-qr/${f}`).matchAll(/from '([^']+)'/g)) {
      const target = new URL(m[1], `https://menu.test/${f}`).pathname.slice(1);
      assert.ok(existsSync(dist(target)), `${f} importa ${m[1]}, que no está en el paquete`);
    }
  }
});

test('Cabeceras de la carta del QR: nada que la saque de Google y la CSP no deja scripts en línea', () => {
  const toml = read('menu-qr/netlify.toml');
  assert.doesNotMatch(toml, /X-Robots-Tag|noindex/);
  const csp = toml.match(/Content-Security-Policy = "([^"]+)"/)[1];
  assert.equal(csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src')), "script-src 'self'");
  assert.match(csp, /frame-ancestors 'none'/);
});

// Revisión final (9-oct): etiquetas sin foto, foco en la hoja del pedido y doble toque en el iPhone.
const rulesFor = (css, selector) => css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').flatMap(block => {
  const i = block.indexOf('{');
  return i > -1 && block.slice(0, i).trim().split(/\s*,\s*/).includes(selector) ? [block.slice(i + 1)] : [];
});

test('La etiqueta del plato sale aunque no tenga foto', () => {
  const conEtiqueta = ALL.filter(a => a.item.badge);
  assert.ok(conEtiqueta.some(a => !a.item.img), 'hay platos con etiqueta y sin foto');
  for (const { item: i } of conEtiqueta) assert.equal(count(renderCard(i, 'es'), `>${esc(i.badge)}</span>`), 1, i.id);
});

test('La hoja del pedido es visible en cuanto se abre, para que el foco entre en el diálogo', () => {
  const css = read('menu-qr/css/menu-qr.css');
  assert.match(rulesFor(css, '.cart-sheet')[0], /visibility 0s \.34s/);          // al cerrar, se oculta al final
  assert.match(rulesFor(css, '.cart-sheet.open')[0], /visibility 0s(?!\s*\.)/);   // al abrir, al instante
});

test('Los botones que se tocan seguido no hacen zoom con doble toque en el iPhone', () => {
  const css = read('menu-qr/css/menu-qr.css');
  for (const sel of ['.add-btn', '.step-btn', '.ci-btn', '.cat-tab', '.ot-btn']) {
    assert.ok(rulesFor(css, sel).some(b => b.includes('touch-action:manipulation')), sel);
  }
});

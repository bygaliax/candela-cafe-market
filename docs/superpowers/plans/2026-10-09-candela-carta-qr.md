# Carta del QR en menu.candelaycafe.com — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que `menu.candelaycafe.com` (donde abren los QR del local) enseñe la carta de abril sobre blanco, solo en DM Sans y con los platos reales de la web, con pedido por WhatsApp al número real, y que el QR nuevo apunte ahí.

**Architecture:**
- **`menu-qr/`** es una página estática nueva dentro del repo. Importa los datos y el carrito de `web/js/` sin copiarlos.
- **Lo que se prueba sin navegador** (HTML en texto, pedido y búsqueda) vive en `menu-qr/js/qr-render.js`.
- **`tools/build-menu-qr.mjs`** empaqueta en `dist-menu-qr/` la página más la parte de `web/` que usa. Así las rutas `../web/...` valen igual en el repo y publicadas.
- **Publicación:** a mano, en el sitio de Netlify que ya tiene el dominio.
- **El QR** se rehace con `qr/generar.py` y se verifica con `qr/verificar.py`, `qr/verificar-jsqr.mjs` y `qr/verificar.html`.

**Tech Stack:**
- HTML, CSS y JS (módulos ES) sin build de bundler.
- `node:test` (Node 24).
- Python con `qrcode`, PyMuPDF y OpenCV 5.
- `sharp` y `jsqr` en `tools/`.
- Netlify CLI 26.

**Spec:** `docs/superpowers/specs/2026-10-09-candela-carta-qr-design.md`

## Global Constraints

- **URL del QR:** `https://menu.candelaycafe.com`
- **WhatsApp de los pedidos:** `17862547577`, que es `PHONE` de `web/js/menu-data.js`. Nunca otro número.
- **Sitio de Netlify:** `candela-cafe-menu`, ID `1260f03f-9e5d-4992-9259-6021bbd3814e`. No se tocan su dominio, los DNS ni sus ajustes.
- **Colores (variante A):**

  | Token | Valor |
  |---|---|
  | fondo | `#FFFFFF` |
  | texto | `#2C1810` |
  | texto 2 | `#6B5A50` |
  | naranja | `#C9571A` |
  | naranja de relleno con texto blanco | `#B5501A` |
  | precios | `#A8441A` |
  | dorado | `#D4A83A` |
  | verde | `#3A4A3C` |
  | WhatsApp | `#25D366`, con texto `#0B2A16` |

- **Letra:** solo DM Sans, de `web/assets/fonts/dm-sans-latin.woff2`. Una sola `@font-face`, y toda declaración de fuente va a `var(--body)`.
- **Nada inventado:** solo datos que ya están en la web. Ni `555`, ni Coral Way, ni platos, ofertas o eventos que no existen.
- **Sin CDNs ni Google Fonts.** CSP con `script-src 'self'` y sin `<script>` en línea en la página publicada.
- **`web/` no cambia:** la carta y la portada de `candelaycafe.com` siguen igual.
- **Pruebas:** `node --test tests/*.test.mjs`. Node 24 no acepta la carpeta `tests/` sola.
- **Producción solo con el OK explícito de Robert.** Antes, siempre, un deploy de prueba.
- **Commits:**
  - en español y con el estilo del repo (`feat(qr-menu): …`, `test(qr-menu): …`);
  - acaban con estas dos líneas:
    ```
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi
    ```
  - `git push` de la rama `feature/qr-menu` después de cada commit.
- **Lectores de QR en este PC:** OpenCV funciona; ZXing no, porque Smart App Control bloquea su DLL. El tercer lector es jsQR.

## Review Focus

Estos casos no los cubre ninguna prueba con `node:test`. Cada uno lleva su comprobación con Playwright en la Task 3.

1. **Pedido guardado de una carta anterior:** si cambió un precio o desapareció un plato, al abrir la página el pedido
   se corrige (el precio nuevo y sin el plato que ya no existe).
2. **Enviar sin nombre:** no abre WhatsApp, marca el campo, enseña el aviso y pone el foco en el nombre.
3. **Móvil de 320 px con nombres largos** («3 Pancakes / French Toast / Wafles», «Central Park Club Sandwiches»): sin
   scroll horizontal.
4. **Modo privado o almacenamiento bloqueado:** la carta se ve y el pedido funciona igual; solo no se recuerda al
   recargar.
5. **Cambiar de idioma con platos en el pedido:** cambian los textos de la carta, el botón flotante y la hoja, y el
   pedido se conserva.

---

### Task 1: Funciones puras de la carta del QR

**Files:**
- Create: `menu-qr/js/qr-render.js`
- Create: `tests/menu-qr.test.mjs`

**Interfaces:**
- Consumes (de la web, sin tocarlos):
  - `esc(s)` de `web/js/sections.js`;
  - `matches(item, cat, query)` de `web/js/menu-render.js`;
  - `waUrl(phone, text)` de `web/js/cart-core.js`;
  - `PHONE`, `MENU`, `CATEGORIES` y `PARTS` de `web/js/menu-data.js`.
  - Forma de los datos:
    - `MENU[catId]` es una lista de platos `{ id: string, name: string, desc: {en,es}|null, price: number (0 = sin precio), badge: string|null, img: string|null, focus?: string }`.
    - `CATEGORIES[i]` es `{ id, part, label: {en,es}, cover?: {img, w: number[], focus?}, note?: {en,es} }`.
    - `PARTS[i]` es `{ id, label: {en,es} }`.
- Produces (todo exportado desde `menu-qr/js/qr-render.js`):
  - **Constantes:** `IMG` (`'../web/assets/img/'`), `EMOJI` (`{catId: string}`), `MARQUEE` (lista `{es, en}`) y
    `TXT` (`{clave: {es, en}}`).
  - **Textos e idioma:**
    - `tr(key, lang) → string`;
    - `money(n) → '$11.49'`;
    - `itemsLabel(n, lang) → '2 platos' | '2 items'`;
    - `pickLang(stored, navLang) → 'es' | 'en'`.
  - **HTML en texto:**
    - `renderMarquee(lang)`;
    - `renderTabs(categories, lang)`;
    - `renderCard(item, lang, qty = 0)`;
    - `renderSections(categories, menu, parts, lang, qtyOf = () => 0)`;
    - `renderCartLines(lines, lang, lookup)`, donde `lines` es `[{id, name, price, qty}]` y `lookup(id)` devuelve
      `{item, cat}` o `null`.
  - **Búsqueda:** `findInMenu(categories, menu, id) → {item, cat} | null` y
    `searchHits(categories, menu, query) → {items: Set<id>, cats: Set<catId>}`.
  - **Pedido:**
    - `orderText({lines, total, type: 'aqui'|'llevar', name, table, note}, lang) → string | null`;
    - `orderUrl(order, lang) → 'https://wa.me/17862547577?text=…' | null`.

- [ ] **Step 1: Escribir las pruebas (fallan: el módulo no existe)**

Crear `tests/menu-qr.test.mjs`:

```js
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
```

- [ ] **Step 2: Comprobar que fallan**

Run: `node --test tests/menu-qr.test.mjs`
Expected: FAIL. `Cannot find module …/menu-qr/js/qr-render.js`.

- [ ] **Step 3: Escribir el módulo**

Crear `menu-qr/js/qr-render.js`:

```js
// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): funciones PURAS que devuelven HTML en texto o el pedido.
// Probadas en tests/menu-qr.test.mjs. Los platos son los de la web (web/js/menu-data.js); todo dato pasa por esc().
import { esc } from '../../web/js/sections.js';
import { matches } from '../../web/js/menu-render.js';
import { waUrl } from '../../web/js/cart-core.js';
import { PHONE } from '../../web/js/menu-data.js';

/** Fotos de la web. Relativo a la página: vale en el repo (/menu-qr/) y publicado (/), ver tools/build-menu-qr.mjs. */
export const IMG = '../web/assets/img/';

export const EMOJI = {
  breakfast: '☀️', 'avocado-toast': '🥑', bakery: '🥐', coffee: '☕', juices: '🍊', smoothies: '🍓',
  shakes: '💪', appetizers: '🍟', 'salads-wraps': '🥗', 'dominican-spot': '🇩🇴', soups: '🍲',
  signature: '🥪', 'ny-signature': '🗽', panini: '🥖', burgers: '🍔',
};
const emoji = cat => EMOJI[cat] || '🍽️';

/** Franja de avisos: solo datos que ya están en la web. */
export const MARQUEE = [
  { es: '🎵 Música en vivo · todos los viernes desde las 8 pm', en: '🎵 Live music · every Friday from 8 pm' },
  { es: '⭐ Pregunta por los especiales del día', en: '⭐ Ask about our daily specials' },
  { es: '🛵 También en Uber Eats y DoorDash', en: '🛵 Also on Uber Eats and DoorDash' },
  { es: '☕ Abiertos todos los días desde las 8 am', en: '☕ Open every day from 8 am' },
  { es: '📍 507 N Miami Ave · Downtown Miami', en: '📍 507 N Miami Ave · Downtown Miami' },
];

/** Textos de la página. En index.html van en data-t (texto), data-t-ph (placeholder) y data-t-aria (aria-label). */
export const TXT = {
  title:       { es: 'Carta — Candela & Café Market', en: 'Menu — Candela & Café Market' },
  skip:        { es: 'Ir a la carta', en: 'Skip to the menu' },
  search:      { es: 'Buscar en la carta…', en: 'Search the menu…' },
  searchBtn:   { es: 'Buscar', en: 'Search' },
  back:        { es: 'Volver', en: 'Back' },
  cats:        { es: 'Categorías', en: 'Categories' },
  eyebrow:     { es: 'NY Deli Market & Café', en: 'NY Deli Market & Café' },
  sub:         { es: 'Deli de Nueva York y comida dominicana en Downtown Miami.', en: 'NY deli & Dominican food in Downtown Miami.' },
  pill:        { es: 'Comida dominicana', en: 'Dominican food' },
  ask:         { es: 'Pregunta en tienda', en: 'Ask in store' },
  add:         { es: 'Añadir', en: 'Add' },
  less:        { es: 'Quitar uno', en: 'Remove one' },
  more:        { es: 'Añadir otro', en: 'Add one more' },
  empty:       { es: 'No lo encontramos. Pregúntanos en tienda.', en: "We couldn't find it. Ask us in store." },
  order:       { es: 'Tu pedido', en: 'Your order' },
  cartEmpty:   { es: 'Tu pedido está vacío. ¡Escoge algo rico!', en: 'Your order is empty. Pick something good!' },
  type:        { es: 'Tipo de pedido', en: 'Order type' },
  here:        { es: 'Para comer aquí', en: 'Dine in' },
  togo:        { es: 'Para llevar', en: 'Takeout' },
  name:        { es: 'Tu nombre', en: 'Your name' },
  namePh:      { es: 'Nombre', en: 'Name' },
  nameMissing: { es: 'Escribe tu nombre para enviar el pedido.', en: 'Add your name to send the order.' },
  table:       { es: 'Mesa nº', en: 'Table #' },
  tablePh:     { es: 'Ej: 4', en: 'E.g. 4' },
  note:        { es: 'Nota para la cocina', en: 'Note for the kitchen' },
  notePh:      { es: 'Sin picante, alergias, sin sal…', en: 'No spice, allergies, no salt…' },
  total:       { es: 'Total', en: 'Total' },
  send:        { es: 'Enviar pedido por WhatsApp', en: 'Send order on WhatsApp' },
  close:       { es: 'Cerrar', en: 'Close' },
};
export const tr = (key, lang) => TXT[key][lang];

export const money = n => `$${n.toFixed(2)}`;
export const itemsLabel = (n, lang) => (lang === 'es' ? `${n} ${n === 1 ? 'plato' : 'platos'}` : `${n} ${n === 1 ? 'item' : 'items'}`);

/** El idioma guardado; si no hay, el del móvil (español si empieza por «es»); si no, inglés. */
export const pickLang = (stored, nav) =>
  (['es', 'en'].includes(stored) ? stored : /^es\b/i.test(String(nav || '')) ? 'es' : 'en');

/** Dos tandas iguales: la animación mueve la pista un 50 % y vuelve sin salto. La segunda no se lee en voz alta. */
export function renderMarquee(lang) {
  const one = MARQUEE.map(m => `<span class="mq-item">${esc(m[lang])}</span><span class="mq-sep" aria-hidden="true">✦</span>`).join('');
  return `${one}<span class="mq-dup" aria-hidden="true">${one}</span>`;
}

export function renderTabs(categories, lang) {
  return categories.map((c, i) => `<button class="cat-tab${i === 0 ? ' active' : ''}" type="button" data-cat="${esc(c.id)}">`
    + `<span aria-hidden="true">${emoji(c.id)}</span> ${esc(c.label[lang])}</button>`).join('');
}

/** Fila de plato: foto solo si es el plato; sin precio, «Pregunta en tienda» y sin botón; con el plato en el pedido, contador. */
export function renderCard(item, lang, qty = 0) {
  const id = esc(item.id), name = esc(item.name);
  const photo = item.img
    ? `<div class="card-img"><img src="${IMG}${esc(item.img)}-480.webp" alt="" width="88" height="88" loading="lazy" decoding="async"`
      + `${item.focus ? ` style="object-position:${esc(item.focus)}"` : ''}>`
      + `${item.badge ? `<span class="card-badge-label">${esc(item.badge)}</span>` : ''}</div>`
    : '';
  const desc = item.desc ? `<p class="card-desc">${esc(item.desc[lang])}</p>` : '';
  const priced = item.price > 0;
  const price = priced
    ? `<span class="card-price">${money(item.price)}</span>`
    : `<span class="card-price ask">${tr('ask', lang)}</span>`;
  const ctrl = !priced ? ''
    : qty === 0
      ? `<button class="add-btn" type="button" data-action="add" data-id="${id}" aria-label="${tr('add', lang)}: ${name}">+</button>`
      : `<div class="stepper"><button class="step-btn" type="button" data-action="dec" data-id="${id}" aria-label="${tr('less', lang)}: ${name}">−</button>`
        + `<span class="step-qty">${qty}</span>`
        + `<button class="step-btn step-add" type="button" data-action="inc" data-id="${id}" aria-label="${tr('more', lang)}: ${name}">+</button></div>`;
  return `<article class="menu-card${item.img ? '' : ' no-img'}" data-id="${id}">${photo}<div class="card-body">`
    + `<div><h3 class="card-name">${name}</h3>${desc}</div><div class="card-footer">${price}${ctrl}</div></div></article>`;
}

/** Las secciones de la carta, en el orden de CATEGORIES. qtyOf(id) dice cuántos hay de ese plato en el pedido. */
export function renderSections(categories, menu, parts, lang, qtyOf = () => 0) {
  const part = Object.fromEntries(parts.map(p => [p.id, p.label[lang]]));
  return categories.map(c => {
    const id = esc(c.id);
    const cover = c.cover
      ? `<figure class="sec-cover"><img src="${IMG}${esc(c.cover.img)}-${c.cover.w[0]}.webp" `
        + `srcset="${c.cover.w.map(w => `${IMG}${esc(c.cover.img)}-${w}.webp ${w}w`).join(', ')}" `
        + `sizes="(min-width: 600px) 528px, calc(100vw - 32px)" alt="" loading="lazy" decoding="async"`
        + `${c.cover.focus ? ` style="object-position:${esc(c.cover.focus)}"` : ''}></figure>`
      : '';
    const note = c.note ? `<p class="sec-note">${esc(c.note[lang])}</p>` : '';
    const cards = (menu[c.id] || []).map(i => renderCard(i, lang, qtyOf(i.id))).join('');
    return `<section class="menu-section" id="sec-${id}" data-section="${id}" aria-labelledby="h-${id}">`
      + `<div class="sec-head"><div class="sec-icon" aria-hidden="true">${emoji(c.id)}</div>`
      + `<div><p class="sec-label">${esc(part[c.part] || '')}</p><h2 class="sec-name" id="h-${id}">${esc(c.label[lang])}</h2></div></div>`
      + `<div class="sec-divider"></div>${cover}${note}${cards}</section>`;
  }).join('');
}

/** El plato y su categoría, por id; null si ya no está en la carta. */
export function findInMenu(categories, menu, id) {
  for (const c of categories) {
    const item = (menu[c.id] || []).find(i => i.id === id);
    if (item) return { item, cat: c.id };
  }
  return null;
}

/** Líneas de la hoja del pedido: la foto del plato o, si no tiene, el emoji de su categoría. */
export function renderCartLines(lines, lang, lookup) {
  return lines.map(l => {
    const found = lookup(l.id), id = esc(l.id), name = esc(l.name);
    const pic = found && found.item.img
      ? `<img src="${IMG}${esc(found.item.img)}-480.webp" alt="" loading="lazy" decoding="async">`
      : `<span class="ci-emoji" aria-hidden="true">${emoji(found && found.cat)}</span>`;
    return `<div class="ci"><div class="ci-img">${pic}</div>`
      + `<div class="ci-info"><p class="ci-name">${name}</p><p class="ci-price">${money(l.price * l.qty)}</p></div>`
      + `<div class="ci-ctrl"><button class="ci-btn" type="button" data-ci="dec" data-id="${id}" aria-label="${tr('less', lang)}: ${name}">−</button>`
      + `<span class="ci-qty">${l.qty}</span>`
      + `<button class="ci-btn" type="button" data-ci="inc" data-id="${id}" aria-label="${tr('more', lang)}: ${name}">+</button></div></div>`;
  }).join('');
}

/** Qué platos y secciones se ven con una búsqueda (la de la web: sin tildes, en las dos lenguas y con todas las palabras). */
export function searchHits(categories, menu, query) {
  const items = new Set(), cats = new Set();
  for (const c of categories) {
    for (const i of menu[c.id] || []) {
      if (matches(i, c, query)) { items.add(i.id); cats.add(c.id); }
    }
  }
  return { items, cats };
}

const RULE = '━'.repeat(12);

/** Texto del pedido para WhatsApp. Sin nombre o sin platos no hay pedido (null). La mesa solo va «para comer aquí». */
export function orderText({ lines, total, type, name, table, note }, lang) {
  const who = String(name || '').trim(), mesa = String(table || '').trim(), nota = String(note || '').trim();
  if (!who || !lines.length) return null;
  const es = lang === 'es';
  const head = type === 'llevar'
    ? `${es ? '¡Hola! 🥡 Pedido *Para llevar*' : 'Hi! 🥡 Order *Takeout*'} · *${who}*`
    : `${es ? '¡Hola! 🍽️ Pedido *Para comer aquí*' : 'Hi! 🍽️ Order *Dine in*'} · *${who}*`
      + (mesa ? ` · ${es ? 'Mesa' : 'Table'} *${mesa}*` : '');
  const body = lines.map(l => `• ${l.name} x${l.qty} — ${money(l.price * l.qty)}`).join('\n');
  return `${head}:\n\n*Candela & Café Market*\n${RULE}\n${body}\n${RULE}\n*Total: ${money(total)}*${nota ? `\n\n📝 _${nota}_` : ''}`;
}

/** Enlace de WhatsApp al número del local (PHONE de la web), o null si aún no hay pedido. */
export function orderUrl(order, lang) {
  const text = orderText(order, lang);
  return text ? waUrl(PHONE, text) : null;
}
```

- [ ] **Step 4: Comprobar que pasan, y que el resto sigue en verde**

Run: `node --test tests/menu-qr.test.mjs` y después `node --test tests/*.test.mjs`
Expected: las 14 pruebas nuevas, PASS. Toda la batería, en verde, sin fallos.

- [ ] **Step 5: Commit**

```bash
git add menu-qr/js/qr-render.js tests/menu-qr.test.mjs
git commit -m "feat(qr-menu): funciones puras de la carta del QR (platos de la web, pedido por WhatsApp, búsqueda)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi"
git push
```

---

### Task 2: La página y su estilo

**Files:**
- Create: `menu-qr/index.html`
- Create: `menu-qr/css/menu-qr.css`
- Modify: `tests/menu-qr.test.mjs` (pruebas nuevas al final)

**Interfaces:**
- Consumes: `TXT` de la Task 1, porque cada `data-t`, `data-t-ph` y `data-t-aria` del HTML es una clave de `TXT`.
- Produces: los ids que usa `menu-qr/js/menu-qr.js` (Task 3): `appHeader`, `searchBtn`, `searchBack`, `searchInput`,
  `marqueeStrip`, `marqueeTrack`, `catTabs`, `menuSections`, `emptyState`, `cartFab`, `fabCount`, `fabTotal`,
  `overlay`, `cartSheet`, `cartClose`, `cartCountLabel`, `cartLines`, `cartEmpty`, `orderForm`, `guestName`,
  `nameError`, `tableField`, `tableNum`, `orderNote`, `sheetFtr`, `cartTotalAmt` y `waBtn`. También los botones
  `.lang-btn[data-lang]` y `.ot-btn[data-type]`, y las clases que pinta la Task 1.

- [ ] **Step 1: Añadir las pruebas de la página al final de `tests/menu-qr.test.mjs`**

Añadir arriba, junto a los otros imports:

```js
import { readFileSync, existsSync } from 'node:fs';
import { TXT } from '../menu-qr/js/qr-render.js';
```

Y al final del archivo:

```js
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

test('La página: no se indexa, sin scripts en línea ni CDNs, y con los datos reales del local', () => {
  const html = read('menu-qr/index.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
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
```

- [ ] **Step 2: Comprobar que fallan**

Run: `node --test tests/menu-qr.test.mjs`
Expected: FAIL en las 3 primeras pruebas nuevas, con `ENOENT … menu-qr/index.html` y `… menu-qr.css`. La de «nada
inventado» pasa, porque aún solo existe `qr-render.js`.

- [ ] **Step 3: Escribir `menu-qr/index.html`**

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Carta — Candela &amp; Café Market</title>
<meta name="description" content="La carta de Candela &amp; Café Market, en el 507 N Miami Ave (Downtown Miami): desayunos, sándwiches de Nueva York, comida dominicana, café y jugos. Pide desde la mesa por WhatsApp.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="../web/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="../web/favicon-32x32.png">
<link rel="apple-touch-icon" href="../web/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="../web/assets/fonts/dm-sans-latin.woff2" crossorigin>
<link rel="stylesheet" href="css/menu-qr.css">
<script type="module" src="js/menu-qr.js"></script>
</head>
<body>
<a class="skip" href="#menuSections" data-t="skip">Ir a la carta</a>

<header class="app-header" id="appHeader">
  <div class="header-brand">
    <img class="header-logo-img" src="../web/assets/img/logo-96.webp" alt="" width="36" height="36">
    <div class="header-wordmark"><span class="word-market">MARKET</span><span class="word-name">Candela &amp; Café</span></div>
  </div>
  <div class="search-bar" id="searchBar" role="search">
    <button class="search-back" id="searchBack" type="button" data-t-aria="back" aria-label="Volver">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="search-input-wrap">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="search" id="searchInput" data-t-ph="search" data-t-aria="search" placeholder="Buscar en la carta…" aria-label="Buscar en la carta…" autocomplete="off" spellcheck="false">
    </div>
  </div>
  <div class="lang" role="group" aria-label="Idioma / Language">
    <button class="lang-btn" type="button" data-lang="en" lang="en" aria-pressed="false">EN</button>
    <span aria-hidden="true">/</span>
    <button class="lang-btn" type="button" data-lang="es" lang="es" aria-pressed="true">ES</button>
  </div>
  <button class="header-search-btn" id="searchBtn" type="button" data-t-aria="searchBtn" aria-label="Buscar">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  </button>
</header>

<div class="marquee-strip" id="marqueeStrip"><div class="marquee-track" id="marqueeTrack"></div></div>

<section class="identity">
  <div class="id-bg"></div>
  <div class="id-inner">
    <div class="dr-stripe" aria-hidden="true"><b></b><b></b><b></b></div>
    <p class="id-eyebrow" data-t="eyebrow">NY Deli Market &amp; Café</p>
    <h1 class="id-title">Candela <span class="amp">&amp;</span> Café</h1>
    <p class="id-sub" data-t="sub">Deli de Nueva York y comida dominicana en Downtown Miami.</p>
    <p class="dr-badge"><span class="dr-flag" aria-hidden="true"><b></b><b></b><b></b><b></b></span><span data-t="pill">Comida dominicana</span></p>
  </div>
</section>

<nav class="cat-tabs" id="catTabs" data-t-aria="cats" aria-label="Categorías"></nav>

<main class="menu-body" id="menuBody">
  <div id="menuSections" class="pending" tabindex="-1"></div>
  <div class="empty-state" id="emptyState"><div class="es-emoji" aria-hidden="true">🍽️</div><p data-t="empty">No lo encontramos. Pregúntanos en tienda.</p></div>
  <noscript><p class="noscript">Esta carta necesita JavaScript. Llámanos al +1 (786) 254-7577 — 507 N Miami Ave. · This menu needs JavaScript. Call us at +1 (786) 254-7577.</p></noscript>
  <footer class="menu-footer">
    <span>507 N Miami Ave · Miami, FL 33136</span><br>
    <a href="tel:+17862547577">+1 (786) 254-7577</a><br>
    <a href="https://candelaycafe.com/">candelaycafe.com</a>
    <span class="f-sig">— hecho con candela —</span>
  </footer>
</main>

<button class="cart-fab" id="cartFab" type="button">
  <span class="fab-left"><span class="fab-badge" id="fabCount">0</span><span class="fab-label" data-t="order">Tu pedido</span></span>
  <span class="fab-total" id="fabTotal">$0.00</span>
</button>

<div class="overlay" id="overlay"></div>

<div class="cart-sheet" id="cartSheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" inert>
  <div class="sheet-handle"></div>
  <div class="sheet-hdr">
    <h2 class="sheet-title" id="sheetTitle"><span data-t="order">Tu pedido</span> <small id="cartCountLabel">0 platos</small></h2>
    <button class="sheet-close" id="cartClose" type="button" data-t-aria="close" aria-label="Cerrar">✕</button>
  </div>
  <div class="sheet-body">
    <div id="cartLines"></div>
    <div class="empty-cart" id="cartEmpty" hidden><div class="ec-icon" aria-hidden="true">🛒</div><p data-t="cartEmpty">Tu pedido está vacío. ¡Escoge algo rico!</p></div>
    <div id="orderForm">
      <div class="order-type">
        <p class="ot-label" data-t="type">Tipo de pedido</p>
        <div class="ot-toggle">
          <button class="ot-btn active" type="button" data-type="aqui" aria-pressed="true"><span aria-hidden="true">🍽️</span> <span data-t="here">Para comer aquí</span></button>
          <button class="ot-btn" type="button" data-type="llevar" aria-pressed="false"><span aria-hidden="true">🥡</span> <span data-t="togo">Para llevar</span></button>
        </div>
      </div>
      <div class="guest-fields">
        <div class="gf-row">
          <div class="gf-field">
            <label class="gf-label" for="guestName"><span data-t="name">Tu nombre</span><span class="gf-required" aria-hidden="true">*</span></label>
            <input class="gf-input" type="text" id="guestName" data-t-ph="namePh" placeholder="Nombre" autocomplete="given-name" required aria-describedby="nameError">
          </div>
          <div class="gf-field" id="tableField">
            <label class="gf-label" for="tableNum" data-t="table">Mesa nº</label>
            <input class="gf-input" type="text" id="tableNum" data-t-ph="tablePh" placeholder="Ej: 4" autocomplete="off" inputmode="numeric">
          </div>
        </div>
        <p class="gf-error" id="nameError" data-t="nameMissing" hidden>Escribe tu nombre para enviar el pedido.</p>
      </div>
      <div class="note-wrap">
        <label class="note-label" for="orderNote" data-t="note">Nota para la cocina</label>
        <textarea class="note-input" id="orderNote" rows="2" data-t-ph="notePh" placeholder="Sin picante, alergias, sin sal…"></textarea>
      </div>
    </div>
  </div>
  <div class="sheet-ftr" id="sheetFtr">
    <div class="total-row"><span class="total-label" data-t="total">Total</span><span class="total-amt" id="cartTotalAmt">$0.00</span></div>
    <a class="wa-btn" id="waBtn" href="#" target="_blank" rel="noopener noreferrer">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.8L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.6 14.1c-.2.6-1.2 1.2-1.7 1.3-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.5-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.1 0 .4 0 .5.4.2.5.7 1.7.7 1.8.1.1.1.2 0 .4-.1.1-.1.2-.2.4l-.4.4c-.1.1-.3.3-.1.5.1.3.7 1.1 1.4 1.7.9.8 1.7 1.1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1.2.1 1.4.7 1.7.8.2.1.4.2.4.3.1.1.1.5 0 1z"/></svg>
      <span data-t="send">Enviar pedido por WhatsApp</span>
    </a>
  </div>
</div>
</body>
</html>
```

- [ ] **Step 4: Escribir `menu-qr/css/menu-qr.css`**

```css
/* Carta del QR (menu.candelaycafe.com, spec 2026-10-09): el diseño de la carta de abril, sobre blanco y solo en DM Sans. */
@font-face{font-family:'DM Sans';src:url("../../web/assets/fonts/dm-sans-latin.woff2") format('woff2');font-weight:100 1000;font-style:normal;font-display:swap}
:root{
  --bg:#FFFFFF;--ink:#2C1810;--ink-2:#6B5A50;--ph:#8A7D74;
  --line:rgba(44,24,16,.1);--soft:rgba(44,24,16,.05);
  --llama:#C9571A; /* el naranja de la vieja: el «&», el foco y los bordes activos */
  --fill:#B5501A;--fill-d:#9E4414; /* naranja de los rellenos con texto blanco: 5,1:1 (AA). El #C9571A da 4,3:1 */
  --precio:#A8441A; /* naranja para texto sobre blanco: 6:1 */
  --oro:#D4A83A;--etiqueta:#E2B84A;--verde:#3A4A3C;
  --wa:#25D366;--wa-d:#1FBE5C;--wa-txt:#0B2A16; /* con texto blanco, el verde de WhatsApp da 2:1 */
  --dr-blue:#002D62;--dr-red:#CE1126;--dr-txt:#B00F20;
  --body:'DM Sans',system-ui,sans-serif;
  --header-h:64px;--marquee-h:34px;--top-h:calc(var(--header-h) + var(--marquee-h));
}
*{box-sizing:border-box;margin:0;padding:0}
[hidden]{display:none!important}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--body);background:var(--bg);color:var(--ink);min-height:100dvh;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
a{color:inherit}
:focus-visible{outline:2px solid var(--llama);outline-offset:2px}
.skip{position:absolute;left:8px;top:-60px;z-index:100;background:var(--ink);color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;font-weight:700}
.skip:focus{top:8px}

/* ---- CABECERA ---- */
.app-header{position:fixed;top:0;left:0;right:0;z-index:50;height:var(--header-h);background:rgba(255,255,255,.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 16px;gap:10px}
.header-brand{display:flex;align-items:center;gap:9px;flex:1;min-width:0}
.header-logo-img{width:36px;height:36px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1.5px var(--oro);flex-shrink:0}
.header-wordmark{line-height:1;min-width:0;display:flex;flex-direction:column}
.word-market{font-size:8px;letter-spacing:.38em;color:var(--precio);font-weight:700;margin-bottom:2px}
.word-name{font-size:15px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lang{display:flex;align-items:center;font-size:11px;letter-spacing:.08em;color:var(--ink-2);flex-shrink:0}
.lang-btn{min-width:28px;min-height:32px;padding:0 3px;font-weight:600;color:var(--ink-2)}
.lang-btn[aria-pressed="true"]{color:var(--ink);font-weight:800}
.header-search-btn,.search-back{width:36px;height:36px;border-radius:50%;background:var(--soft);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink);flex-shrink:0}
.app-header.search-active .header-brand,.app-header.search-active .lang,.app-header.search-active .header-search-btn{display:none}
.search-bar{display:none;align-items:center;gap:10px;flex:1;min-width:0}
.app-header.search-active .search-bar{display:flex}
.search-input-wrap{flex:1;min-width:0;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:7px 12px;display:flex;align-items:center;gap:8px}
.search-input-wrap svg{color:var(--ink-2);flex-shrink:0}
.search-input-wrap input{background:none;border:none;outline:none;color:var(--ink);font:inherit;font-size:16px;flex:1;width:100%;min-width:0}
.search-input-wrap input::placeholder{color:var(--ph)}

/* ---- FRANJA DE AVISOS ---- */
.marquee-strip{position:fixed;top:var(--header-h);left:0;right:0;z-index:45;height:var(--marquee-h);background:var(--oro);overflow:hidden;display:flex;align-items:center;cursor:pointer}
.marquee-track{display:flex;align-items:center;white-space:nowrap;animation:marquee 32s linear infinite}
.marquee-strip:hover .marquee-track,.marquee-strip.paused .marquee-track{animation-play-state:paused}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mq-item{display:inline-flex;align-items:center;padding:0 22px;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ink)}
.mq-sep{color:var(--ink);opacity:.45;font-size:10px}
.mq-dup{display:inline-flex;align-items:center}

/* ---- PORTADA ---- */
.identity{padding-top:var(--top-h);position:relative;overflow:hidden;text-align:center}
.id-bg{position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(ellipse 80% 60% at 50% 100%,rgba(206,17,38,.08) 0%,transparent 70%),
  radial-gradient(ellipse 60% 50% at 15% 0%,rgba(0,45,98,.07) 0%,transparent 60%),
  radial-gradient(ellipse 60% 50% at 85% 0%,rgba(0,45,98,.05) 0%,transparent 60%)}
.id-inner{padding:32px 20px 28px;position:relative}
.dr-stripe{display:flex;height:3px;border-radius:2px;overflow:hidden;width:72px;margin:0 auto 16px}
.dr-stripe b:nth-child(1){flex:1;background:var(--dr-blue)}
.dr-stripe b:nth-child(2){flex:.5;background:#E6E0D8}
.dr-stripe b:nth-child(3){flex:1;background:var(--dr-red)}
.id-eyebrow{font-size:12px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--precio);margin-bottom:10px}
.id-title{font-size:clamp(34px,10vw,48px);font-weight:900;letter-spacing:-.03em;line-height:.95;margin-bottom:8px}
.id-title .amp{color:var(--llama)}
.id-sub{font-size:14px;font-weight:500;color:var(--ink-2);margin:0 auto 18px;max-width:30ch}
.dr-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(206,17,38,.06);border:1px solid rgba(206,17,38,.22);border-radius:999px;padding:5px 13px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--dr-txt)}
.dr-flag{width:18px;height:12px;border-radius:2px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;box-shadow:0 0 0 1px var(--line);flex-shrink:0}
.dr-flag b:nth-child(1),.dr-flag b:nth-child(4){background:var(--dr-blue)}
.dr-flag b:nth-child(2),.dr-flag b:nth-child(3){background:var(--dr-red)}

/* ---- PESTAÑAS ---- */
.cat-tabs{position:sticky;top:var(--top-h);z-index:40;min-height:54px;background:var(--bg);padding:10px 0 10px 16px;display:flex;gap:7px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;border-bottom:1px solid var(--line)}
.cat-tabs::-webkit-scrollbar{display:none}
.cat-tab{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:8px 15px;border-radius:999px;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;background:var(--soft);color:var(--ink-2);border:1px solid var(--line);transition:background .2s,color .2s,border-color .2s;white-space:nowrap}
.cat-tab:last-child{margin-right:16px}
.cat-tab.active{background:var(--fill);color:#fff;border-color:var(--fill)}

/* ---- CARTA ---- */
.menu-body{padding:0 0 110px}
#menuSections.pending{min-height:100vh} /* hasta que el JS pinta la carta, el pie no salta dentro de la pantalla */
.menu-section{padding:28px 0 0}
.menu-section.all-hidden{display:none}
.sec-head{display:flex;align-items:center;gap:11px;padding:0 16px 14px}
.sec-icon{width:38px;height:38px;border-radius:10px;background:var(--soft);border:1px solid var(--line);display:grid;place-items:center;font-size:18px;flex-shrink:0}
.sec-label{font-size:10px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--precio);margin-bottom:2px}
.sec-name{font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.05}
.sec-divider{height:1px;margin:0 16px 4px;background:var(--line)}
.sec-cover{margin:6px 16px;border-radius:12px;overflow:hidden;aspect-ratio:16/9;background:var(--soft)}
.sec-cover img{width:100%;height:100%;object-fit:cover}
.sec-note{margin:6px 16px 2px;font-size:12.5px;font-weight:600;color:var(--precio)}
.menu-card{display:flex;gap:12px;padding:14px 16px}
.menu-card + .menu-card{border-top:1px solid var(--line)}
.menu-card.hidden{display:none}
.card-img{position:relative;flex-shrink:0;width:88px;height:88px;border-radius:10px;overflow:hidden;background:var(--soft)}
.card-img img{width:100%;height:100%;object-fit:cover}
.card-badge-label{position:absolute;top:5px;left:5px;background:rgba(26,13,7,.88);color:var(--etiqueta);font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 6px;border-radius:4px}
.card-body{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:8px}
.card-name{font-size:15.5px;font-weight:700;line-height:1.25;margin-bottom:3px;overflow-wrap:anywhere}
.card-desc{font-size:12px;line-height:1.44;color:var(--ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
.card-price{font-size:17px;font-weight:800;color:var(--precio);line-height:1}
.card-price.ask{font-size:12px;font-weight:600;color:var(--ink-2)}
.add-btn{width:32px;height:32px;border-radius:50%;background:var(--fill);color:#fff;display:grid;place-items:center;font-size:22px;line-height:.9;flex-shrink:0;transition:background .15s,transform .15s}
.add-btn:hover{background:var(--fill-d);transform:scale(1.06)}
.stepper{display:flex;align-items:center;background:var(--soft);border:1px solid var(--line);border-radius:999px;overflow:hidden;flex-shrink:0}
.step-btn{width:30px;height:30px;display:grid;place-items:center;font-size:18px}
.step-btn.step-add{background:var(--fill);color:#fff;border-radius:0 999px 999px 0}
.step-qty{min-width:22px;text-align:center;font-size:13px;font-weight:700;padding:0 2px}
.empty-state{text-align:center;padding:60px 24px;display:none}
.empty-state.visible{display:block}
.es-emoji{font-size:44px;margin-bottom:12px}
.empty-state p{color:var(--ink-2);font-size:16px;line-height:1.4}
.noscript{margin:24px 16px;font-size:14px;color:var(--ink-2)}
.menu-footer{text-align:center;padding:28px 20px 8px;color:var(--ink-2);font-size:11px;letter-spacing:.12em;line-height:1.9}
.menu-footer a{text-decoration:underline;text-underline-offset:2px}
.f-sig{display:block;color:var(--precio);font-size:14px;font-weight:600;letter-spacing:.04em;margin-top:6px}

/* ---- BOTÓN DEL PEDIDO ---- */
.cart-fab{position:fixed;bottom:max(24px,env(safe-area-inset-bottom,24px));left:50%;transform:translateX(-50%);z-index:60;background:var(--fill);color:#fff;border-radius:999px;height:54px;padding:0 22px 0 18px;display:flex;align-items:center;gap:14px;justify-content:space-between;min-width:210px;box-shadow:0 8px 28px rgba(181,80,26,.42),0 2px 8px rgba(0,0,0,.18);transition:opacity .28s,visibility .28s,transform .2s;opacity:0;visibility:hidden;pointer-events:none;white-space:nowrap}
.cart-fab.show{opacity:1;visibility:visible;pointer-events:auto}
.cart-fab:active{transform:translateX(-50%) scale(.97)}
.fab-left{display:flex;align-items:center;gap:9px}
.fab-badge{width:26px;height:26px;border-radius:50%;background:#fff;color:var(--precio);font-size:14px;font-weight:800;display:grid;place-items:center;flex-shrink:0}
.fab-label{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.fab-total{font-size:18px;font-weight:800}

/* ---- HOJA DEL PEDIDO ---- */
.overlay{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.45);opacity:0;pointer-events:none;transition:opacity .3s}
.overlay.show{opacity:1;pointer-events:auto}
.cart-sheet{position:fixed;bottom:0;left:0;right:0;z-index:80;background:var(--bg);border-radius:20px 20px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.12);max-height:88dvh;display:flex;flex-direction:column;transform:translateY(100%);visibility:hidden;transition:transform .34s cubic-bezier(.32,.72,0,1),visibility .34s;padding-bottom:max(20px,env(safe-area-inset-bottom,20px))}
.cart-sheet.open{transform:translateY(0);visibility:visible}
.sheet-handle{width:36px;height:4px;border-radius:2px;background:var(--line);margin:12px auto 0;flex-shrink:0}
.sheet-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 20px 13px;border-bottom:1px solid var(--line);flex-shrink:0}
.sheet-title{font-size:21px;font-weight:800;line-height:1}
.sheet-title small{font-size:11px;color:var(--ink-2);letter-spacing:.08em;margin-left:7px;font-weight:500}
.sheet-close{width:32px;height:32px;border-radius:50%;background:var(--soft);display:grid;place-items:center;font-size:15px}
.sheet-body{flex:1;overflow-y:auto;padding:0 20px;-webkit-overflow-scrolling:touch}
.ci{display:flex;align-items:center;gap:11px;padding:13px 0;border-bottom:1px solid var(--line)}
.ci-img{width:50px;height:50px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--soft);display:grid;place-items:center}
.ci-img img{width:100%;height:100%;object-fit:cover}
.ci-emoji{font-size:22px}
.ci-info{flex:1;min-width:0}
.ci-name{font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-price{font-size:12px;color:var(--precio);font-weight:700}
.ci-ctrl{display:flex;align-items:center;background:var(--soft);border:1px solid var(--line);border-radius:999px}
.ci-btn{width:30px;height:30px;display:grid;place-items:center;font-size:17px;border-radius:999px}
.ci-qty{min-width:20px;text-align:center;font-size:13px;font-weight:700}
.empty-cart{text-align:center;padding:40px 20px}
.ec-icon{font-size:38px;margin-bottom:11px}
.empty-cart p{color:var(--ink-2);font-size:15px;line-height:1.45}
.order-type{padding:14px 0 0}
.ot-label,.gf-label,.note-label,.total-label{display:block;font-size:10px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--ink-2)}
.ot-label{margin-bottom:8px}
.ot-toggle{display:flex;background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:3px;gap:3px}
.ot-btn{flex:1;padding:10px 8px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-2);text-align:center;transition:background .2s,color .2s}
.ot-btn.active{background:var(--fill);color:#fff}
.ot-btn[data-type="llevar"].active{background:var(--verde)}
.guest-fields{padding:14px 0 0}
.gf-row{display:flex;gap:10px;margin-bottom:6px}
.gf-field{flex:1;min-width:0}
.gf-label{margin-bottom:6px}
.gf-required{color:var(--precio);margin-left:2px}
.gf-input,.note-input{width:100%;background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:10px 11px;color:var(--ink);font:inherit;font-size:16px}
.gf-input:focus,.note-input:focus{outline:none;border-color:var(--llama)}
.gf-input::placeholder,.note-input::placeholder{color:var(--ph)}
.gf-input[aria-invalid="true"]{border-color:var(--dr-txt)}
.gf-error{font-size:12px;font-weight:600;color:var(--dr-txt);margin:2px 0 6px}
.note-wrap{padding:10px 0 14px}
.note-label{margin-bottom:7px}
.note-input{resize:none}
.sheet-ftr{padding:14px 20px 0;border-top:1px solid var(--line);flex-shrink:0}
.total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.total-amt{font-size:28px;font-weight:800}
.wa-btn{display:flex;align-items:center;justify-content:center;gap:11px;width:100%;padding:15px;border-radius:14px;background:var(--wa);color:var(--wa-txt);font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none}
.wa-btn:hover{background:var(--wa-d)}

/* ---- ESCRITORIO Y MOVIMIENTO REDUCIDO ---- */
@media (min-width:600px){
  body{max-width:560px;margin:0 auto;box-shadow:0 0 0 1px var(--line)}
  .app-header,.marquee-strip,.cart-sheet{max-width:560px;margin:0 auto}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .marquee-track{animation:none}
  .cart-sheet,.cart-fab,.overlay,.cat-tab,.add-btn{transition:none}
}
```

- [ ] **Step 5: Comprobar que pasan**

Run: `node --test tests/menu-qr.test.mjs` y después `node --test tests/*.test.mjs`
Expected: todo PASS.

- [ ] **Step 6: Commit**

```bash
git add menu-qr/index.html menu-qr/css/menu-qr.css tests/menu-qr.test.mjs
git commit -m "feat(qr-menu): página y estilo de la carta del QR (la de abril sobre blanco, solo DM Sans)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi"
git push
```

---

### Task 3: El comportamiento, comprobado en el navegador

**Files:**
- Create: `menu-qr/js/menu-qr.js`

**Interfaces:**
- Consumes:
  - de la Task 1: `renderTabs`, `renderSections`, `renderCard`, `renderMarquee`, `renderCartLines`, `findInMenu`,
    `searchHits`, `orderUrl`, `money`, `tr`, `itemsLabel` y `pickLang`;
  - de la Task 2: los ids del HTML;
  - de la web: `createCart(serialized)` de `web/js/cart-core.js`, con `add(item)`, `setQty(id, qty)`,
    `revalidate(lookup)`, `lines()`, `count()`, `total()` y `serialize()`;
  - de la web: `trapFocus(container) → release()` de `web/js/focus-trap.js`.
- Produces:
  - el comportamiento de la página;
  - las claves de `localStorage`: `candela-qr-lang` (`'es'|'en'`) y `candela-qr-cart` (el JSON de `cart.serialize()`).

- [ ] **Step 1: Escribir `menu-qr/js/menu-qr.js`**

```js
// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): pinta la carta y lleva el pedido.
// Lo puro (HTML, pedido, búsqueda) está en qr-render.js y se prueba en tests/menu-qr.test.mjs.
import { MENU, CATEGORIES, PARTS } from '../../web/js/menu-data.js';
import { createCart } from '../../web/js/cart-core.js';
import { trapFocus } from '../../web/js/focus-trap.js';
import { renderTabs, renderSections, renderCard, renderMarquee, renderCartLines, findInMenu, searchHits,
  orderUrl, money, tr, itemsLabel, pickLang } from './qr-render.js';

const LANG_KEY = 'candela-qr-lang', CART_KEY = 'candela-qr-cart';
const $ = id => document.getElementById(id);
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* modo privado: el pedido vive solo en la página */ } },
};
const lookup = id => findInMenu(CATEGORIES, MENU, id);

let lang = pickLang(store.get(LANG_KEY), navigator.language);
let orderType = 'aqui';
let releaseTrap = null, lastFocus = null, spy = null;
const cart = createCart(store.get(CART_KEY));
const save = () => store.set(CART_KEY, cart.serialize());
cart.revalidate(id => lookup(id)?.item);   // precios cambiados o platos que ya no están
save();
const qtyOf = id => cart.lines().find(l => l.id === id)?.qty ?? 0;
const header = $('appHeader'), searchInput = $('searchInput');

/* ---------- textos e idioma ---------- */
function applyTexts() {
  document.documentElement.lang = lang;
  document.title = tr('title', lang);
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = tr(el.dataset.t, lang); });
  document.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = tr(el.dataset.tPh, lang); });
  document.querySelectorAll('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.tAria, lang)); });
  document.querySelectorAll('.lang-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function renderAll() {
  applyTexts();
  $('marqueeTrack').innerHTML = renderMarquee(lang);
  $('catTabs').innerHTML = renderTabs(CATEGORIES, lang);
  $('menuSections').innerHTML = renderSections(CATEGORIES, MENU, PARTS, lang, qtyOf);
  $('menuSections').classList.remove('pending');
  bindTabs();
  applySearch();
  updateFab();
  if (isCartOpen()) renderSheet();
}

document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  store.set(LANG_KEY, lang);
  renderAll();
}));

/* ---------- pestañas ---------- */
function setActiveTab(cat) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  document.querySelector(`.cat-tab[data-cat="${CSS.escape(cat)}"]`)
    ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}
function bindTabs() {
  document.querySelectorAll('.cat-tab').forEach(tab => tab.addEventListener('click', () => {
    const sec = $(`sec-${tab.dataset.cat}`);
    if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' });
    setActiveTab(tab.dataset.cat);
  }));
  spy?.disconnect();
  spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) setActiveTab(e.target.dataset.section);
  }), { rootMargin: '-38% 0px -58% 0px', threshold: 0 });
  document.querySelectorAll('.menu-section').forEach(s => spy.observe(s));
}

/* ---------- carta: añadir y quitar ---------- */
function refreshCard(id, focusAction) {
  const old = document.querySelector(`.menu-card[data-id="${CSS.escape(id)}"]`);
  const found = lookup(id);
  if (!old || !found) return;
  const had = old.contains(document.activeElement);
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCard(found.item, lang, qtyOf(id));
  const neu = tmp.firstElementChild;
  neu.classList.toggle('hidden', old.classList.contains('hidden'));
  old.replaceWith(neu);
  if (had) (neu.querySelector(`[data-action="${focusAction}"]`) || neu.querySelector('[data-action]'))?.focus({ preventScroll: true });
}
function change(id, action) {
  const found = lookup(id);
  if (!found || !(found.item.price > 0)) return;
  if (action === 'dec') cart.setQty(id, qtyOf(id) - 1);
  else cart.add(found.item);
  save();
  refreshCard(id, action === 'dec' ? 'dec' : 'inc');
  updateFab();
}
$('menuSections').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) change(btn.dataset.id, btn.dataset.action);
});

/* ---------- botón flotante ---------- */
function updateFab() {
  const n = cart.count(), total = money(cart.total());
  $('fabCount').textContent = n;
  $('fabTotal').textContent = total;
  $('cartFab').classList.toggle('show', n > 0);
  $('cartFab').setAttribute('aria-label', `${tr('order', lang)}: ${itemsLabel(n, lang)}, ${total}`);
}

/* ---------- hoja del pedido ---------- */
const isCartOpen = () => $('cartSheet').classList.contains('open');
function openCart() {
  lastFocus = document.activeElement;
  renderSheet();
  $('cartSheet').inert = false;
  $('cartSheet').classList.add('open');
  $('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  releaseTrap = trapFocus($('cartSheet'));
  $('cartClose').focus();
}
function closeCart() {
  if (!isCartOpen()) return;
  $('cartSheet').classList.remove('open');
  $('cartSheet').inert = true;
  $('overlay').classList.remove('show');
  document.body.style.overflow = '';
  releaseTrap?.();
  releaseTrap = null;
  (lastFocus && document.contains(lastFocus) ? lastFocus : $('cartFab')).focus();
}
function syncOrderType() {
  document.querySelectorAll('.ot-btn').forEach(b => {
    const on = b.dataset.type === orderType;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  $('tableField').hidden = orderType !== 'aqui';
}
const currentOrder = () => ({ lines: cart.lines(), total: cart.total(), type: orderType,
  name: $('guestName').value, table: $('tableNum').value, note: $('orderNote').value });
function updateWaLink() {
  const url = orderUrl(currentOrder(), lang);
  $('waBtn').href = url || '#';
  $('waBtn').dataset.ready = url ? '1' : '';
}
function renderSheet() {
  const lines = cart.lines(), empty = lines.length === 0;
  $('cartCountLabel').textContent = itemsLabel(cart.count(), lang);
  $('cartLines').innerHTML = renderCartLines(lines, lang, lookup);
  $('cartEmpty').hidden = !empty;
  $('orderForm').hidden = empty;
  $('sheetFtr').hidden = empty;
  $('cartTotalAmt').textContent = money(cart.total());
  syncOrderType();
  updateWaLink();
}

$('cartFab').addEventListener('click', openCart);
$('cartClose').addEventListener('click', closeCart);
$('overlay').addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
$('cartLines').addEventListener('click', e => {
  const b = e.target.closest('[data-ci]');
  if (!b) return;
  const { id, ci } = b.dataset;
  change(id, ci === 'dec' ? 'dec' : 'inc');
  renderSheet();
  ($('cartLines').querySelector(`[data-ci="${ci}"][data-id="${CSS.escape(id)}"]`) || $('cartClose')).focus();
});
document.querySelectorAll('.ot-btn').forEach(b => b.addEventListener('click', () => {
  orderType = b.dataset.type;
  syncOrderType();
  updateWaLink();
}));
['guestName', 'tableNum', 'orderNote'].forEach(id => $(id).addEventListener('input', () => {
  if (id === 'guestName' && $('guestName').value.trim()) {
    $('guestName').removeAttribute('aria-invalid');
    $('nameError').hidden = true;
  }
  updateWaLink();
}));
$('waBtn').addEventListener('click', e => {
  updateWaLink();
  if ($('waBtn').dataset.ready) return;   // abre WhatsApp con el pedido
  e.preventDefault();
  $('guestName').setAttribute('aria-invalid', 'true');
  $('nameError').hidden = false;
  $('guestName').focus();
});

/* ---------- búsqueda ---------- */
function applySearch() {
  const { items, cats } = searchHits(CATEGORIES, MENU, searchInput.value);
  document.querySelectorAll('.menu-card').forEach(c => c.classList.toggle('hidden', !items.has(c.dataset.id)));
  document.querySelectorAll('.menu-section').forEach(s => s.classList.toggle('all-hidden', !cats.has(s.dataset.section)));
  $('emptyState').classList.toggle('visible', cats.size === 0);
}
$('searchBtn').addEventListener('click', () => {
  header.classList.add('search-active');
  setTimeout(() => searchInput.focus(), 60);
});
$('searchBack').addEventListener('click', () => {
  header.classList.remove('search-active');
  searchInput.value = '';
  applySearch();
  $('searchBtn').focus();
});
searchInput.addEventListener('input', applySearch);

/* ---------- franja: se para al tocarla ---------- */
$('marqueeStrip').addEventListener('click', () => $('marqueeStrip').classList.toggle('paused'));

renderAll();
```

- [ ] **Step 2: Pruebas sin navegador**

Run: `node --test tests/*.test.mjs`
Expected: todo PASS. La de «nada inventado» ya revisa también `menu-qr.js`.

- [ ] **Step 3: Servir el repo**

Mirar que el puerto esté libre: `netstat -ano | grep ":8792 "` no debe sacar nada. Si está ocupado, usar 8793 y
cambiarlo en los pasos siguientes. Lanzar en segundo plano:
`python -m http.server 8792 --bind 127.0.0.1 --directory "X:/Proyectos/Candela y Cafe Market"`.
Comprobar: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8792/menu-qr/` → `200`.

- [ ] **Step 4: Que la carta se pinte entera (Playwright MCP, `browser_run_code_unsafe`)**

```js
async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8792/menu-qr/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('candela-qr-lang', 'es'); });
  await page.reload({ waitUntil: 'networkidle' });
  return await page.evaluate(() => ({
    secciones: document.querySelectorAll('.menu-section').length,
    platos: document.querySelectorAll('.menu-card').length,
    pestañas: document.querySelectorAll('.cat-tab').length,
    fotos: document.querySelectorAll('.menu-card img').length,
    letra: getComputedStyle(document.querySelector('.id-title')).fontFamily,
    fondo: getComputedStyle(document.body).backgroundColor,
    scrollHorizontal: document.documentElement.scrollWidth > innerWidth,
    titulo: document.title,
  }));
}
```

Expected:

```
{ secciones: 15, platos: 79, pestañas: 15, fotos: 13, letra: "\"DM Sans\", system-ui, sans-serif",
  fondo: "rgb(255, 255, 255)", scrollHorizontal: false, titulo: "Carta — Candela & Café Market" }
```

Con `browser_console_messages`, ningún error. En local, el único admitido es el 404 de `/favicon.ico`, porque en el
repo no está en la raíz.

- [ ] **Step 4b: El buscador**

```js
async (page) => {
  await page.click('#searchBtn');
  await page.fill('#searchInput', 'aguacate');
  const a = await page.evaluate(() => ({ secciones: [...document.querySelectorAll('.menu-section:not(.all-hidden)')].map(s => s.dataset.section),
    vacio: document.getElementById('emptyState').classList.contains('visible') }));
  await page.fill('#searchInput', 'zzqxw');
  const b = await page.evaluate(() => ({ visibles: document.querySelectorAll('.menu-card:not(.hidden)').length,
    vacio: document.getElementById('emptyState').classList.contains('visible'), texto: document.querySelector('#emptyState p').textContent }));
  await page.click('#searchBack');
  const c = await page.evaluate(() => document.querySelectorAll('.menu-card:not(.hidden)').length);
  return { a, b, c };
}
```

Expected:
- `a.secciones` incluye `"avocado-toast"` y `a.vacio` es `false`.
- `b`: `{ visibles: 0, vacio: true, texto: "No lo encontramos. Pregúntanos en tienda." }`.
- `c`: `79`.

- [ ] **Step 5: Enviar sin nombre y después con nombre (Review Focus 2)**

```js
async (page) => {
  await page.click('.menu-card[data-id="bk-downtown-platter"] [data-action="add"]');
  await page.click('.menu-card[data-id="bk-downtown-platter"] [data-action="inc"]');
  await page.click('#cartFab');
  await page.click('#waBtn');                      // sin nombre: no abre nada
  const sinNombre = await page.evaluate(() => ({ aviso: !document.getElementById('nameError').hidden,
    invalido: document.getElementById('guestName').getAttribute('aria-invalid'), foco: document.activeElement.id }));
  await page.fill('#guestName', 'Ana');
  await page.fill('#tableNum', '4');
  const conNombre = await page.evaluate(() => { const u = new URL(document.getElementById('waBtn').href);
    return { a: u.origin + u.pathname, texto: u.searchParams.get('text'), aviso: !document.getElementById('nameError').hidden }; });
  await page.click('.ot-btn[data-type="llevar"]');
  const llevar = await page.evaluate(() => ({ mesaOculta: document.getElementById('tableField').hidden,
    texto: new URL(document.getElementById('waBtn').href).searchParams.get('text') }));
  return { sinNombre, conNombre, llevar, paginas: page.context().pages().length };
}
```

Expected:
- `sinNombre`: `{ aviso: true, invalido: "true", foco: "guestName" }`.
- `conNombre.a`: `"https://wa.me/17862547577"`.
- `conNombre.texto`: empieza por `¡Hola! 🍽️ Pedido *Para comer aquí* · *Ana* · Mesa *4*:`, lleva
  `• Downtown Platter x2 — $22.98` y acaba en `*Total: $22.98*`.
- `conNombre.aviso`: `false`.
- `llevar.mesaOculta`: `true`, y `llevar.texto` empieza por `¡Hola! 🥡 Pedido *Para llevar* · *Ana*:`.
- `paginas`: `1`. Nunca se llegó a abrir WhatsApp.

No hacer clic en `#waBtn` cuando ya tiene nombre, porque abriría `wa.me`.

- [ ] **Step 6: Pedido guardado de una carta anterior (Review Focus 1)**

```js
async (page) => {
  await page.evaluate(() => localStorage.setItem('candela-qr-cart', JSON.stringify([
    { id: 'bk-downtown-platter', name: 'Downtown Platter', price: 1, qty: 2 },   // precio viejo
    { id: 'plato-que-ya-no-existe', name: 'Plato viejo', price: 12, qty: 1 },    // ya no está en la carta
  ])));
  await page.reload({ waitUntil: 'networkidle' });
  return await page.evaluate(() => ({ n: document.getElementById('fabCount').textContent, total: document.getElementById('fabTotal').textContent,
    guardado: JSON.parse(localStorage.getItem('candela-qr-cart') || '[]').length }));
}
```

Expected: `{ n: "2", total: "$22.98", guardado: 1 }`. El precio se corrige a 11,49, el plato viejo desaparece y el
pedido corregido queda guardado.

- [ ] **Step 7: Cambiar de idioma con platos en el pedido (Review Focus 5)**

```js
async (page) => {
  await page.click('.lang-btn[data-lang="en"]');
  await page.click('#cartFab');
  const r = await page.evaluate(() => ({ html: document.documentElement.lang, titulo: document.title,
    fab: document.getElementById('cartFab').getAttribute('aria-label'), hoja: document.getElementById('sheetTitle').textContent,
    tipo: document.querySelector('.ot-btn[data-type="aqui"]').textContent.trim(), n: document.getElementById('fabCount').textContent,
    seccion: document.querySelector('.sec-label').textContent }));
  await page.keyboard.press('Escape');
  await page.click('.lang-btn[data-lang="es"]');
  return r;
}
```

Expected:
- `html`: `"en"`, y `titulo`: `"Menu — Candela & Café Market"`.
- `fab`: empieza por `Your order: 2 items`.
- `hoja`: empieza por `Your order`.
- `tipo`: `"🍽️ Dine in"`.
- `n`: `"2"`.
- `seccion`: `"Morning"`.

- [ ] **Step 8: Almacenamiento bloqueado, como en modo privado (Review Focus 4)**

```js
async (page) => {
  const p = await page.context().newPage();
  await p.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } }));
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://127.0.0.1:8792/menu-qr/', { waitUntil: 'networkidle' });
  await p.click('.menu-card[data-id="bk-downtown-platter"] [data-action="add"]');
  const r = await p.evaluate(() => ({ platos: document.querySelectorAll('.menu-card').length,
    n: document.getElementById('fabCount').textContent, visible: document.getElementById('cartFab').classList.contains('show') }));
  await p.close();
  return r;
}
```

Expected: `{ platos: 79, n: "1", visible: true }`, sin errores en la consola de esa pestaña.

- [ ] **Step 9: Móvil de 320 px (Review Focus 3) y capturas para Robert**

```js
async (page) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.reload({ waitUntil: 'networkidle' });
  const r320 = await page.evaluate(() => {
    const anchos = [...document.querySelectorAll('.menu-card, .cat-tabs, .app-header, .identity')]
      .map(e => e.getBoundingClientRect().right).filter(x => x > innerWidth + 1);
    return { scrollHorizontal: document.documentElement.scrollWidth > innerWidth, fuera: anchos.length };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '.playwright-mcp\\carta-qr-1-portada.jpg', type: 'jpeg', quality: 88 });
  await page.evaluate(() => { const s = document.getElementById('sec-ny-signature'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 150); });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '.playwright-mcp\\carta-qr-2-platos.jpg', type: 'jpeg', quality: 88 });
  await page.click('#cartFab');
  await page.waitForTimeout(800);
  await page.screenshot({ path: '.playwright-mcp\\carta-qr-3-pedido.jpg', type: 'jpeg', quality: 88 });
  await page.keyboard.press('Escape');
  return r320;
}
```

Expected: `{ scrollHorizontal: false, fuera: 0 }`.

Mirar las tres capturas con Read y compararlas con las maquetas aprobadas
(`Desktop\Galiax\2026-10-09\maquetas-carta-qr\A-*.jpg`):
- fondo blanco, franja dorada y naranja en botones y precios;
- solo DM Sans y fotos solo en sus platos;
- la hoja del pedido con «Para comer aquí» y la mesa.

Si algo no cuadra, se corrige antes del commit.

- [ ] **Step 10: Commit**

```bash
git add menu-qr/js/menu-qr.js
git commit -m "feat(qr-menu): comportamiento de la carta del QR (pestañas, búsqueda, pedido por WhatsApp, EN/ES)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi"
git push
```

---

### Task 4: Paquete de publicación y cabeceras

**Files:**
- Create: `tools/build-menu-qr.mjs`
- Create: `menu-qr/netlify.toml`
- Modify: `.gitignore` (añadir `dist-menu-qr/`)
- Modify: `tests/menu-qr.test.mjs` (pruebas nuevas al final)

**Interfaces:**
- Consumes: `MENU` y `CATEGORIES` (para saber qué fotos copiar) y la estructura de `menu-qr/` de las Tasks 1-3.
- Produces: `node tools/build-menu-qr.mjs` → `dist-menu-qr/`. Lleva `index.html`, `favicon.ico`, `netlify.toml`, `css/`,
  `js/`, `web/js/*` (todos), `web/assets/img/` (las fotos que usa la carta y el logo), `web/assets/fonts/` y los iconos.

- [ ] **Step 1: Pruebas (al final de `tests/menu-qr.test.mjs`)**

Añadir a los imports de arriba:

```js
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
```

Y al final:

```js
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

test('Cabeceras de la carta del QR: no se indexa y la CSP no deja scripts en línea', () => {
  const toml = read('menu-qr/netlify.toml');
  assert.match(toml, /X-Robots-Tag = "noindex"/);
  const csp = toml.match(/Content-Security-Policy = "([^"]+)"/)[1];
  assert.equal(csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src')), "script-src 'self'");
  assert.match(csp, /frame-ancestors 'none'/);
});
```

- [ ] **Step 2: Comprobar que fallan**

Run: `node --test tests/menu-qr.test.mjs`
Expected: FAIL en las dos nuevas. El script de build y `menu-qr/netlify.toml` aún no existen.

- [ ] **Step 3: Escribir `tools/build-menu-qr.mjs`**

```js
// Empaqueta la carta del QR (menu-qr/) para el sitio de Netlify «candela-cafe-menu» (menu.candelaycafe.com).
// Uso: node tools/build-menu-qr.mjs  →  dist-menu-qr/ (ignorada en git)
// La página usa rutas ../web/…: aquí se replica en dist-menu-qr/web/ solo lo que usa, así valen igual en el repo y publicadas.
import { rmSync, mkdirSync, cpSync } from 'node:fs';
import { CATEGORIES, MENU } from '../web/js/menu-data.js';

const root = new URL('../', import.meta.url);
const out = new URL('dist-menu-qr/', root);
const from = p => new URL(p, root);
const to = p => new URL(p, out);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(from('menu-qr/'), out, { recursive: true });
cpSync(from('web/js/'), to('web/js/'), { recursive: true });

const fotos = new Set(['logo-96.webp']);
for (const c of CATEGORIES) {
  if (c.cover) c.cover.w.forEach(w => fotos.add(`${c.cover.img}-${w}.webp`));
  for (const i of MENU[c.id] || []) if (i.img) fotos.add(`${i.img}-480.webp`);
}
for (const f of fotos) cpSync(from(`web/assets/img/${f}`), to(`web/assets/img/${f}`));
cpSync(from('web/assets/fonts/dm-sans-latin.woff2'), to('web/assets/fonts/dm-sans-latin.woff2'));
for (const f of ['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png']) cpSync(from(`web/${f}`), to(`web/${f}`));
cpSync(from('web/favicon.ico'), to('favicon.ico'));   // los navegadores lo piden en la raíz
console.log(`dist-menu-qr/ listo: ${fotos.size} imágenes, DM Sans, iconos y web/js/`);
```

- [ ] **Step 4: Escribir `menu-qr/netlify.toml`**

```toml
# Carta del QR (menu.candelaycafe.com): sitio de Netlify «candela-cafe-menu» (ID 1260f03f-9e5d-4992-9259-6021bbd3814e).
# Se publica desde dist-menu-qr/ (node tools/build-menu-qr.mjs), entrando en esa carpeta:
#   netlify deploy --dir . --no-build --site 1260f03f-9e5d-4992-9259-6021bbd3814e          (prueba)
#   ... lo mismo con --prod, solo con el OK de Robert.
# No sale en Google: para Google está candelaycafe.com/menu.
[[headers]]
  for = "/web/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"
    X-Robots-Tag = "noindex"
```

`style-src 'unsafe-inline'` hace falta, igual que en la web, porque las fotos se encuadran con `style="object-position"`.

- [ ] **Step 5: `.gitignore`**

Añadir al final de `.gitignore` la línea `dist-menu-qr/`.

- [ ] **Step 6: Comprobar que pasan, y que `dist-menu-qr/` no entra en git**

Run: `node --test tests/*.test.mjs` y `git status --short`
Expected: todo PASS. `git status` no lista `dist-menu-qr/`.

- [ ] **Step 7: Mirar el paquete servido como en Netlify (raíz = `dist-menu-qr/`)**

Lanzar en segundo plano `python -m http.server 8794 --bind 127.0.0.1 --directory "X:/Proyectos/Candela y Cafe Market/dist-menu-qr"`.
Después, con Playwright, abrir `http://127.0.0.1:8794/` a 390×844 y evaluar
`({ platos: document.querySelectorAll('.menu-card').length, fotos: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length })`
tras bajar hasta el final.
Expected: `{ platos: 79, fotos: 0 }`, es decir, ninguna imagen rota. Con `browser_console_messages`, ningún error.
Parar ese servidor.

- [ ] **Step 8: Commit**

```bash
git add tools/build-menu-qr.mjs menu-qr/netlify.toml .gitignore tests/menu-qr.test.mjs
git commit -m "feat(qr-menu): paquete de publicación y cabeceras de la carta del QR (noindex, CSP sin scripts en línea)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi"
git push
```

---

### Task 5: El QR, a https://menu.candelaycafe.com

**Files:**
- Modify: `qr/generar.py` (URL, `matriz(mask)`, generación bajo `if __name__ == "__main__"`, máscara elegida de nuevo)
- Create: `qr/verificar.py`, `qr/verificar-jsqr.mjs` y `qr/verificar.html`
- Modify: `tests/qr-menu.test.mjs`
- Modify: `tools/package.json` y `tools/package-lock.json` (con `jsqr@1.4.0`)
- Regenerate: `qr/qr-candela-menu-{bn,hueco-cuadrado,hueco-circular}.{svg,pdf,png}`

**Interfaces:**
- Consumes: el `qr/generar.py` actual, con `URL`, `MASK`, `QUIET`, `N`, `VARIANTES` (lista de `(nombre, hueco)`, donde
  `hueco(r, c) → bool`), `nada`, `cuadrado`, `circular` y `matriz()`.
- Produces:
  - `generar.matriz(mask=MASK)`;
  - `generar.generar()`, que escribe los 9 archivos;
  - `python qr/verificar.py`, que devuelve 0 si todo se lee y 1 si algo falla;
  - `python qr/verificar.py --mascaras`;
  - `node qr/verificar-jsqr.mjs`, que devuelve 0 o 1;
  - `qr/verificar.html`, para Chrome.

- [ ] **Step 1: Pruebas del QR (fallan: el QR aún apunta a /menu)**

Sustituir `tests/qr-menu.test.mjs` entero por:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Los QR impresos del local abren https://menu.candelaycafe.com (qr/generar.py): la carta de menu-qr/, publicada en el
// sitio de Netlify «candela-cafe-menu». Esa URL no puede cambiar: el sitio no puede perder el dominio, ni Squarespace el
// registro DNS «menu». La carta de la web (/menu) sigue viva porque la usan el perfil de Google y la barra de la web.
const url = p => new URL(`../${p}`, import.meta.url);
const read = p => readFileSync(url(p), 'utf8');

test('el QR impreso apunta a https://menu.candelaycafe.com', () => {
  assert.ok(read('qr/generar.py').includes('URL = "https://menu.candelaycafe.com"'));
});

test('la carta del QR está en el repo y se empaqueta para publicarla', () => {
  assert.ok(existsSync(url('menu-qr/index.html')));
  assert.ok(existsSync(url('tools/build-menu-qr.mjs')));
});

test('/menu sigue abriendo la carta de la web: existe menu.html o un 301 desde /menu en los dos netlify.toml', () => {
  const redirect = p => /from\s*=\s*"\/menu"/.test(read(p));
  assert.ok(existsSync(url('web/menu.html')) || (redirect('netlify.toml') && redirect('web/netlify.toml')));
});
```

Run: `node --test tests/qr-menu.test.mjs`
Expected: FAIL en «el QR impreso apunta a https://menu.candelaycafe.com».

- [ ] **Step 2: `qr/generar.py`: URL nueva, `matriz(mask)` y generar solo al ejecutarlo**

Tres cambios:

1. `URL = "https://candelaycafe.com/menu"` pasa a `URL = "https://menu.candelaycafe.com"`. Son 29 caracteres:
   sigue siendo versión 4-H y el `assert q.version == 4` vale.
2. `def matriz():` pasa a `def matriz(mask=MASK):`, y dentro, `mask_pattern=MASK` pasa a `mask_pattern=mask`.
3. Todo el bucle `for nombre, hueco in VARIANTES:` (hasta el final del archivo) pasa a una función que solo corre al
   ejecutar el script:

```python
def generar():
    for nombre, hueco in VARIANTES:
        M = matriz()
        # … (el cuerpo actual del bucle, sin cambios, con una sangría más)


if __name__ == "__main__":
    generar()
```

Run: `python qr/generar.py` (todavía con la máscara 2) y `node --test tests/qr-menu.test.mjs`
Expected: escribe los 9 archivos y las 3 pruebas pasan.

- [ ] **Step 3: Crear `qr/verificar.py`**

```python
"""Comprueba el QR de la carta leyéndolo de verdad, como pide el estándar de QR de Galiax (cerebro: procesos/qr-codes).

python qr/verificar.py             → lee los 9 archivos de qr/ (SVG y PDF pintados con MuPDF, PNG tal cual) con los dos
                                      lectores de OpenCV, a tamaños grandes y degradados, y mira que los PDF sean
                                      vectoriales y de 60 mm. Sale con 1 si algo falla.
python qr/verificar.py --mascaras  → puntúa las 8 máscaras de cada versión con las mismas pruebas, para elegir MASK.
El tercer lector, jsQR, va aparte: node qr/verificar-jsqr.mjs, y qr/verificar.html en Chrome.
"""
import sys
from pathlib import Path

import cv2
import fitz  # PyMuPDF
import numpy as np

from generar import N, QUIET, URL, VARIANTES, matriz

HERE = Path(__file__).resolve().parent
LECTORES = {"opencv": cv2.QRCodeDetector(), "aruco": cv2.QRCodeDetectorAruco()}
GRANDES = (410, 600, 820, 1000, 1230, 1435, 1640, 1845, 2050, 2460)
S = N + 2 * QUIET


def lee(img):
    """Qué lectores leen la URL exacta. Si alguno lee otra cosa, falla en el acto."""
    out = {}
    for nombre, d in LECTORES.items():
        try:
            txt = d.detectAndDecode(img)[0]
        except cv2.error:
            txt = ""
        assert txt in ("", URL), f"{nombre} leyó otra cosa: {txt!r}"
        out[nombre] = txt == URL
    return out


def pinta(path, px):
    pg = fitz.open(path)[0]
    z = px / pg.rect.width
    pix = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False, colorspace=fitz.csGRAY)
    return np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width).copy()


def desde_matriz(M, hueco, px=8):
    img = np.array([[255 if (not v or hueco(r, c)) else 0 for c, v in enumerate(fila)] for r, fila in enumerate(M)], np.uint8)
    return np.kron(np.pad(img, QUIET, constant_values=255), np.ones((px, px), np.uint8))


def degradaciones(base, semilla=7):
    """El QR como lo vería un móvil: pequeño, borroso, en JPEG, girado, en perspectiva, con ruido o con poca luz."""
    rs = lambda im, s: cv2.resize(im, (s, s), interpolation=cv2.INTER_AREA)
    jpg = lambda im, q: cv2.imdecode(cv2.imencode(".jpg", im, [cv2.IMWRITE_JPEG_QUALITY, q])[1], cv2.IMREAD_GRAYSCALE)
    rng = np.random.default_rng(semilla)
    for s in (164, 123, 110, 103, 96, 90):
        yield f"pequeño {s}px", rs(base, s)
    for s in (164, 123):
        for k in (3, 5):
            yield f"desenfoque k{k} a {s}px", cv2.GaussianBlur(rs(base, s), (k, k), 0)
        yield f"desenfoque y JPEG a {s}px", jpg(cv2.GaussianBlur(rs(base, s), (3, 3), 0), 25)
    p = cv2.copyMakeBorder(base, 60, 60, 60, 60, cv2.BORDER_CONSTANT, value=255)
    h, w = p.shape
    for ang in (15, 45, 90):
        yield f"giro {ang}°", rs(cv2.warpAffine(p, cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1), (w, h), borderValue=255), 220)
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    for i in range(8):  # perspectiva, giro y tamaño al azar, como un móvil mal apuntado
        j = rng.uniform(0, 0.12, (4, 2)) * [w, h]
        dst = np.float32([[j[0][0], j[0][1]], [w - j[1][0], j[1][1]], [w - j[2][0], h - j[2][1]], [j[3][0], h - j[3][1]]])
        im = cv2.warpPerspective(p, cv2.getPerspectiveTransform(src, dst), (w, h), borderValue=255)
        im = cv2.warpAffine(im, cv2.getRotationMatrix2D((w / 2, h / 2), rng.uniform(-40, 40), 1), (w, h), borderValue=255)
        im = cv2.GaussianBlur(rs(im, int(rng.uniform(150, 230))), (3, 3), rng.uniform(0.4, 1.1))
        im = np.clip(im.astype(np.float32) * rng.uniform(.55, 1) + rng.normal(0, 18, im.shape) + rng.uniform(0, 70), 0, 255)
        yield f"móvil al azar {i + 1}", im.astype(np.uint8)
    for s in (164, 123):
        b = rs(base, s)
        yield f"ruido a {s}px", np.clip(b.astype(np.int16) + rng.normal(0, 45, b.shape), 0, 255).astype(np.uint8)
        yield f"poca luz a {s}px", (b.astype(np.float32) * .4 + 130).astype(np.uint8)


def puntua(M, hueco):
    """Lecturas buenas en las degradaciones (3 semillas, 2 lectores) y tamaños grandes y nítidos que no se leen."""
    base = desde_matriz(M, hueco)
    imgs = [im for s in (7, 11, 23) for _, im in degradaciones(base, s)]
    buenas = sum(sum(lee(im).values()) for im in imgs)
    fallan = [px for px in GRANDES if not all(lee(cv2.resize(desde_matriz(M, hueco, max(1, round(px / S))), (px, px),
                                                             interpolation=cv2.INTER_NEAREST)).values())]
    return buenas, 2 * len(imgs), fallan


def mascaras():
    print(f"URL: {URL}")
    for nombre, hueco in VARIANTES:
        print(f"\n{nombre}")
        for m in range(8):
            buenas, total, fallan = puntua(matriz(m), hueco)
            print(f"  máscara {m}: {buenas}/{total} lecturas degradadas · grandes que fallan: {fallan or 'ninguno'}")
    print("\nRegla: la que no falle en ningún tamaño grande en las tres versiones y, entre esas, la que más lecturas "
          "sume en las dos versiones con hueco.")


def verificar():
    fallos = 0
    for nombre, _ in VARIANTES:
        for ext, px in (("svg", 1200), ("svg", 410), ("pdf", 1200), ("pdf", 300)):
            ok = all(lee(pinta(HERE / f"{nombre}.{ext}", px)).values())
            fallos += not ok
            print(f"  {'OK ' if ok else 'MAL'} {nombre}.{ext} a {px} px")
        ok = all(lee(cv2.imread(str(HERE / f"{nombre}.png"), cv2.IMREAD_GRAYSCALE)).values())
        fallos += not ok
        print(f"  {'OK ' if ok else 'MAL'} {nombre}.png")
        grandes = [px for px in GRANDES if not all(lee(pinta(HERE / f"{nombre}.svg", px)).values())]
        fallos += bool(grandes)
        print(f"  {'OK ' if not grandes else 'MAL'} {nombre}.svg grande y nítido, de 410 a 2460 px"
              f"{f': fallan {grandes}' if grandes else ''}")
        degr = list(degradaciones(pinta(HERE / f"{nombre}.svg", 8 * S)))
        print(f"  ··· {nombre}: {sum(any(lee(im).values()) for _, im in degr)} de {len(degr)} degradadas leídas por algún lector")
        doc = fitz.open(HERE / f"{nombre}.pdf")
        pg = doc[0]
        ok = len(doc) == 1 and abs(pg.rect.width / 72 * 25.4 - 60) < 0.01 and not pg.get_images() and bool(pg.get_drawings())
        fallos += not ok
        print(f"  {'OK ' if ok else 'MAL'} {nombre}.pdf: 1 página de 60 mm, vectorial")
    print(f"\nFALLOS: {fallos}")
    return fallos


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if "--mascaras" in sys.argv:
        mascaras()
    else:
        sys.exit(1 if verificar() else 0)
```

- [ ] **Step 4: Elegir la máscara para la URL nueva**

Run: `python qr/verificar.py --mascaras` (tarda unos minutos; timeout de 10 min)
Expected: una tabla con las 8 máscaras de cada versión.

Aplicar la regla que imprime:
1. quedarse con las máscaras que no fallan en ningún tamaño grande en las tres versiones;
2. de esas, elegir la que más lecturas suma en `hueco-cuadrado` y `hueco-circular`;
3. si hay empate, la que más lee en `bn`.

Poner ese número en `MASK = …` de `qr/generar.py`. En su docstring, el párrafo que empieza por «Máscara 2 fija en las
tres» se sustituye por el resultado medido, con este texto y los números que haya dado la tabla:

```
Máscara <m> fija en las tres, que así son el mismo dibujo. Elegida el 2026-10-09 para https://menu.candelaycafe.com con
`python qr/verificar.py --mascaras` (los dos lectores de OpenCV; degradaciones con 3 semillas y tamaños grandes y
nítidos de 410 a 2460 px): es la que no falla en ningún tamaño grande en las tres versiones y la que más lee con
hueco (<lecturas cuadrado>/<total> y <lecturas circular>/<total>). Elegirla por los codewords que estropea el hueco no
sirve: escogía de las peores. jsQR lee igual todas las máscaras.
```

- [ ] **Step 5: Generar y verificar con OpenCV**

Run: `python qr/generar.py` y después `python qr/verificar.py`
Expected: `FALLOS: 0`. Las 15 lecturas directas (SVG, PDF y PNG) dan OK, los grandes de 410 a 2460 px dan OK y los 3
PDF son de 60 mm y vectoriales.

- [ ] **Step 6: Tercer lector, jsQR, en Node**

Run: `npm install --prefix tools jsqr@1.4.0`

Crear `qr/verificar-jsqr.mjs`:

```js
// Tercer lector del QR: jsQR (el mismo que en Chrome), sobre los SVG pintados por sharp a varios tamaños y los PNG.
// Uso: node qr/verificar-jsqr.mjs   (usa sharp y jsqr de tools/node_modules). Sale con 1 si algo no se lee.
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../tools/package.json', import.meta.url));
const sharp = require('sharp'), jsQR = require('jsqr');
const dir = new URL('./', import.meta.url);
const URL_QR = readFileSync(new URL('generar.py', dir), 'utf8').match(/^URL = "([^"]+)"/m)[1];

let fallos = 0;
for (const f of readdirSync(dir).filter(f => /^qr-.*\.(svg|png)$/.test(f)).sort()) {
  const buf = readFileSync(new URL(f, dir));
  for (const size of f.endsWith('.svg') ? [160, 300, 600, 1200] : [null]) {
    const img = size ? sharp(buf, { density: 72 * size / 410 }) : sharp(buf);   // el SVG mide 410 px
    const { data, info } = await img.flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const r = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
    const ok = !!r && r.data === URL_QR;
    fallos += !ok;
    console.log(`${ok ? 'OK ' : 'MAL'} ${f} a ${info.width} px → ${r ? r.data : 'sin lectura'}`);
  }
}
console.log(`\nFALLOS: ${fallos}`);
process.exit(fallos ? 1 : 0);
```

Run: `node qr/verificar-jsqr.mjs`
Expected: 15 líneas `OK` (3 SVG × 4 tamaños + 3 PNG), todas con `→ https://menu.candelaycafe.com`, y `FALLOS: 0`.

- [ ] **Step 7: En Chrome (el de Robert, con claude-in-chrome)**

Crear `qr/verificar.html`:

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Verificando QR…</title>
<style>
  body{font:15px/1.45 system-ui,sans-serif;margin:24px;color:#111;background:#fff}
  #summary{font-size:18px;font-weight:700;margin:12px 0 20px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
  figure{margin:0;border:1px solid #ddd;border-radius:8px;padding:12px}
  figure img{width:100%;height:auto;display:block}
  figcaption{font-weight:700;margin:8px 0 4px;word-break:break-all}
  ul{margin:0;padding-left:18px;font-size:13px}
  .ok{color:#0a7a2f}.bad{color:#c00}
</style>
</head>
<body>
<h1>QR de la carta — lectura con jsQR en Chrome</h1>
<p>Servir la raíz del repo (<code>python -m http.server 8793 --bind 127.0.0.1</code>) y abrir <code>/qr/verificar.html</code>.</p>
<div id="summary">Leyendo…</div>
<div class="grid" id="grid"></div>
<script src="../tools/node_modules/jsqr/dist/jsQR.js"></script>
<script>
const NAMES = ['qr-candela-menu-bn', 'qr-candela-menu-hueco-cuadrado', 'qr-candela-menu-hueco-circular'];
const SIZES = [160, 300, 600, 1200];
(async () => {
  const expected = (await (await fetch('generar.py')).text()).match(/^URL = "([^"]+)"/m)[1];
  let ok = 0, total = 0;
  for (const f of NAMES.flatMap(n => [`${n}.svg`, `${n}.png`])) {
    const img = new Image();
    img.src = f;
    await img.decode();
    const rows = SIZES.map(s => {
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, s, s); ctx.drawImage(img, 0, 0, s, s);
      const r = jsQR(ctx.getImageData(0, 0, s, s).data, s, s);
      const good = !!r && r.data === expected;
      total++; ok += good;
      return `<li class="${good ? 'ok' : 'bad'}">${s}px → ${r ? r.data : 'sin lectura'}</li>`;
    });
    const fig = document.createElement('figure');
    fig.innerHTML = `<img src="${f}" alt=""><figcaption>${f}</figcaption><ul>${rows.join('')}</ul>`;
    document.getElementById('grid').append(fig);
  }
  const all = ok === total;
  const sum = document.getElementById('summary');
  sum.className = all ? 'ok' : 'bad';
  sum.innerHTML = `${ok} de ${total} lecturas = <code>${expected}</code> ${all ? '✔' : '✘'} · <a href="${expected}">abrir</a>`;
  document.title = `${all ? 'QR OK' : 'QR FALLO'} ${ok}/${total}`;
})();
</script>
</body>
</html>
```

Servir la raíz del repo en el puerto 8793 (en segundo plano). En Chrome (claude-in-chrome: `tabs_context_mcp`, una
pestaña nueva y `navigate`), abrir `http://127.0.0.1:8793/qr/verificar.html` y esperar a que el título pase a
`QR OK 24/24`.
Expected: el título `QR OK 24/24` (6 archivos × 4 tamaños) y `get_page_text` con las 24 lecturas
`https://menu.candelaycafe.com`. La comprobación de que abre la carta nueva va en la Task 6, después de publicar.
Cerrar la pestaña y parar el servidor.

- [ ] **Step 8: Toda la batería y commit**

Run: `node --test tests/*.test.mjs`
Expected: todo PASS.

```bash
git add qr/ tests/qr-menu.test.mjs tools/package.json tools/package-lock.json
git commit -m "feat(qr): el QR de la carta apunta a https://menu.candelaycafe.com (máscara elegida de nuevo, verificación en el repo)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ctp7P1cncM2Wca2isUnGDi"
git push
```

---

### Task 6: Publicar (prueba → OK de Robert → producción) y dejarlo apuntado

**Files:**
- Create (fuera del repo): copias en `C:\Users\rmace\Desktop\Galiax\2026-10-09\qr-carta-candela\`. Sustituyen las del QR
  viejo a `/menu`.
- Modify (otros repos): `X:\Proyectos\galiax-brain\clientes\candela-cafe.md` y
  `X:\Proyectos\galiax-pendientes\PENDIENTES.md`.
- Modify (memoria): `C:\Users\rmace\.claude\projects\X--Proyectos-Candela-y-Cafe-Market\memory\candela-qr-carta.md`

**Interfaces:**
- Consumes: `dist-menu-qr/` (Task 4) y los archivos del QR (Task 5).
- Produces: `https://menu.candelaycafe.com` con la carta nueva.

- [ ] **Step 1: Deploy de prueba**

```bash
node tools/build-menu-qr.mjs
cd dist-menu-qr && netlify deploy --dir . --no-build --site 1260f03f-9e5d-4992-9259-6021bbd3814e --message "carta del QR: diseño de abril sobre blanco, carta real"
```

Expected: `Deploy is live!` y una `Website draft URL` del tipo `https://<id>--candela-cafe-menu.netlify.app`. Apuntar el
id del deploy.

- [ ] **Step 2: Cabeceras y contenido del enlace de prueba**

Run: `curl -sI <draft-url>/` y `curl -s <draft-url>/ | grep -c 'js/menu-qr.js'`
Expected:
- `x-robots-tag: noindex`;
- una `content-security-policy` con `script-src 'self';`;
- `x-frame-options: DENY`;
- el `grep` da `1`.

Si faltan las cabeceras, crear `menu-qr/_headers` con las mismas reglas que `menu-qr/netlify.toml`, en el formato de
`_headers` de Netlify. Volver a empaquetar y publicar la prueba, y añadir el archivo a la prueba de la Task 4.

- [ ] **Step 3: Playwright sobre el enlace de prueba**

Repetir los Steps 4, 5 y 9 de la Task 3 cambiando `http://127.0.0.1:8792/menu-qr/` por `<draft-url>/`. Expected: los
mismos resultados, ninguna imagen rota y ningún error en la consola, ni siquiera el del favicon. Guardar las tres
capturas como `.playwright-mcp\carta-qr-prueba-{1-portada,2-platos,3-pedido}.jpg`.

- [ ] **Step 4: Lighthouse móvil (3 pasadas, la mediana)**

Run, 3 veces y cambiando `<n>` (en `<scratchpad>` va la carpeta scratchpad de la sesión):
`npx --yes lighthouse@12 "<draft-url>/" --only-categories=performance,accessibility --form-factor=mobile --chrome-flags="--headless=new" --output=json --output-path="<scratchpad>/lh-<n>.json" --quiet`

Después:
`node -e "for (const n of [1,2,3]) { const j = require(process.argv[1] + '/lh-' + n + '.json'); console.log(n, Math.round(j.categories.performance.score*100), Math.round(j.categories.accessibility.score*100)); }" "<scratchpad>"`

Expected: la mediana de rendimiento ≥ 90 y la de accesibilidad ≥ 95. Si no llega:
- mirar las auditorías que fallan (`j.audits`, las de `score < 1`) y corregirlas en `menu-qr/`;
- volver a la Task 2 o la 3 con su commit;
- repetir los Steps 1-4.

- [ ] **Step 5: Enseñárselo a Robert y esperar su OK (PUERTA)**

- Copiar las tres capturas a `C:\Users\rmace\Desktop\Galiax\2026-10-09\maquetas-carta-qr\`.
- Mandarlas con `SendUserFile`, junto con el enlace de prueba para que lo abra en el móvil.
- Preguntar si se publica en `menu.candelaycafe.com`.
- **No seguir sin un sí explícito.** Si pide cambios: corregirlos, hacer commit y repetir los Steps 1-5.

- [ ] **Step 6: Producción (solo con el OK)**

```bash
cd dist-menu-qr && netlify deploy --prod --dir . --no-build --site 1260f03f-9e5d-4992-9259-6021bbd3814e --message "carta del QR: diseño de abril sobre blanco, carta real"
```

Expected: `Deploy is live!` con la URL `https://menu.candelaycafe.com`. Apuntar el id del deploy. La vuelta atrás es
restaurar en Netlify el deploy de abril, `69ef98ba21fb2a48de572d62`.

- [ ] **Step 7: Comprobar producción, dos veces y en Chrome**

1. **Con curl:** `curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://menu.candelaycafe.com/` da `200`.
   Con `curl -s https://menu.candelaycafe.com/ | grep -c -E "555|Coral Way"`, `0`. Con
   `curl -sI https://menu.candelaycafe.com/`, sale `x-robots-tag: noindex`.
2. **En Chrome** (claude-in-chrome), en una pestaña nueva, abrir `https://menu.candelaycafe.com`. Con
   `javascript_tool`, `({ url: location.href, platos: document.querySelectorAll('.menu-card').length, titulo: document.title, tel: [...document.querySelectorAll('a[href^="tel:"]')].map(a => a.href) })`.
   Expected: `platos: 79`, `tel: ["tel:+17862547577"]` y una captura con `save_to_disk`.
3. **Otra vez desde el QR:** servir el repo (8793), abrir `qr/verificar.html`, esperar a `QR OK 24/24` y hacer clic en
   «abrir». Tiene que llegar a `https://menu.candelaycafe.com/` con la carta nueva (79 platos).
4. Cerrar las pestañas y parar los servidores.

- [ ] **Step 8: Copias para Robert y registro**

1. **Bandeja del día:** copiar los 9 archivos de `qr/` (`qr-candela-menu-*`) a
   `C:\Users\rmace\Desktop\Galiax\2026-10-09\qr-carta-candela\`, sobrescribiendo los del QR viejo a `/menu`, y
   comprobarlos con `sha256sum -c` contra los del repo.
2. **Cerebro** (`/brain add`, en `clientes/candela-cafe.md`), en la sección del 9-oct:
   - el QR va a `https://menu.candelaycafe.com`;
   - la carta del QR vive en `menu-qr/` y está publicada (con el id del deploy de producción);
   - al cambiar `web/js/menu-data.js` hay que publicar **las dos**, la web y la carta del QR;
   - `candela-cafe-menu` no puede perder el dominio, ni Squarespace el registro `menu`;
   - el subdominio ya no sirve la carta de abril.
3. **Pendientes** (`/pendientes`):
   - borrar «decidir `menu.candelaycafe.com`…»;
   - cambiar el de escanear el QR para que diga que apunta a `menu.candelaycafe.com`;
   - mantener el de renovar el dominio.
4. **Memoria:** actualizar `candela-qr-carta.md`. El QR abre `https://menu.candelaycafe.com` (la carta de `menu-qr/`);
   `/menu` de la web sigue vivo por el perfil de Google; al cambiar la carta, publicar las dos. Actualizar también su
   línea en `MEMORY.md`.
5. **Commit y push** del repo si quedó algo, y del cerebro y los pendientes.

- [ ] **Step 9: Cierre**

- Mandar a Robert el QR nuevo (`qr-candela-menu-bn.svg` y `.pdf`) con `SendUserFile`.
- Avisarle de que los archivos del QR que le llegaron antes apuntaban a `candelaycafe.com/menu` y ya no valen.
- Preguntarle si se fusiona `feature/qr-menu` en `master`: necesita su OK y no cambia la web publicada.

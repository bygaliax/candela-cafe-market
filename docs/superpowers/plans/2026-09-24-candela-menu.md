# Menú digital «Carta de papel» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer `web/menu.html` con la piel «Carta de papel»: fotos reales en los platos que coinciden, carta agrupada por momentos del día, buscador y anclas a cada plato. El pedido por WhatsApp no cambia.

**Architecture:** Los datos (`menu-data.js`) ganan momentos, cabeceras y encuadres. Un módulo puro nuevo (`menu-render.js`) pinta la carta y los chips, y decide qué se ve con cada búsqueda; se prueba con `node:test`. `menu.js` solo pinta, conecta el DOM (chips, scroll-spy, buscador, anclas y carrito) y se prueba en el navegador. `cart.js` y `cart-core.js` no cambian.

**Tech Stack:** HTML, CSS y JS vanilla con módulos ES, sin build. Tests con `node --test`. Imágenes con sharp (`tools/node_modules`). Pruebas de navegador con Playwright MCP. Netlify CLI para la preview.

**Spec:** `docs/superpowers/specs/2026-09-24-candela-menu-design.md`

## Global Constraints

- Rama `feature/un-dia-en-candela`. Push de la rama tras cada commit (aprobado). **Nada a `master`.**
- Los `id` de las categorías y de los platos no cambian. Dependen de ellos el carrito guardado, los favoritos de la portada y los enlaces `menu.html#…`.
- Nada inventado: ni platos, ni precios, ni fotos. Precios, nombres y descripciones no se tocan: siguen siendo 79 platos que suman 889,84 $.
- `cart.js` y `cart-core.js` sin cambios de lógica. El mensaje de WhatsApp y la clave `candela-cart` de `localStorage` siguen iguales.
- Contraste sobre crema:
  - precios en rojo `#C42A1F` (5,3:1);
  - texto verde pequeño en `#3F7021` (5,5:1);
  - rellenos rojos con texto blanco en `--rojo-txt` (4,7:1).
- Botones «+» de 40 px como mínimo.
- Todo texto visible o accesible pasa por i18n, en EN y en ES.
- Sin scroll horizontal a 320 px. Lighthouse en móvil: ≥ 90 en rendimiento y ≥ 95 en accesibilidad.
- Tests: `node --test tests/*.test.mjs` desde la raíz del repo. `npm test` no existe: no hay `package.json` en la raíz.
- **Navegador:**
  - Playwright MCP contra `http://localhost:8124` (python `http.server` sobre `web/`, ya levantado).
  - **Nunca contra `:8123`**: es browser-sync y la pestaña de Robert.
  - Antes de navegar, desactivar la caché con `browser_run_code_unsafe`:
    `const s = await page.context().newCDPSession(page); await s.send('Network.enable'); await s.send('Network.clearBrowserCache'); await s.send('Network.setCacheDisabled', { cacheDisabled: true });`
  - Para mover la página: `scrollTo({ top, behavior: 'instant' })`, porque el `html` tiene scroll suave.
- Despliegue: solo preview con `netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5`, sin `--prod`.
- Workspace del plan (ignorado por git): `.superpowers/sdd/2026-09-24-candela-menu/`, en adelante `$W`.

## Review Focus

1. **Carrito guardado antes del cambio** (`candela-cart` con líneas de ids que existen y de uno que ya no existe): se carga, el botón de pedido muestra cantidad y total, y la línea huérfana se descarta sin romper nada. Prueba: Task 4, paso 9.
2. **Búsqueda puesta y cambio de idioma:** el filtro sigue aplicado, los chips ocultos siguen ocultos y los textos cambian de idioma. Prueba: Task 5, paso 7.
3. **Hash raro:**
   - `menu.html#no-existe` y `menu.html#%E0%A4%A` (mal codificado): la carta se pinta, sin errores en consola y en lo alto de la página;
   - la portada con `#%E0%A4%A` sigue funcionando.
   Pruebas: Task 4, paso 8, y Task 6, paso 5.
4. **320 px con nombres largos** en tarjetas de dos columnas y en la ancha: ni la página ni ninguna tarjeta se desborda. Prueba: Task 4, paso 6.
5. **Teclado:** un «+» que queda bajo la barra de chips y recibe el foco con Tab no se queda tapado (`scroll-padding-top`). Prueba: Task 4, paso 10.

---

### Task 1: Fotos y datos de la carta

**Files:**
- Create: `tools/convert-menu.mjs`
- Modify: `web/js/menu-data.js` (bloque `CATEGORIES`, líneas 13-29; comentario `// item:` de la línea 30; líneas `img:` de 12 platos)
- Delete: `web/assets/img/pastrami-{480,960,1440}.webp` y `web/assets/img/hero-sandwich-{480,960,1440}.webp`
- Create: `web/assets/img/menu-*.webp` (14 archivos)
- Test: `tests/menu-data.test.mjs` (nuevo)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `PARTS: Array<{ id: 'morning'|'coffee'|'midday', label: { en, es } }>`, en ese orden;
  - `CATEGORIES`: reordenado; cada categoría con `part`, y las que la tienen con `cover: { img: string, w: number[], focus?: string }` y `note: { en, es }` (solo `dominican-spot`, que es `DAILY_SPECIAL`);
  - platos con `img: string|null` y el campo opcional `focus: 'X% Y%'` (se usa como `object-position`).

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/menu-data.test.mjs`:

```js
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
    // fotos que ya tenía la carta y se mantienen
    'bk-downtown-platter': 'breakfast-platter',
    'sw-chicken-caesar-salad': 'caesar-salad',
    'dm-fritura-mixta-2ps': 'food-2',
    'pn-italian-panini': 'food-3',
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
```

- [ ] **Step 2: Verlo fallar**

Run: `node --test tests/menu-data.test.mjs`
Expected: FAIL. `SyntaxError: The requested module '../web/js/menu-data.js' does not provide an export named 'PARTS'`.

- [ ] **Step 3: Convertir las 6 fotos nuevas**

Crear `tools/convert-menu.mjs`:

```js
// Fotos de la carta «Carta de papel» (2026-09-24) → WebP responsive en web/assets/img.
// Solo las nuevas: las demás ya las convirtió convert-un-dia.mjs y se reutilizan (spec del menú, §5.1).
// Originales en _material (fuera del repo). Solo genera anchos ≤ al original (sin ampliar).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/fotos-2026-09-24';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const IMAGES = {
  'menu-central-park-club': 'descargas-24-sep/01 (11).png',
  'menu-california-turkey': 'descargas-24-sep/01 (12).png',
  'menu-greek-salad':       'descargas-24-sep/01 (10).png',
  'menu-quesadilla':        'zip-18-sep/F-1.jpg',
  'menu-candela-burger':    'zip-18-sep/E-2.jpg',
  'menu-sopa':              'zip-18-sep/B-1.jpg',
};
const WIDTHS = [480, 960, 1440];

for (const [slug, rel] of Object.entries(IMAGES)) {
  const src = path.join(SRC, rel);
  const { width } = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then(r => r.info);
  for (const w of WIDTHS.filter(w => w <= width)) {
    const info = await sharp(src).rotate().resize({ width: w }).webp({ quality: 76 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
    console.log(`${slug}-${w}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  }
}
```

Run: `node tools/convert-menu.mjs`
Expected: 14 líneas.
- `menu-central-park-club`, `menu-california-turkey`, `menu-greek-salad` y `menu-candela-burger`: 480 y 960 (sus originales miden menos de 1440 de ancho).
- `menu-quesadilla` y `menu-sopa`: 480, 960 y 1440.
- Ningún archivo pasa de ~300 KB.

- [ ] **Step 4: Momentos, orden y cabeceras en `menu-data.js`**

Sustituir el bloque `export const CATEGORIES = [ … ];` (líneas 13-29) por:

```js
// Momentos del día de la carta (spec del menú, §4.2). CATEGORIES va en este orden.
export const PARTS = [
  { id: 'morning', label: { en: 'Morning',         es: 'Mañana' } },
  { id: 'coffee',  label: { en: 'Coffee & juices', es: 'Café y jugos' } },
  { id: 'midday',  label: { en: 'Midday',          es: 'Mediodía' } },
];

// cover = foto de cabecera cuando la foto enseña varios productos o el lugar; w = anchos que existen en assets/img.
export const CATEGORIES = [
  { id: 'breakfast',      part: 'morning', label: { en: 'Breakfast',               es: 'Desayunos' } },
  { id: 'avocado-toast',  part: 'morning', label: { en: 'Avocado Toast',           es: 'Avocado Toast' } },
  { id: 'bakery',         part: 'morning', label: { en: 'Bakery & More',           es: 'Panadería' },
    cover: { img: 'manana-pastelitos', w: [480, 960] } },
  { id: 'coffee',         part: 'coffee',  label: { en: 'Coffee Bar',              es: 'Barra de Café' },
    cover: { img: 'noche-neon', w: [480, 960], focus: '50% 88%' } },
  { id: 'juices',         part: 'coffee',  label: { en: 'Juices',                  es: 'Jugos' } },
  { id: 'smoothies',      part: 'coffee',  label: { en: 'Smoothies',               es: 'Batidos' } },
  { id: 'shakes',         part: 'coffee',  label: { en: 'Protein Shakes',          es: 'Batidos de Proteína' } },
  { id: 'ny-signature',   part: 'midday',  label: { en: 'NY Signature Sandwiches', es: 'Sándwiches NY' } },
  { id: 'signature',      part: 'midday',  label: { en: 'Signature Sandwiches',    es: 'Sándwiches de la Casa' } },
  { id: 'panini',         part: 'midday',  label: { en: 'Panini',                  es: 'Panini' } },
  { id: 'burgers',        part: 'midday',  label: { en: 'Burgers',                 es: 'Hamburguesas' } },
  { id: 'dominican-spot', part: 'midday',  label: { en: 'Dominican Spot',          es: 'Rincón Dominicano' },
    cover: { img: 'mediodia-mesa-caliente', w: [480, 960, 1440] }, note: DAILY_SPECIAL },
  { id: 'salads-wraps',   part: 'midday',  label: { en: 'Salads & Wraps',          es: 'Ensaladas y Wraps' } },
  { id: 'soups',          part: 'midday',  label: { en: 'Soups',                   es: 'Sopas' },
    cover: { img: 'menu-sopa', w: [480, 960, 1440], focus: '50% 55%' } },
  { id: 'appetizers',     part: 'midday',  label: { en: 'Appetizers & Sides',      es: 'Aperitivos' } },
];
```

En la línea del comentario de los platos, cambiar
`// item: { id, name, desc:{en,es}|null, price:Number, badge:String|null, img:slug|null }`
por
`// item: { id, name, desc:{en,es}|null, price:Number, badge:String|null, img:slug|null, focus?:'X% Y%' }`

- [ ] **Step 5: Fotos de los 12 platos**

Crear `$W/set-photos.mjs` y ejecutarlo desde la raíz del repo con `node "$W/set-photos.mjs"`. Cambia la línea `img:` de cada plato y, si hace falta, añade debajo su `focus`. Respeta los CRLF del archivo.

```js
import { readFileSync, writeFileSync } from 'node:fs';
const F = 'web/js/menu-data.js';
// id → [archivo web, encuadre]. Encuadre provisional: se revisa en la Task 7 con capturas.
const PHOTOS = {
  'bk-pancakes-french-toast-wafles': ['manana-fachada', '50% 78%'],
  'sw-chicken-steak-quesadilla':     ['menu-quesadilla', null],
  'sw-greek-salad':                  ['menu-greek-salad', '45% 45%'],
  'sg-prosciutto-sandwich':          ['lugar-interior', '50% 72%'],
  'sg-california-turkey-sandwich':   ['menu-california-turkey', '50% 45%'],
  'ny-the-ruben-sandwich':           ['deli-ruben', '50% 58%'],
  'ny-central-park-club-sandwiches': ['menu-central-park-club', null],
  'ny-chopped-cheese':               ['deli-chopped-cheese', null],
  'ny-manhattan-hero':               ['lugar-neon-sub', '50% 58%'],
  'ny-phili-cheese-steak':           ['lugar-terraza', '50% 62%'],
  'pn-grilled-chicken-panini':       ['deli-chicken-panini', null],
  'bg-candela-burger':               ['menu-candela-burger', '50% 42%'],
};
const src = readFileSync(F, 'utf8');
const eol = src.includes('\r\n') ? '\r\n' : '\n';
const lines = src.split(eol);
for (const [id, [img, focus]] of Object.entries(PHOTOS)) {
  const at = lines.findIndex(l => l.includes(`id: '${id}'`));
  const k = lines.findIndex((l, i) => i > at && /^\s*img:/.test(l));
  if (at < 0 || k < 0 || k - at > 12) throw new Error(`no encuentro img de ${id}`);
  const pad = lines[k].match(/^\s*/)[0];
  lines.splice(k, 1, `${pad}img: '${img}',`, ...(focus ? [`${pad}focus: '${focus}',`] : []));
}
writeFileSync(F, lines.join(eol));
console.log('ok', Object.keys(PHOTOS).length);
```

Expected: `ok 12`. `git diff --stat web/js/menu-data.js` muestra solo ese archivo.

- [ ] **Step 6: Borrar las fotos viejas**

Run: `git rm -q web/assets/img/pastrami-480.webp web/assets/img/pastrami-960.webp web/assets/img/pastrami-1440.webp web/assets/img/hero-sandwich-480.webp web/assets/img/hero-sandwich-960.webp web/assets/img/hero-sandwich-1440.webp && grep -rn "pastrami-\|hero-sandwich" web --include=*.html --include=*.js --include=*.css`
Expected: el grep no imprime nada (nadie más las usa).

- [ ] **Step 7: Verlo pasar y la suite entera**

Run: `node --test tests/menu-data.test.mjs` → Expected: 7/7 PASS.
Run: `node --test tests/*.test.mjs` → Expected: 46/46 PASS (39 + 7).

- [ ] **Step 8: Commit**

```bash
git add tools/convert-menu.mjs web/js/menu-data.js web/assets/img/menu-*.webp tests/menu-data.test.mjs
git commit -m "feat(menú): fotos aprobadas en sus platos, momentos del día y cabeceras de categoría"
git push -q
```

---

### Task 2: Pintado puro de la carta (`menu-render.js`)

**Files:**
- Create: `web/js/menu-render.js`
- Test: `tests/menu-render.test.mjs` (nuevo)

**Interfaces:**
- Consumes: `PARTS`, `CATEGORIES` (con `part`, `cover`, `note`) y `MENU` (con `img` y `focus`) de la Task 1. También `esc` de `web/js/sections.js` y `DICT` de `web/js/i18n.js`.
- Produces:
  - `groupByPart(categories, parts) → Array<{ part, cats }>`, sin momentos vacíos;
  - `wideId(itemsWithImg) → string|null`: id de la primera tarjeta si son impares;
  - `renderMenu(categories, menu, parts, lang) → string`;
  - `renderChips(categories, parts, lang) → string`.
- **Marcado que usan la Task 4 y la Task 5:**
  - `<section class="part" data-part>` con su `<h2 class="part-label">`;
  - `<section class="cat" id="<cat>">` con `<h3 class="cat-sign">`, `<figure class="cat-cover">`, `<p class="cat-note">`, `<ul class="cards">` y `<ul class="rows">`;
  - `<li class="card[ card--wide]" id="<plato>" data-id="<plato>">` y `<li class="row" id data-id>`;
  - `.it-name`, `.it-desc`, `.badge`, `.it-buy`, `.it-price`, `.it-ask` y `<button class="it-add">`;
  - chips: `<a class="chip" href="#<cat>" data-cat="<cat>">`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/menu-render.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, MENU, PARTS } from '../web/js/menu-data.js';
import { groupByPart, wideId, renderMenu, renderChips } from '../web/js/menu-render.js';

const count = (html, needle) => html.split(needle).length - 1;
const sectionOf = (html, id) => { const a = html.indexOf(`<section class="cat" id="${id}"`); return html.slice(a, html.indexOf('</section>', a)); };
const ES = renderMenu(CATEGORIES, MENU, PARTS, 'es');

test('groupByPart: tres momentos en orden, con todas las categorías', () => {
  const g = groupByPart(CATEGORIES, PARTS);
  assert.deepEqual(g.map(x => x.part.id), ['morning', 'coffee', 'midday']);
  assert.deepEqual(g[0].cats.map(c => c.id), ['breakfast', 'avocado-toast', 'bakery']);
  assert.equal(g.reduce((n, x) => n + x.cats.length, 0), CATEGORIES.length);
});

test('wideId: la primera si son impares, ninguna si son pares', () => {
  assert.equal(wideId([{ id: 'a' }, { id: 'b' }, { id: 'c' }]), 'a');
  assert.equal(wideId([{ id: 'a' }, { id: 'b' }]), null);
  assert.equal(wideId([]), null);
});

test('renderMenu: cada plato sale una sola vez, con su ancla', () => {
  for (const it of Object.values(MENU).flat()) assert.equal(count(ES, `id="${it.id}"`), 1, it.id);
  assert.equal(count(ES, 'data-id="'), 79);
});

test('renderMenu: h2 por momento y h3 por categoría, en el orden de la carta', () => {
  assert.equal(count(ES, '<h2 class="part-label"'), 3);
  assert.equal(count(ES, '<h3 class="cat-sign"'), 15);
  assert.ok(ES.indexOf('>Mañana<') < ES.indexOf('>Café y jugos<'));
  assert.ok(ES.indexOf('>Café y jugos<') < ES.indexOf('>Mediodía<'));
  assert.ok(ES.indexOf('id="breakfast"') < ES.indexOf('id="coffee"'));
  assert.ok(ES.indexOf('id="coffee"') < ES.indexOf('id="ny-signature"'));
});

test('renderMenu: tarjetas = platos con foto, antes que las filas', () => {
  const ny = sectionOf(ES, 'ny-signature');
  assert.equal(count(ny, '<li class="card'), 5);
  assert.equal(count(ny, '<li class="row"'), 2);
  assert.ok(ny.indexOf('<ul class="cards">') < ny.indexOf('<ul class="rows">'));
  assert.equal(count(ES, '<li class="card'), 16);
});

test('renderMenu: con tarjetas impares la primera va ancha', () => {
  const wides = [...ES.matchAll(/<li class="card card--wide" id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(wides, ['ny-the-ruben-sandwich', 'bg-candela-burger', 'dm-fritura-mixta-2ps', 'sw-chicken-steak-quesadilla']);
});

test('renderMenu: precio 0 → «Pregunta en tienda» sin «+»; con precio, «+» con el nombre del plato', () => {
  const coffee = sectionOf(ES, 'coffee');
  assert.equal(count(coffee, 'class="it-add"'), 0);
  assert.equal(count(coffee, 'Pregunta en tienda'), 10);
  assert.match(ES, /<button class="it-add" type="button" aria-label="Agregar Chopped Cheese">\+<\/button>/);
  assert.match(sectionOf(ES, 'burgers'), /\$15\.99/);
});

test('renderMenu: foto de tarjeta con srcset 480/960, tamaño fijo, decorativa y con su encuadre', () => {
  const card = ES.match(/<li class="card[^"]*" id="ny-phili-cheese-steak"[\s\S]*?<\/li>/)[0];
  assert.match(card, /srcset="assets\/img\/lugar-terraza-480\.webp 480w, assets\/img\/lugar-terraza-960\.webp 960w"/);
  assert.match(card, /alt=""/);
  assert.match(card, /width="480" height="360"/);
  assert.match(card, /style="object-position:50% 62%"/);
  assert.match(card, /loading="lazy"/);
});

test('renderMenu: solo las fotos de Desayunos se cargan sin lazy', () => {
  assert.equal(count(sectionOf(ES, 'breakfast'), 'loading="lazy"'), 0);
  assert.equal(count(ES, '<img') - count(ES, 'loading="lazy"'), 2);
});

test('renderMenu: cabeceras decorativas con sus anchos y el aviso del especial en Rincón Dominicano', () => {
  assert.equal(count(ES, '<figure class="cat-cover">'), 4);
  const dom = sectionOf(ES, 'dominican-spot');
  assert.match(dom, /mediodia-mesa-caliente-1440\.webp 1440w/);
  assert.match(dom, /<p class="cat-note">¡Pregunta por nuestros especiales del día!<\/p>/);
  assert.doesNotMatch(sectionOf(ES, 'coffee'), /1440w/);
});

test('renderMenu: textos en el idioma pedido y todo escapado', () => {
  const EN = renderMenu(CATEGORIES, MENU, PARTS, 'en');
  assert.match(EN, />Morning</);
  assert.match(EN, /Ask in store/);
  const evil = [{ id: 'x', part: 'morning', label: { en: '<b>', es: '<b>' } }];
  const html = renderMenu(evil, { x: [{ id: 'y"', name: '<i>', desc: { en: '&', es: '&' }, price: 1, badge: null, img: null }] }, PARTS, 'en');
  assert.doesNotMatch(html, /<b>|<i>/);
  assert.match(html, /&lt;i&gt;/);
  assert.match(html, /id="y&quot;"/);
});

test('renderChips: un chip por categoría, en el orden de la carta', () => {
  const html = renderChips(CATEGORIES, PARTS, 'es');
  const cats = [...html.matchAll(/data-cat="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(cats, groupByPart(CATEGORIES, PARTS).flatMap(g => g.cats.map(c => c.id)));
  assert.match(html, /<a class="chip" href="#ny-signature" data-cat="ny-signature">Sándwiches NY<\/a>/);
});
```

- [ ] **Step 2: Verlo fallar**

Run: `node --test tests/menu-render.test.mjs`
Expected: FAIL. `Cannot find module '…/web/js/menu-render.js'`.

- [ ] **Step 3: Implementar `web/js/menu-render.js`**

```js
// Carta «Carta de papel» (2026-09): funciones PURAS que devuelven HTML en texto.
// Testeadas en tests/menu-render.test.mjs. Todo dato pasa por esc().
import { DICT } from './i18n.js';
import { esc } from './sections.js';

const tx = (key, lang) => (DICT[key] && DICT[key][lang]) || key;
const IMG = 'assets/img/';
const srcset = (img, widths) => widths.map(w => `${IMG}${esc(img)}-${w}.webp ${w}w`).join(', ');
const pos = focus => (focus ? ` style="object-position:${esc(focus)}"` : '');

/** Momentos del día con sus categorías, en el orden de PARTS y de CATEGORIES. Sin momentos vacíos. */
export function groupByPart(categories, parts) {
  return parts
    .map(part => ({ part, cats: categories.filter(c => c.part === part.id) }))
    .filter(g => g.cats.length);
}

/** Con un número impar de tarjetas, la primera va a todo el ancho: su id, o null. */
export const wideId = withImg => (withImg.length % 2 === 1 ? withImg[0].id : null);

function buy(item, lang) {
  return item.price > 0
    ? `<span class="it-price">$${item.price.toFixed(2)}</span>`
      + `<button class="it-add" type="button" aria-label="${esc(tx('cart.add', lang))} ${esc(item.name)}">+</button>`
    : `<span class="it-ask">${esc(tx('cart.ask', lang))}</span>`;
}

function card(item, lang, wide, eager) {
  return `<li class="card${wide ? ' card--wide' : ''}" id="${esc(item.id)}" data-id="${esc(item.id)}">`
    + `<img src="${IMG}${esc(item.img)}-480.webp" srcset="${srcset(item.img, [480, 960])}"`
    + ` sizes="${wide ? '(max-width:599px) 92vw, 540px' : '(max-width:599px) 46vw, 270px'}"`
    + ` alt="" width="480" height="360"${eager ? '' : ' loading="lazy"'} decoding="async"${pos(item.focus)}>`
    + `<span class="it-name">${esc(item.name)}</span>`
    + (item.badge ? `<span class="badge">${esc(item.badge)}</span>` : '')
    + (item.desc ? `<span class="it-desc">${esc(item.desc[lang])}</span>` : '')
    + `<span class="it-buy">${buy(item, lang)}</span></li>`;
}

function row(item, lang) {
  return `<li class="row" id="${esc(item.id)}" data-id="${esc(item.id)}">`
    + `<span class="it-text"><span class="it-name">${esc(item.name)}</span>`
    + (item.badge ? `<span class="badge">${esc(item.badge)}</span>` : '')
    + (item.desc ? `<span class="it-desc">${esc(item.desc[lang])}</span>` : '')
    + `</span>${buy(item, lang)}</li>`;
}

function cover(c, eager) {
  return `<figure class="cat-cover"><img src="${IMG}${esc(c.img)}-960.webp" srcset="${srcset(c.img, c.w)}"`
    + ` sizes="(max-width:1180px) 100vw, 1100px" alt="" width="960" height="400"`
    + `${eager ? '' : ' loading="lazy"'} decoding="async"${pos(c.focus)}></figure>`;
}

function category(cat, items, lang, eager) {
  const withImg = items.filter(i => i.img), noImg = items.filter(i => !i.img);
  const wide = wideId(withImg);
  return `<section class="cat" id="${esc(cat.id)}" aria-labelledby="h-${esc(cat.id)}">`
    + `<h3 class="cat-sign" id="h-${esc(cat.id)}">${esc(cat.label[lang])}</h3>`
    + (cat.cover ? cover(cat.cover, eager) : '')
    + (cat.note ? `<p class="cat-note">${esc(cat.note[lang])}</p>` : '')
    + (withImg.length ? `<ul class="cards">${withImg.map(i => card(i, lang, i.id === wide, eager)).join('')}</ul>` : '')
    + (noImg.length ? `<ul class="rows">${noImg.map(i => row(i, lang)).join('')}</ul>` : '')
    + '</section>';
}

/** La carta entera: h2 por momento y h3 por categoría. Solo la primera categoría carga sus fotos sin lazy. */
export function renderMenu(categories, menu, parts, lang) {
  let first = true;
  return groupByPart(categories, parts).map(({ part, cats }) =>
    `<section class="part" data-part="${esc(part.id)}" aria-labelledby="p-${esc(part.id)}">`
    + `<h2 class="part-label" id="p-${esc(part.id)}">${esc(part.label[lang])}</h2>`
    + cats.map(c => { const html = category(c, menu[c.id] || [], lang, first); first = false; return html; }).join('')
    + '</section>').join('');
}

/** Un chip por categoría, en el orden en que salen en la carta. */
export function renderChips(categories, parts, lang) {
  return groupByPart(categories, parts).flatMap(g => g.cats)
    .map(c => `<a class="chip" href="#${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.label[lang])}</a>`).join('');
}
```

- [ ] **Step 4: Verlo pasar y la suite entera**

Run: `node --test tests/menu-render.test.mjs` → Expected: 12/12 PASS.
Run: `node --test tests/*.test.mjs` → Expected: 58/58 PASS.

- [ ] **Step 5: Commit**

```bash
git add web/js/menu-render.js tests/menu-render.test.mjs
git commit -m "feat(menú): pintado puro de la carta por momentos, con tarjetas, filas y cabeceras"
git push -q
```

---

### Task 3: Búsqueda pura e i18n del buscador

**Files:**
- Modify: `web/js/menu-render.js` (imports y funciones nuevas al final)
- Modify: `web/js/i18n.js` (claves `menu.search.*` al final de `DICT`; `apply()`, línea 157)
- Modify: `tests/site-consistency.test.mjs:32` (regex de claves: incluye `-placeholder`)
- Test: `tests/menu-search.test.mjs` (nuevo)

**Interfaces:**
- Consumes: `wideId` (Task 2), `CATEGORIES` y `MENU` (Task 1), `PHONE` de `menu-data.js` y `waUrl(phone, text)` de `cart-core.js`.
- Produces:
  - `normalize(s) → string`;
  - `matches(item, cat, query) → boolean`;
  - `filterMenu(categories, menu, query) → { items: Set<id>, cats: Set<catId>, parts: Set<partId>, wide: Set<id>, count: number }`;
  - `searchStatus(count, lang) → string`;
  - `askUrl(query, lang) → string`;
  - claves `menu.search.label|ph|one|many|none|ask|wa`;
  - atributo `data-i18n-placeholder`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/menu-search.test.mjs`:

```js
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
```

- [ ] **Step 2: Verlo fallar**

Run: `node --test tests/menu-search.test.mjs`
Expected: FAIL. `does not provide an export named 'normalize'`.

- [ ] **Step 3: Implementar**

En `web/js/menu-render.js`, añadir debajo de `import { esc } from './sections.js';`:

```js
import { waUrl } from './cart-core.js';
import { PHONE } from './menu-data.js';
```

Al final de `web/js/menu-render.js`:

```js
/* ── buscador ─────────────────────────────────────────────── */

/** Minúsculas, sin tildes y sin espacios sobrantes: «Café » → «cafe». */
export const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Busca en nombre, descripción (EN y ES) y nombre de la categoría (EN y ES). Tienen que estar todas las palabras. */
export function matches(item, cat, query) {
  const q = normalize(query);
  if (q.length < 2) return true;
  const hay = [item.name, item.desc && item.desc.en, item.desc && item.desc.es, cat.label.en, cat.label.es]
    .filter(Boolean).map(normalize).join(' | ');
  return q.split(/\s+/).every(w => hay.includes(w));
}

/** Qué se ve con una búsqueda: platos, categorías, momentos, tarjetas anchas y cuántos platos. */
export function filterMenu(categories, menu, query) {
  const items = new Set(), cats = new Set(), parts = new Set(), wide = new Set();
  for (const c of categories) {
    const hits = (menu[c.id] || []).filter(i => matches(i, c, query));
    if (!hits.length) continue;
    hits.forEach(i => items.add(i.id));
    cats.add(c.id);
    parts.add(c.part);
    const w = wideId(hits.filter(i => i.img));
    if (w) wide.add(w);
  }
  return { items, cats, parts, wide, count: items.size };
}

/** Texto de la región viva: «1 plato», «12 platos» o «No lo encontramos.». */
export function searchStatus(count, lang) {
  if (count === 0) return tx('menu.search.none', lang);
  return count === 1 ? tx('menu.search.one', lang) : tx('menu.search.many', lang).replace('{n}', String(count));
}

/** «¿Tienen …?» por WhatsApp, con lo que se buscó. */
export const askUrl = (query, lang) => waUrl(PHONE, tx('menu.search.wa', lang).replace('{q}', query.trim()));
```

En `web/js/i18n.js`, añadir antes del `};` que cierra `DICT` (línea 136):

```js
  /* ============ carta «Carta de papel» (2026-09-24) ============ */
  'menu.search.label': { en: 'Search the menu', es: 'Buscar en la carta' },
  'menu.search.ph':    { en: 'Cortadito, burger, empanadas…', es: 'Cortadito, burger, empanadas…' },
  'menu.search.one':   { en: '1 dish', es: '1 plato' },
  'menu.search.many':  { en: '{n} dishes', es: '{n} platos' },
  'menu.search.none':  { en: "We couldn't find that.", es: 'No lo encontramos.' },
  'menu.search.ask':   { en: 'Ask us on WhatsApp', es: 'Pregúntanos por WhatsApp' },
  'menu.search.wa':    { en: 'Hi Candela & Café! Do you have {q}?', es: '¡Hola Candela & Café! ¿Tienen {q}?' },
```

En `apply()` de `web/js/i18n.js`, debajo de la línea de `[data-i18n-aria]`:

```js
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const e = DICT[el.dataset.i18nPlaceholder]; if (e) el.placeholder = e[lang]; });
```

En `tests/site-consistency.test.mjs:32`, cambiar `/data-i18n(?:-alt|-aria)?="([^"]+)"/g` por `/data-i18n(?:-alt|-aria|-placeholder)?="([^"]+)"/g`.

- [ ] **Step 4: Verlo pasar y la suite entera**

Run: `node --test tests/menu-search.test.mjs` → Expected: 10/10 PASS.
Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS.

- [ ] **Step 5: Commit**

```bash
git add web/js/menu-render.js web/js/i18n.js tests/menu-search.test.mjs tests/site-consistency.test.mjs
git commit -m "feat(menú): búsqueda sin tildes en EN y ES, tarjeta ancha recalculada y textos del buscador"
git push -q
```

---

### Task 4: La página nueva (HTML, piel de papel y comportamiento)

**Files:**
- Modify: `web/menu.html` (fuentes, `<body>`, `aria-label` de las navs, cabecera y hoja del carrito)
- Modify: `web/js/i18n.js` (claves de la página; `menu.title`)
- Replace: `web/css/menu.css` (se rehace)
- Replace: `web/js/menu.js` (se rehace)

**Interfaces:**
- Consumes: `renderMenu` y `renderChips` (Task 2); `PARTS`, `CATEGORIES` y `MENU` (Task 1); `cart`, `refresh`, `initCartUI` y `syncFromStorage` de `cart.js` (sin cambios).
- Produces:
  - en `menu.js`: `render()`, `setActive(id)`, `syncActive()`, `initSpy()` y `reanchor()`, que la Task 5 amplía;
  - ids del DOM: `#nav`, `#chips`, `#menuMain` y `#menuTitle`;
  - variable CSS `--menu-top` (alto de nav + chips) en `<html>`;
  - clase `.is-target` en el plato al que se llega por ancla.

- [ ] **Step 1: RED en el navegador**

Desactivar la caché y abrir `http://localhost:8124/menu.html` a 375×812. Luego `browser_evaluate`:

```js
() => ({ parts: document.querySelectorAll('.part-label').length, cards: document.querySelectorAll('.card').length, bg: getComputedStyle(document.body).backgroundColor })
```

Expected: `{ parts: 0, cards: 0, bg: 'rgb(13, 13, 13)' }` (la carta vieja, oscura).

- [ ] **Step 2: Marcado de `web/menu.html`**

Los números de línea son los del archivo antes de tocarlo. Localiza cada cambio por su contenido.

1. En las tres URL de Google Fonts (líneas 18-20), cambiar `family=Architects+Daughter&` por `family=Anton&family=Architects+Daughter&`. Así quedan igual que en la portada y comparten caché.
2. Línea 34: `<body>` → `<body class="page-menu">`.
3. Línea 36: añadir `data-i18n-aria="nav.main"` al `<nav class="nav" …>`.
4. Sustituir el bloque `<header class="menu-hero">…</header>` (líneas 53-58) por:

```html
<header class="menu-head">
  <div class="wrap">
    <p class="menu-kick" data-i18n="menu.kicker">Order · pick up at 507</p>
    <h1 id="menuTitle" tabindex="-1" data-i18n="menu.title">The menu.</h1>
    <p class="ssub" data-i18n="menu.sub">Order online — we confirm by WhatsApp.</p>
  </div>
</header>
```

5. Línea 60: añadir `data-i18n-aria="menu.chips"` al `<nav class="chips" …>`.
6. Línea 72: añadir `data-i18n-aria="cart.label"` al `<aside class="cart-sheet" …>`.
7. Línea 86: añadir `data-i18n-aria="footer.nav"` al `<nav aria-label="Footer navigation">`.

- [ ] **Step 3: RED de i18n y claves**

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL en «i18n: toda clave usada existe en EN y en ES». Faltan `footer.nav`, `menu.chips`, `menu.kicker` y `nav.main`.

En `web/js/i18n.js`:
- cambiar `'menu.title'` por `{ en: 'The menu.', es: 'La carta.' }`;
- añadir al bloque «carta» de la Task 3:

```js
  'menu.kicker':       { en: 'Order · pick up at 507', es: 'Pide · recoge en el 507' },
  'menu.chips':        { en: 'Menu categories', es: 'Categorías de la carta' },
  'nav.main':          { en: 'Main navigation', es: 'Navegación principal' },
  'footer.nav':        { en: 'Footer navigation', es: 'Navegación del pie de página' },
```

Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS.

- [ ] **Step 4: Rehacer `web/css/menu.css`**

```css
/* MENU.CSS — «Carta de papel» (2026-09). Spec: docs/superpowers/specs/2026-09-24-candela-menu-design.md
   Crema, carteles en Anton y precios a mano en rojo. Complementa base.css. */
html{scroll-padding-top:var(--menu-top,128px)}
.page-menu{--precio:#C42A1F;--verde-txt:#3F7021;--raya:#d8c9b4;background:var(--claro);color:var(--ink)}
.page-menu :focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.page-menu .nav :focus-visible,.page-menu .footer :focus-visible{outline-color:var(--verde)}

/* nav negra y compacta desde arriba: la transparente no se ve sobre crema */
.page-menu .nav{background:rgba(13,13,13,.97)}
.page-menu .nav-inner{padding-top:12px;padding-bottom:12px}

/* cabecera */
.menu-head{padding:112px 0 22px}
.menu-kick{font:700 .74rem/1.2 var(--body);letter-spacing:.22em;text-transform:uppercase;color:var(--verde-txt)}
.menu-head h1{font:400 clamp(3rem,10vw,4.8rem)/.95 var(--disp);margin:10px 0 8px;color:var(--ink)}
.menu-head .ssub{color:var(--ink-2);max-width:48ch}

/* chips fijos bajo la nav */
.chips{position:sticky;top:70px;z-index:90;display:flex;gap:8px;overflow-x:auto;padding:12px 20px;
  background:var(--claro);border-bottom:2px solid var(--ink);scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:0 0 auto;font:400 .82rem/1 var(--sign);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  color:var(--ink);border:2px solid var(--ink);padding:9px 12px 8px;transition:background .2s,color .2s,border-color .2s}
.chip:hover{background:var(--arena)}
.chip.active{background:var(--rojo-txt);border-color:var(--rojo-txt);color:#fff}
@media(min-width:1024px){.chips{flex-wrap:wrap;justify-content:center;overflow:visible;padding:12px 40px}}

/* la carta: momentos y categorías */
.menu-main{padding-top:6px;padding-bottom:140px;min-height:60vh}
.part-label{display:flex;align-items:center;gap:12px;margin:34px 0 0;font:700 .74rem/1 var(--body);
  letter-spacing:.22em;text-transform:uppercase;color:var(--verde-txt)}
.part-label::after{content:"";flex:1;height:2px;background:var(--ink);opacity:.14}
.cat{padding-top:22px}
.cat-sign{font:400 clamp(1.55rem,5vw,2.1rem)/1 var(--sign);letter-spacing:.04em;text-transform:uppercase;color:var(--ink);margin-bottom:14px}
.cat-cover{margin:0 0 14px}
.cat-cover img{width:100%;height:auto;aspect-ratio:12/5;object-fit:cover;border-radius:14px;background:var(--arena)}
@media(min-width:900px){.cat-cover img{aspect-ratio:16/5}}
.cat-note{font:400 1.2rem/1.3 var(--disp);color:var(--precio);margin:0 0 14px}

/* tarjetas: platos con foto */
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}
@media(min-width:600px){.cards{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}}
.card{display:flex;flex-direction:column;min-width:0;background:#fff;border-radius:14px;padding:6px 6px 10px;
  box-shadow:0 6px 16px rgba(90,40,10,.12);scroll-margin-top:12px}
.card--wide{grid-column:span 2}
.card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--arena)}
.card--wide img{aspect-ratio:16/9}
.card .it-name{font:400 1rem/1.1 var(--sign);letter-spacing:.03em;text-transform:uppercase;margin:10px 4px 0;overflow-wrap:anywhere}
.card .badge{align-self:flex-start;margin:6px 4px 0}
.card .it-desc{margin:5px 4px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.it-buy{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:auto 4px 0;padding-top:10px}

/* filas: platos sin foto */
.rows{margin-bottom:10px}
@media(min-width:900px){.rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:44px}}
.row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 12px;align-items:center;
  padding:12px 0;border-bottom:1.5px dashed var(--raya);scroll-margin-top:12px}
.row .it-name{font-weight:700;overflow-wrap:anywhere}
.row .badge{margin-left:6px}
.row .it-desc{display:block;margin-top:3px}
.row .it-ask{grid-column:2/-1}

/* piezas comunes */
.it-desc{font-size:.86rem;line-height:1.4;color:var(--ink-2)}
.it-price{font:400 1.2rem/1 var(--disp);color:var(--precio);white-space:nowrap}
.it-ask{font-size:.86rem;font-style:italic;color:var(--ink-2);white-space:nowrap}
.it-add{flex:none;width:40px;height:40px;border-radius:50%;background:var(--rojo-txt);color:#fff;font-size:1.4rem;line-height:1;
  display:grid;place-items:center;transition:transform .2s var(--ease),background .2s}
.it-add:hover{background:var(--rojo-hover);transform:scale(1.08)}
.badge{display:inline-block;background:var(--verde);color:#10210a;font:700 .62rem/1 var(--body);letter-spacing:.06em;
  text-transform:uppercase;border-radius:4px;padding:3px 7px;vertical-align:2px}
.is-target{box-shadow:0 0 0 3px var(--rojo-txt),0 6px 16px rgba(90,40,10,.12)}
.row.is-target{box-shadow:none;background:var(--arena)}
.noscript{padding:40px 0;text-align:center;font-weight:700}

/* botón de pedido y hoja del carrito (piel de papel; la lógica está en cart.js) */
.cart-fab{position:fixed;right:20px;bottom:20px;z-index:95;display:flex;gap:12px;align-items:center;font-weight:700;
  background:var(--rojo-txt);color:#fff;padding:14px 22px;border-radius:999px;box-shadow:0 12px 30px rgba(216,53,42,.4)}
.fab-count{background:#fff;color:var(--rojo-txt);border-radius:50%;width:26px;height:26px;display:grid;place-items:center;font-size:.8rem}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:110}
.cart-sheet{position:fixed;z-index:111;inset:auto 0 0 0;max-height:82vh;display:flex;flex-direction:column;
  background:var(--claro);color:var(--ink);border-radius:18px 18px 0 0;
  transform:translateY(100%);transition:transform .35s var(--ease),visibility 0s .35s;visibility:hidden}
.cart-sheet.open{transform:none;visibility:visible;transition:transform .35s var(--ease),visibility 0s 0s}
@media(min-width:861px){.cart-sheet{inset:0 0 0 auto;width:420px;border-radius:0;transform:translateX(100%);max-height:none}}
.cart-sheet header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:2px solid var(--ink)}
.cart-sheet header b{font:400 1.4rem/1 var(--sign);letter-spacing:.04em;text-transform:uppercase}
.cart-sheet header button{width:40px;height:40px;font-size:1.2rem}
.sheet-body{overflow-y:auto;padding:8px 24px;flex:1}
.sheet-line{display:grid;grid-template-columns:1fr auto;gap:4px 14px;padding:14px 0;border-bottom:1.5px dashed var(--raya)}
.sheet-line .mi-name{font-weight:700}
.sheet-line .mi-price{grid-column:2;justify-self:end;font:400 1.15rem/1 var(--disp);color:var(--precio)}
.qty{display:inline-flex;gap:10px;align-items:center}
.qty button{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--ink);color:var(--ink)}
.sheet-footer{padding:18px 24px 24px;border-top:2px solid var(--ink);display:grid;gap:12px}
.cart-note{color:var(--ink-2);font-size:.9rem}
.total-row{display:flex;justify-content:space-between;font-size:1.15rem;font-weight:700}
.wa-send{justify-content:center}
.wa-send[aria-disabled="true"]{opacity:.45;pointer-events:none}
.cart-empty{text-align:center;color:var(--ink-2);padding:40px 0}
```

- [ ] **Step 5: Rehacer `web/js/menu.js`**

```js
// Carta «Carta de papel» (2026-09). Spec: docs/superpowers/specs/2026-09-24-candela-menu-design.md
// El HTML lo pinta menu-render.js (puro, testeado); aquí solo se conecta el DOM.
import { MENU, CATEGORIES, PARTS } from './menu-data.js';
import { initLangToggle, getLang } from './i18n.js';
import { cart, refresh, initCartUI, syncFromStorage } from './cart.js';
import { initNav } from './nav.js';
import { renderMenu, renderChips } from './menu-render.js';

initLangToggle();
initNav();

const $ = id => document.getElementById(id);
const chips = $('chips'), main = $('menuMain');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ── alto de nav + chips: anclas y foco quedan justo debajo (scroll-padding-top en menu.css) ── */
const setMenuTop = () => document.documentElement.style.setProperty('--menu-top', `${$('nav').offsetHeight + chips.offsetHeight}px`);
new ResizeObserver(setMenuTop).observe(chips);

/* ── chip activo: la categoría que cruza el 30 % de la pantalla ── */
let pausedUntil = 0;
function setActive(id) {
  let on = null;
  chips.querySelectorAll('.chip').forEach(ch => {
    const is = ch.dataset.cat === id;
    ch.classList.toggle('active', is);
    if (is) { ch.setAttribute('aria-current', 'true'); on = ch; } else ch.removeAttribute('aria-current');
  });
  if (on && chips.scrollWidth > chips.clientWidth) {
    chips.scrollTo({ left: on.offsetLeft - (chips.clientWidth - on.offsetWidth) / 2, behavior: reduce.matches ? 'auto' : 'smooth' });
  }
}
function syncActive() {
  const line = innerHeight * 0.3;
  const visible = [...main.querySelectorAll('.cat:not([hidden])')];
  const cur = visible.find(s => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
  setActive((cur || visible[0] || {}).id);
}
let spy = null;
function initSpy() {
  if (spy) spy.disconnect();
  spy = new IntersectionObserver(entries => {
    if (Date.now() < pausedUntil) return;
    const hit = entries.find(en => en.isIntersecting);
    if (hit) setActive(hit.target.id);
  }, { rootMargin: '-30% 0px -69% 0px' });
  main.querySelectorAll('.cat').forEach(s => spy.observe(s));
}
// Al tocar un chip, el spy calla hasta que acaba el scroll suave; si no, el chip parpadea entre categorías.
chips.addEventListener('click', e => {
  const ch = e.target.closest('.chip');
  if (!ch) return;
  setActive(ch.dataset.cat);
  pausedUntil = Date.now() + 1500;
  addEventListener('scrollend', () => { pausedUntil = Date.now() + 150; }, { once: true });
});

/* ── pintar (y repintar al cambiar de idioma) ─────────────── */
function render() {
  const lang = getLang();
  chips.innerHTML = renderChips(CATEGORIES, PARTS, lang);
  main.innerHTML = renderMenu(CATEGORIES, MENU, PARTS, lang);
  initSpy();
  syncActive();
}
render();
document.addEventListener('langchange', render);

/* ── menu.html#categoría o #plato ─────────────────────────────
   La carta se pinta con JS y Chrome corta el scroll al fragmento mientras la página cambia de alto:
   se re-ancla sin animación en cada punto de carga, salvo que el usuario ya se haya movido. */
let userMoved = false, marked = false;
['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { userMoved = true; }, { once: true, passive: true }));
function reanchor() {
  if (userMoved || !location.hash) return;
  let el = null;
  try { el = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; } // hash mal codificado
  if (!el || !main.contains(el)) return;
  el.scrollIntoView({ behavior: 'instant', block: 'start' });
  syncActive();
  if (el.dataset.id && !marked) { // es un plato: se marca un momento
    marked = true;
    el.classList.add('is-target');
    setTimeout(() => el.classList.remove('is-target'), 2500);
  }
}
setMenuTop();
reanchor();
addEventListener('load', () => { reanchor(); setTimeout(reanchor, 300); });
if (document.fonts) document.fonts.ready.then(reanchor);

/* ── «+» → carrito ───────────────────────────────────────── */
main.addEventListener('click', e => {
  const btn = e.target.closest('.it-add');
  if (!btn) return;
  const item = (MENU[btn.closest('.cat').id] || []).find(i => i.id === btn.closest('[data-id]').dataset.id);
  if (!item || item.price <= 0) return;
  syncFromStorage();
  cart.add(item);
  if (!reduce.matches) btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 240);
  refresh();
});

initCartUI();
```

- [ ] **Step 6: GREEN, estructura y sin desbordes (Review Focus 4)**

Recargar con la caché desactivada. A 320, 375, 768, 1024 y 1440 de ancho (`browser_resize`, alto 900), `browser_evaluate`:

```js
() => ({
  over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  cardsOver: [...document.querySelectorAll('.card, .row')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.id),
  parts: document.querySelectorAll('.part-label').length,
  cats: document.querySelectorAll('.cat').length,
  cards: document.querySelectorAll('.card').length,
  wide: [...document.querySelectorAll('.card--wide')].map(c => c.id),
  bg: getComputedStyle(document.body).backgroundColor,
  chipsH: document.getElementById('chips').offsetHeight,
  menuTopOk: getComputedStyle(document.documentElement).getPropertyValue('--menu-top').trim()
    === `${document.getElementById('nav').offsetHeight + document.getElementById('chips').offsetHeight}px`,
})
```

Expected en los cinco anchos:
- `over: 0` y `cardsOver: []`;
- `parts: 3`, `cats: 15` y `cards: 16`;
- `wide`: `['ny-the-ruben-sandwich','bg-candela-burger','dm-fritura-mixta-2ps','sw-chicken-steak-quesadilla']`;
- `bg`: `'rgb(251, 247, 240)'` y `menuTopOk: true`;
- `chipsH`:
  - hasta 768: ≤ 64, una línea que se desplaza;
  - a 1024 y a 1440: ≤ 110, dos líneas como mucho, también con los textos en ES.
  - Si a 1024 salen tres líneas, bajar el relleno de `.chip` en `@media(min-width:1024px)` hasta que quepan en dos.

Captura de pantalla completa a 375 y a 1440 en `$W/t4-375.png` y `$W/t4-1440.png`. Mirarlas: crema, carteles en Anton, precios en rojo, tarjetas en 2 columnas en móvil y filas en 2 columnas a 1440.

- [ ] **Step 7: Chips y scroll-spy sin parpadeo**

A 375×812, en lo alto: `document.querySelector('.chip.active').dataset.cat` → Expected: `'breakfast'`.

Luego:

```js
async () => {
  const seen = new Set();
  const t = setInterval(() => seen.add((document.querySelector('.chip.active') || {}).dataset?.cat), 40);
  document.querySelector('.chip[data-cat="burgers"]').click();
  await new Promise(r => setTimeout(r, 3000));
  clearInterval(t);
  const h = document.getElementById('burgers').getBoundingClientRect().top;
  return { seen: [...seen], top: Math.round(h), menuTop: getComputedStyle(document.documentElement).getPropertyValue('--menu-top') };
}
```

Expected: `seen` es `['burgers']`, sin otras categorías por el camino, y `top` ≈ `menuTop` (±4 px).

Después, `scrollTo({ top: document.getElementById('coffee').offsetTop - innerHeight * 0.25, behavior: 'instant' })`, esperar 400 ms y leer el chip activo. Expected: `'coffee'`, visible dentro de la barra: su `getBoundingClientRect()` cabe entre 0 y `innerWidth`.

- [ ] **Step 8: Anclas y hashes raros (Review Focus 3)**

Para cada URL, navegar, esperar a `load` y 800 ms más, y evaluar:

```js
() => {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = document.getElementById(id);
  return { y: scrollY, top: el ? Math.round(el.getBoundingClientRect().top) : null, target: el ? el.classList.contains('is-target') : null,
           menuTop: getComputedStyle(document.documentElement).getPropertyValue('--menu-top') };
}
```

- `menu.html#breakfast`: Expected: `top` ≈ `menuTop` (±4) y `target: false`.
- `menu.html#ny-chopped-cheese`: Expected: `top` ≈ `menuTop + 12` (±4) y `target: true`. Pasados 3 s, `false`.
- `menu.html#no-existe`: Expected: `y: 0`, `top: null` y 16 tarjetas pintadas.
- `menu.html#%E0%A4%A`: para esta URL, evaluar solo `() => ({ y: scrollY, cards: document.querySelectorAll('.card').length })`, porque `decodeURIComponent` lanzaría. Expected: `{ y: 0, cards: 16 }`, y `browser_console_messages` sin errores de la página.

- [ ] **Step 9: Carrito (Review Focus 1)**

1. En `menu.html`, pulsar el «+» del Chopped Cheese (`#ny-chopped-cheese .it-add`). Expected: el botón de pedido aparece con `1` y `$13.99`.
2. Abrir la hoja, pulsar su «+». Expected: `2` y `$27.98`. El enlace `#waSend` contiene `2x%20Chopped%20Cheese`.
3. Cambiar de idioma con la hoja cerrada. Expected: la carta sale en español (`>Mañana<`) y el carrito sigue con 2.
4. `localStorage.setItem('candela-cart', JSON.stringify([{ id: 'ny-the-ruben-sandwich', name: 'The Ruben Sandwich', price: 15.49, qty: 1 }, { id: 'ya-no-existe', name: 'X', price: 9, qty: 3 }]))` y recargar. Expected: botón con `1` y `$15.49`; la línea huérfana no aparece.
5. Sincronía entre pestañas: abrir una segunda pestaña con `menu.html`, pulsar allí el «+» de la Candela Burger y volver a la primera. Expected: la primera muestra `2` y `$31.48` sin recargar (evento `storage`).

- [ ] **Step 10: Foco con teclado bajo la barra (Review Focus 5)**

A 375×812:
1. Colocar el foco, sin mover la página, en el «+» anterior al del Ruben en el orden del DOM (el último de Batidos de Proteína), y dejar el del Ruben debajo de los chips. Con `browser_evaluate`:

```js
() => {
  const all = [...document.querySelectorAll('.it-add')];
  const ruben = document.querySelector('#ny-the-ruben-sandwich .it-add');
  all[all.indexOf(ruben) - 1].focus({ preventScroll: true });
  scrollBy({ top: ruben.getBoundingClientRect().top - 100, behavior: 'instant' });
  return Math.round(ruben.getBoundingClientRect().top);
}
```

   Expected: `100`, tapado por la barra de chips.
2. `browser_press_key` → `Tab`, y esperar 400 ms.
3. Evaluar `() => ({ isRuben: document.activeElement === document.querySelector('#ny-the-ruben-sandwich .it-add'), top: Math.round(document.activeElement.getBoundingClientRect().top), menuTop: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--menu-top')) })`.

Expected: `isRuben: true` y `top ≥ menuTop`: el navegador lo desplaza fuera de la barra por el `scroll-padding-top`.

- [ ] **Step 11: Suite y commit**

Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS.

```bash
git add web/menu.html web/css/menu.css web/js/menu.js web/js/i18n.js
git commit -m "feat(menú): página «Carta de papel» — crema, carteles, tarjetas con foto, chips que siguen el scroll y anclas a cada plato"
git push -q
```

---

### Task 5: Buscador en la página

**Files:**
- Modify: `web/menu.html` (formulario de búsqueda en la cabecera; aviso de «sin resultados» antes de `<main>`)
- Modify: `web/css/menu.css` (bloque «buscador» al final)
- Modify: `web/js/menu.js` (import, referencias, `applyFilter`, listeners y `render()`)

**Interfaces:**
- Consumes: `filterMenu`, `searchStatus`, `askUrl` y `normalize` (Task 3); `render`, `syncActive` y los ids `#chips` y `#menuMain` (Task 4); claves `menu.search.*` y `data-i18n-placeholder` (Task 3).
- Produces: ids del DOM `#searchForm`, `#menuSearch`, `#searchStatus`, `#menuEmpty` y `#menuAsk`; clase `.is-searching` en `#menuMain`.

- [ ] **Step 1: RED en el navegador**

En `menu.html`: `() => !!document.getElementById('menuSearch')` → Expected: `false`.

- [ ] **Step 2: Marcado**

En `web/menu.html`, dentro de `.menu-head .wrap`, debajo del `<p class="ssub" …>`:

```html
    <form class="menu-search" id="searchForm" role="search" action="#">
      <label class="sr-only" for="menuSearch" data-i18n="menu.search.label">Search the menu</label>
      <input id="menuSearch" type="search" autocomplete="off" enterkeyhint="search" spellcheck="false"
        placeholder="Cortadito, burger, empanadas…" data-i18n-placeholder="menu.search.ph">
    </form>
    <p class="sr-only" id="searchStatus" role="status"></p>
```

Inmediatamente antes de `<main class="wrap menu-main" id="menuMain">`:

```html
<div class="wrap menu-empty" id="menuEmpty" hidden>
  <p data-i18n="menu.search.none">We couldn't find that.</p>
  <a class="btn btn-g" id="menuAsk" href="#" target="_blank" rel="noopener" data-i18n="menu.search.ask">Ask us on WhatsApp</a>
</div>
```

- [ ] **Step 3: Estilos**

Al final de `web/css/menu.css`:

```css
/* buscador */
.menu-search{margin-top:20px;max-width:520px}
.menu-search input{width:100%;font:500 1rem/1.2 var(--body);color:var(--ink);border:2px solid var(--ink);border-radius:999px;
  padding:13px 18px 13px 44px;
  background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none' stroke='%231c1c1c' stroke-width='2.2' stroke-linecap='round'%3E%3Ccircle cx='8' cy='8' r='6'/%3E%3Cpath d='m12.5 12.5 4 4'/%3E%3C/svg%3E") no-repeat 16px 50%}
.menu-search input::placeholder{color:#6b625a;opacity:1}
.menu-empty{text-align:center;padding:36px 20px 120px}
.menu-empty p{font:400 1.6rem/1.2 var(--disp);margin-bottom:16px}
.is-searching .cat-cover,.is-searching .cat-note{display:none}
```

- [ ] **Step 4: Conectar el buscador en `web/js/menu.js`**

1. Cambiar el import de `menu-render.js` por:
   `import { renderMenu, renderChips, filterMenu, searchStatus, askUrl, normalize } from './menu-render.js';`
2. Debajo de `const chips = $('chips'), main = $('menuMain');`, añadir:
   `const search = $('menuSearch'), live = $('searchStatus'), empty = $('menuEmpty');`
3. Inmediatamente antes del comentario `/* ── pintar (y repintar al cambiar de idioma) ── */`, añadir:

```js
/* ── buscador: oculta lo que no coincide (qué se ve lo decide filterMenu) ── */
let query = '', speakT = null;
function applyFilter({ speak = true } = {}) {
  const f = filterMenu(CATEGORIES, MENU, query);
  const active = normalize(query).length >= 2;
  main.classList.toggle('is-searching', active);
  main.querySelectorAll('[data-id]').forEach(el => { el.hidden = !f.items.has(el.dataset.id); });
  main.querySelectorAll('.card').forEach(el => el.classList.toggle('card--wide', f.wide.has(el.dataset.id)));
  main.querySelectorAll('.cards, .rows').forEach(ul => { ul.hidden = !ul.querySelector(':scope > li:not([hidden])'); });
  main.querySelectorAll('.cat').forEach(el => { el.hidden = !f.cats.has(el.id); });
  main.querySelectorAll('.part').forEach(el => { el.hidden = !f.parts.has(el.dataset.part); });
  chips.querySelectorAll('.chip').forEach(el => { el.hidden = !f.cats.has(el.dataset.cat); });
  empty.hidden = !(active && f.count === 0);
  if (!empty.hidden) $('menuAsk').href = askUrl(query, getLang());
  clearTimeout(speakT);
  if (speak) speakT = setTimeout(() => { live.textContent = active ? searchStatus(f.count, getLang()) : ''; }, 500);
  syncActive();
}
search.addEventListener('input', () => { query = search.value; applyFilter(); });
search.addEventListener('keydown', e => {
  if (e.key === 'Escape' && search.value) { e.preventDefault(); search.value = ''; query = ''; applyFilter(); }
});
$('searchForm').addEventListener('submit', e => { e.preventDefault(); search.blur(); });
```

4. En `render()`, sustituir la línea `  syncActive();` por `  applyFilter({ speak: false });`. Así, al cambiar de idioma, la búsqueda se vuelve a aplicar.

- [ ] **Step 5: GREEN: buscar, sin resultados y limpiar**

A 375×812 con la caché desactivada. En cada caso, escribir en `#menuSearch` con `browser_type` y esperar 700 ms:

- **«cafe»:** Expected:
  - `#coffee` visible con 10 filas;
  - `document.querySelectorAll('.cat:not([hidden])').length` = 2 (`coffee` y `shakes`);
  - `#searchStatus` = `'11 dishes'` (o `'11 platos'` en ES);
  - chips visibles: `coffee` y `shakes`;
  - `.cat-cover` no se ve (`getComputedStyle(…).display === 'none'`).
- **«burger»:** Expected:
  - `#burgers` visible con 3 platos;
  - `#bg-candela-burger` con `card--wide`.
- **«chopped»:** Expected:
  - `#ny-chopped-cheese` con `card--wide`;
  - `#ny-the-ruben-sandwich` oculto.
- **«xyzzy»:** Expected:
  - `#menuEmpty` visible;
  - `document.querySelectorAll('.part:not([hidden])').length` = 0;
  - `#menuAsk` con `href` que empieza por `https://wa.me/17862547577?text=` y contiene `xyzzy`;
  - sin scroll horizontal.
- **Esc en el campo:** Expected:
  - campo vacío;
  - 79 `[data-id]:not([hidden])`;
  - 4 `.card--wide`, las de la carta;
  - `#menuEmpty` oculto.

- [ ] **Step 6: Enter no recarga**

Escribir «ruben» y pulsar Enter. Expected: misma URL sin `?`, el campo pierde el foco y `#ny-the-ruben-sandwich` sigue visible.

- [ ] **Step 7: Búsqueda puesta y cambio de idioma (Review Focus 2)**

Con «burger» escrito, pulsar el botón de idioma: en móvil, abriendo antes la hamburguesa, o con `.click()` por JS sobre `.lang-toggle`.

Expected:
- el campo sigue diciendo «burger» y el placeholder cambia de idioma;
- solo se ve `#burgers`;
- los chips ocultos siguen ocultos;
- el cartel cambia de idioma (`Burgers` ↔ `Hamburguesas`).

- [ ] **Step 8: Suite y commit**

Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS.

```bash
git add web/menu.html web/css/menu.css web/js/menu.js
git commit -m "feat(menú): buscador — sin tildes, en EN y ES, con aviso accesible y «pregúntanos por WhatsApp» si no hay nada"
git push -q
```

---

### Task 6: De un favorito de la portada al plato

**Files:**
- Modify: `web/js/sections.js:28-30` (`renderFavorites`: el enlace va al plato)
- Modify: `tests/sections.test.mjs:19-27`
- Modify: `web/js/landing.js:51-55` (`reanchor` a prueba de hash mal codificado)

**Interfaces:**
- Consumes: los ids de plato como anclas y `.is-target` (Task 4).
- Produces: `renderFavorites` con `href="menu.html#<id del plato>"`.

- [ ] **Step 1: Test que falla**

En `tests/sections.test.mjs`:
- el título del test de `renderFavorites` pasa a `'renderFavorites: 4 tarjetas con nombre, precio real y enlace a su plato en la carta'`;
- la línea `assert.match(html, /href="menu\.html#ny-signature"/);` pasa a `assert.match(html, /href="menu\.html#ny-the-ruben-sandwich"/);`.

- [ ] **Step 2: Verlo fallar**

Run: `node --test tests/sections.test.mjs`
Expected: FAIL en `renderFavorites`, porque el HTML trae `menu.html#ny-signature`.

- [ ] **Step 3: Implementar**

En `web/js/sections.js`, dentro de `renderFavorites`:
- `const { cat, item } = hit;` pasa a `const { item } = hit;`;
- `` `<a class="fav" href="menu.html#${esc(cat)}">` `` pasa a `` `<a class="fav" href="menu.html#${esc(item.id)}">` ``.

Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS.

- [ ] **Step 4: Del favorito al plato en el navegador**

A 375×812:
1. Abrir `index.html#favs` y pulsar el favorito del Chopped Cheese (`a.fav[href="menu.html#ny-chopped-cheese"]`).
2. Esperar a `load` y 800 ms.
3. Evaluar la misma función del paso 8 de la Task 4.

Expected:
- `top` ≈ `menuTop + 12` (±4);
- `target: true`;
- el chip activo es `ny-signature`.

- [ ] **Step 5: RED y GREEN de la portada con hash mal codificado (Review Focus 3)**

**RED**, antes de tocar `landing.js`:
1. Abrir `http://localhost:8124/index.html#%E0%A4%A`.
2. Evaluar `() => document.querySelectorAll('[data-burst] svg').length`.

Expected: `0`, y en la consola un `URIError`: el módulo se para en `reanchor()` y no pinta los sellos.

**Arreglo:** en `web/js/landing.js`, dentro de `reanchor()`, sustituir
`const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));`
por:

```js
  let target = null;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; } // hash mal codificado
```

**GREEN:** recargar la misma URL. Expected: más de `0` sellos y ningún error en la consola.

- [ ] **Step 6: Commit**

```bash
git add web/js/sections.js tests/sections.test.mjs web/js/landing.js
git commit -m "feat(portada): los favoritos llevan a su plato en la carta; la portada aguanta un hash mal codificado"
git push -q
```

---

### Task 7: Encuadres, Lighthouse y preview

**Files:**
- Modify: `web/js/menu-data.js` (solo valores `focus` de platos y cabeceras)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: URL de la preview de Netlify para Robert.

- [ ] **Step 1: Capturas de cada foto**

A 375×812 y a 1440×900, `browser_take_screenshot` de cada `.cat` que tenga fotos. Son 10 categorías: `breakfast`, `bakery`, `coffee`, `ny-signature`, `signature`, `panini`, `burgers`, `dominican-spot`, `salads-wraps` y `soups`. Guardarlas en `$W/foco-<cat>-<ancho>.png`.

Mirar cada foto: el plato tiene que verse entero o casi, sin cortar el sándwich ni quedar en un borde. En las cabeceras, lo que importa es:
- las tazas en Barra de Café;
- las bandejas en Rincón Dominicano;
- el cuenco en Sopas;
- empanadas y tequeños en Panadería.

- [ ] **Step 2: Ajustar encuadres**

Por cada foto mal encuadrada, cambiar su `focus` en `web/js/menu-data.js`. En un plato, la línea `focus:` que añadió la Task 1 (o se añade debajo de `img:`); en una cabecera, `cover.focus`. Repetir la captura de esa categoría hasta que se vea bien.

Run: `node --test tests/*.test.mjs` → Expected: 68/68 PASS. El test de formato «X% Y%» protege los valores.

- [ ] **Step 3: Preview de Netlify**

Run: `netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5 --message "menú: carta de papel"`
Expected: `Deployed draft to https://<hash>--<site>.netlify.app`. Guardar la URL como `$PREVIEW`.

- [ ] **Step 4: Lighthouse en móvil**

Run: `npx --yes lighthouse "$PREVIEW/menu.html" --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility --quiet --chrome-flags="--headless=new" --output=json --output-path="$W/lh-menu.json"`, y luego:
`node -e "const r=require(process.argv[1]);console.log(Object.values(r.categories).map(c=>c.id+' '+Math.round(c.score*100)).join(' | '))" "$W/lh-menu.json"`

Expected: `performance ≥ 90 | accessibility ≥ 95`. Si alguna no llega, leer las auditorías que fallan en el JSON y arreglar la causa. Solo se admite como ruling si la causa es de la red de la preview.

- [ ] **Step 5: Commit**

```bash
git add web/js/menu-data.js
git commit -m "fix(menú): encuadres revisados con capturas a 375 y 1440"
git push -q
```

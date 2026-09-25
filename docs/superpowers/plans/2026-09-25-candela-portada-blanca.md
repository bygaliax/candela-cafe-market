# Portada en blanco, al estilo del menú — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer la portada (`web/index.html`) toda en blanco y con el estilo del menú «Carta de papel», sin recorrido del día, sin secciones oscuras y sin animaciones. La barra y el pie nuevos se comparten con `menu.html`.

**Architecture:** La lógica pura (`status.js`, `sections.js`) se prueba con `node:test`. La barra, el menú de la hamburguesa y el pie son el mismo HTML en las dos páginas, con estilos en `base.css` y conducta en `nav.js`. La portada tiene su propia hoja, `home.css`, que sustituye a `landing.css` y `sections.css`. `landing.js` solo pinta y conecta el DOM. Lo visual se prueba en el navegador con Playwright MCP.

**Tech Stack:** HTML, CSS y JS vanilla con módulos ES, sin build. Tests con `node --test`. Pruebas de navegador con Playwright MCP. Netlify CLI para la preview. Lighthouse con `npx`.

**Spec:** `docs/superpowers/specs/2026-09-25-candela-portada-blanca-design.md`

## Global Constraints

- Rama `feature/portada-blanca`. Push de la rama tras cada commit (aprobado). **Nada a `master`.**
- Las anclas no cambian: `#hero`, `#market`, `#noche` y `#visit`.
- **Fondo de papel `#FBF7F0` en toda la página, sin ninguna sección oscura.** Prohibidos en la portada:
  - degradados de fondo y neones;
  - sellos de estrella y tramas de puntos sobre las fotos;
  - fotos giradas y sombras de color.
- **Sin animaciones:** ni GSAP ni ScrollTrigger. Al pasar el ratón solo cambian colores (y la sombra neutra de las tarjetas).
- **Contraste sobre papel:**
  - precios y notas a mano en `#C42A1F` (5,3:1);
  - antetítulos y «Abierto ahora» en `#3F7021` (5,5:1);
  - rellenos rojos `#D8352A` (`--rojo-txt`) con texto blanco (4,7:1).
- **Tipografías:**
  - Architects Daughter solo para el `h1`, la frase de marca, las notas a mano y los precios;
  - Anton para los títulos de sección, los carteles, los nombres de las tarjetas y el «507»;
  - DM Sans para el texto, los botones y la barra.
- **Nada inventado:**
  - platos, precios y fotos salen de `menu-data.js`, `site-data.js` y `market-data.js`;
  - con `DAILY_MENU` vacío se muestra el aviso `DAILY_SPECIAL`.
- **Idiomas:** todo texto visible o accesible pasa por i18n, en EN y en ES. Quedan fuera la frase de marca «Born in NY, raised Dominican, served in Miami.», «Candela & Café», «WhatsApp» y los nombres de marca.
- Botones y enlaces táctiles de 44 px como mínimo.
- Sin scroll horizontal a 320 px.
- La portada mide como mucho 5.000 px de alto a 1440 × 900.
- Lighthouse en móvil: ≥ 90 en rendimiento, ≥ 95 en accesibilidad y CLS < 0,05.
- Tests: `node --test tests/*.test.mjs` desde la raíz del repo. `npm test` no existe: no hay `package.json` en la raíz.
- **Navegador:**
  - Playwright MCP contra `http://localhost:8124` (python `http.server` sobre `web/`).
  - Si no responde (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8124/`), arrancarlo en segundo plano con `python -m http.server 8124 --directory web`.
  - **Nunca contra `:8123`**: es el browser-sync de Robert.
  - Antes de navegar, desactivar la caché con `browser_run_code_unsafe`:
    `const s = await page.context().newCDPSession(page); await s.send('Network.enable'); await s.send('Network.clearBrowserCache'); await s.send('Network.setCacheDisabled', { cacheDisabled: true });`
  - Para mover la página: `scrollTo({ top, behavior: 'instant' })`, porque el `html` tiene scroll suave.
  - Las capturas se guardan en `.playwright-mcp/` (es la única carpeta de escritura que admite el MCP).
- Despliegue: solo preview con `netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5`, sin `--prod`.
- Workspace del plan (ignorado por git): `.superpowers/sdd/2026-09-25-candela-portada-blanca/`, en adelante `$W`.

## Review Focus

1. **Visitante que ya eligió español** (`localStorage['candela-lang'] = 'es'` antes de cargar): toda la primera carga sale en español, también lo que pinta el JS, el estado, el menú de la hamburguesa, los `alt` y los `aria-label`. Prueba: Task 3, paso 9.
2. **Local cerrado o a punto de cerrar** (reloj simulado):
   - la portada dice «Cierra pronto · a las 10 pm» o «Cerrado · abrimos mañana a las 8 am», con el punto del color que toca;
   - el menú de la hamburguesa dice lo mismo;
   - la tabla marca el día correcto.
   Prueba: Task 3, paso 10.
3. **320 px en español:** los carteles, los botones y la fila «Hoy · Viernes · música en vivo | 8 am – 11:30 pm» no desbordan. Prueba: Task 3, paso 8.
4. **Llegar desde la carta con ancla** (`index.html#market`, `#noche`, `#visit`): el título de la sección queda a la vista bajo la barra fija, sin taparse. Prueba: Task 3, paso 11.
5. **Solo con teclado:**
   - el menú de la hamburguesa atrapa el foco y lo devuelve al cerrar;
   - la barra del móvil oculta no recibe el foco;
   - el modal atrapa el foco y lo devuelve al botón que lo abrió.
   Pruebas: Task 2, paso 8, y Task 4, pasos 6 y 7.

## Mapa de archivos

| Archivo | Qué hace | Tareas |
|---|---|---|
| `web/js/status.js` | Estado del local por la hora de Miami (puro). Pierde las franjas del día. | 1 |
| `web/js/sections.js` | HTML de las secciones (puro): favoritos, lista del market, mesa caliente, horario y estado. | 1, 3 |
| `web/js/site-data.js` | Datos del local. Pierde `DAYPARTS` y `DAY_NIGHT`. | 1, 3 |
| `web/js/market-data.js` | Categorías del market. Pierden `img` y `h`. | 3 |
| `web/js/nav.js` | Barra y menú de la hamburguesa (DOM), compartidos. | 2 |
| `web/js/i18n.js` | Textos EN/ES y selector «EN / ES». | 1–5 |
| `web/js/landing.js` | Pinta la portada y conecta el DOM. | 1, 3, 4 |
| `web/js/hero.js` | Se borra. | 3 |
| `web/css/base.css` | Tokens, reset, botones, estado, barra, menú de la hamburguesa y pie (compartidos). | 2 |
| `web/css/home.css` | Nueva: estilos de la portada. | 3, 4 |
| `web/css/landing.css`, `web/css/sections.css` | Se borran. | 3 |
| `web/css/menu.css` | Pierde la barra negra. | 2 |
| `web/index.html` | Portada. | 2, 3, 4 |
| `web/menu.html` | Carta: barra y pie nuevos. | 2 |
| `web/assets/img/*` | Se borran las imágenes huérfanas. | 5 |
| `tests/status.test.mjs`, `tests/sections.test.mjs`, `tests/site-consistency.test.mjs` | Pruebas. | 1–5 |

---

### Task 1: Lógica pura — estado sin franjas, favoritos como en la carta, lista del market y mesa caliente

**Files:**
- Modify: `web/js/status.js` (función `statusAt`)
- Modify: `web/js/site-data.js` (comentario de cabecera y bloque `DAYPARTS`)
- Modify: `web/js/landing.js` (línea del `import` de `site-data.js` y la llamada a `statusAt`)
- Modify: `web/js/sections.js` (`renderFavorites` y `renderBoard`; nuevas `renderMarketList` y `statusHTML`)
- Modify: `web/js/i18n.js` (clave nueva `home.dom.today`)
- Test: `tests/status.test.mjs`, `tests/sections.test.mjs`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `statusAt(date: Date, hours: Array<{open,close}|null>, tz?: string) → { open: boolean, soon: boolean, closesAt: string|null, opensAt: string|null, opensDay: number|null, day: number }` (sin `part`).
  - `renderFavorites(favs, lang) → string`: una `<a class="fav">` por plato, con `<img alt="">`, `<h3 class="fav-n">`, `<p class="fav-d">` y `<p class="fav-p">`.
  - `renderMarketList(cats, lang) → string`: `<li><b>nombre</b><span>ejemplos</span></li>` × n.
  - `renderBoard(daily, weekday, lang) → string`: `<p class="note">DAILY_SPECIAL</p>` o `<p class="board-h">…</p><ul class="board-list"><li>…</li></ul>`.
  - `statusHTML(st, lang, suffix?) → { cls: 'is-open'|'is-soon'|'is-closed', html: string }`: la primera parte en `<b>` y el resto separado por « · ».

- [ ] **Step 1: Adaptar las pruebas del estado (fallan)**

En `tests/status.test.mjs`, sustituir las líneas 4 y 6 por:

```js
import { HOURS } from '../web/js/site-data.js';

const at = iso => statusAt(new Date(iso), HOURS);
```

Sustituir la prueba «martes 9:30 pm» por:

```js
test('martes 9:30 pm: abierto y cierra pronto a las 10 pm; ya no hay franjas', () => {
  const s = at('2026-09-23T01:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, true);
  assert.equal(s.closesAt, '22:00');
  assert.equal('part' in s, false);
});
```

Sustituir la prueba «miércoles 12:30 pm» por:

```js
test('miércoles 12:30 pm: abierto y no cierra pronto', () => {
  const s = at('2026-09-23T16:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, false);
  assert.equal(s.day, 3);
});
```

Sustituir la prueba «el reloj del visitante no importa» por:

```js
test('el reloj del visitante no importa: siempre hora de Miami', () => {
  const prev = process.env.TZ;
  process.env.TZ = 'Europe/Madrid';
  try {
    const s = at('2026-09-23T16:30:00Z');
    assert.equal(s.open, true);
    assert.equal(s.day, 3);
  } finally { process.env.TZ = prev; }
});
```

- [ ] **Step 2: Comprobar que fallan**

Run: `node --test tests/status.test.mjs`
Expected: FAIL, con `TypeError: Cannot read properties of undefined (reading 'filter')`, porque `statusAt` todavía espera las franjas.

- [ ] **Step 3: Quitar las franjas de `statusAt`**

En `web/js/status.js`, sustituir el comentario y la función `statusAt` completos por:

```js
/** { open, soon (< 60 min para cerrar), closesAt, opensAt, opensDay, day } */
export function statusAt(date, hours, tz = TZ) {
  const { day, min } = zonedNow(date, tz);
  const today = hours[day];
  if (today && min >= toMin(today.open) && min < toMin(today.close)) {
    return { open: true, soon: toMin(today.close) - min < 60, closesAt: today.close, opensAt: null, opensDay: null, day };
  }
  let opensDay = null;
  if (today && min < toMin(today.open)) opensDay = day;
  else for (let i = 1; i <= 7; i++) { const d = (day + i) % 7; if (hours[d]) { opensDay = d; break; } }
  return { open: false, soon: false, closesAt: null, opensAt: opensDay === null ? null : hours[opensDay].open, opensDay, day };
}
```

En `web/js/site-data.js`:
- Sustituir las dos primeras líneas de comentario por:

  ```js
  // Datos del local — ÚNICA fuente de horario, Google, favoritos y mesa caliente.
  // Los usan el estado de la portada, la tabla de Visítanos y el test de coherencia del JSON-LD.
  ```
- Borrar el bloque `// Franjas del día…` y `export const DAYPARTS = [ … ];` entero.

En `web/js/landing.js`:
- Sustituir `import { HOURS, DAYPARTS, FAVORITES, DAILY_MENU, DAY_NIGHT, GOOGLE } from './site-data.js';` por `import { HOURS, FAVORITES, DAILY_MENU, DAY_NIGHT, GOOGLE } from './site-data.js';`.
- Sustituir `const st = statusAt(new Date(), HOURS, DAYPARTS);` por `const st = statusAt(new Date(), HOURS);`.

- [ ] **Step 4: Comprobar que pasan**

Run: `node --test tests/status.test.mjs`
Expected: PASS (9 pruebas).

- [ ] **Step 5: Pruebas nuevas de las secciones (fallan)**

En `tests/sections.test.mjs`, sustituir la línea 3 por:

```js
import { esc, findItem, renderFavorites, renderMarketList, renderMarket, renderArches, renderBoard, renderHours, renderStatus, statusHTML, burstSvg } from '../web/js/sections.js';
```

Sustituir la prueba `renderFavorites: 4 tarjetas…` por estas dos:

```js
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
```

Sustituir las dos pruebas de `renderBoard` por:

```js
test('renderBoard: sin platos, el aviso del especial escrito a mano y ninguna lista', () => {
  assert.equal(renderBoard({}, 3, 'es'), `<p class="note">${esc(DAILY_SPECIAL.es)}</p>`);
  assert.equal(renderBoard({ 3: [] }, 3, 'en'), `<p class="note">${esc(DAILY_SPECIAL.en)}</p>`);
});

test('renderBoard: con platos de hoy, título y lista escapada', () => {
  assert.equal(renderBoard({ 3: [{ en: 'Stew', es: 'Guiso <casero>' }] }, 3, 'es'),
    '<p class="board-h">Hoy en la mesa caliente:</p><ul class="board-list"><li>Guiso &lt;casero&gt;</li></ul>');
});
```

Añadir al final del archivo:

```js
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
```

- [ ] **Step 6: Comprobar que fallan**

Run: `node --test tests/sections.test.mjs`
Expected: FAIL: `SyntaxError: The requested module '../web/js/sections.js' does not provide an export named 'renderMarketList'`.

- [ ] **Step 7: Implementar**

En `web/js/sections.js`, sustituir `renderFavorites` y `renderBoard` completas por lo siguiente, y añadir `renderMarketList` y `statusHTML`:

```js
export function renderFavorites(favs, lang) {
  return favs.map(f => {
    const hit = findItem(f.id);
    if (!hit) return '';
    const { item } = hit;
    const src = `assets/img/${esc(f.img)}`;
    return `<a class="fav" href="menu.html#${esc(item.id)}">`
      + `<img src="${src}-480.webp" srcset="${src}-480.webp 480w, ${src}-960.webp 960w" sizes="(max-width:900px) 45vw, 270px" alt="" loading="lazy" width="480" height="${Number(f.h)}">`
      + `<h3 class="fav-n">${esc(item.name)}</h3>`
      + `<p class="fav-d">${esc(item.desc ? item.desc[lang] : '')}</p>`
      + `<p class="fav-p">$${item.price.toFixed(2)}</p></a>`;
  }).join('');
}

/** Filas del cartel del market: nombre en Anton y ejemplos a la derecha. */
export function renderMarketList(cats, lang) {
  return cats.map(c => `<li><b>${esc(c.name[lang])}</b><span>${esc(c.examples[lang])}</span></li>`).join('');
}

export function renderBoard(daily, weekday, lang) {
  const dishes = daily[weekday];
  if (!dishes || !dishes.length) return `<p class="note">${esc(DAILY_SPECIAL[lang])}</p>`;
  return `<p class="board-h">${esc(tx('home.dom.today', lang))}</p>`
    + `<ul class="board-list">${dishes.map(d => `<li>${esc(d[lang])}</li>`).join('')}</ul>`;
}
```

Después de `renderStatus`, añadir:

```js
/** Estado con la primera parte en negrita: «<b>Abierto ahora</b> · hasta las 11:30 pm · 507 N Miami Ave». */
export function statusHTML(st, lang, suffix = '') {
  const { cls, text } = renderStatus(st, lang);
  const [head, ...rest] = text.split(' · ');
  if (suffix) rest.push(suffix);
  return { cls, html: `<b>${esc(head)}</b>${rest.map(p => ` · ${esc(p)}`).join('')}` };
}
```

En `web/js/i18n.js`, añadir antes del `};` que cierra `DICT`:

```js
  /* ============ portada en blanco (2026-09-25) ============ */
  'home.dom.today':    { en: 'Today at the hot table:', es: 'Hoy en la mesa caliente:' },
```

- [ ] **Step 8: Comprobar que pasa todo**

Run: `node --test tests/*.test.mjs`
Expected: PASS en todos los archivos. `site-consistency` también pasa, porque `home.dom.today` existe en EN y en ES.

- [ ] **Step 9: La portada vieja sigue cargando**

- Levantar el servidor si hace falta (Global Constraints).
- Con Playwright, navegar a `http://localhost:8124/` con la caché desactivada.
- `browser_console_messages` con `level: "error"`.

Expected: 0 errores. Los favoritos se ven sin estilo: es esperado, la portada nueva llega en la Task 3.

- [ ] **Step 10: Commit y push**

```bash
git add web/js/status.js web/js/site-data.js web/js/landing.js web/js/sections.js web/js/i18n.js tests/status.test.mjs tests/sections.test.mjs
git commit -m "feat(portada): lógica pura — estado sin franjas, favoritos como en la carta, lista del market y estado en negrita

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 2: Barra y pie nuevos, compartidos por la portada y la carta

**Files:**
- Modify: `web/css/base.css` (reset, utilidades, botones, estado, barra, menú de la hamburguesa, pie y movimiento)
- Modify: `web/css/menu.css` (líneas 5-13: barra negra y focos)
- Modify: `web/js/nav.js` (se reescribe)
- Modify: `web/js/i18n.js` (función `apply` y claves de la barra y el pie)
- Modify: `web/menu.html` (barra, líneas 36-51; pie, líneas 94-106)
- Modify: `web/index.html` (barra, líneas 50-61; pie, líneas 236-248)
- Test: `tests/site-consistency.test.mjs`

**Interfaces:**
- Consumes: `statusHTML(st, lang)` y `statusAt(date, hours)` (Task 1); `HOURS` (`site-data.js`); `PHONE` (`menu-data.js`); `waUrl(phone, text)` (`cart-core.js`); `trapFocus(el) → release()` (`focus-trap.js`).
- Produces:
  - `initNav()`, que siguen llamando `landing.js` y `menu.js`.
  - Los ids `nav`, `burger`, `navMenu`, `navClose`, `navStatus`, `navWa` y `footWa`.
  - Las clases `.status`, `.dot`, `.is-open`, `.is-soon`, `.is-closed`, `.btn`, `.btn-p`, `.btn-ghost` y `.btn-g`, que usa la Task 3.
  - La clase `menu-open` en `<html>` bloquea el scroll de fondo y la reutiliza la Task 4.

- [ ] **Step 1: Pruebas de la barra y el pie (fallan)**

Al final de `tests/site-consistency.test.mjs`, añadir:

```js
test('Barra y pie nuevos en la portada y en la carta', () => {
  for (const [name, html] of [['index', INDEX], ['menu', MENUP]]) {
    assert.match(html, /<div class="nav-menu" id="navMenu"[^>]*hidden>/, `${name}: menú de la hamburguesa`);
    assert.match(html, /aria-controls="navMenu"/, `${name}: la hamburguesa lo controla`);
    assert.equal(html.split('class="lang-toggle"').length - 1, 2, `${name}: selector en la barra y en el menú`);
    assert.match(html, /class="btn btn-p nav-go" href="https:\/\/www\.google\.com\/maps\/dir\//, `${name}: «Cómo llegar» en la barra`);
    assert.doesNotMatch(html, /data-i18n="nav\.order"/, `${name}: la barra ya no lleva «Order Now»`);
    assert.match(html, /<p class="footer-tag">Born in NY, raised Dominican,<br>served in Miami\.<\/p>/, `${name}: frase en el pie`);
    assert.match(html, /id="footWa"/, `${name}: WhatsApp en el pie`);
  }
});

test('En español, el enlace de la carta dice «Carta»', () => {
  assert.equal(DICT['nav.menu'].es, 'Carta');
});
```

- [ ] **Step 2: Comprobar que fallan**

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL en las dos pruebas nuevas (`index: menú de la hamburguesa` y `'Menú' !== 'Carta'`).

- [ ] **Step 3: Barra y pie en `menu.html`**

Sustituir el bloque `<nav class="nav" …>…</div></nav>` (líneas 36-51) por:

```html
<nav class="nav" id="nav" aria-label="Main navigation" data-i18n-aria="nav.main"><div class="nav-inner">
  <a class="nav-logo" href="./"><img src="assets/img/logo-96.webp" alt="" width="46" height="46"><b>Candela &amp; Café</b></a>
  <div class="nav-links">
    <a href="menu.html" aria-current="page" data-i18n="nav.menu">Menu</a>
    <a href="index.html#market" data-i18n="nav.market">Market</a>
    <a href="index.html#noche" data-i18n="nav.nights">Nights</a>
    <a href="index.html#visit" data-i18n="nav.visit">Visit Us</a>
  </div>
  <button class="lang-toggle" type="button"><span data-l="en">EN</span> / <span data-l="es">ES</span></button>
  <a class="btn btn-p nav-go" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a>
  <button class="nav-burger" id="burger" type="button" aria-label="Open menu" data-i18n-aria="nav.burger" aria-expanded="false" aria-controls="navMenu"><span></span><span></span><span></span></button>
</div></nav>
<div class="nav-menu" id="navMenu" role="dialog" aria-modal="true" aria-label="Site menu" data-i18n-aria="nav.dialog" hidden>
  <div class="nav-menu-top">
    <a class="nav-logo" href="./"><img src="assets/img/logo-96.webp" alt="" width="46" height="46"><b>Candela &amp; Café</b></a>
    <button class="nav-x" id="navClose" type="button" aria-label="Close menu" data-i18n-aria="nav.close">✕</button>
  </div>
  <nav class="nav-menu-links" aria-label="Sections" data-i18n-aria="nav.sections">
    <a href="menu.html"><span data-i18n="nav.menu">Menu</span><i aria-hidden="true">→</i></a>
    <a href="index.html#market"><span data-i18n="nav.market">Market</span><i aria-hidden="true">→</i></a>
    <a href="index.html#noche"><span data-i18n="nav.nights">Nights</span><i aria-hidden="true">→</i></a>
    <a href="index.html#visit"><span data-i18n="nav.visit">Visit Us</span><i aria-hidden="true">→</i></a>
  </nav>
  <div class="nav-menu-bot">
    <p class="status is-open" id="navStatus"><i class="dot" aria-hidden="true"></i><span>Open daily from 8 am</span></p>
    <a class="btn btn-p" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a>
    <div class="nav-menu-two"><a class="btn btn-ghost" href="tel:+17862547577" data-i18n="mbar.call">Call</a><a class="btn btn-ghost" id="navWa" href="https://wa.me/17862547577" target="_blank" rel="noopener">WhatsApp</a></div>
    <button class="lang-toggle" type="button"><span data-l="en">EN</span> / <span data-l="es">ES</span></button>
  </div>
</div>
```

Sustituir el bloque `<footer class="footer">…</footer>` (líneas 94-106) por:

```html
<footer class="footer"><div class="wrap">
  <div class="footer-grid">
    <div>
      <a class="brand" href="./"><img src="assets/img/logo-96.webp" alt="" width="46" height="46"><b>Candela &amp; Café</b></a>
      <p class="footer-tag">Born in NY, raised Dominican,<br>served in Miami.</p>
    </div>
    <nav aria-label="Footer navigation" data-i18n-aria="footer.nav">
      <h2 class="footer-h" data-i18n="footer.explore">Explore</h2>
      <a href="menu.html" data-i18n="nav.menu">Menu</a><a href="index.html#market" data-i18n="nav.market">Market</a><a href="index.html#noche" data-i18n="nav.nights">Nights</a><a href="index.html#visit" data-i18n="nav.visit">Visit Us</a>
    </nav>
    <div>
      <h2 class="footer-h" data-i18n="footer.orders">Orders &amp; social</h2>
      <a id="footWa" href="https://wa.me/17862547577" target="_blank" rel="noopener">WhatsApp</a>
      <a href="https://www.ubereats.com/store/candela-y-cafe-market/oa35cIfwWWuJm-ND4o9G1g" target="_blank" rel="noopener">Uber Eats</a>
      <a href="https://www.doordash.com/store/candela-y-caf%C3%A9-market-miami-26069377/" target="_blank" rel="noopener">DoorDash</a>
      <a href="https://www.instagram.com/candelaycafe/" target="_blank" rel="noopener">@candelaycafe</a>
      <a href="tel:+17862547577">+1 (786) 254-7577</a>
    </div>
  </div>
  <div class="foot-bottom"><span>&copy; 2026 Candela &amp; Café Market</span><span>507 N Miami Ave, Miami, FL 33136</span></div>
</div></footer>
```

- [ ] **Step 4: Barra y pie en `index.html`**

Usar el mismo HTML del paso 3, con estos cambios porque es la propia portada:
- los dos `class="nav-logo" href="./"` pasan a `href="#hero"`;
- en la barra, el menú, el pie y el `brand`, `index.html#market`, `index.html#noche` e `index.html#visit` pasan a `#market`, `#noche` y `#visit`, y el `brand` del pie pasa a `href="#hero"`;
- el enlace `menu.html` de `.nav-links` va **sin** `aria-current`.

Sustituir con él la barra (líneas 50-61) y el pie (líneas 236-248). La portada vieja se verá rara hasta la Task 3: es esperado.

- [ ] **Step 5: Estilos compartidos en `base.css`**

En el bloque RESET:
- sustituir la línea `body{…}` por:

  ```css
  body{font-family:var(--body);background:var(--claro);color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ```
- sustituir la línea `:focus-visible{…}` por:

  ```css
  :focus-visible{outline:3px solid var(--ink);outline-offset:2px}
  html.menu-open{overflow:hidden}
  ```

Sustituir el bloque UTILIDADES entero (desde `/* ============ UTILIDADES ============ */` hasta `.sec .btn{border-radius:999px}`, ambos incluidos) y el bloque MODO CLARO entero por:

```css
/* ============ UTILIDADES ============ */
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 40px}
@media(max-width:600px){.wrap{padding:0 20px}}
.ssub{max-width:56ch;font-size:1.02rem;color:var(--ink-2)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
/* botones: pastilla roja rellena, verde de WhatsApp o contorno negro; sin sombras de color */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:999px;
  font:700 .8125rem/1 var(--body);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;cursor:pointer;
  transition:background-color .2s,color .2s,border-color .2s}
.btn-p{background:var(--rojo-txt);color:#fff}
.btn-p:hover{background:var(--rojo-hover)}
.btn-g{background:var(--verde);color:#10210a}
.btn-g:hover{background:#8ad05a}
.btn-ghost{border:2px solid var(--ink);color:var(--ink);background:transparent}
.btn-ghost:hover{background:var(--ink);color:var(--claro)}
/* estado del local (portada y menú de la hamburguesa) */
.status{display:flex;align-items:flex-start;gap:12px;font:500 1.0625rem/1.4 var(--body)}
.status .dot{flex:none;width:12px;height:12px;margin-top:5px;border-radius:50%;background:#4f8a2a;box-shadow:0 0 0 5px rgba(79,138,42,.16)}
.status b{color:#3F7021}
.status.is-soon .dot{background:#b35c00;box-shadow:0 0 0 5px rgba(179,92,0,.16)}
.status.is-soon b{color:#8a4700}
.status.is-closed .dot{background:#8a8178;box-shadow:none}
.status.is-closed b{color:var(--ink)}
```

Sustituir el bloque NAVBAR entero (desde `/* ============ NAVBAR` hasta el cierre del `@media(max-width:1024px){…}`) por:

```css
/* ============ BARRA (portada y carta) ============ */
.nav{position:fixed;inset:0 0 auto;z-index:100;background:var(--claro);color:var(--ink);border-bottom:1px solid rgba(28,28,28,.12)}
.nav-inner{max-width:var(--maxw);height:80px;margin:0 auto;padding:0 40px;display:flex;align-items:center;gap:26px}
.nav-logo{display:flex;align-items:center;gap:12px;margin-right:auto;white-space:nowrap}
.nav-logo img{width:46px;height:46px;border-radius:50%}
.nav-logo b{font:400 1.625rem/1 var(--disp)}
.nav-links{display:flex;align-items:center;gap:28px;font:700 .8125rem/1 var(--body);letter-spacing:.14em;text-transform:uppercase}
.nav-links a{padding:14px 0 12px;border-bottom:2px solid transparent;transition:border-color .2s}
.nav-links a:hover,.nav-links a[aria-current="page"]{border-bottom-color:var(--rojo-txt)}
.lang-toggle{min-height:44px;padding:0 4px;font:500 .8125rem/1 var(--body);letter-spacing:.14em;color:#6b625a}
.lang-toggle .is-on{color:var(--ink);font-weight:700}
.nav-go{min-height:44px;padding:0 20px;font-size:.75rem}
.nav-burger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:44px;height:44px}
.nav-burger span{width:24px;height:2px;border-radius:2px;background:var(--ink)}
@media(max-width:1024px){.nav-links,.nav-go{display:none}.nav-burger{display:flex}.nav-inner{gap:10px}}
@media(max-width:600px){.nav-inner{height:64px;padding:0 20px}.nav-logo{gap:9px}.nav-logo img{width:38px;height:38px}.nav-logo b{font-size:1.3rem}}
/* menú de la hamburguesa, en papel */
.nav-menu{position:fixed;inset:0;z-index:150;display:flex;flex-direction:column;overflow-y:auto;background:var(--claro);color:var(--ink)}
.nav-menu-top{flex:none;height:80px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;border-bottom:1px solid rgba(28,28,28,.12)}
.nav-x{width:44px;height:44px;font-size:1.5rem;line-height:1}
.nav-menu-links{padding:8px 40px 0}
.nav-menu-links a{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-bottom:1px solid rgba(28,28,28,.12);
  font:400 2.625rem/1 var(--sign);text-transform:uppercase}
.nav-menu-links i{font:400 1.5rem/1 var(--body);font-style:normal;color:var(--rojo-txt)}
.nav-menu-bot{margin-top:auto;padding:22px 40px 26px;display:grid;gap:12px}
.nav-menu-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.nav-menu-bot .lang-toggle{justify-self:center}
@media(max-width:600px){.nav-menu-top{height:64px;padding:0 20px}.nav-menu-links{padding:8px 20px 0}.nav-menu-bot{padding:22px 20px 26px}}
```

Sustituir el bloque FOOTER entero por:

```css
/* ============ PIE (portada y carta) ============ */
.footer{margin-top:96px;padding-top:52px;border-top:1px solid rgba(28,28,28,.14);color:var(--ink-2);font-size:.9375rem}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px}
.footer .brand{display:inline-flex;align-items:center;gap:12px;color:var(--ink)}
.footer .brand img{width:46px;height:46px;border-radius:50%}
.footer .brand b{font:400 1.625rem/1 var(--disp)}
.footer-tag{margin-top:16px;font:400 1.375rem/1.35 var(--disp);color:var(--ink)}
.footer-h{margin-bottom:10px;font:700 .75rem/1 var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--ink)}
.footer-grid nav a,.footer-grid div > a:not(.brand){display:block;padding:6px 0}
.footer a:hover{color:var(--rojo-txt)}
.foot-bottom{margin-top:40px;padding:18px 0 24px;border-top:1px solid rgba(28,28,28,.1);display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 12px;font-size:.8125rem;color:#6b625a}
@media(max-width:760px){
  .footer{margin-top:60px;padding-top:36px}
  .footer-grid{grid-template-columns:1fr;gap:26px}
  .footer-grid nav a,.footer-grid div > a:not(.brand){padding:11px 0}
}
```

Sustituir el bloque MOTION entero por:

```css
/* ============ MOVIMIENTO ============ */
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
```

- [ ] **Step 6: La carta pierde la barra negra**

En `web/css/menu.css`, borrar las líneas 5-13: los dos `:focus-visible` de `.page-menu`, el comentario y la regla de la barra negra, `.page-menu .nav-inner{…}` y el `@media(max-width:600px){…}` de la barra. Después de la línea `.page-menu{…}`, añadir:

```css
.page-menu .footer{margin-top:0}
```

- [ ] **Step 7: `nav.js` e i18n**

Sustituir el contenido de `web/js/nav.js` por:

```js
// Barra compartida (portada y carta): enlaces, idioma y menú de la hamburguesa en papel.
import { getLang, t } from './i18n.js';
import { HOURS } from './site-data.js';
import { statusAt } from './status.js';
import { statusHTML } from './sections.js';
import { PHONE } from './menu-data.js';
import { waUrl } from './cart-core.js';
import { trapFocus } from './focus-trap.js';

export function initNav() {
  const $ = id => document.getElementById(id);
  const burger = $('burger'), menu = $('navMenu'), close = $('navClose'), status = $('navStatus'), wa = $('navWa');
  let release = null;
  // El estado del menú es texto normal (no región viva): el de la portada ya se anuncia.
  const paint = () => {
    const { cls, html } = statusHTML(statusAt(new Date(), HOURS), getLang());
    status.classList.remove('is-open', 'is-soon', 'is-closed');
    status.classList.add(cls);
    status.querySelector('span').innerHTML = html;
    wa.href = waUrl(PHONE, t('wa.hello'));
  };
  const set = open => {
    if (open === !menu.hidden) return;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { paint(); release = trapFocus(menu); close.focus(); }
    else { if (release) release(); release = null; burger.focus(); }
  };
  burger.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) set(false); });
  matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) set(false); });
  document.addEventListener('langchange', () => { if (!menu.hidden) paint(); });
}
```

En `web/js/i18n.js`:
- En `apply()`, sustituir el bucle `document.querySelectorAll('.lang-toggle').forEach(b => { … });` por:

  ```js
  document.querySelectorAll('.lang-toggle').forEach(b => {
    b.querySelectorAll('[data-l]').forEach(s => s.classList.toggle('is-on', s.dataset.l === lang));
    b.setAttribute('aria-label', DICT['lang.switch'][lang]);
    b.setAttribute('lang', lang === 'en' ? 'es' : 'en');
  });
  ```
- Cambiar `'nav.menu'` a `{ en: 'Menu', es: 'Carta' }`.
- Cambiar `'footer.orders'` a `{ en: 'Orders & social', es: 'Pedidos y redes' }`.
- Borrar las claves `'nav.order'` y `'footer.tag'`.
- Añadir en el bloque `portada en blanco (2026-09-25)`:

  ```js
  'nav.dialog':        { en: 'Site menu', es: 'Menú del sitio' },
  'nav.close':         { en: 'Close menu', es: 'Cerrar menú' },
  'nav.sections':      { en: 'Sections', es: 'Secciones' },
  ```

Run: `node --test tests/*.test.mjs`
Expected: PASS en todo, incluidas las dos pruebas del paso 1.

- [ ] **Step 8: La carta con la barra nueva, en el navegador**

En `http://localhost:8124/menu.html`, con la caché desactivada:

1. A 1440 × 900:
   - barra de papel con raya fina, logo y «Candela & Café» a la izquierda;
   - a la derecha, CARTA · MARKET · NOCHES · VISÍTANOS (en ES) con CARTA subrayada en rojo, «EN / ES» con el idioma actual en negrita y el botón rojo «Cómo llegar»;
   - los chips quedan justo bajo la barra, arriba y tras `scrollTo({ top: 1500, behavior: 'instant' })`: `chips.getBoundingClientRect().top === nav.offsetHeight`;
   - el pie en papel, con 3 columnas.
   Captura: `.playwright-mcp/t2-menu-1440.png`.
2. A 375 × 812:
   - se ven el logo, «EN / ES» y la hamburguesa;
   - al tocar la hamburguesa se abre el menú en papel y `document.activeElement.id === 'navClose'`;
   - el estado dice «Abierto ahora · hasta las …» (o el que toque a esa hora);
   - pulsar Tab 12 veces: el foco no sale de `#navMenu` (`navMenu.contains(document.activeElement)` en cada paso);
   - Esc cierra el menú y `document.activeElement.id === 'burger'`.
   Captura del menú abierto: `.playwright-mcp/t2-menu-375-abierto.png`.
3. A 320 × 700:
   - `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0`;
   - la barra mide 64 px (`nav.offsetHeight`) y el nombre no se parte en dos líneas;
   - los chips quedan justo bajo la barra arriba y tras `scrollTo({ top: 1500, behavior: 'instant' })` (`chips.getBoundingClientRect().top === nav.offsetHeight`).
4. El selector de idioma del menú abierto cambia todos los textos (CARTA ↔ MENU, «Cómo llegar» ↔ «Get directions») y el estado.
5. `browser_console_messages` con `level: "error"`: 0 errores.

- [ ] **Step 9: Commit y push**

```bash
git add web/css/base.css web/css/menu.css web/js/nav.js web/js/i18n.js web/menu.html web/index.html tests/site-consistency.test.mjs
git commit -m "feat(barra): barra, menú de la hamburguesa y pie en papel, compartidos por la portada y la carta

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 3: La portada nueva

**Files:**
- Modify: `web/index.html` (cabecera, `<body>`, contenido entre el menú de la hamburguesa y el pie, y scripts)
- Create: `web/css/home.css`
- Delete: `web/css/landing.css`, `web/css/sections.css`, `web/js/hero.js`
- Modify: `web/js/landing.js` (se reescribe)
- Modify: `web/js/sections.js` (se borran `renderMarket`, `renderArches` y `burstSvg`)
- Modify: `web/js/site-data.js` (se borra `DAY_NIGHT`)
- Modify: `web/js/market-data.js` (sin `img` ni `h`)
- Modify: `web/js/i18n.js` (claves `home.*`; se borran las de la portada vieja)
- Test: `tests/sections.test.mjs`, `tests/site-consistency.test.mjs`

**Interfaces:**
- Consumes:
  - de la Task 1: `renderFavorites`, `renderMarketList`, `renderBoard`, `renderHours` y `statusHTML`;
  - de la Task 2: `initNav()` y las clases `.status`, `.btn*` y `.wrap`;
  - `ADDRESS`, `HOURS`, `FAVORITES`, `DAILY_MENU` y `GOOGLE` (`site-data.js`), `MARKET_CATEGORIES` (`market-data.js`), `PHONE` (`menu-data.js`) y `waUrl` (`cart-core.js`).
- Produces:
  - ids para la Task 4: `hero`, `heroCtas`, `heroStatus`, `heroStatusText` y `visit`;
  - botones `[data-open-res]` en «Los viernes», que abrirán el modal de la Task 4;
  - `$` y `getLang` ya importados en `landing.js`.

- [ ] **Step 1: Pruebas de la portada nueva (fallan)**

Al final de `tests/site-consistency.test.mjs`, añadir:

```js
test('La portada nueva: su hoja, sin GSAP, sin hero de fuego ni market de banco de imágenes', () => {
  assert.match(INDEX, /<link rel="stylesheet" href="css\/home\.css">/);
  for (const gone of [/gsap/i, /ScrollTrigger/, /hero-(fire|grill|burger|chips|drink|leaf)/, /mk-(despensa|aceite|cereal|frutas|verdes|cafe)/,
    /landing\.css/, /sections\.css/, /class="dawn"/, /class="dusk"/, /id="cartas"/, /class="now"/, /Order Now/])
    assert.doesNotMatch(INDEX, gone, String(gone));
  assert.match(INDEX, /<link rel="preload" as="image" href="assets\/img\/manana-fachada-960\.webp"/);
  assert.match(INDEX, /<img class="hero-photo"[^>]*fetchpriority="high"/);
});

test('La portada: un solo h1 y las anclas de siempre', () => {
  assert.equal(INDEX.split('<h1').length - 1, 1);
  for (const id of ['hero', 'market', 'noche', 'visit']) assert.match(INDEX, new RegExp(`id="${id}"`), id);
});
```

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL en las dos pruebas nuevas (no carga `home.css` y encuentra `gsap`).

- [ ] **Step 2: Cabecera y scripts de `index.html`**

- Borrar la línea `<script>document.documentElement.classList.add('js')</script>`.
- Sustituir la precarga de `hero-grill` (3 líneas) y los 5 `<link>` de CSS que siguen (`base.css`, `landing.css`, la precarga de `sections.css`, `sections.css` y su `<noscript>`) por:

  ```html
  <link rel="preload" as="image" href="assets/img/manana-fachada-960.webp"
        imagesrcset="assets/img/manana-fachada-480.webp 480w, assets/img/manana-fachada-960.webp 960w"
        imagesizes="(max-width:900px) 92vw, 470px" fetchpriority="high">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/home.css">
  ```
- `<body>` pasa a `<body class="page-home">`.
- Borrar los dos `<script>` de GSAP (`gsap.min.js` y `ScrollTrigger.min.js`). Se queda `<script type="module" src="js/landing.js"></script>`.
- Borrar la barra del móvil vieja (`<nav class="mbar" …>…</nav>`) y el modal viejo (desde `<!-- MODAL DE RESERVA -->` hasta su `</div>` final). Vuelven en la Task 4.

- [ ] **Step 3: El contenido de la portada**

Sustituir todo lo que hay entre el `</div>` que cierra `#navMenu` y `<footer class="footer">` (es decir, el `<main>` viejo entero) por:

```html
<main id="main">

<header class="hero wrap" id="hero">
  <div>
    <h1 class="hero-title">Candela &amp; Café</h1>
    <ul class="signs" role="list">
      <li class="sign" data-i18n="home.sign.deli">NY Deli</li>
      <li class="sign sign--red" data-i18n="home.sign.dominican">Dominican food</li>
      <li class="sign" data-i18n="home.sign.coffee">Coffee &amp; juices</li>
      <li class="sign" data-i18n="home.sign.market">Market</li>
    </ul>
    <p class="tagline">Born in NY, raised Dominican, served in Miami.</p>
    <p class="status is-open" id="heroStatus" role="status"><i class="dot" aria-hidden="true"></i><span id="heroStatusText">Open daily from 8 am · 507 N Miami Ave</span></p>
    <div class="ctas" id="heroCtas">
      <a class="btn btn-p btn-lg" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a>
      <a class="btn btn-ghost btn-lg" href="menu.html" data-i18n="home.cta.menu">See the menu</a>
    </div>
  </div>
  <img class="hero-photo" src="assets/img/manana-fachada-960.webp" srcset="assets/img/manana-fachada-480.webp 480w, assets/img/manana-fachada-960.webp 960w" sizes="(max-width:900px) 92vw, 470px" width="480" height="640" fetchpriority="high" alt="Breakfast plate at the door of 507 N Miami Ave" data-i18n-alt="home.hero.alt">
</header>

<section class="sec wrap" id="favoritos" aria-labelledby="favsTitle">
  <p class="kick" data-i18n="home.favs.kick">From the New York deli</p>
  <div class="sec-head"><h2 class="sec-title" id="favsTitle" data-i18n="home.favs.title">The favorites</h2><a class="btn btn-ghost btn-sm hide-m" href="menu.html" data-i18n="home.favs.cta">See the menu →</a></div>
  <div class="favs" id="favs"></div>
  <a class="btn btn-ghost show-m" href="menu.html" data-i18n="home.favs.cta.m">See the full menu</a>
</section>

<section class="sec wrap" id="dominicana" aria-labelledby="domTitle">
  <p class="kick" data-i18n="home.dom.kick">Made every day</p>
  <h2 class="sec-title" id="domTitle" data-i18n="home.dom.title">Dominican food</h2>
  <div class="split">
    <img class="photo" src="assets/img/mediodia-sancocho-960.webp" srcset="assets/img/mediodia-sancocho-480.webp 480w, assets/img/mediodia-sancocho-960.webp 960w" sizes="(max-width:900px) 92vw, 620px" width="480" height="640" loading="lazy" alt="Bowl of sancocho with white rice and avocado" data-i18n-alt="home.dom.alt">
    <div>
      <p class="lead" data-i18n="home.dom.body">The hot table: Dominican food made today, just like home.</p>
      <div id="board"><p class="note">Ask about our daily food specials!</p></div>
      <a class="btn btn-ghost" id="domWa" href="https://wa.me/17862547577" target="_blank" rel="noopener" data-i18n="home.dom.wa">Order on WhatsApp</a>
    </div>
  </div>
</section>

<section class="sec wrap" id="market" aria-labelledby="cmTitle">
  <p class="kick" data-i18n="home.cm.kick">All day</p>
  <h2 class="sec-title" id="cmTitle" data-i18n="home.cm.title">Coffee &amp; market</h2>
  <div class="duo">
    <article class="big">
      <img src="assets/img/manana-jugo-960.webp" srcset="assets/img/manana-jugo-480.webp 480w, assets/img/manana-jugo-960.webp 960w" sizes="(max-width:900px) 92vw, 540px" width="480" height="640" loading="lazy" alt="Fresh juice on the terrace" data-i18n-alt="home.coffee.alt">
      <h3 class="big-title" data-i18n="home.coffee.title">Coffee &amp; breakfast</h3>
      <p class="big-body" data-i18n="home.coffee.body">From 8 am: coffee, fresh juices, breakfast and bakery.</p>
      <a class="btn btn-ghost btn-sm" href="menu.html#breakfast" data-i18n="home.coffee.cta">See breakfast</a>
    </article>
    <article class="big shop">
      <p class="kick" data-i18n="home.market.kick">Basics &amp; natural products</p>
      <h3 class="big-title" data-i18n="home.market.title">The market</h3>
      <ul class="shop-list" id="shopList" role="list"></ul>
      <p class="note" data-i18n="home.market.note">Got it? Ask us before you come.</p>
      <a class="btn btn-ghost btn-sm" id="marketAsk" href="https://wa.me/17862547577" target="_blank" rel="noopener" data-i18n="home.market.cta">Ask on WhatsApp</a>
    </article>
  </div>
</section>

<section class="sec wrap" id="noche" aria-labelledby="friTitle">
  <div class="fri">
    <img class="photo" src="assets/img/noche-neon-960.webp" srcset="assets/img/noche-neon-480.webp 480w, assets/img/noche-neon-960.webp 960w" sizes="(max-width:900px) 92vw, 600px" width="480" height="701" loading="lazy" alt="The «Coffee now, Wine later» neon over the red banquette" data-i18n-alt="home.fri.alt">
    <div class="fri-copy">
      <p class="kick" data-i18n="home.fri.kick">Fridays</p>
      <h2 class="sec-title" id="friTitle" data-i18n="home.fri.title">Wine &amp; live music</h2>
      <p class="fri-body" data-i18n="home.fri.body">Wine, coffee until close and live music from 8 pm.</p>
      <button class="btn btn-p btn-lg" type="button" data-open-res data-i18n="home.fri.cta">Reserve a table</button>
    </div>
  </div>
</section>

<section class="sec wrap" id="lugar" aria-labelledby="placeTitle">
  <p class="kick" data-i18n="home.place.kick">The place</p>
  <h2 class="sec-title" id="placeTitle" data-i18n="home.place.title">Come see it</h2>
  <div class="place">
    <img src="assets/img/lugar-interior-960.webp" srcset="assets/img/lugar-interior-480.webp 480w, assets/img/lugar-interior-960.webp 960w" sizes="(max-width:900px) 92vw, 360px" width="480" height="523" loading="lazy" alt="Prosciutto sandwich by the red banquette" data-i18n-alt="home.place.alt1">
    <img src="assets/img/local-interior-960.webp" srcset="assets/img/local-interior-480.webp 480w, assets/img/local-interior-960.webp 960w, assets/img/local-interior-1440.webp 1440w" sizes="(max-width:900px) 45vw, 360px" width="480" height="640" loading="lazy" alt="Grilled chicken with rice and salad in the dining room" data-i18n-alt="home.place.alt2">
    <img src="assets/img/lugar-terraza-960.webp" srcset="assets/img/lugar-terraza-480.webp 480w, assets/img/lugar-terraza-960.webp 960w" sizes="(max-width:900px) 45vw, 360px" width="480" height="640" loading="lazy" alt="Philly cheesesteak on the terrace" data-i18n-alt="home.place.alt3">
  </div>
  <p class="google"><span class="star" aria-hidden="true">★</span> <b><span id="gRating">4.6</span> <span data-i18n="home.place.google">on Google</span></b> · <span id="gReviews">142</span> <span data-i18n="home.place.reviews">reviews</span> · <a id="gRead" href="https://www.google.com/maps?cid=6497021305409967970" target="_blank" rel="noopener" data-i18n="home.place.read">Read the reviews</a> · <a id="gWrite" href="https://www.google.com/maps?cid=6497021305409967970" target="_blank" rel="noopener" data-i18n="reviews.write">Write a review</a></p>
</section>

<section class="sec wrap visit" id="visit" aria-labelledby="visitTitle">
  <div class="visit-grid">
    <div>
      <p class="kick" data-i18n="visit.kicker">Visit Us</p>
      <h2 class="num" id="visitTitle" aria-label="507 N Miami Ave">507</h2>
      <p class="street">N Miami Ave</p>
      <p class="city">Downtown Miami, FL 33136</p>
      <div class="ctas"><a class="btn btn-p" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a><a class="btn btn-ghost" href="tel:+17862547577" data-i18n="mbar.call">Call</a><a class="btn btn-ghost" id="visitWa" href="https://wa.me/17862547577" target="_blank" rel="noopener">WhatsApp</a></div>
    </div>
    <div>
      <table class="hours"><caption class="sr-only" data-i18n="visit.hours.title">Hours</caption>
        <tbody id="hoursBody"><tr><th scope="row" data-i18n="visit.fallback1">Sun–Tue · 8 am – 10 pm</th><td></td></tr><tr><th scope="row" data-i18n="visit.fallback2">Wed–Sat · 8 am – 11:30 pm</th><td></td></tr></tbody>
      </table>
      <iframe class="map" loading="lazy" title="Map: Candela &amp; Café" src="https://www.google.com/maps?q=507+N+Miami+Ave,+Miami,+FL+33136&amp;output=embed"></iframe>
    </div>
  </div>
</section>

</main>
```

- [ ] **Step 4: `home.css`**

Crear `web/css/home.css`:

```css
/* HOME.CSS — portada en blanco, al estilo del menú (2026-09-25).
   Spec: docs/superpowers/specs/2026-09-25-candela-portada-blanca-design.md. Complementa base.css. */
html{scroll-padding-top:92px}
.page-home{--precio:#C42A1F;--verde-txt:#3F7021;--raya:#d8c9b4;--sombra:0 1px 0 rgba(28,28,28,.07),0 12px 30px -18px rgba(28,28,28,.4)}
.page-home main{padding-top:80px}

/* ── piezas comunes ── */
.sec{padding-top:92px}
.kick{display:flex;align-items:center;gap:16px;font:700 .8125rem/1 var(--body);letter-spacing:.24em;text-transform:uppercase;color:var(--verde-txt)}
.kick::after{content:"";flex:1;height:1px;background:rgba(28,28,28,.18)}
.sec-title{margin-top:14px;font:400 clamp(2.75rem,5.4vw,4.25rem)/1 var(--sign);text-transform:uppercase}
.sec-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}
.sign{display:inline-block;padding:9px 12px 8px;background:var(--ink);color:#fff;font:400 1rem/1 var(--sign);letter-spacing:.12em;text-transform:uppercase}
.sign--red{background:var(--rojo-txt)}
.note{font:400 2rem/1.15 var(--disp);color:var(--precio)}
.lead{font-size:1.375rem;line-height:1.5}
.photo{display:block;width:100%;height:auto;object-fit:cover;border-radius:18px;background:var(--arena)}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.btn-lg{min-height:54px;padding:0 28px;font-size:.875rem}
.btn-sm{min-height:44px;padding:0 20px;font-size:.75rem}
.show-m{display:none}

/* ── portada ── */
.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center;padding-top:48px}
.hero-title{font:400 clamp(3.625rem,8vw,6.5rem)/1 var(--disp);text-wrap:balance}
.signs{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
.tagline{max-width:22ch;margin-top:24px;font:400 1.8125rem/1.25 var(--disp);color:var(--precio)}
.hero .status{margin-top:28px}
.hero .ctas{margin-top:26px}
.hero-photo{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 0;border-radius:22px;background:var(--arena)}

/* ── los favoritos ── */
.favs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:30px}
.fav{display:flex;flex-direction:column;background:#fff;border-radius:14px;padding:7px 7px 16px;box-shadow:var(--sombra);transition:box-shadow .2s}
.fav:hover{box-shadow:0 0 0 2px var(--ink)}
.fav img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:10px;background:var(--arena)}
.fav-n{margin:13px 7px 0;font:400 1.3125rem/1.1 var(--sign);text-transform:uppercase;overflow-wrap:anywhere}
.fav-d{margin:6px 7px 0;font-size:.875rem;line-height:1.4;color:var(--ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.fav-p{margin:auto 7px 0;padding-top:12px;font:400 1.625rem/1 var(--disp);color:var(--precio)}

/* ── comida dominicana ── */
.split{display:grid;grid-template-columns:1.3fr 1fr;gap:48px;align-items:center;margin-top:30px}
.split .photo{aspect-ratio:16/10}
#board{margin-top:18px}
.board-h{font-weight:700}
.board-list{display:grid;gap:6px;margin-top:8px}
.board-list li::before{content:"· ";color:var(--precio)}
.split .btn{margin-top:26px}

/* ── café y market ── */
.duo{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:stretch;margin-top:30px}
.big{display:flex;flex-direction:column;background:#fff;border-radius:18px;padding:10px 10px 28px;box-shadow:var(--sombra)}
.big img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;border-radius:12px;background:var(--arena)}
.big-title{margin:22px 16px 0;font:400 2.5rem/1 var(--sign);text-transform:uppercase}
.big-body{margin:10px 16px 0;font-size:1.0625rem;line-height:1.5;color:var(--ink-2)}
.big .btn{align-self:flex-start;margin:22px 16px 0}
.shop{padding:34px 26px 30px}
.shop .kick::after{content:none}
.shop .big-title{margin:12px 0 0}
.shop-list{margin-top:18px}
.shop-list li{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:10px 0;border-bottom:1.5px dashed var(--raya)}
.shop-list b{font:400 1.3125rem/1 var(--sign);text-transform:uppercase}
.shop-list span{font-size:.9375rem;color:var(--ink-2);text-align:right}
.shop .note{margin:20px 0 0;font-size:1.6875rem}
.shop .btn{margin:18px 0 0}

/* ── los viernes ── */
.fri{display:grid;grid-template-columns:1.2fr 1fr;gap:52px;align-items:center;background:#fff;border-radius:24px;padding:18px 52px 18px 18px;box-shadow:var(--sombra)}
.fri .photo{aspect-ratio:4/3}
.fri .sec-title{font-size:clamp(2.5rem,4.6vw,3.75rem)}
.fri-body{margin-top:16px;font-size:1.1875rem;line-height:1.5;color:var(--ink-2)}
.fri .btn{margin-top:26px}

/* ── el local ── */
.place{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:30px}
.place img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:18px;background:var(--arena)}
.google{margin-top:26px;font-size:1.125rem}
.google .star{color:var(--rojo-txt)}
.google a{text-decoration:underline;text-underline-offset:4px}
.google a:hover{color:var(--rojo-txt)}

/* ── visítanos ── */
.visit-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
.num{margin-top:24px;font:400 13.125rem/.8 var(--sign)}
.street{margin-top:14px;font:400 3.5rem/1 var(--sign);text-transform:uppercase}
.city{margin-top:10px;font-size:1.1875rem;color:var(--ink-2)}
.visit .ctas{margin-top:28px}
.hours{width:100%;border-collapse:collapse;font-size:1.0625rem}
.hours th,.hours td{padding:13px 12px;border-bottom:1px solid rgba(28,28,28,.12);text-align:left;font-weight:400}
.hours td{text-align:right;white-space:nowrap}
.hours tr.today th,.hours tr.today td{background:var(--arena);font-weight:700}
.map{display:block;width:100%;height:200px;margin-top:22px;border:0;border-radius:16px;background:var(--arena)}
.page-home .footer{margin-top:72px}

/* ── tableta ── */
@media(max-width:900px){
  .hero,.split,.duo,.visit-grid{grid-template-columns:1fr}
  .hero{gap:0}
  .hero-photo{aspect-ratio:4/3;margin-top:26px;border-radius:18px}
  .split,.duo{gap:18px}
  .visit-grid{gap:28px}
  .fri{grid-template-columns:1fr;gap:18px;padding:10px 10px 26px}
  .fri-copy{padding:0 10px}
  .favs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .place{grid-template-columns:1fr 1fr}
  .place img{aspect-ratio:1}
  .place img:first-child{grid-column:span 2;aspect-ratio:4/3}
}

/* ── móvil ── */
@media(max-width:600px){
  html{scroll-padding-top:76px}
  .page-home main{padding-top:64px}
  .sec{padding-top:56px}
  .hero{padding-top:30px}
  .signs{gap:6px;margin-top:16px}
  .sign{padding:7px 9px 6px;font-size:.8125rem}
  .tagline{margin-top:16px;font-size:1.375rem}
  .status{font-size:.9375rem}
  .hero .status{margin-top:18px}
  .hero .ctas{margin-top:18px}
  .btn-lg{min-height:50px;padding:0 22px;font-size:.8125rem}
  .kick{font-size:.6875rem;letter-spacing:.2em}
  .hide-m{display:none}
  .show-m{display:inline-flex;margin-top:18px}
  .favs{gap:10px;margin-top:20px}
  .fav-n{font-size:1rem}
  .fav-d{font-size:.75rem}
  .fav-p{font-size:1.3125rem}
  .split,.duo{margin-top:20px}
  .lead{font-size:1.125rem}
  .note{font-size:1.5625rem}
  .big-title{margin:18px 12px 0;font-size:2rem}
  .big-body{margin:8px 12px 0;font-size:.9375rem}
  .big .btn{margin:18px 12px 0}
  .shop{padding:26px 18px 24px}
  .shop .big-title{margin:10px 0 0}
  .shop-list b{font-size:1.0625rem}
  .shop-list span{font-size:.8125rem}
  .shop .note{font-size:1.375rem}
  .shop .btn{margin:16px 0 0}
  .fri .sec-title{font-size:2.5rem}
  .fri-body{font-size:1rem}
  .place{gap:10px;margin-top:20px}
  .google{font-size:.9375rem}
  .num{font-size:9.375rem}
  .street{font-size:2.5rem}
  .city{font-size:1rem}
  .visit .ctas{margin-top:20px}
  .hours{font-size:.9375rem}
  .hours th,.hours td{padding:11px 8px}
  .page-home .footer{margin-top:60px}
}
```

Borrar `web/css/landing.css`, `web/css/sections.css` y `web/js/hero.js` con `git rm`.

- [ ] **Step 5: `landing.js`, datos y secciones**

Sustituir el contenido de `web/js/landing.js` por:

```js
// Portada en blanco, al estilo del menú (2026-09-25). Spec: docs/superpowers/specs/2026-09-25-candela-portada-blanca-design.md
import { initLangToggle, t, getLang } from './i18n.js';
import { PHONE } from './menu-data.js';
import { MARKET_CATEGORIES } from './market-data.js';
import { ADDRESS, HOURS, FAVORITES, DAILY_MENU, GOOGLE } from './site-data.js';
import { statusAt } from './status.js';
import { renderFavorites, renderMarketList, renderBoard, renderHours, statusHTML } from './sections.js';
import { waUrl } from './cart-core.js';
import { initNav } from './nav.js';

initLangToggle();
initNav();
const $ = id => document.getElementById(id);

/* ── estado del local, horario y mesa caliente (hora de Miami) ──
   Solo se escribe si cambia: #heroStatus es una región viva y reescribirla la vuelve a anunciar. */
const last = new Map();
const setHTML = (el, html) => { if (last.get(el) !== html) { el.innerHTML = html; last.set(el, html); } };
function updateNow() {
  const lang = getLang();
  const st = statusAt(new Date(), HOURS);
  const { cls, html } = statusHTML(st, lang, ADDRESS.street);
  const box = $('heroStatus');
  if (!box.classList.contains(cls)) { box.classList.remove('is-open', 'is-soon', 'is-closed'); box.classList.add(cls); }
  setHTML($('heroStatusText'), html);
  setHTML($('hoursBody'), renderHours(HOURS, st.day, lang));
  setHTML($('board'), renderBoard(DAILY_MENU, st.day, lang));
}

/* ── lo que cambia con el idioma ── */
function renderAll() {
  const lang = getLang();
  $('favs').innerHTML = renderFavorites(FAVORITES, lang);
  $('shopList').innerHTML = renderMarketList(MARKET_CATEGORIES, lang);
  $('domWa').href = waUrl(PHONE, t('wa.greeting'));
  $('marketAsk').href = waUrl(PHONE, t('home.market.askmsg'));
  $('visitWa').href = waUrl(PHONE, t('wa.hello'));
  updateNow();
}
renderAll();
document.addEventListener('langchange', renderAll);
setInterval(() => { if (!document.hidden) updateNow(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateNow(); });

/* ── Google: el dato vive en site-data.js ── */
$('gRating').textContent = String(GOOGLE.rating);
$('gReviews').textContent = String(GOOGLE.count);
$('gRead').href = GOOGLE.url;
$('gWrite').href = GOOGLE.reviewUrl;

/* ── anclas al llegar desde la carta (index.html#visit) ──
   Chrome corta el scroll al fragmento mientras la página carga y cambia de alto;
   se re-ancla sin animación en cada punto de carga, salvo que el usuario ya se haya movido. */
let userMoved = false;
['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { userMoved = true; }, { once: true, passive: true }));
function reanchor() {
  if (userMoved || !location.hash) return;
  let target = null;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; } // hash mal codificado
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
}
reanchor();
addEventListener('load', () => { reanchor(); setTimeout(reanchor, 300); });
if (document.fonts) document.fonts.ready.then(reanchor);
```

En `web/js/sections.js`:
- borrar `renderMarket`, `renderArches` y `burstSvg` (con su comentario);
- sustituir el comentario de cabecera por:

  ```js
  // Secciones dinámicas de la portada. Funciones PURAS: devuelven HTML en texto
  // (testeadas en tests/sections.test.mjs). Todo dato pasa por esc().
  ```

En `web/js/site-data.js`, borrar el bloque `// Cartas «Coffee now» / «Wine later»…` y `export const DAY_NIGHT = [ … ];`.

Sustituir el contenido de `web/js/market-data.js` por:

```js
// Market = VITRINA en forma de cartel: sin fotos, carrito ni precios (decisiones de Robert, 24 y 25-sep).
// ⚠ Categorías y ejemplos a confirmar con el cliente. Cuando pase fotos de sus estanterías, el cartel lleva foto.
export const MARKET_CATEGORIES = [
  { id: 'despensa',  name: { en: 'Pantry',      es: 'Despensa' },          examples: { en: 'rice, beans, pasta',      es: 'arroz, habichuelas, pasta' } },
  { id: 'basicos',   name: { en: 'Staples',     es: 'Básicos' },           examples: { en: 'oil, salt, spices',       es: 'aceite, sal, especias' } },
  { id: 'desayuno',  name: { en: 'Breakfast',   es: 'Desayuno' },          examples: { en: 'cereal, milk, bread',     es: 'cereales, leche, pan' } },
  { id: 'frescos',   name: { en: 'Fruit & veg', es: 'Frutas y verduras' }, examples: { en: 'plantain, yuca, avocado', es: 'plátano, yuca, aguacate' } },
  { id: 'naturales', name: { en: 'Natural',     es: 'Naturales' },         examples: { en: 'natural products',        es: 'productos naturales' } },
  { id: 'cafe',      name: { en: 'Coffee',      es: 'Café' },              examples: { en: 'to take home',            es: 'para llevar a casa' } },
];
```

En `tests/sections.test.mjs`:
- la línea 3 pasa a `import { esc, findItem, renderFavorites, renderMarketList, renderBoard, renderHours, renderStatus, statusHTML } from '../web/js/sections.js';`;
- la línea 4 pasa a `import { FAVORITES, HOURS } from '../web/js/site-data.js';`;
- borrar las pruebas `renderMarket: 6 baldas…`, `renderArches: dos cartas…` y `burstSvg: …`.

- [ ] **Step 6: Textos de la portada (i18n)**

En `web/js/i18n.js`:
- **Borrar** estas claves:
  - `hero.sub`, `hero.cta.order`, `hero.title`, `hero.cta.menu`, `music.p3` y `visit.call`;
  - `nightmenu.close`;
  - **todas** las que empiezan por `day.`.
- **Añadir** en el bloque `portada en blanco (2026-09-25)`:

```js
  'home.sign.deli':      { en: 'NY Deli', es: 'NY Deli' },
  'home.sign.dominican': { en: 'Dominican food', es: 'Comida dominicana' },
  'home.sign.coffee':    { en: 'Coffee & juices', es: 'Café y jugos' },
  'home.sign.market':    { en: 'Market', es: 'Market' },
  'home.cta.menu':       { en: 'See the menu', es: 'Ver la carta' },
  'home.hero.alt':       { en: 'Breakfast plate at the door of 507 N Miami Ave', es: 'Plato de desayuno en la puerta del 507 N Miami Ave' },
  'home.favs.kick':      { en: 'From the New York deli', es: 'Del deli de Nueva York' },
  'home.favs.title':     { en: 'The favorites', es: 'Los favoritos' },
  'home.favs.cta':       { en: 'See the menu →', es: 'Ver la carta →' },
  'home.favs.cta.m':     { en: 'See the full menu', es: 'Ver la carta completa' },
  'home.dom.kick':       { en: 'Made every day', es: 'Hecha cada día' },
  'home.dom.title':      { en: 'Dominican food', es: 'Comida dominicana' },
  'home.dom.body':       { en: 'The hot table: Dominican food made today, just like home.', es: 'La mesa caliente: comida dominicana hecha hoy, como en casa.' },
  'home.dom.wa':         { en: 'Order on WhatsApp', es: 'Pedir por WhatsApp' },
  'home.dom.alt':        { en: 'Bowl of sancocho with white rice and avocado', es: 'Plato de sancocho con arroz blanco y aguacate' },
  'home.cm.kick':        { en: 'All day', es: 'Todo el día' },
  'home.cm.title':       { en: 'Coffee & market', es: 'Café y market' },
  'home.coffee.title':   { en: 'Coffee & breakfast', es: 'Café y desayunos' },
  'home.coffee.body':    { en: 'From 8 am: coffee, fresh juices, breakfast and bakery.', es: 'Desde las 8 am: café, jugos naturales, desayunos y panadería.' },
  'home.coffee.cta':     { en: 'See breakfast', es: 'Ver desayunos' },
  'home.coffee.alt':     { en: 'Fresh juice on the terrace', es: 'Jugo natural en la terraza' },
  'home.market.kick':    { en: 'Basics & natural products', es: 'Básicos y productos naturales' },
  'home.market.title':   { en: 'The market', es: 'El market' },
  'home.market.note':    { en: 'Got it? Ask us before you come.', es: '¿Lo tienes? Pregúntanos antes de venir.' },
  'home.market.cta':     { en: 'Ask on WhatsApp', es: 'Preguntar por WhatsApp' },
  'home.market.askmsg':  { en: 'Hi Candela & Café! Do you have … at the market?', es: '¡Hola Candela & Café! ¿Tienen … en el market?' },
  'home.fri.kick':       { en: 'Fridays', es: 'Los viernes' },
  'home.fri.title':      { en: 'Wine & live music', es: 'Vino y música en vivo' },
  'home.fri.body':       { en: 'Wine, coffee until close and live music from 8 pm.', es: 'Vino, café hasta el cierre y música en vivo desde las 8 pm.' },
  'home.fri.cta':        { en: 'Reserve a table', es: 'Reservar mesa' },
  'home.fri.alt':        { en: 'The «Coffee now, Wine later» neon over the red banquette', es: 'El neón «Coffee now, Wine later» sobre el banco rojo' },
  'home.place.kick':     { en: 'The place', es: 'El local' },
  'home.place.title':    { en: 'Come see it', es: 'Ven a verlo' },
  'home.place.alt1':     { en: 'Prosciutto sandwich by the red banquette', es: 'Sándwich de prosciutto junto al banco rojo' },
  'home.place.alt2':     { en: 'Grilled chicken with rice and salad in the dining room', es: 'Pollo a la plancha con arroz y ensalada en el comedor' },
  'home.place.alt3':     { en: 'Philly cheesesteak on the terrace', es: 'Philly cheesesteak en la terraza' },
  'home.place.google':   { en: 'on Google', es: 'en Google' },
  'home.place.reviews':  { en: 'reviews', es: 'reseñas' },
  'home.place.read':     { en: 'Read the reviews', es: 'Leer reseñas' },
```

Run: `node --test tests/*.test.mjs`
Expected: PASS en todo, incluidas las dos pruebas del paso 1 y la de claves de i18n.

- [ ] **Step 7: Escritorio en el navegador**

En `http://localhost:8124/`, con la caché desactivada y a 1440 × 900, en ES (tocar «EN / ES» si hace falta):

1. Primera pantalla: «Candela & Café» a mano en dos líneas; los 4 carteles (el de «Comida dominicana» en rojo); la frase en rojo; el estado con el punto verde, «Abierto ahora · hasta las … · 507 N Miami Ave» (o el que toque); «Cómo llegar» y «Ver la carta»; a la derecha, la foto de la puerta con el «507» visible arriba.
2. Hacer scroll por toda la página. Deben verse, en orden:
   - los 4 favoritos con precio a mano;
   - la comida dominicana con la foto del sancocho y el aviso del especial;
   - las dos tarjetas de café y market, con el market como cartel de 6 filas;
   - la tarjeta de los viernes con el neón;
   - las 3 fotos del local y la línea de Google;
   - «507» en negro con el horario (hoy marcado en arena) y el mapa;
   - el pie.
3. Ninguna sección oscura ni degradado. Nada se mueve al cargar ni al hacer scroll.
4. Alto de la página: `document.documentElement.scrollHeight` ≤ 5000. Si pasa de 5.000, las fotos de `.place` pasan de `aspect-ratio:4/5` a `1` en escritorio (unos −90 px), y se vuelve a medir.
5. Errores y recursos:
   - `browser_console_messages` con `level: "error"`: 0 errores;
   - `browser_network_requests` con `static: true`: ningún `[404]`.
6. Capturas de página completa en ES y EN: `.playwright-mcp/t3-1440-es.png` y `.playwright-mcp/t3-1440-en.png`. Compararlas con los bocetos aprobados (`arriba-barra-portada.html` y `resto-portada.html` en `.superpowers/brainstorm/1067-1790354076/content/`).

- [ ] **Step 8: Móvil y tableta**

1. A 375 × 812, sin hacer scroll: el `h1`, `#heroStatus` y el botón «Cómo llegar» de `#heroCtas` quedan dentro de la pantalla (`getBoundingClientRect().bottom < 812` en los tres).
2. A 375 y a 768: todo a una columna y los favoritos a dos. En «El local», la primera foto va ancha y las otras dos cuadradas.
3. **A 320 × 700, en ES**, la prueba de la Review Focus n.º 3:
   - `scrollWidth - clientWidth === 0`;
   - ningún `.sign`, `.btn` ni `tr` sobresale de la página (`getBoundingClientRect().right <= clientWidth` en todos);
   - la fila «Hoy · Viernes · música en vivo» (o la del día) parte el texto de la izquierda y no la hora.
4. Capturas de página completa a 375 en ES: `.playwright-mcp/t3-375-es.png`.

- [ ] **Step 9: Visitante que ya eligió español (Review Focus 1)**

En una pestaña nueva, con `browser_run_code_unsafe`:

```js
await page.addInitScript(() => localStorage.setItem('candela-lang', 'es'));
await page.goto('http://localhost:8124/');
await page.waitForLoadState('load');
return await page.evaluate(() => {
  const txt = document.body.innerText;
  const en = ['Get directions', 'See the menu', 'The favorites', 'Dominican food', 'Coffee & market', 'Wine & live music', 'Come see it', 'Visit Us', 'Open now', 'Closed', 'Closing soon', 'reviews'];
  return {
    englishLeft: en.filter(s => txt.includes(s)),
    heroAlt: document.querySelector('.hero-photo').alt,
    burger: document.getElementById('burger').getAttribute('aria-label'),
    lang: document.documentElement.lang,
  };
});
```

Expected:
- `englishLeft` vacío;
- `heroAlt` empieza por «Plato de desayuno»;
- `burger` es «Abrir menú»;
- `lang` es `es`.

A 375 × 812, abrir la hamburguesa: los enlaces dicen CARTA · MARKET · NOCHES · VISÍTANOS y el estado va en español.

- [ ] **Step 10: Cerrado y cierra pronto (Review Focus 2)**

Para cada hora, con `browser_run_code_unsafe` en una pestaña nueva y en ES:

```js
await page.addInitScript(() => localStorage.setItem('candela-lang', 'es'));
await page.clock.setFixedTime(new Date(ISO));
await page.goto('http://localhost:8124/');
return await page.evaluate(() => ({
  cls: document.getElementById('heroStatus').className,
  text: document.getElementById('heroStatusText').innerText,
  today: document.querySelector('#hoursBody tr.today th').innerText,
}));
```

| `ISO` | `cls` contiene | `text` | `today` |
|---|---|---|---|
| `2026-09-30T01:30:00Z` (mar 9:30 pm) | `is-soon` | `Cierra pronto · a las 10 pm · 507 N Miami Ave` | `Hoy · Martes` |
| `2026-09-30T02:30:00Z` (mar 10:30 pm) | `is-closed` | `Cerrado · abrimos mañana a las 8 am · 507 N Miami Ave` | `Hoy · Martes` |
| `2026-09-25T19:00:00Z` (vie 3 pm) | `is-open` | `Abierto ahora · hasta las 11:30 pm · 507 N Miami Ave` | `Hoy · Viernes · música en vivo` |

Con la hora «cerrado», a 375 × 812, abrir la hamburguesa: `#navStatus` dice «Cerrado · abrimos mañana a las 8 am» y el punto es gris (`getComputedStyle(dot).backgroundColor === 'rgb(138, 129, 120)'`).

- [ ] **Step 11: Llegar desde la carta con ancla (Review Focus 4)**

A 1440 × 900 y a 375 × 812, para `#market`, `#noche` y `#visit`:
- navegar a `http://localhost:8124/menu.html`;
- tocar el enlace de la barra (en móvil, desde la hamburguesa);
- esperar 1 s y medir el título de la sección (`#cmTitle`, `#friTitle` o `#visitTitle`).

Expected: `top >= nav.offsetHeight` y `bottom <= innerHeight`. El título se ve entero bajo la barra.

- [ ] **Step 12: Commit y push**

```bash
git add web/index.html web/css/home.css web/js/landing.js web/js/sections.js web/js/site-data.js web/js/market-data.js web/js/i18n.js tests/sections.test.mjs tests/site-consistency.test.mjs
git rm web/css/landing.css web/css/sections.css web/js/hero.js
git commit -m "feat(portada): portada en blanco al estilo del menú — hero con la puerta del 507, favoritos, comida dominicana, café y market, viernes, el local y visítanos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 4: Barra fija del móvil y modal de reserva en papel

**Files:**
- Modify: `web/index.html` (barra del móvil y modal, entre `</footer>` y el `<script>`)
- Modify: `web/css/home.css` (bloques nuevos al final)
- Modify: `web/js/landing.js` (imports y bloques nuevos al final)
- Modify: `web/js/i18n.js` (`res.title`; se borran `res.title.a` y `res.title.b`)
- Test: `tests/site-consistency.test.mjs`

**Interfaces:**
- Consumes:
  - ids `heroCtas` y `visit`, y botones `[data-open-res]` (Task 3);
  - `buildReservationUrl(data, phone, lang)` (`cart-core.js`) y `trapFocus` (`focus-trap.js`);
  - clase `menu-open` en `<html>` (Task 2).
- Produces:
  - `#mbar` con la clase `is-shown` cuando se ve;
  - `#resModal` con la clase `open` cuando está abierto.

- [ ] **Step 1: Prueba (falla)**

Al final de `tests/site-consistency.test.mjs`, añadir:

```js
test('La portada: barra fija del móvil y modal de reserva en papel', () => {
  assert.match(INDEX, /<nav class="mbar" id="mbar"/);
  assert.match(INDEX, /<div class="modal" id="resModal" aria-hidden="true">/);
  assert.match(INDEX, /<h2 id="resTitle" class="modal-title" data-i18n="res\.title">/);
  assert.match(INDEX, /data-open-res/);
  assert.doesNotMatch(INDEX, /modal-seal/);
});
```

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL: no encuentra `class="mbar"`.

- [ ] **Step 2: HTML**

En `web/index.html`, entre `</footer>` y `<script type="module" src="js/landing.js"></script>`, añadir:

```html
<nav class="mbar" id="mbar" aria-label="Quick actions" data-i18n-aria="mbar.label">
  <a class="btn btn-p" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="mbar.go">Directions</a>
  <a class="btn btn-ghost" href="tel:+17862547577" data-i18n="mbar.call">Call</a>
  <a class="btn btn-ghost" href="menu.html" data-i18n="nav.menu">Menu</a>
</nav>

<div class="modal" id="resModal" aria-hidden="true">
  <div class="modal-ov" data-close></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="resTitle">
    <button class="modal-x" type="button" data-close aria-label="Close" data-i18n-aria="modal.close">×</button>
    <h2 id="resTitle" class="modal-title" data-i18n="res.title">Reserve your Friday</h2>
    <p class="modal-sub" data-i18n="res.sub">Live music every Friday. Fill this in and we confirm by WhatsApp.</p>
    <label class="fld"><span data-i18n="res.name">Name</span><input id="resName" type="text" autocomplete="name"></label>
    <label class="fld"><span data-i18n="res.phone">Phone</span><input id="resPhone" type="tel" autocomplete="tel" placeholder="(786) 000-0000"></label>
    <div class="fld-row">
      <label class="fld"><span data-i18n="res.day">Friday</span><select id="resDate"></select></label>
      <label class="fld"><span data-i18n="res.time">Time</span><select id="resTime"><option>8:00 PM</option><option>9:00 PM</option><option>10:00 PM</option></select></label>
    </div>
    <div class="fld"><span data-i18n="res.guests">Guests</span><div class="stepper"><button type="button" id="gMinus" aria-label="Less" data-i18n-aria="cart.less">−</button><b id="gCount" aria-live="polite">2</b><button type="button" id="gPlus" aria-label="More" data-i18n-aria="cart.more">+</button></div></div>
    <button class="btn btn-g modal-go" type="button" id="resGo" data-i18n="res.go">Confirm via WhatsApp</button>
    <p class="modal-note" data-i18n="res.note">We'll reply to confirm availability.</p>
  </div>
</div>
```

- [ ] **Step 3: CSS**

Al final de `web/css/home.css`, añadir:

```css
/* ── barra fija del móvil: aparece sin moverse (sin animación) ── */
.mbar{display:none}
@media(max-width:768px){
  .mbar{position:fixed;inset:auto 0 0 0;z-index:90;display:grid;grid-template-columns:1.35fr 1fr 1fr;gap:8px;
    padding:10px 12px calc(14px + env(safe-area-inset-bottom));background:rgba(251,247,240,.97);border-top:1px solid rgba(28,28,28,.14);visibility:hidden}
  .mbar.is-shown{visibility:visible}
  .mbar .btn{min-height:46px;padding:0 8px;font-size:.75rem}
  .page-home .foot-bottom{padding-bottom:96px}
}

/* ── modal de reserva, en papel ── */
.modal{position:fixed;inset:0;z-index:200;display:none}
.modal.open{display:block}
.modal-ov{position:absolute;inset:0;background:rgba(28,28,28,.55)}
.modal-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,92vw);max-height:92vh;overflow-y:auto;
  padding:30px 26px 24px;border-radius:18px;background:var(--claro);color:var(--ink);box-shadow:0 24px 60px rgba(28,28,28,.35)}
.modal-x{position:absolute;right:12px;top:12px;width:44px;height:44px;border-radius:50%;font-size:1.5rem;line-height:1}
.modal-x:hover{background:var(--arena)}
.modal-title{padding-right:40px;font:400 2.25rem/1.05 var(--disp);color:var(--precio)}
.modal-sub{margin:8px 0 18px;font-size:.9375rem;color:var(--ink-2)}
.fld{display:block;margin-bottom:14px}
.fld > span{display:block;margin-bottom:6px;font:700 .75rem/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--verde-txt)}
.fld input,.fld select{width:100%;min-height:48px;padding:0 14px;border:2px solid var(--ink);border-radius:12px;background:#fff;color:var(--ink);font:500 1rem/1.2 var(--body)}
.fld-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stepper{display:inline-flex;align-items:center;gap:18px;padding:4px 10px;border:2px solid var(--ink);border-radius:12px;background:#fff}
.stepper button{width:44px;height:44px;border-radius:50%;background:var(--rojo-txt);color:#fff;font-size:1.3rem;line-height:1}
.stepper b{min-width:24px;text-align:center;font-size:1.1rem}
.modal-go{width:100%;margin-top:18px}
.modal-note{margin-top:10px;text-align:center;font-size:.8125rem;color:var(--ink-2)}
```

- [ ] **Step 4: JS**

En `web/js/landing.js`:
- sustituir `import { waUrl } from './cart-core.js';` por `import { waUrl, buildReservationUrl } from './cart-core.js';`;
- después de `import { initNav } from './nav.js';`, añadir `import { trapFocus } from './focus-trap.js';`;
- al final del archivo, añadir:

```js
/* ── barra fija del móvil: sale cuando los botones de la portada se van y se esconde en Visítanos ── */
const mbar = $('mbar');
const seen = { ctas: true, visit: false };
const syncBar = () => mbar.classList.toggle('is-shown', !seen.ctas && !seen.visit);
new IntersectionObserver(([e]) => { seen.ctas = e.isIntersecting; syncBar(); }).observe($('heroCtas'));
new IntersectionObserver(([e]) => { seen.visit = e.isIntersecting; syncBar(); }, { threshold: 0.15 }).observe($('visit'));

/* ── modal de reserva → WhatsApp ── */
const modal = $('resModal'), dsel = $('resDate');
function fillFridays() {
  dsel.innerHTML = '';
  const d = new Date(); let n = 0;
  while (n < 6) {
    if (d.getDay() === 5) {
      const o = document.createElement('option');
      o.textContent = d.toLocaleDateString(getLang() === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short' });
      dsel.appendChild(o); n++;
    }
    d.setDate(d.getDate() + 1);
  }
}
fillFridays();
document.addEventListener('langchange', fillFridays);
let guests = 2;
$('gPlus').addEventListener('click', () => { if (guests < 12) $('gCount').textContent = ++guests; });
$('gMinus').addEventListener('click', () => { if (guests > 1) $('gCount').textContent = --guests; });
let lastFocus = null, release = null;
const openRes = () => {
  lastFocus = document.activeElement;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('menu-open');
  release = trapFocus(modal); $('resName').focus();
};
const closeRes = () => {
  modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('menu-open');
  if (release) release(); release = null;
  if (lastFocus) lastFocus.focus();
};
document.querySelectorAll('[data-open-res]').forEach(b => b.addEventListener('click', openRes));
modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeRes));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeRes(); });
$('resGo').addEventListener('click', () => {
  const data = { name: $('resName').value.trim(), phone: $('resPhone').value.trim(), day: dsel.value, time: $('resTime').value, guests };
  window.open(buildReservationUrl(data, PHONE, getLang()), '_blank', 'noopener');
});
```

En `web/js/i18n.js`, borrar `res.title.a` y `res.title.b` y añadir en el bloque `portada en blanco (2026-09-25)`:

```js
  'res.title':           { en: 'Reserve your Friday', es: 'Reserva tu viernes' },
```

Run: `node --test tests/*.test.mjs`
Expected: PASS en todo.

- [ ] **Step 5: Barra del móvil en el navegador**

En `http://localhost:8124/` a 375 × 812:
1. Arriba del todo: `getComputedStyle(mbar).visibility === 'hidden'`.
2. `scrollTo({ top: 1400, behavior: 'instant' })` y esperar 300 ms: `visible`. Tiene «Cómo llegar» (rojo), «Llamar» y «Carta».
3. `document.getElementById('visit').scrollIntoView({ behavior: 'instant' })` y esperar 300 ms: `hidden`.
4. Al final de la página (pie): `visible`. El texto del pie queda por encima de la barra, porque el pie tiene 96 px de margen abajo.
5. A 1440 × 900: `getComputedStyle(mbar).display === 'none'` en cualquier punto.

- [ ] **Step 6: La barra oculta no recibe el foco (Review Focus 5)**

A 375 × 812, arriba del todo:

```js
const a = document.querySelector('#mbar a');
a.focus();
return document.activeElement === a;
```

Expected: `false`. Con la barra visible (tras `scrollTo({ top: 1400 })`), el mismo código da `true`.

- [ ] **Step 7: Modal de reserva (Review Focus 5)**

A 1440 × 900 y en ES:
1. `scrollIntoView` de «Reservar mesa» (en `#noche`) y pulsarlo.
   - Expected: modal en papel, con el título a mano en rojo «Reserva tu viernes»;
   - `document.activeElement.id === 'resName'`;
   - `document.documentElement.classList.contains('menu-open')`.
2. Pulsar Tab 12 veces: `resModal.contains(document.activeElement)` en cada paso.
3. Esc: el modal se cierra; el foco vuelve a «Reservar mesa» (`document.activeElement.dataset.openRes === ''`); `menu-open` desaparece.
4. Volver a abrirlo y preparar la prueba del enlace:

   ```js
   window.open = u => { window.__wa = u; };
   document.getElementById('resName').value = 'Ana';
   ```

   - Pulsar «+» una vez (3 personas) y «Confirmar por WhatsApp».
   - Expected: `window.__wa` empieza por `https://wa.me/17862547577?text=`;
   - una vez decodificado, contiene `para 3 personas` y `Nombre: Ana`.
5. Captura del modal abierto: `.playwright-mcp/t4-modal.png`.

- [ ] **Step 8: Commit y push**

```bash
git add web/index.html web/css/home.css web/js/landing.js web/js/i18n.js tests/site-consistency.test.mjs
git commit -m "feat(portada): barra fija del móvil que aparece al bajar y modal de reserva en papel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5: Limpieza — imágenes huérfanas y claves sin usar

**Files:**
- Delete: las imágenes de `web/assets/img/` que ya no usa nadie (paso 3)
- Modify: `web/js/i18n.js` (claves sin usar)
- Test: `tests/site-consistency.test.mjs`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada nuevo. Deja dos pruebas que impiden que vuelvan a quedar imágenes o claves sueltas.

- [ ] **Step 1: Pruebas (fallan)**

En `tests/site-consistency.test.mjs`, después de `const INDEX = …`, añadir:

```js
const IMG_DIR = new URL('../web/assets/img/', import.meta.url);
const SOURCES = [INDEX, MENUP,
  ...readdirSync(new URL('../web/js/', import.meta.url)).map(f => read(`web/js/${f}`)),
  ...readdirSync(new URL('../web/css/', import.meta.url)).map(f => read(`web/css/${f}`))].join('\n');
```

Al final del archivo, añadir:

```js
test('Toda imagen que citan las páginas existe', () => {
  const refs = new Set([...(INDEX + MENUP).matchAll(/assets\/img\/([\w-]+\.(?:webp|jpg|png))/g)].map(m => m[1]));
  assert.deepEqual([...refs].filter(f => !existsSync(new URL(f, IMG_DIR))), []);
});

test('No quedan imágenes que no use nadie', () => {
  const base = f => f.replace(/-(?:96|240|480|960|1440)(?=\.)/, '').replace(/\.(?:webp|jpg|png)$/, '');
  assert.deepEqual(readdirSync(IMG_DIR).filter(f => !SOURCES.includes(base(f))), []);
});

test('Toda clave de i18n se usa en alguna página o módulo', () => {
  const used = new Set();
  for (const m of (INDEX + MENUP).matchAll(/data-i18n(?:-alt|-aria|-placeholder)?="([^"]+)"/g)) used.add(m[1]);
  for (const m of SOURCES.matchAll(/\b(?:t|tx)\('([\w.-]+)'|DICT\['([\w.-]+)'\]/g)) used.add(m[1] || m[2]);
  assert.deepEqual(Object.keys(DICT).filter(k => !used.has(k)), []);
});
```

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL en «No quedan imágenes…», que lista `hero-*`, `mk-*`, `gal-*`, `food-*`, etc. También falla «Toda clave de i18n se usa», que lista al menos `cart.items`, `footer.delivery`, `res.greeting` y `now.fallback`.

- [ ] **Step 2: Claves sin usar**

En `web/js/i18n.js`, borrar exactamente las claves que lista la prueba (se esperan `cart.items`, `footer.delivery`, `res.greeting` y `now.fallback`). **Antes de borrar cualquier otra que salga, comprobar con `grep -rn "<clave>" web/` que de verdad no la usa nadie.**

- [ ] **Step 3: Imágenes huérfanas**

Borrar con `git rm` los archivos que lista la prueba. Se esperan estos grupos, con todas sus variantes:
- `hero-*`;
- `mk-*`;
- `gal-*` y `food-*`;
- `breakfast-platter-*`, `catering-*` y `miami-skyline-*`;
- `lugar-flan-*` y `manana-tres-golpes-*`.

**No borrar nada que no salga en la lista.** `manana-pastelitos`, `mediodia-mesa-caliente` y `lugar-neon-sub` los usa la carta.

- [ ] **Step 4: Comprobar que pasa todo**

Run: `node --test tests/*.test.mjs`
Expected: PASS en todo.

- [ ] **Step 5: Ningún 404 en las dos páginas**

Con la caché desactivada, cargar `http://localhost:8124/` (bajando hasta el final, para que carguen las fotos diferidas) y `http://localhost:8124/menu.html`. En las dos, `browser_network_requests` con `static: true` no muestra ningún `[404]`.

- [ ] **Step 6: Commit y push**

```bash
git add web/js/i18n.js tests/site-consistency.test.mjs
git rm <los archivos del paso 3>
git commit -m "chore(portada): fuera imágenes y claves que ya no usa nadie, con pruebas para que no vuelvan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 6: Verificación final y preview

**Files:** ninguno. Si una prueba falla, se arregla en el archivo que toque, con su propio commit.

**Interfaces:** —

- [ ] **Step 1: Pruebas unitarias**

Run: `node --test tests/*.test.mjs`
Expected: PASS en todo. Anotar el número de pruebas en `$W/informe.md`.

- [ ] **Step 2: Matriz del navegador**

Portada y carta a 320, 375, 768, 1280 y 1440 px, en EN y en ES:
- `scrollWidth - clientWidth === 0`;
- 0 errores en consola;
- ningún `[404]`.

Anotar la tabla en `$W/informe.md`.

- [ ] **Step 3: Repaso de la Review Focus**

Repetir en un solo pase: Task 3, pasos 9, 10 y 11; Task 2, paso 8.2, y Task 4, pasos 6 y 7. Anotar el resultado de cada uno en `$W/informe.md`.

- [ ] **Step 4: Preview en Netlify**

```bash
W=.superpowers/sdd/2026-09-25-candela-portada-blanca && mkdir -p "$W"
netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5 --message "preview portada blanca ($(git rev-parse --short HEAD))" --json > "$W/deploy.json"
node -e "console.log(require('./.superpowers/sdd/2026-09-25-candela-portada-blanca/deploy.json').deploy_url)"
```

Expected: una URL `https://<id>--candela-cafe-market.netlify.app`. **No usar `--prod`.**

- [ ] **Step 5: Lighthouse en móvil contra la preview**

```bash
npx -y lighthouse@12 "<deploy_url>/" --only-categories=performance,accessibility --output=json --output-path="$W/lh-home.json" --chrome-flags="--headless=new" --quiet
npx -y lighthouse@12 "<deploy_url>/menu.html" --only-categories=performance,accessibility --output=json --output-path="$W/lh-menu.json" --chrome-flags="--headless=new" --quiet
node -e "for (const f of ['lh-home','lh-menu']) { const r = require('./.superpowers/sdd/2026-09-25-candela-portada-blanca/' + f + '.json'); console.log(f, Math.round(r.categories.performance.score*100), Math.round(r.categories.accessibility.score*100), r.audits['cumulative-layout-shift'].numericValue.toFixed(3)); }"
```

Expected: en las dos, rendimiento ≥ 90, accesibilidad ≥ 95 y CLS < 0,05. Si no llega, arreglar lo que diga Lighthouse (commit propio) y repetir los pasos 4 y 5.

- [ ] **Step 6: Informe para Robert**

En `$W/informe.md`: la URL de la preview, los resultados de Lighthouse, la matriz y las capturas de `.playwright-mcp/` (t3-1440-es, t3-375-es y t4-modal). La publicación a producción espera su OK (spec §13).

# «Un día en Candela» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer la portada de candelaycafe.com como «Un día en Candela» (mañana → mediodía → market → noche → el lugar → visítanos), dejando el hero intacto y arreglando los fallos de la revisión de código.

**Architecture:**
- Sitio estático sin build (`web/`), en HTML/CSS/JS vanilla con módulos ES.
- Los datos del local viven en `site-data.js`. La lógica pura está en `status.js`, `sections.js` y `cart-core.js`, y se prueba con `node --test`.
- `landing.js` solo conecta el DOM.
- `nav.js`, `focus-trap.js` y `hero.js` son módulos pequeños y reutilizables.

**Tech Stack:**
- HTML5, CSS y JS (ES modules).
- GSAP 3.12.5 + ScrollTrigger desde CDN con SRI (ya estaban).
- Pruebas con `node:test` (Node 24) y en navegador con Playwright.
- `sharp` (en `tools/`) para convertir las fotos a WebP.
- Netlify con deploy manual.

**Spec:** `docs/superpowers/specs/2026-09-24-candela-un-dia-design.md`. Los hallazgos #n remiten a `docs/superpowers/reviews/2026-09-24-revision-codigo.md`.

## Global Constraints

- El diseño del hero no cambia. Lo único visual que se toca es el contraste de sus CTA (#20) y el destino de «View menu», que pasa a `menu.html`.
- Nada de amarillo ni ámbar. Paleta: negro `#0d0d0d`, rojo `#ED3B2F`, verde `#76C043`, crema `#FBF7F0`, arena `#F1DFC6`/`#EBCDAA`, terracota `#9a4a2c` y noche `#0a0a0a`.
- **No se inventa contenido del negocio.**
  - Platos, precios y descripciones salen de `web/js/menu-data.js`.
  - La mesa caliente muestra el especial del día si `DAILY_MENU` está vacío.
  - Solo datos reales de Google (nota y número). Nunca reseñas de ejemplo.
- Es bilingüe EN/ES: todo texto visible, `alt` y `aria-label` sale de `DICT` en `web/js/i18n.js`. «Coffee now, Wine later» y «Wine later.» se dejan en inglés.
- **Tipografías:**
  - Architects Daughter para los titulares.
  - DM Sans para el texto (≥ 16 px).
  - Anton **solo** para carteles, etiquetas, sellos y el «507».
- Las transiciones entre fondos son siempre degradados: nunca un corte de claro a oscuro.
- Solo se animan `transform` y `opacity`, y `prefers-reduced-motion` lo desactiva todo.
- Sin scroll horizontal a ningún ancho (≥ 320 px). En móvil, todo en una columna.
- Sin dependencias nuevas en tiempo de ejecución. Swiper **sale**.
- Lighthouse en móvil: rendimiento ≥ 90, accesibilidad ≥ 95, CLS < 0.05.
- **Despliegue:** solo preview. Producción, solo con el OK de Robert.
- **Commits:** en español, formato `tipo(ámbito): …`, terminados con las líneas de atribución vigentes (`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` + `Claude-Session: …`). Push tras cada commit a `feature/un-dia-en-candela`.

## Review Focus

1. **Un visitante con el reloj en otra zona horaria** (turista en Madrid) tiene que ver el estado según la hora de **Miami**, no la suya. Test en la Task 2 (`process.env.TZ`).
2. **Un carrito guardado viejo o roto** (objeto en vez de lista, líneas sin precio o productos del market que ya no existen) no puede romper la página ni cobrar un precio viejo. Tests en la Task 3.
3. **Cambiar de idioma con todo pintado** tiene que actualizar horario, favoritos, cartas, market y los `alt`/`aria-label`, y mantener «hoy» marcado. Tests en la Task 4 (`renderHours` y `renderStatus` en EN) y comprobación en la Task 9.
4. **Sin JavaScript** tienen que verse el texto del hero, las secciones con `.reveal` y un horario, no una página en blanco. Comprobación en la Task 9 (Playwright con JS desactivado).
5. **Móvil estrecho (320 px) con la barra fija:**
   - ningún botón ni el footer pueden quedar tapados;
   - no puede haber scroll horizontal;
   - el menú hamburguesa tiene que funcionar después de hacer scroll.

   Comprobación en la Task 9.

---

### Task 1: Fotos nuevas a WebP

**Files:**
- Create: `tools/convert-un-dia.mjs`
- Create (generados): `web/assets/img/{manana-fachada,manana-tres-golpes,manana-jugo,manana-pastelitos,mediodia-sancocho,mediodia-mesa-caliente,deli-ruben,deli-candela-burger,deli-cheese-steak,deli-chicken-panini,noche-neon,lugar-neon-sub,lugar-terraza,lugar-interior,lugar-flan}-{480,960[,1440]}.webp`

**Interfaces:**
- Produces: los archivos WebP y sus medidas, que se usan como `width`/`height` en las Tasks 4 y 5. Medidas a 480 de ancho:

| slug | 480 | anchos que se generan |
|---|---|---|
| manana-fachada, manana-tres-golpes, manana-jugo, mediodia-sancocho, lugar-neon-sub, lugar-terraza, lugar-flan | 480×640 | 480, 960 |
| manana-pastelitos | 480×480 | 480, 960 |
| mediodia-mesa-caliente | 480×270 | 480, 960, 1440 |
| deli-ruben | 480×720 | 480, 960 |
| deli-candela-burger, deli-cheese-steak, deli-chicken-panini | 480×320 | 480, 960, 1440 |
| noche-neon | 480×701 | 480, 960 |
| lugar-interior | 480×523 | 480, 960 |

- [ ] **Step 1: Instalar sharp en tools/**

Run: `cd "X:/Proyectos/Candela y Cafe Market/tools" && npm install`
Expected: termina sin errores y existe `tools/node_modules/sharp`.

- [ ] **Step 2: Crear `tools/convert-un-dia.mjs`**

```js
// Fotos del rediseño «Un día en Candela» (2026-09-24) → WebP responsive en web/assets/img.
// Originales en _material (fuera del repo). Solo genera anchos ≤ al original (sin ampliar).
import sharp from 'sharp';
import path from 'path';

const SRC = process.env.FOTOS || 'X:/Proyectos/_material/candela-cafe/fotos-2026-09-24';
const OUT = path.resolve(import.meta.dirname, '..', 'web', 'assets', 'img');

const IMAGES = {
  'manana-fachada':         'descargas-24-sep/01 (2).png',
  'manana-tres-golpes':     'descargas-24-sep/01 (9).png',
  'manana-jugo':            'descargas-24-sep/01 (17).png',
  'manana-pastelitos':      'descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.08.jpeg',
  'mediodia-sancocho':      'descargas-24-sep/01 (14).png',
  'mediodia-mesa-caliente': 'descargas-24-sep/01 (7).png',
  'deli-ruben':             'zip-18-sep/A-1.jpg',
  'deli-candela-burger':    'zip-18-sep/E-1.jpg',
  'deli-cheese-steak':      'zip-18-sep/D-1.jpg',
  'deli-chicken-panini':    'zip-18-sep/C-1.jpg',
  'noche-neon':             'descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.31.jpeg',
  'lugar-neon-sub':         'descargas-24-sep/01 (13).png',
  'lugar-terraza':          'descargas-24-sep/01 (16).png',
  'lugar-interior':         'descargas-24-sep/01 (15).png',
  'lugar-flan':             'descargas-24-sep/01 (18).png',
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

- [ ] **Step 3: Ejecutar la conversión**

Run: `cd "X:/Proyectos/Candela y Cafe Market/tools" && node convert-un-dia.mjs`
Expected: 34 líneas `… .webp  WxH  N KB`. Las medidas a 480 tienen que coincidir con la tabla de Interfaces (p. ej. `deli-ruben-480.webp  480x720`) y ninguna pasar de ~180 KB.

- [ ] **Step 4: Commit**

```bash
git add tools/convert-un-dia.mjs web/assets/img/manana-* web/assets/img/mediodia-* web/assets/img/deli-* web/assets/img/noche-* web/assets/img/lugar-*
git commit -m "assets(un-dia): fotos nuevas del cliente en WebP 480/960/1440" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 2: Datos del local y estado «abierto ahora»

**Files:**
- Create: `web/js/site-data.js`
- Create: `web/js/status.js`
- Test: `tests/status.test.mjs`

**Interfaces:**
- Produces (`site-data.js`): `ADDRESS`, `MAPS_DIRECTIONS`, `MAPS_PLACE`, `HOURS` (array 0=dom…6=sáb de `{open:'HH:MM', close:'HH:MM'}` o `null`), `DAYPARTS` (`[{id, from}]`), `GOOGLE` (`{rating, count, asOf, url, reviewUrl}`), `FAVORITES` (`[{id, img, h}]`), `DAILY_MENU` (`{[day:number]: [{en, es}]}`) y `DAY_NIGHT` (`[{id, title, from, to, items:[{en, es}]}]`).
- Produces (`status.js`):
  - `TZ = 'America/New_York'`;
  - `toMin(hhmm) → number`;
  - `zonedNow(date, tz?) → {day, min}`;
  - `statusAt(date, hours, dayparts, tz?) → {open, soon, closesAt, opensAt, opensDay, day, part}`;
  - `fmtTime(hhmm) → '8 am' | '11:30 pm'`.

- [ ] **Step 1: Escribir el test que falla, `tests/status.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusAt, zonedNow, fmtTime } from '../web/js/status.js';
import { HOURS, DAYPARTS } from '../web/js/site-data.js';

const at = iso => statusAt(new Date(iso), HOURS, DAYPARTS);

test('zonedNow usa la hora de Miami (EDT en septiembre)', () => {
  assert.deepEqual(zonedNow(new Date('2026-09-22T11:59:00Z')), { day: 2, min: 7 * 60 + 59 });
});

test('martes 7:59 am: cerrado, abre hoy a las 8', () => {
  const s = at('2026-09-22T11:59:00Z');
  assert.equal(s.open, false);
  assert.equal(s.opensAt, '08:00');
  assert.equal(s.opensDay, 2);
});

test('martes 9:30 pm: abierto, cierra pronto a las 10 pm, franja noche', () => {
  const s = at('2026-09-23T01:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, true);
  assert.equal(s.closesAt, '22:00');
  assert.equal(s.part, 'noche');
});

test('martes 9:00 pm: faltan 60 min, todavía no «cierra pronto»', () => {
  assert.equal(at('2026-09-23T01:00:00Z').soon, false);
});

test('martes 10:00 pm: cerrado, abre el miércoles a las 8', () => {
  const s = at('2026-09-23T02:00:00Z');
  assert.equal(s.open, false);
  assert.equal(s.opensDay, 3);
  assert.equal(s.opensAt, '08:00');
});

test('sábado 11:29 pm: abierto y cierra pronto (11:30 pm)', () => {
  const s = at('2026-09-27T03:29:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, true);
  assert.equal(s.closesAt, '23:30');
});

test('miércoles 12:30 pm: abierto, franja mediodía', () => {
  const s = at('2026-09-23T16:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, false);
  assert.equal(s.part, 'mediodia');
});

test('invierno (EST): martes 7:30 am sigue cerrado', () => {
  // 12:30Z = 7:30 EST. Con un desfase fijo de verano saldría 8:30 y «abierto».
  assert.equal(at('2026-01-13T12:30:00Z').open, false);
});

test('el reloj del visitante no importa: siempre hora de Miami', () => {
  const prev = process.env.TZ;
  process.env.TZ = 'Europe/Madrid';
  try { assert.equal(at('2026-09-23T16:30:00Z').part, 'mediodia'); }
  finally { process.env.TZ = prev; }
});

test('fmtTime', () => {
  assert.equal(fmtTime('08:00'), '8 am');
  assert.equal(fmtTime('23:30'), '11:30 pm');
  assert.equal(fmtTime('12:00'), '12 pm');
  assert.equal(fmtTime('00:15'), '12:15 am');
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

Run: `cd "X:/Proyectos/Candela y Cafe Market" && node --test tests/status.test.mjs`
Expected: FAIL con `Cannot find module '…/web/js/status.js'`.

- [ ] **Step 3: Crear `web/js/site-data.js`**

```js
// Datos del local — ÚNICA fuente de horario, franjas del día, Google, favoritos y cartas.
// Los usan «Ahora en Candela», la tabla de Visítanos y el test de coherencia del JSON-LD.

export const ADDRESS = { street: '507 N Miami Ave', city: 'Downtown Miami, FL 33136' };
export const MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136';
export const MAPS_PLACE = 'https://www.google.com/maps/search/?api=1&query=Candela+y+Caf%C3%A9+Market%2C+507+N+Miami+Ave%2C+Miami%2C+FL';

// 0 = domingo … 6 = sábado. null = cerrado. Sin cierres después de medianoche.
export const HOURS = [
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
];

// Franjas del día, en orden. Coinciden con los carteles de cada sección.
export const DAYPARTS = [
  { id: 'manana',   from: '08:00' },
  { id: 'mediodia', from: '12:00' },
  { id: 'tarde',    from: '15:00' },
  { id: 'noche',    from: '19:00' },
];

// Nota real del Perfil de Google. Se actualiza a mano, con su fecha.
export const GOOGLE = { rating: 4.6, count: 136, asOf: '2026-07-27', url: MAPS_PLACE, reviewUrl: MAPS_PLACE };

// Favoritos del deli: id de MENU + foto nueva (h = alto de la variante de 480).
export const FAVORITES = [
  { id: 'ny-the-ruben-sandwich',     img: 'deli-ruben',          h: 720 },
  { id: 'bg-candela-burger',         img: 'deli-candela-burger', h: 320 },
  { id: 'ny-phili-cheese-steak',     img: 'deli-cheese-steak',   h: 320 },
  { id: 'pn-grilled-chicken-panini', img: 'deli-chicken-panini', h: 320 },
];

// Mesa caliente por día de la semana (0 = dom), p. ej. { 3: [{ en: 'Beef stew', es: 'Carne guisada' }] }.
// ⚠ La rellena el cliente. Vacío = se muestra el especial del día. NUNCA poner platos inventados.
export const DAILY_MENU = {};

// Cartas «Coffee now» / «Wine later». ⚠ Líneas y horas a confirmar con el cliente antes de publicar.
export const DAY_NIGHT = [
  { id: 'day', title: 'Coffee now', from: '08:00', to: '19:00', items: [
    { en: 'Espresso & cortadito', es: 'Espresso y cortadito' },
    { en: 'Cappuccino & latte',   es: 'Cappuccino y latte' },
    { en: 'Fresh juices',         es: 'Jugos naturales' },
  ] },
  { id: 'night', title: 'Wine later', from: '19:00', to: 'close', items: [
    { en: 'Red, white & rosé wine', es: 'Vino tinto, blanco y rosado' },
    { en: 'By the glass or bottle', es: 'Por copa o por botella' },
    { en: 'Cold beers',             es: 'Cervezas frías' },
    { en: 'Coffee until close',     es: 'Café hasta el cierre' },
  ] },
];
```

- [ ] **Step 4: Crear `web/js/status.js`**

```js
// «Ahora en Candela»: estado del local según la hora de Miami. Puro y testeable.
export const TZ = 'America/New_York';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Día (0 = dom) y minutos desde medianoche en la zona `tz`, sea cual sea la del visitante. */
export function zonedNow(date, tz = TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  return { day: DAYS.indexOf(get('weekday')), min: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** { open, soon (< 60 min para cerrar), closesAt, opensAt, opensDay, day, part } */
export function statusAt(date, hours, dayparts, tz = TZ) {
  const { day, min } = zonedNow(date, tz);
  const today = hours[day];
  if (today && min >= toMin(today.open) && min < toMin(today.close)) {
    const part = dayparts.filter(p => min >= toMin(p.from)).pop()?.id ?? dayparts[0].id;
    return { open: true, soon: toMin(today.close) - min < 60, closesAt: today.close, opensAt: null, opensDay: null, day, part };
  }
  let opensDay = null;
  if (today && min < toMin(today.open)) opensDay = day;
  else for (let i = 1; i <= 7; i++) { const d = (day + i) % 7; if (hours[d]) { opensDay = d; break; } }
  return { open: false, soon: false, closesAt: null, opensAt: opensDay === null ? null : hours[opensDay].open, opensDay, day, part: null };
}

/** '08:00' → '8 am' · '23:30' → '11:30 pm'. Mismo formato en EN y ES. */
export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1, ap = h < 12 ? 'am' : 'pm';
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
}
```

- [ ] **Step 5: Ejecutar los tests y ver que pasan**

Run: `node --test tests/status.test.mjs`
Expected: PASS, 10/10.

- [ ] **Step 6: Commit**

```bash
git add web/js/site-data.js web/js/status.js tests/status.test.mjs
git commit -m "feat(un-dia): datos del local y estado «abierto ahora» con hora de Miami" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 3: Carrito robusto y mensajes de WhatsApp por idioma

**Files:**
- Modify: `web/js/cart-core.js` (archivo entero, 43 líneas)
- Test: `tests/cart-core.test.mjs` (se amplía; se ajustan los 2 tests de reserva)

**Interfaces:**
- Produces:
  - `createCart(serialized)`: ignora lo que no sea una lista y las líneas mal formadas (#17).
  - Métodos nuevos del carrito: `load(serialized)` y `revalidate(lookup)`, donde `lookup(id) → {name, price} | null` (#5 y #17).
  - `waUrl(phone, text) → string`.
  - `buildReservationUrl(data, phone, lang = 'es')`, con plantilla por idioma y plural (#11).
  - Se mantienen `buildWaUrl(cart, phone, greeting)`, `count()`, `total()` y `serialize()`.
  - «¿Lo tienes?» del market (spec §6.6) = `waUrl(PHONE, t('day.market.askmsg'))`. No hace falta una función aparte.

- [ ] **Step 1: Escribir los tests que fallan, al final de `tests/cart-core.test.mjs`**

Cambia también los dos tests de reserva que ya existen: el tercer argumento pasa a ser el idioma (`'es'`).

```js
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
```

Los dos tests de reserva existentes quedan así:

```js
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
```

- [ ] **Step 2: Ejecutarlos y ver que fallan**

Run: `node --test tests/cart-core.test.mjs`
Expected: FAIL. `waUrl` no se exporta, `c.load is not a function`, `lines.reduce is not a function` y el mensaje en inglés sale con «del … a las».

- [ ] **Step 3: Reescribir `web/js/cart-core.js`**

```js
// Núcleo puro del carrito — sin DOM. Testeado en tests/cart-core.test.mjs.
const validLine = l => !!l && typeof l.id === 'string' && typeof l.name === 'string'
  && Number.isFinite(l.price) && l.price >= 0 && Number.isInteger(l.qty) && l.qty > 0;

/** Lo guardado solo vale si es una lista de líneas válidas (#17). */
function parseLines(serialized) {
  if (!serialized) return [];
  try {
    const v = JSON.parse(serialized);
    return Array.isArray(v) ? v.filter(validLine).map(l => ({ id: l.id, name: l.name, price: l.price, qty: l.qty })) : [];
  } catch { return []; }
}

export function createCart(serialized) {
  let lines = parseLines(serialized);
  const find = id => lines.find(l => l.id === id);
  return {
    add(item) {
      const l = find(item.id);
      if (l) l.qty += 1;
      else lines.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    },
    setQty(id, qty) {
      const l = find(id);
      if (!l) return;
      l.qty = qty;
      if (l.qty <= 0) lines = lines.filter(x => x.id !== id);
    },
    /** Sustituye el contenido por lo guardado en otra pestaña o al volver atrás (#5). */
    load(s) { lines = parseLines(s); },
    /** Toma nombre y precio de la carta actual y quita lo que ya no existe o no tiene precio (#17). */
    revalidate(lookup) {
      lines = lines.flatMap(l => {
        const it = lookup(l.id);
        return it && it.price > 0 ? [{ ...l, name: it.name, price: it.price }] : [];
      });
    },
    lines: () => lines.map(l => ({ ...l })),
    count: () => lines.reduce((n, l) => n + l.qty, 0),
    total: () => Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100,
    clear() { lines = []; },
    serialize: () => JSON.stringify(lines),
  };
}

export const waUrl = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export function buildWaUrl(cart, phone, greeting) {
  const fmt = n => `$${n.toFixed(2)}`;
  const body = cart.lines().map(l => `${l.qty}x ${l.name} — ${fmt(l.price * l.qty)}`).join('\n');
  return waUrl(phone, `${greeting}\n\n${body}\n\nTotal: ${fmt(cart.total())}`);
}

// Mensaje de reserva (música en vivo) por idioma, con plural (#11).
const RES = {
  es: { head: (d, t, n) => `¡Hola Candela & Café! Quiero reservar para la música en vivo del ${d} a las ${t}, para ${n} ${n === 1 ? 'persona' : 'personas'}.`, name: 'Nombre', tel: 'Tel' },
  en: { head: (d, t, n) => `Hi Candela & Café! I'd like to reserve for live music on ${d} at ${t}, for ${n} ${n === 1 ? 'person' : 'people'}.`, name: 'Name', tel: 'Phone' },
};

export function buildReservationUrl(data, phone, lang = 'es') {
  const R = RES[lang] || RES.es;
  const { day, time, guests, name, phone: tel } = data;
  let msg = R.head(day, time, guests);
  if (name) msg += ` ${R.name}: ${name}.`;
  if (tel) msg += ` ${R.tel}: ${tel}.`;
  return waUrl(phone, msg);
}
```

- [ ] **Step 4: Ejecutar los tests y ver que pasan**

Run: `node --test tests/cart-core.test.mjs`
Expected: PASS, 14/14.

- [ ] **Step 5: Commit**

```bash
git add web/js/cart-core.js tests/cart-core.test.mjs
git commit -m "fix(carrito): validar lo guardado, recargar entre pestañas y reserva por idioma (#5 #11 #17)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 4: Renderers de las secciones, vitrina del market y textos

**Files:**
- Create: `web/js/sections.js`
- Modify: `web/js/market-data.js` (archivo entero)
- Modify: `web/js/i18n.js`: se añaden claves a `DICT`, se borran las muertas (Step 5) y `apply()` gana `data-i18n-alt`, `data-i18n-aria` y el `aria-label` del selector de idioma
- Test: `tests/sections.test.mjs`

**Interfaces:**
- Consumes: `DICT` (i18n.js), `MENU` y `DAILY_SPECIAL` (menu-data.js), `fmtTime` (status.js) y las formas de `site-data.js` (Task 2).
- Produces (`sections.js`), todas puras y devolviendo HTML en texto:
  - `esc(s)`;
  - `findItem(id) → {cat, item} | null`;
  - `renderFavorites(favs, lang)`;
  - `renderMarket(cats, lang)`;
  - `renderArches(dayNight, lang)`;
  - `renderBoard(daily, weekday, lang)`;
  - `renderHours(hours, today, lang)`;
  - `renderStatus(st, lang) → {cls, text}`;
  - `burstSvg(color)`.
- Produces (`market-data.js`): `MARKET_CATEGORIES = [{id, img, h, name:{en,es}, examples:{en,es}}]`. **Sin precios.**

- [ ] **Step 1: Escribir el test que falla, `tests/sections.test.mjs`**

```js
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

test('renderFavorites: 4 tarjetas con nombre, precio real y enlace a su categoría', () => {
  const html = renderFavorites(FAVORITES, 'es');
  assert.equal(count(html, 'class="fav"'), 4);
  assert.match(html, /The Ruben Sandwich/);
  assert.match(html, /\$15\.49/);
  assert.match(html, /href="menu\.html#ny-signature"/);
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
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

Run: `node --test tests/sections.test.mjs`
Expected: FAIL con `Cannot find module '…/web/js/sections.js'`.

- [ ] **Step 3: Reescribir `web/js/market-data.js`**

```js
// Market = VITRINA (sin carrito ni precios). Decisión de Robert, 2026-09-24.
// ⚠ Categorías y ejemplos a confirmar con el cliente. Las fotos mk-* son PROVISIONALES
//   (stock) hasta tener las de las estanterías reales. h = alto de la variante de 480.
export const MARKET_CATEGORIES = [
  { id: 'despensa',  img: 'mk-despensa', h: 360, name: { en: 'Pantry',      es: 'Despensa' },          examples: { en: 'rice, beans, pasta',      es: 'arroz, habichuelas, pasta' } },
  { id: 'basicos',   img: 'mk-aceite',   h: 666, name: { en: 'Staples',     es: 'Básicos' },           examples: { en: 'oil, salt, spices',       es: 'aceite, sal, especias' } },
  { id: 'desayuno',  img: 'mk-cereal',   h: 360, name: { en: 'Breakfast',   es: 'Desayuno' },          examples: { en: 'cereal, milk, bread',     es: 'cereales, leche, pan' } },
  { id: 'frescos',   img: 'mk-frutas',   h: 360, name: { en: 'Fruit & veg', es: 'Frutas y verduras' }, examples: { en: 'plantain, yuca, avocado', es: 'plátano, yuca, aguacate' } },
  { id: 'naturales', img: 'mk-verdes',   h: 320, name: { en: 'Natural',     es: 'Naturales' },         examples: { en: 'natural products',        es: 'productos naturales' } },
  { id: 'cafe',      img: 'mk-cafe',     h: 320, name: { en: 'Coffee',      es: 'Café' },              examples: { en: 'to take home',            es: 'para llevar a casa' } },
];
```

- [ ] **Step 4: Crear `web/js/sections.js`**

```js
// Secciones dinámicas de la portada «Un día en Candela». Funciones PURAS: devuelven HTML
// en texto (testeadas en tests/sections.test.mjs). Todo dato pasa por esc().
import { DICT } from './i18n.js';
import { MENU, DAILY_SPECIAL } from './menu-data.js';
import { fmtTime } from './status.js';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const tx = (key, lang) => (DICT[key] && DICT[key][lang]) || key;

const DAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
};
const WEEK_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0];

export function findItem(id) {
  for (const [cat, items] of Object.entries(MENU)) {
    const item = items.find(i => i.id === id);
    if (item) return { cat, item };
  }
  return null;
}

export function renderFavorites(favs, lang) {
  return favs.map(f => {
    const hit = findItem(f.id);
    if (!hit) return '';
    const { cat, item } = hit;
    const src = `assets/img/${esc(f.img)}`;
    return `<a class="fav" href="menu.html#${esc(cat)}">`
      + `<span class="fav-ph"><img src="${src}-480.webp" srcset="${src}-480.webp 480w, ${src}-960.webp 960w" sizes="(max-width:768px) 45vw, 280px" alt="${esc(item.name)}" loading="lazy" width="480" height="${Number(f.h)}"></span>`
      + `<span class="fav-n">${esc(item.name)}</span>`
      + `<span class="fav-d">${esc(item.desc ? item.desc[lang] : '')}</span>`
      + `<span class="fav-p">$${item.price.toFixed(2)}</span></a>`;
  }).join('');
}

export function renderMarket(cats, lang) {
  return cats.map(c => `<figure class="tile"><img src="assets/img/${esc(c.img)}-480.webp" alt="" loading="lazy" width="480" height="${Number(c.h)}">`
    + `<figcaption><b>${esc(c.name[lang])}</b><span>${esc(c.examples[lang])}</span></figcaption></figure>`).join('');
}

export function renderArches(list, lang) {
  return list.map(a => {
    const to = a.to === 'close' ? tx('nightmenu.close', lang) : fmtTime(a.to);
    return `<article class="arch arch--${esc(a.id)}"><h3>${esc(a.title)}</h3>`
      + `<p class="arch-hrs">${esc(fmtTime(a.from))} – ${esc(to)}</p>`
      + `<ul>${a.items.map(i => `<li>${esc(i[lang])}</li>`).join('')}</ul></article>`;
  }).join('');
}

export function renderBoard(daily, weekday, lang) {
  const dishes = daily[weekday];
  if (!dishes || !dishes.length) return `<p class="board-special">${esc(DAILY_SPECIAL[lang])}</p>`;
  return `<ul>${dishes.map(d => `<li>${esc(d[lang])}</li>`).join('')}</ul>`;
}

export function renderHours(hours, today, lang) {
  return WEEK_FROM_MONDAY.map(d => {
    const h = hours[d];
    let label = DAY_NAMES[lang][d];
    if (d === 5) label += ` · ${tx('visit.livemusic', lang)}`;
    if (d === today) label = `${tx('visit.today', lang)} · ${label}`;
    const time = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : tx('visit.closed', lang);
    return `<tr${d === today ? ' class="today" aria-current="date"' : ''}><th scope="row">${esc(label)}</th><td>${esc(time)}</td></tr>`;
  }).join('');
}

export function renderStatus(st, lang) {
  if (st.open && st.soon) return { cls: 'is-soon', text: `${tx('now.soon', lang)} · ${tx('now.closesat', lang)} ${fmtTime(st.closesAt)}` };
  if (st.open) return { cls: 'is-open', text: `${tx('now.open', lang)} · ${tx('now.until', lang)} ${fmtTime(st.closesAt)}` };
  const when = st.opensDay === st.day ? tx('now.today', lang)
    : st.opensDay === (st.day + 1) % 7 ? tx('now.tomorrow', lang)
    : `${DAY_NAMES[lang][st.opensDay]} ${tx('now.at', lang)}`;
  return { cls: 'is-closed', text: `${tx('now.closed', lang)} · ${tx('now.opens', lang)} ${when} ${fmtTime(st.opensAt)}` };
}

/** Sello de estrella (starburst) de 22 puntas, como los stickers de Frank's. */
export function burstSvg(color) {
  const n = 22, R = 100, r = 88, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI * i / n, rad = i % 2 ? r : R;
    pts.push(`${(100 + rad * Math.cos(a)).toFixed(1)},${(100 + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}" fill="${esc(color)}"/>`
    + '<circle cx="100" cy="100" r="74" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 6"/></svg>';
}
```

- [ ] **Step 5: Actualizar `web/js/i18n.js`**

(a) **Borra** de `DICT` estas claves muertas, que solo usaban las secciones que se van:
- `nav.music`, `nav.catering`, `nav.history`;
- `hero.kicker`, `hero.title.1`, `hero.title.2`, `hero.cta.music`, `hero.hours`;
- todas las `about.*`, `teaser.*`, `catering.*`, `gallery.*` y `hist.*`;
- `music.kicker`, `music.title`, `music.body`, `music.cta`, `music.wa`, `music.p1`, `music.p2`;
- `market.kicker`, `market.title`, `market.body`, `market.title.a`, `market.title.b`, `market.sub`, `market.cta`, `market.add`, `market.instore`;
- `reviews.kicker`, `reviews.title`, `reviews.title.a`, `reviews.title.b`, `reviews.rating`;
- `visit.title`, `visit.title.a`, `visit.title.b`, `visit.hours.1`, `visit.hours.2`, `visit.h1`, `visit.h2`;
- `menu.kicker`, `menu.title.a`, `menu.title.b`.

Se quedan: `music.p3`, `reviews.write`, `visit.kicker`, `visit.hours.title`, `visit.call`, `visit.directions`, `res.*`, `cart.*`, `wa.greeting`, `noscript`, `menu.title`, `menu.sub`, `footer.*`, `nav.menu`, `nav.market`, `nav.visit`, `nav.order`, `hero.title`, `hero.sub`, `hero.cta.order` y `hero.cta.menu`.

(b) **Añade** antes del `};` que cierra `DICT`:

```js
  /* ============ «Un día en Candela» (2026-09-24) ============ */
  'nav.nights':        { en: 'Nights', es: 'Noches' },
  'nav.burger':        { en: 'Open menu', es: 'Abrir menú' },
  'lang.switch':       { en: 'Ver en español', es: 'View in English' },
  'modal.close':       { en: 'Close', es: 'Cerrar' },
  'wa.hello':          { en: 'Hi Candela & Café!', es: '¡Hola Candela & Café!' },
  'now.fallback':      { en: 'Open daily from 8 am', es: 'Abierto todos los días desde las 8 am' },
  'now.open':          { en: 'Open now', es: 'Abierto ahora' },
  'now.until':         { en: 'until', es: 'hasta las' },
  'now.soon':          { en: 'Closing soon', es: 'Cierra pronto' },
  'now.closesat':      { en: 'at', es: 'a las' },
  'now.closed':        { en: 'Closed', es: 'Cerrado' },
  'now.opens':         { en: 'opens', es: 'abrimos' },
  'now.today':         { en: 'today at', es: 'hoy a las' },
  'now.tomorrow':      { en: 'tomorrow at', es: 'mañana a las' },
  'now.at':            { en: 'at', es: 'a las' },
  'day.morning.sign':  { en: '8:00 am · Coffee now', es: '8:00 am · Coffee now' },
  'day.morning.w1':    { en: 'Coffee.', es: 'Café.' },
  'day.morning.w2':    { en: 'Juices.', es: 'Jugos.' },
  'day.morning.w3':    { en: 'Breakfast.', es: 'Desayuno.' },
  'day.morning.body':  { en: 'Coffee, cortadito and fresh juices. New York breakfasts — pancakes, omelettes, bacon, egg & cheese — and empanadas fresh out of the oven.',
                         es: 'Café, cortadito y jugos naturales. Desayunos de Nueva York —pancakes, omelettes, bacon, egg & cheese— y empanadas recién hechas.' },
  'day.morning.juices':{ en: 'Fresh juices', es: 'Jugos naturales' },
  'day.morning.cta':   { en: 'See breakfast', es: 'Ver desayunos' },
  'day.morning.burst': { en: 'Open 8 am', es: 'Abrimos 8 am' },
  'day.morning.alt':   { en: 'Breakfast plate at the door of 507 N Miami Ave', es: 'Plato de desayuno en la puerta del 507 N Miami Ave' },
  'day.midday.sign':   { en: '12:00 pm · Midday', es: '12:00 pm · Mediodía' },
  'day.midday.title':  { en: "Today's food.", es: 'La comida del día.' },
  'day.midday.body':   { en: 'The hot table: Dominican food made today, just like home. Ask about the special.',
                         es: 'La mesa caliente: comida dominicana hecha hoy, como en casa. Pregunta por el especial.' },
  'day.midday.cta':    { en: "What's on today", es: 'Qué hay hoy' },
  'day.midday.wa':     { en: 'Order on WhatsApp', es: 'Pedir por WhatsApp' },
  'day.midday.burst':  { en: 'Made today', es: 'Hecho hoy' },
  'day.midday.alt':    { en: 'Bowl of sancocho with white rice and avocado', es: 'Plato de sancocho con arroz blanco y aguacate' },
  'day.board.title':   { en: 'Today at the hot table', es: 'Hoy en la mesa caliente' },
  'day.board.sub':     { en: 'Changes every day', es: 'Cambia cada día' },
  'day.board.alt':     { en: "The hot table with today's trays", es: 'La mesa caliente con las bandejas del día' },
  'day.favs.sign':     { en: 'From the New York deli', es: 'Del deli de Nueva York' },
  'day.favs.title':    { en: 'The favorites', es: 'Los favoritos' },
  'day.favs.cta':      { en: 'See the full menu →', es: 'Ver el menú completo →' },
  'day.market.sign':   { en: '3:00 pm · Afternoon', es: '3:00 pm · Tarde' },
  'day.market.title':  { en: 'The market.', es: 'El market.' },
  'day.market.body':   { en: "The house basics, around the corner: pantry, fruit and veg, natural products and everyday essentials. If you don't see it, ask us.",
                         es: 'Lo básico de la casa, a la vuelta de la esquina: despensa, frutas y verduras, productos naturales y lo del día a día. Si no lo ves, pregúntanos.' },
  'day.market.cta':    { en: 'Got it? Ask on WhatsApp', es: '¿Lo tienes? Pregunta por WhatsApp' },
  'day.market.note':   { en: "Come by and pick it up — we're open every day from 8 am.", es: 'Pasa a buscarlo: abrimos todos los días desde las 8 am.' },
  'day.market.askmsg': { en: 'Hi Candela & Café! Do you have … at the market?', es: '¡Hola Candela & Café! ¿Tienen … en el market?' },
  'day.night.sign':    { en: '7:00 pm · Night', es: '7:00 pm · Noche' },
  'day.night.body':    { en: "Wine, coffee until close and good music. On Fridays, it's live.", es: 'Vino, café hasta el cierre y buena música. Los viernes, en vivo.' },
  'day.night.reserve': { en: 'Reserve a table', es: 'Reservar mesa' },
  'day.night.cta':     { en: 'See the night menu', es: 'Ver la carta de noche' },
  'day.night.stamp':   { en: 'EVERY FRIDAY · LIVE MUSIC · ', es: 'TODOS LOS VIERNES · MÚSICA EN VIVO · ' },
  'day.night.live':    { en: 'live', es: 'en vivo' },
  'day.night.alt':     { en: 'The «Coffee now, Wine later» neon over the red banquette', es: 'El neón «Coffee now, Wine later» sobre el banco rojo' },
  'nightmenu.close':   { en: 'close', es: 'cierre' },
  'day.music.title':   { en: 'Live music.', es: 'Música en vivo.' },
  'day.music.p1':      { en: 'Fridays', es: 'Viernes' },
  'day.place.sign':    { en: 'The place', es: 'El lugar' },
  'day.place.title.a': { en: 'Come', es: 'Ven a' },
  'day.place.title.b': { en: 'see it.', es: 'verlo.' },
  'day.place.alt1':    { en: 'Boar\'s Head sub under the neon sign', es: 'Sub de Boar\'s Head bajo el neón' },
  'day.place.alt2':    { en: 'Philly cheesesteak on the terrace', es: 'Philly cheesesteak en la terraza' },
  'day.place.alt3':    { en: 'Prosciutto sandwich by the red banquette', es: 'Sándwich de prosciutto junto al banco rojo' },
  'day.place.alt4':    { en: 'Flan on the terrace', es: 'Flan en la terraza' },
  'day.place.ongoogle':{ en: 'on Google', es: 'en Google' },
  'day.place.reviews': { en: 'reviews on Google.', es: 'reseñas en Google.' },
  'day.place.body':    { en: 'What the neighborhood says, straight from our Google profile.', es: 'Lo que dice el barrio, directo de nuestro perfil de Google.' },
  'day.place.read':    { en: 'Read the reviews', es: 'Leer las reseñas' },
  'visit.today':       { en: 'Today', es: 'Hoy' },
  'visit.closed':      { en: 'Closed', es: 'Cerrado' },
  'visit.livemusic':   { en: 'live music', es: 'música en vivo' },
  'visit.fallback1':   { en: 'Sun–Tue · 8 am – 10 pm', es: 'Dom–Mar · 8 am – 10 pm' },
  'visit.fallback2':   { en: 'Wed–Sat · 8 am – 11:30 pm', es: 'Mié–Sáb · 8 am – 11:30 pm' },
  'mbar.label':        { en: 'Quick actions', es: 'Acciones rápidas' },
  'mbar.go':           { en: 'Directions', es: 'Cómo llegar' },
  'mbar.call':         { en: 'Call', es: 'Llamar' },
```

(c) **Reemplaza** `apply()` por:

```js
export function apply() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { const e = DICT[el.dataset.i18n]; if (e) el.textContent = e[lang]; });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { const e = DICT[el.dataset.i18nAlt]; if (e) el.alt = e[lang]; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { const e = DICT[el.dataset.i18nAria]; if (e) el.setAttribute('aria-label', e[lang]); });
  document.querySelectorAll('.lang-toggle').forEach(b => {
    b.textContent = lang === 'en' ? 'ES' : 'EN';
    b.setAttribute('aria-label', DICT['lang.switch'][lang]);
    b.setAttribute('lang', lang === 'en' ? 'es' : 'en');
  });
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}
```

- [ ] **Step 6: Ejecutar los tests y ver que pasan**

Run: `node --test tests/sections.test.mjs`
Expected: PASS, 10/10.

Run: `node --test`
Expected: pasan todos los de las Tasks 2–4, 34 en total.

- [ ] **Step 7: Commit**

```bash
git add web/js/sections.js web/js/market-data.js web/js/i18n.js tests/sections.test.mjs
git commit -m "feat(un-dia): renderers de secciones, market vitrina y textos EN/ES" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5: La portada nueva (HTML, CSS y cableado)

**Files:**
- Modify: `web/index.html`, reescrito entero. El bloque `<header class="hero">` se copia igual; sus arreglos van en la Task 6.
- Create: `web/css/sections.css`
- Modify: `web/css/base.css`: tokens, `.sr-only` y `.sec .btn`
- Modify: `web/css/landing.css`: se quedan solo HERO (líneas 1-51) y MODAL (líneas 193-218); se borra lo demás
- Create: `web/js/nav.js`, `web/js/focus-trap.js`, `web/js/hero.js` (código del hero movido **tal cual** desde `landing.js` líneas 84-176)
- Modify: `web/js/landing.js`, reescrito entero
- Test: `tests/site-consistency.test.mjs`

**Interfaces:**
- Consumes: todo lo de las Tasks 2–4.
- Produces:
  - `initNav()` (nav.js);
  - `trapFocus(container) → release()` (focus-trap.js);
  - `initHero()` (hero.js).
  - IDs del DOM que lee `landing.js`: `now`, `nowState`, `favs`, `board`, `shelf`, `cartas`, `middayWa`, `marketAsk`, `visitWa`, `gRating`, `gReviews`, `gRead`, `gWrite`, `hoursBody`, `mbar`, `visit`, `resModal`, `resDate`, `resTime`, `resName`, `resPhone`, `gCount`, `gPlus`, `gMinus` y `resGo`.

- [ ] **Step 1: Escribir el test que falla, `tests/site-consistency.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DICT } from '../web/js/i18n.js';
import { HOURS, GOOGLE } from '../web/js/site-data.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const INDEX = read('web/index.html'), MENUP = read('web/menu.html');

test('JSON-LD: el horario coincide con HOURS', () => {
  const ld = JSON.parse(INDEX.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const seen = new Set();
  for (const spec of ld.openingHoursSpecification) for (const day of spec.dayOfWeek) {
    const i = names.indexOf(day);
    assert.deepEqual({ open: spec.opens, close: spec.closes }, HOURS[i], day);
    seen.add(i);
  }
  assert.equal(seen.size, 7);
  assert.equal(ld.hasMenu, 'https://candelaycafe.com/menu');
  assert.ok(ld.geo && ld.url && ld.priceRange);
});

test('La nota de Google del HTML (sin JS) es la de site-data', () => {
  assert.match(INDEX, new RegExp(`id="gRating">${GOOGLE.rating}<`));
  assert.match(INDEX, new RegExp(`id="gReviews">${GOOGLE.count}<`));
});

test('i18n: toda clave usada existe en EN y en ES', () => {
  const keys = new Set();
  for (const html of [INDEX, MENUP]) for (const m of html.matchAll(/data-i18n(?:-alt|-aria)?="([^"]+)"/g)) keys.add(m[1]);
  for (const f of readdirSync(new URL('../web/js/', import.meta.url))) {
    for (const m of read(`web/js/${f}`).matchAll(/\b(?:t|tx)\('([\w.-]+)'/g)) keys.add(m[1]);
  }
  const missing = [...keys].filter(k => !DICT[k] || !DICT[k].en || !DICT[k].es);
  assert.deepEqual(missing, []);
});

test('La portada ya no carga Swiper ni tiene reseñas de ejemplo', () => {
  assert.doesNotMatch(INDEX, /swiper/i);
  assert.doesNotMatch(INDEX, /Jonathan R\.|Carla M\.|Luis D\./);
});
```

- [ ] **Step 2: Ejecutarlo y ver que falla**

Run: `node --test tests/site-consistency.test.mjs`
Expected: FAIL. `ld.hasMenu` es `undefined`, no hay `gRating`, faltan claves (`menu.cta`, `visit.dir`) y aparece «swiper».

- [ ] **Step 3: Crear `web/js/nav.js` y `web/js/focus-trap.js`**

```js
// web/js/nav.js — barra de navegación compartida (portada y menú).
export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const set = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', () => set(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) { set(false); burger.focus(); }
  });
}
```

```js
// web/js/focus-trap.js — mantiene el foco dentro de un diálogo mientras está abierto (#16).
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container) {
  const onKey = e => {
    if (e.key !== 'Tab') return;
    const els = [...container.querySelectorAll(FOCUSABLE)].filter(el => el.getClientRects().length);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}
```

- [ ] **Step 4: Crear `web/js/hero.js`, moviendo el código del hero sin cambiar su comportamiento**

```js
// Hero (diseño aprobado el 2026-06-10): entrada del texto, flotación, plato giratorio,
// parallax y chispas. Movido desde landing.js; los arreglos (#13 #21) llegan en la Task 6.
export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  sparks(hero);
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from('.hero-copy > *', { y: 34, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out' });
  [['.dec-chips', 12, 3.6], ['.dec-leaf-a', 10, 2.8], ['.dec-leaf-b', 9, 3.2]].forEach(([sel, amp, dur]) =>
    gsap.to(sel, { y: -amp, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  gsap.to('#platterDisc', { rotation: 360, duration: 48, repeat: -1, ease: 'none' });
  parallax(hero);
}

function parallax(hero) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const movers = [
    ['.dec-chips', 26, 0], ['.dec-leaf-a', 30, 0], ['.dec-leaf-b', 22, 0],
    ['.dec-drink', 16, 10], ['.dec-ringburger', 18, 12], ['.dec-burger', 16, 10],
  ].map(([sel, fx, fy]) => {
    const el = document.querySelector(sel);
    return el && { fx, fy, x: gsap.quickTo(el, 'x', { duration: .7, ease: 'power2.out' }), y: fy ? gsap.quickTo(el, 'y', { duration: .7, ease: 'power2.out' }) : null };
  }).filter(Boolean);
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    movers.forEach(m => { m.x(nx * m.fx); if (m.y) m.y(ny * m.fy); });
  }, { passive: true });
  hero.addEventListener('mouseleave', () => movers.forEach(m => { m.x(0); if (m.y) m.y(0); }), { passive: true });
}

function sparks(hero) {
  const cv = document.getElementById('heroSparks');
  if (!cv || !matchMedia('(hover: hover) and (pointer: fine)').matches
    || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = cv.getContext('2d');
  let W, H;
  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit(); addEventListener('resize', fit, { passive: true });
  const P = [], COLORS = ['255,155,64', '255,90,60', '255,210,122'];
  let lx = -1, ly = -1, raf = 0, visible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }).observe(hero);
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (lx < 0 || Math.hypot(x - lx, y - ly) > 13) {
      lx = x; ly = y;
      for (let i = 0; i < 2 && P.length < 90; i++) P.push({
        x, y, vx: (Math.random() - .5) * 1.1, vy: -.4 - Math.random() * 1.1,
        r: 1.2 + Math.random() * 2.2, a: 1, d: .012 + Math.random() * .02, c: COLORS[Math.random() * 3 | 0],
      });
    }
  }, { passive: true });
  document.querySelectorAll('.hbtn').forEach(btn => {
    let iv = 0;
    btn.addEventListener('mouseenter', () => {
      iv = setInterval(() => {
        if (P.length >= 90) return;
        const br = btn.getBoundingClientRect(), hr = hero.getBoundingClientRect();
        P.push({
          x: br.left - hr.left + 6 + Math.random() * (br.width - 12), y: br.top - hr.top + 2,
          vx: (Math.random() - .5) * .7, vy: -.5 - Math.random() * .8,
          r: .8 + Math.random() * 1.3, a: 1, d: .022 + Math.random() * .025, c: COLORS[Math.random() * 3 | 0],
        });
      }, 150);
    });
    btn.addEventListener('mouseleave', () => clearInterval(iv));
  });
  function tick() {
    raf = 0; ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.x += p.vx; p.y += p.vy; p.vy -= .008; p.vx += (Math.random() - .5) * .08; p.a -= p.d;
      if (p.a <= 0) { P.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 7); ctx.fill();
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}
```

- [ ] **Step 5: Reescribir `web/js/landing.js`**

```js
// Portada «Un día en Candela» (2026-09). Spec: docs/superpowers/specs/2026-09-24-candela-un-dia-design.md
import { initLangToggle, t, getLang } from './i18n.js';
import { PHONE } from './menu-data.js';
import { MARKET_CATEGORIES } from './market-data.js';
import { HOURS, DAYPARTS, FAVORITES, DAILY_MENU, DAY_NIGHT, GOOGLE } from './site-data.js';
import { statusAt } from './status.js';
import { renderFavorites, renderMarket, renderArches, renderBoard, renderHours, renderStatus, burstSvg } from './sections.js';
import { buildReservationUrl, waUrl } from './cart-core.js';
import { initNav } from './nav.js';
import { trapFocus } from './focus-trap.js';
import { initHero } from './hero.js';

initLangToggle();
initNav();
const $ = id => document.getElementById(id);

/* ── «Ahora en Candela», horario y mesa caliente (hora de Miami) ── */
function updateNow() {
  const lang = getLang();
  const st = statusAt(new Date(), HOURS, DAYPARTS);
  const { cls, text } = renderStatus(st, lang);
  const bar = $('now');
  bar.classList.remove('is-open', 'is-soon', 'is-closed');
  bar.classList.add(cls);
  $('nowState').textContent = text;
  $('hoursBody').innerHTML = renderHours(HOURS, st.day, lang);
  $('board').innerHTML = renderBoard(DAILY_MENU, st.day, lang);
}

/* ── contenido que cambia con el idioma ───────────────────── */
function renderAll() {
  const lang = getLang();
  $('favs').innerHTML = renderFavorites(FAVORITES, lang);
  $('shelf').innerHTML = renderMarket(MARKET_CATEGORIES, lang);
  $('cartas').innerHTML = renderArches(DAY_NIGHT, lang);
  $('middayWa').href = waUrl(PHONE, t('wa.greeting'));
  $('marketAsk').href = waUrl(PHONE, t('day.market.askmsg'));
  $('visitWa').href = waUrl(PHONE, t('wa.hello'));
  updateNow();
}
renderAll();
document.addEventListener('langchange', renderAll);
setInterval(() => { if (!document.hidden) updateNow(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateNow(); });

/* ── Google: el dato vive en site-data.js ─────────────────── */
$('gRating').textContent = String(GOOGLE.rating);
$('gReviews').textContent = String(GOOGLE.count);
$('gRead').href = GOOGLE.url;
$('gWrite').href = GOOGLE.reviewUrl;

/* ── sellos de estrella ───────────────────────────────────── */
document.querySelectorAll('[data-burst]').forEach(el => el.insertAdjacentHTML('afterbegin', burstSvg(el.dataset.burst)));

/* ── barra fija del móvil: se esconde al llegar a Visítanos ─ */
const mbar = $('mbar');
new IntersectionObserver(([e]) => mbar.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe($('visit'));

/* ── neón: parpadea una vez al aparecer ───────────────────── */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('flicker');
    io.unobserve(e.target);
  }), { threshold: 0.5 });
  document.querySelectorAll('.neon-big').forEach(el => io.observe(el));
}

/* ── modal de reserva → WhatsApp ──────────────────────────── */
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
  release = trapFocus(modal); $('resName').focus();
};
const closeRes = () => {
  modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
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

/* ── hero + entradas al hacer scroll (GSAP es deferred) ───── */
addEventListener('DOMContentLoaded', () => {
  initHero();
  const reveals = document.querySelectorAll('.reveal');
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  reveals.forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
});
```

- [ ] **Step 6: Reescribir `web/index.html`**

El bloque `<header class="hero" id="hero"> … </header>` se copia **literalmente** del archivo actual (líneas 61–88). Sus cambios van en la Task 6.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>Candela &amp; Café Market — NY Deli, Dominican Soul &amp; Live Music | Downtown Miami</title>
<meta name="description" content="Coffee now, wine later: breakfast, Dominican food made daily, NY deli sandwiches, a neighborhood market and live music on Fridays. 507 N Miami Ave, Downtown Miami.">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="canonical" href="https://candelaycafe.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="Candela & Café Market — Coffee now, wine later | Downtown Miami">
<meta property="og:description" content="Breakfast, Dominican food made daily, NY deli, a neighborhood market and live music on Fridays. 507 N Miami Ave.">
<meta property="og:image" content="https://candelaycafe.com/assets/img/og-image.jpg">
<meta property="og:url" content="https://candelaycafe.com/">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Architects+Daughter&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"></noscript>
<link rel="preload" as="image" href="assets/img/hero-fire-1440.webp"
      imagesrcset="assets/img/hero-fire-960.webp 960w, assets/img/hero-fire-1440.webp 1440w"
      imagesizes="100vw" fetchpriority="high">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/landing.css">
<link rel="stylesheet" href="css/sections.css">
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Restaurant",
  "name": "Candela & Café Market",
  "url": "https://candelaycafe.com/",
  "servesCuisine": ["Deli", "Dominican", "Coffee"],
  "priceRange": "$$",
  "telephone": "+17862547577",
  "address": { "@type": "PostalAddress", "streetAddress": "507 N Miami Ave",
    "addressLocality": "Miami", "addressRegion": "FL", "postalCode": "33136", "addressCountry": "US" },
  "geo": { "@type": "GeoCoordinates", "latitude": 25.7791457, "longitude": -80.1937115 },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Sunday","Monday","Tuesday"], "opens": "08:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Wednesday","Thursday","Friday","Saturday"], "opens": "08:00", "closes": "23:30" } ],
  "hasMenu": "https://candelaycafe.com/menu",
  "image": "https://candelaycafe.com/assets/img/og-image.jpg",
  "sameAs": ["https://www.instagram.com/candelaycafe/"] }
</script>
</head>
<body>

<nav class="nav" id="nav" aria-label="Main navigation"><div class="nav-inner">
  <a class="nav-logo" href="#hero"><img src="assets/img/logo-96.webp" alt="Candela &amp; Café logo" width="46" height="46"><b>CANDELA &amp; CAFÉ</b></a>
  <div class="nav-links" id="navLinks">
    <a href="menu.html" data-i18n="nav.menu">Menu</a>
    <a href="#market" data-i18n="nav.market">Market</a>
    <a href="#noche" data-i18n="nav.nights">Nights</a>
    <a href="#visit" data-i18n="nav.visit">Visit Us</a>
    <button class="lang-toggle" type="button">ES</button>
    <a class="btn btn-p nav-cta" href="menu.html" data-i18n="nav.order">Order Now</a>
  </div>
  <button class="nav-burger" id="burger" type="button" aria-label="Open menu" data-i18n-aria="nav.burger" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
</div></nav>

<main>

<!-- HERO: copiar aquí, sin cambios, las líneas 61-88 del index.html anterior -->

<div class="now" id="now" role="status">
  <span class="now-dot" aria-hidden="true"></span>
  <b class="now-state" id="nowState" data-i18n="now.fallback">Open daily from 8 am</b>
  <span class="now-addr">507 N Miami Ave · Downtown Miami</span>
  <a class="now-go" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a>
</div>

<div class="dawn" aria-hidden="true"></div>

<section class="sec morning" id="manana" aria-labelledby="mananaTitle">
  <div class="wrap m-grid">
    <div class="reveal">
      <span class="sign" data-i18n="day.morning.sign">8:00 am · Coffee now</span>
      <h2 class="stack" id="mananaTitle"><span data-i18n="day.morning.w1">Coffee.</span> <span data-i18n="day.morning.w2">Juices.</span> <span class="fire" data-i18n="day.morning.w3">Breakfast.</span></h2>
      <p class="lead" data-i18n="day.morning.body">Coffee, cortadito and fresh juices. New York breakfasts — pancakes, omelettes, bacon, egg &amp; cheese — and empanadas fresh out of the oven.</p>
      <ul class="tags"><li>Cortadito</li><li>Pancakes</li><li>Omelettes</li><li>Bacon, egg &amp; cheese</li><li>Empanadas</li><li data-i18n="day.morning.juices">Fresh juices</li></ul>
      <div class="ctas"><a class="btn btn-p" href="menu.html#breakfast" data-i18n="day.morning.cta">See breakfast</a><a class="btn btn-ghost" href="#visit" data-i18n="visit.directions">Get directions</a></div>
    </div>
    <div class="m-art">
      <figure class="m-main ht"><img src="assets/img/manana-fachada-480.webp" srcset="assets/img/manana-fachada-480.webp 480w, assets/img/manana-fachada-960.webp 960w" sizes="(max-width:768px) 62vw, 360px" width="480" height="640" loading="lazy" alt="Breakfast plate at the door of 507 N Miami Ave" data-i18n-alt="day.morning.alt"></figure>
      <img class="sticker st-1" src="assets/img/manana-tres-golpes-480.webp" width="480" height="640" loading="lazy" alt="">
      <img class="sticker st-2" src="assets/img/manana-jugo-480.webp" width="480" height="640" loading="lazy" alt="">
      <img class="sticker st-3" src="assets/img/manana-pastelitos-480.webp" width="480" height="480" loading="lazy" alt="">
      <span class="burst b-open" data-burst="#ED3B2F"><span data-i18n="day.morning.burst">Open 8 am</span></span>
    </div>
  </div>
</section>

<section class="sec midday" id="mediodia" aria-labelledby="mediodiaTitle">
  <div class="wrap">
    <div class="redpanel reveal">
      <div class="rp-copy">
        <span class="sign" data-i18n="day.midday.sign">12:00 pm · Midday</span>
        <h2 class="script" id="mediodiaTitle" data-i18n="day.midday.title">Today's food.</h2>
        <p data-i18n="day.midday.body">The hot table: Dominican food made today, just like home. Ask about the special.</p>
        <div class="ctas"><a class="btn btn-light" href="#mesa" data-i18n="day.midday.cta">What's on today</a><a class="btn btn-ghost" id="middayWa" href="https://wa.me/17862547577" target="_blank" rel="noopener" data-i18n="day.midday.wa">Order on WhatsApp</a></div>
      </div>
      <div class="rp-pic">
        <figure class="rp-plate ht"><img src="assets/img/mediodia-sancocho-480.webp" srcset="assets/img/mediodia-sancocho-480.webp 480w, assets/img/mediodia-sancocho-960.webp 960w" sizes="(max-width:768px) 90vw, 460px" width="480" height="640" loading="lazy" alt="Bowl of sancocho with white rice and avocado" data-i18n-alt="day.midday.alt"></figure>
        <span class="burst b-today" data-burst="#0d0d0d"><span data-i18n="day.midday.burst">Made today</span></span>
      </div>
    </div>
    <div class="board-row" id="mesa">
      <figure class="steam ht"><img src="assets/img/mediodia-mesa-caliente-960.webp" srcset="assets/img/mediodia-mesa-caliente-480.webp 480w, assets/img/mediodia-mesa-caliente-960.webp 960w, assets/img/mediodia-mesa-caliente-1440.webp 1440w" sizes="(max-width:768px) 92vw, 640px" width="480" height="270" loading="lazy" alt="The hot table with today's trays" data-i18n-alt="day.board.alt"></figure>
      <div class="board">
        <h3 data-i18n="day.board.title">Today at the hot table</h3>
        <p class="board-sub" data-i18n="day.board.sub">Changes every day</p>
        <div id="board"><p class="board-special">Ask about our daily food specials!</p></div>
      </div>
    </div>
    <div class="favs-head">
      <div><span class="sign sign--red" data-i18n="day.favs.sign">From the New York deli</span><h3 class="favs-title" data-i18n="day.favs.title">The favorites</h3></div>
      <a class="btn btn-ghost" href="menu.html" data-i18n="day.favs.cta">See the full menu →</a>
    </div>
    <div class="favs" id="favs"></div>
  </div>
</section>

<section class="sec tarde" id="market" aria-labelledby="marketTitle">
  <div class="awning" aria-hidden="true">CANDELA &amp; CAFÉ · MARKET · GROCERY · DELI · COFFEE</div>
  <div class="wrap">
    <div class="t-head reveal">
      <div><span class="sign" data-i18n="day.market.sign">3:00 pm · Afternoon</span><h2 class="stack stack--one" id="marketTitle" data-i18n="day.market.title">The market.</h2></div>
      <p class="lead" data-i18n="day.market.body">The house basics, around the corner: pantry, fruit and veg, natural products and everyday essentials. If you don't see it, ask us.</p>
    </div>
    <div class="shelf" id="shelf"></div>
    <div class="t-cta"><a class="btn btn-cream" id="marketAsk" href="https://wa.me/17862547577" target="_blank" rel="noopener" data-i18n="day.market.cta">Got it? Ask on WhatsApp</a><p data-i18n="day.market.note">Come by and pick it up — we're open every day from 8 am.</p></div>
  </div>
</section>

<div class="dusk" aria-hidden="true"></div>

<section class="sec noche" id="noche" aria-labelledby="nocheTitle">
  <div class="wrap">
    <div class="n-banner reveal">
      <img class="n-bg" src="assets/img/noche-neon-960.webp" srcset="assets/img/noche-neon-480.webp 480w, assets/img/noche-neon-960.webp 960w" sizes="(max-width:768px) 100vw, 1180px" width="480" height="701" loading="lazy" alt="The «Coffee now, Wine later» neon over the red banquette" data-i18n-alt="day.night.alt">
      <div class="n-copy">
        <span class="sign sign--glass" data-i18n="day.night.sign">7:00 pm · Night</span>
        <h2 class="neon-big" id="nocheTitle">Wine later.</h2>
        <p class="lead" data-i18n="day.night.body">Wine, coffee until close and good music. On Fridays, it's live.</p>
        <div class="ctas"><button class="btn btn-p" type="button" data-open-res data-i18n="day.night.reserve">Reserve a table</button><a class="btn btn-ghost btn-neon" href="#cartas" data-i18n="day.night.cta">See the night menu</a></div>
      </div>
      <svg class="stamp" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs><path id="stampPath" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
        <circle cx="100" cy="100" r="97" fill="#0a0a0a" stroke="#76C043" stroke-width="3"/>
        <circle cx="100" cy="100" r="58" fill="none" stroke="#76C043" stroke-width="1.5" stroke-dasharray="3 5"/>
        <text font-family="Anton, sans-serif" font-size="17" letter-spacing="4" fill="#dff5cd"><textPath href="#stampPath" data-i18n="day.night.stamp">EVERY FRIDAY · LIVE MUSIC · </textPath></text>
        <text x="100" y="98" text-anchor="middle" font-family="Anton, sans-serif" font-size="30" fill="#fff">8 PM</text>
        <text x="100" y="124" text-anchor="middle" font-family="Architects Daughter, cursive" font-size="18" fill="#9be26a" data-i18n="day.night.live">live</text>
      </svg>
    </div>
    <div class="arches" id="cartas"></div>
    <div class="music reveal">
      <div>
        <span class="sign sign--dark" data-i18n="day.music.p1">Fridays</span>
        <h3 class="neon-big neon-mid" data-i18n="day.music.title">Live music.</h3>
        <div class="pills"><span class="pill-neon" data-i18n="day.music.p1">Fridays</span><span class="pill-neon" data-i18n="music.p3">From 8pm</span></div>
        <button class="btn btn-p" type="button" data-open-res data-i18n="day.night.reserve">Reserve a table</button>
      </div>
      <div class="music-glow" aria-hidden="true"><span>8 pm</span></div>
    </div>
  </div>
</section>

<section class="sec lugar" id="lugar" aria-labelledby="lugarTitle">
  <div class="wrap">
    <span class="sign sign--dark" data-i18n="day.place.sign">The place</span>
    <h2 class="stack stack--one" id="lugarTitle"><span data-i18n="day.place.title.a">Come</span> <span class="fire" data-i18n="day.place.title.b">see it.</span></h2>
    <div class="mosaic">
      <figure class="ht"><img src="assets/img/lugar-neon-sub-960.webp" srcset="assets/img/lugar-neon-sub-480.webp 480w, assets/img/lugar-neon-sub-960.webp 960w" sizes="(max-width:768px) 92vw, 460px" width="480" height="640" loading="lazy" alt="Boar's Head sub under the neon sign" data-i18n-alt="day.place.alt1"></figure>
      <figure><img src="assets/img/lugar-terraza-480.webp" width="480" height="640" loading="lazy" alt="Philly cheesesteak on the terrace" data-i18n-alt="day.place.alt2"></figure>
      <figure class="ht"><img src="assets/img/manana-fachada-480.webp" width="480" height="640" loading="lazy" alt="Breakfast plate at the door of 507 N Miami Ave" data-i18n-alt="day.morning.alt"></figure>
      <figure><img src="assets/img/lugar-interior-480.webp" width="480" height="523" loading="lazy" alt="Prosciutto sandwich by the red banquette" data-i18n-alt="day.place.alt3"></figure>
      <figure class="ht"><img src="assets/img/lugar-flan-480.webp" width="480" height="640" loading="lazy" alt="Flan on the terrace" data-i18n-alt="day.place.alt4"></figure>
    </div>
    <div class="g-row">
      <span class="burst b-google" data-burst="#ED3B2F"><span><b id="gRating">4.6</b><small data-i18n="day.place.ongoogle">on Google</small></span></span>
      <p><b><span id="gReviews">136</span> <span data-i18n="day.place.reviews">reviews on Google.</span></b> <span data-i18n="day.place.body">What the neighborhood says, straight from our Google profile.</span></p>
      <div class="ctas"><a class="btn btn-ghost" id="gRead" href="https://www.google.com/maps/search/?api=1&amp;query=Candela+y+Caf%C3%A9+Market%2C+507+N+Miami+Ave%2C+Miami%2C+FL" target="_blank" rel="noopener" data-i18n="day.place.read">Read the reviews</a><a class="btn btn-ghost" id="gWrite" href="https://www.google.com/maps/search/?api=1&amp;query=Candela+y+Caf%C3%A9+Market%2C+507+N+Miami+Ave%2C+Miami%2C+FL" target="_blank" rel="noopener" data-i18n="reviews.write">Write a review</a></div>
    </div>
  </div>
</section>

<section class="sec visit" id="visit" aria-labelledby="visitTitle">
  <div class="wrap v-grid">
    <div>
      <span class="sign sign--dark" data-i18n="visit.kicker">Visit Us</span>
      <h2 class="num" id="visitTitle" aria-label="507 N Miami Ave">507</h2>
      <p class="addr">N Miami Ave<small>Downtown Miami, FL 33136</small></p>
      <div class="ctas"><a class="btn btn-p" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a><a class="btn btn-ghost" href="tel:+17862547577" data-i18n="visit.call">Call us</a><a class="btn btn-ghost" id="visitWa" href="https://wa.me/17862547577" target="_blank" rel="noopener">WhatsApp</a></div>
    </div>
    <div>
      <table class="hours-t"><caption class="sr-only" data-i18n="visit.hours.title">Hours</caption>
        <tbody id="hoursBody"><tr><th scope="row" data-i18n="visit.fallback1">Sun–Tue · 8 am – 10 pm</th><td></td></tr><tr><th scope="row" data-i18n="visit.fallback2">Wed–Sat · 8 am – 11:30 pm</th><td></td></tr></tbody>
      </table>
      <iframe class="map" loading="lazy" title="Map: Candela &amp; Café" src="https://www.google.com/maps?q=507+N+Miami+Ave,+Miami,+FL+33136&amp;output=embed"></iframe>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="wrap"><div class="footer-grid">
    <div><div class="brand"><img src="assets/img/logo-96.webp" alt="Candela &amp; Café Market logo" width="50" height="50"><b>CANDELA &amp; CAFÉ</b></div>
      <p style="margin-top:14px;max-width:38ch" data-i18n="footer.tag">NY Deli · Market &amp; Café — made with candela in Downtown Miami.</p></div>
    <nav aria-label="Footer navigation"><h4 data-i18n="footer.explore">Explore</h4>
      <a href="menu.html" data-i18n="nav.menu">Menu</a><a href="#market" data-i18n="nav.market">Market</a><a href="#noche" data-i18n="nav.nights">Nights</a><a href="#visit" data-i18n="nav.visit">Visit Us</a></nav>
    <div><h4 data-i18n="footer.orders">Orders &amp; Social</h4>
      <a href="https://www.ubereats.com/store/candela-y-cafe-market/oa35cIfwWWuJm-ND4o9G1g" target="_blank" rel="noopener">Uber Eats</a>
      <a href="https://www.doordash.com/store/candela-y-caf%C3%A9-market-miami-26069377/" target="_blank" rel="noopener">DoorDash</a>
      <a href="https://www.instagram.com/candelaycafe/" target="_blank" rel="noopener">@candelaycafe</a>
      <a href="tel:+17862547577">+1 (786) 254-7577</a></div>
  </div><div class="foot-bottom"><span>&copy; 2026 Candela &amp; Café Market</span><span>507 N Miami Ave, Miami FL</span></div></div>
</footer>

<nav class="mbar" id="mbar" aria-label="Quick actions" data-i18n-aria="mbar.label">
  <a class="mbar-go" href="https://www.google.com/maps/dir/?api=1&amp;destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136" target="_blank" rel="noopener" data-i18n="mbar.go">Directions</a>
  <a href="tel:+17862547577" data-i18n="mbar.call">Call</a>
  <a href="menu.html" data-i18n="nav.menu">Menu</a>
</nav>

<!-- MODAL DE RESERVA -->
<div class="modal" id="resModal" aria-hidden="true">
  <div class="modal-ov" data-close></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="resTitle">
    <button class="modal-x" type="button" data-close aria-label="Close" data-i18n-aria="modal.close">×</button>
    <div class="modal-seal"><img src="assets/img/logo-96.webp" alt="" width="54" height="54"></div>
    <h3 id="resTitle" class="modal-title"><span data-i18n="res.title.a">Reserve your</span> <span class="fire" data-i18n="res.title.b">Friday</span></h3>
    <p class="modal-sub" data-i18n="res.sub">Live music every Friday. Fill this in and we confirm by WhatsApp.</p>
    <label class="fld"><span data-i18n="res.name">Name</span><input id="resName" type="text" autocomplete="name"></label>
    <label class="fld"><span data-i18n="res.phone">Phone</span><input id="resPhone" type="tel" autocomplete="tel" placeholder="(786) 000-0000"></label>
    <div class="fld-row">
      <label class="fld"><span data-i18n="res.day">Friday</span><select id="resDate"></select></label>
      <label class="fld"><span data-i18n="res.time">Time</span><select id="resTime"><option>8:00 PM</option><option>9:00 PM</option><option>10:00 PM</option></select></label>
    </div>
    <div class="fld"><span data-i18n="res.guests">Guests</span><div class="stepper"><button type="button" id="gMinus" aria-label="Less" data-i18n-aria="cart.less">−</button><b id="gCount">2</b><button type="button" id="gPlus" aria-label="More" data-i18n-aria="cart.more">+</button></div></div>
    <button class="btn btn-g modal-go" type="button" id="resGo" data-i18n="res.go">Confirm via WhatsApp</button>
    <p class="modal-note" data-i18n="res.note">We'll reply to confirm availability.</p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer
  integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer
  integrity="sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d" crossorigin="anonymous"></script>
<script type="module" src="js/landing.js"></script>
</body>
</html>
```

Después de pegarlo, sustituye el comentario `<!-- HERO: … -->` por el bloque del hero anterior. En ese bloque, el botón «View menu» pasa de `href="#menu"` a `href="menu.html"`.

- [ ] **Step 6b: `web/menu.html`, enlaces a las anclas nuevas**

Desaparecen `#music` y `#historia`, y la Task 4 ya borró `nav.music` y `nav.history`, así que el test de cobertura fallaría sin este paso.

En `#navLinks` (antes del `lang-toggle`) deja:

```html
    <a href="menu.html" data-i18n="nav.menu">Menu</a>
    <a href="index.html#market" data-i18n="nav.market">Market</a>
    <a href="index.html#noche" data-i18n="nav.nights">Nights</a>
    <a href="index.html#visit" data-i18n="nav.visit">Visit Us</a>
```

En el nav del footer, los enlaces quedan así:

```html
      <a href="menu.html" data-i18n="nav.menu">Menu</a><a href="index.html#market" data-i18n="nav.market">Market</a><a href="index.html#noche" data-i18n="nav.nights">Nights</a><a href="index.html#visit" data-i18n="nav.visit">Visit Us</a></nav>
```

Añade `web/menu.html` al `git add` del Step 12.

- [ ] **Step 7: `web/css/base.css`, tokens y utilidades**

Dentro de `:root`, después de `--disp`/`--body`:

```css
  --sign:'Anton',var(--body); --arena:#F1DFC6; --arena-2:#EBCDAA; --terracota:#9a4a2c; --noche:#0a0a0a;
```

Después de la regla `.frame img{…}` (sección UTILIDADES):

```css
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.sec .btn{border-radius:999px}
```

- [ ] **Step 8: `web/css/landing.css`, dejar solo HERO y MODAL**

Borra desde `/* ── MENÚ (oscuro, …` (línea 53) hasta el final de `/* ── VISÍTANOS … */` (línea 191), y todo el bloque `/* ── CARRITO … */` (líneas 220-245). Se quedan las líneas 1-51 (HERO) y 193-218 (MODAL).

Cambia además la cabecera del archivo:

```css
/* ============================================================
   LANDING.CSS — Candela & Café: HERO (aprobado 2026-06-10) + MODAL DE RESERVA.
   Las secciones «Un día en Candela» viven en sections.css.
   ============================================================ */
```

- [ ] **Step 9: Crear `web/css/sections.css`**

```css
/* ============================================================
   SECTIONS.CSS — «Un día en Candela» (2026-09): todo lo que va debajo del hero.
   Rampa de día: amanece → crema → arena → terracota → anochece → noche.
   ============================================================ */

/* ── componentes ─────────────────────────────────────────── */
.sign{display:inline-block;font:400 .95rem/1 var(--sign);letter-spacing:.14em;text-transform:uppercase;background:var(--negro);color:#fff;padding:.62em .8em .56em}
.sign--red{background:var(--rojo)}
.sign--dark{background:#1b1b1b}
.sign--glass{background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2)}
.sec{position:relative;padding:clamp(56px,8vw,100px) 0}
.stack{font-family:var(--disp);font-weight:400;font-size:clamp(3.4rem,8vw,7.2rem);line-height:.92;letter-spacing:-.01em;margin:.3em 0 .28em}
.stack span{display:block}
.stack--one{font-size:clamp(3rem,7vw,6.2rem)}
.lead{font-size:1.06rem;line-height:1.6;max-width:34rem;margin:0 0 1.3rem}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.btn-cream{background:var(--claro);color:var(--negro)}
.btn-light{background:#fff;color:#b8231a}
.ht{position:relative;overflow:hidden}
.ht::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(20,8,4,.55) 1px,transparent 1.35px);background-size:5px 5px;mix-blend-mode:multiply;opacity:.35}
.sticker{position:absolute;border-radius:50%;object-fit:cover;border:9px solid #fff;box-shadow:0 14px 30px rgba(60,20,5,.28);transform:rotate(var(--r,0deg));transition:transform .35s var(--ease)}
@media(hover:hover) and (pointer:fine){.sticker:hover{transform:rotate(0deg) scale(1.05)}}
.burst{position:absolute;z-index:3;display:grid;place-items:center;text-align:center;color:#fff;font:400 1.1rem/1.05 var(--sign);letter-spacing:.06em;text-transform:uppercase;isolation:isolate;transform:rotate(var(--r,0deg))}
.burst>svg{position:absolute;inset:0;width:100%;height:100%;z-index:-1}
.burst>span{max-width:68%}

/* ── «Ahora en Candela» ─────────────────────────────────── */
.now{display:flex;align-items:center;flex-wrap:wrap;gap:12px 18px;background:var(--negro);color:#f3efe8;border-top:1px solid #222;padding:14px max(20px,calc((100% - var(--maxw)) / 2 + 40px));font-size:.95rem}
.now-dot{flex:none;width:11px;height:11px;border-radius:50%;background:var(--verde)}
.now.is-open .now-dot{animation:nowPulse 1.8s infinite}
.now.is-soon .now-dot{background:#ff8f3a}
.now.is-closed .now-dot{background:#8a8279}
@keyframes nowPulse{0%{box-shadow:0 0 0 0 rgba(118,192,67,.7)}70%{box-shadow:0 0 0 11px rgba(118,192,67,0)}100%{box-shadow:0 0 0 0 rgba(118,192,67,0)}}
.now-state{font:400 1.05rem/1.2 var(--sign);letter-spacing:.1em;text-transform:uppercase;color:var(--verde)}
.now.is-soon .now-state{color:#ffb070}
.now.is-closed .now-state{color:#e7e0d6}
.now-addr{flex:1;min-width:14rem;color:#cfc8bd}
.now-go{font:400 .95rem/1 var(--sign);letter-spacing:.12em;text-transform:uppercase;background:var(--rojo);color:#fff;padding:.8em 1.15em;border-radius:999px}
.now-go:hover{background:var(--rojo-hover)}

/* ── transiciones de la rampa ───────────────────────────── */
.dawn{position:relative;height:clamp(140px,18vw,230px);overflow:hidden;background:linear-gradient(var(--negro) 0%,#2a0f09 22%,#6e2a16 45%,#d9875c 70%,#f6d5b4 86%,var(--claro) 100%)}
.dawn::before{content:"";position:absolute;left:50%;bottom:-40px;width:min(760px,120vw);height:260px;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 100%,rgba(255,190,130,.75),transparent 62%)}
.dusk{position:relative;height:clamp(140px,18vw,220px);background:linear-gradient(var(--terracota),#5a2414 30%,#1d0b06 65%,var(--noche))}
.dusk::after{content:"";position:absolute;left:12%;right:12%;bottom:38px;height:2px;background:var(--verde);box-shadow:0 0 10px var(--verde),0 0 26px rgba(118,192,67,.8);opacity:.75}

/* ── mañana ─────────────────────────────────────────────── */
.morning{background:var(--claro);color:var(--ink)}
.m-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:40px;align-items:center}
.morning .lead{color:#3a332d}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px;padding:0;list-style:none}
.tags li{font:400 .9rem/1 var(--sign);letter-spacing:.1em;text-transform:uppercase;border:2px solid var(--negro);padding:.55em .7em .5em}
.m-art{position:relative;min-height:540px}
.m-main{position:absolute;right:30px;top:20px;width:min(360px,70%);aspect-ratio:3/4;border:10px solid var(--negro);transform:rotate(2deg);box-shadow:0 26px 50px rgba(60,25,10,.25);margin:0}
.m-main img{width:100%;height:100%;object-fit:cover}
.st-1{left:0;bottom:36px;width:200px;height:200px;--r:-8deg}
.st-2{right:-6px;top:-10px;width:140px;height:140px;--r:9deg}
.st-3{right:14px;bottom:-18px;width:160px;height:160px;--r:-4deg}
.b-open{left:50px;top:36px;width:140px;height:140px;--r:-12deg}

/* ── mediodía ───────────────────────────────────────────── */
.midday{background:linear-gradient(var(--claro),var(--arena) 180px,var(--arena-2));color:var(--ink)}
.redpanel{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:460px;background:var(--rojo);color:#fff;border-radius:28px;margin-top:40px}
.rp-copy{position:relative;z-index:2;padding:46px 20px 42px 50px}
.script{font-family:var(--disp);font-weight:400;font-size:clamp(3.2rem,7.4vw,6.8rem);line-height:.92;margin:.3em 0 .28em;text-shadow:0 4px 0 rgba(0,0,0,.12)}
.rp-copy p{font-size:1.06rem;line-height:1.55;max-width:26rem;margin:0 0 1.4rem;color:#fff}
.rp-pic{position:relative}
.rp-plate{position:absolute;right:-18px;top:-44px;width:min(460px,100%);height:calc(100% + 88px);border-radius:240px 240px 30px 30px;border:10px solid var(--negro);box-shadow:0 30px 60px rgba(90,10,0,.35);margin:0}
.rp-plate img{width:100%;height:100%;object-fit:cover}
.b-today{left:-30px;bottom:24px;width:150px;height:150px;--r:10deg}
.board-row{display:grid;grid-template-columns:1.25fr 1fr;gap:26px;margin-top:84px;align-items:stretch}
.steam{position:relative;min-height:320px;border:10px solid var(--negro);margin:0}
.steam img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.board{background:#141414;color:#f5f1ea;padding:28px 30px;border-radius:6px;box-shadow:inset 0 0 0 6px #2b2b2b,0 18px 40px rgba(60,25,10,.25)}
.board h3{font:400 1.6rem/1.1 var(--sign);letter-spacing:.08em;text-transform:uppercase;margin:0 0 4px;color:#fff}
.board-sub{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--verde);margin:0 0 16px}
.board ul{list-style:none;margin:0;padding:0;font-family:var(--disp);font-size:1.5rem;line-height:1.55}
.board li{border-bottom:1px dashed #3a3a3a}
.board-special{font-family:var(--disp);font-size:1.7rem;line-height:1.3;margin:10px 0 0}
.favs-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:72px 0 22px}
.favs-title{font-family:var(--disp);font-weight:400;font-size:clamp(2.4rem,4.6vw,3.4rem);line-height:1;margin:10px 0 0}
.favs{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.fav{display:flex;flex-direction:column;background:#fff;color:var(--ink);border-radius:22px;padding:14px 14px 18px;box-shadow:0 16px 34px rgba(90,40,10,.14);transform:rotate(-1.2deg);transition:transform .3s var(--ease),box-shadow .3s}
.fav:nth-child(even){transform:rotate(1.2deg)}
.fav:hover{transform:rotate(0) translateY(-4px);box-shadow:0 22px 44px rgba(90,40,10,.2)}
.fav-ph{display:block;height:200px;border-radius:14px;overflow:hidden}
.fav-ph img{width:100%;height:100%;object-fit:cover}
.fav-n{font:400 1.15rem/1.1 var(--sign);letter-spacing:.05em;text-transform:uppercase;margin:14px 2px 4px}
.fav-d{flex:1;font-size:.85rem;color:#5b534a;line-height:1.4;margin:0 2px 10px}
.fav-p{font-family:var(--disp);font-size:1.7rem;color:#c42a1f;margin:0 2px}

/* ── tarde · market ─────────────────────────────────────── */
.tarde{background:linear-gradient(var(--arena-2) 0%,#d49a6c 35%,#b8653f 75%,var(--terracota) 100%);color:var(--ink);padding-top:0}
.awning{position:relative;background:var(--rojo);color:#fff;text-align:center;font:400 clamp(1rem,2.6vw,2.3rem)/1.2 var(--sign);letter-spacing:.2em;padding:clamp(18px,2.6vw,30px) 16px;box-shadow:inset 0 8px 0 var(--rojo-hover);filter:drop-shadow(0 12px 14px rgba(80,25,5,.3));margin-bottom:clamp(40px,6vw,64px)}
.awning::after{content:"";position:absolute;left:0;right:0;top:100%;height:18px;background:radial-gradient(circle at 18px 0,var(--rojo) 17.5px,transparent 18px) 0 0/36px 18px repeat-x}
.t-head{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:end}
.shelf{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin:40px 0 0}
.tile{margin:0;background:var(--claro);border-radius:6px;overflow:hidden;box-shadow:0 14px 28px rgba(70,20,5,.28)}
.tile img{width:100%;height:150px;object-fit:cover}
.tile figcaption{background:var(--negro);color:#fff;padding:10px 12px}
.tile b{display:block;font:400 1.05rem/1.05 var(--sign);letter-spacing:.06em;text-transform:uppercase}
.tile span{font-size:.8rem;color:#d6cdc1}
.t-cta{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:34px;color:#fff}
.t-cta p{margin:0;color:#ffe6d6}

/* ── noche ──────────────────────────────────────────────── */
.noche{background:var(--noche);color:#eee;padding-top:0}
.n-banner{position:relative;min-height:540px;border-radius:26px;overflow:hidden;box-shadow:0 0 0 2px rgba(118,192,67,.4),0 0 60px rgba(118,192,67,.18)}
.n-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.8)}
.n-banner::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.45) 48%,transparent 78%)}
.n-copy{position:relative;z-index:2;max-width:30rem;padding:64px 54px}
.n-copy .lead{color:#e2dbd1}
.neon-big{font-family:var(--disp);font-weight:400;font-size:clamp(3.4rem,8vw,7rem);line-height:.92;margin:.3em 0 .25em;color:#eaffd9;text-shadow:0 0 4px #b8f58f,0 0 12px rgba(118,192,67,.95),0 0 28px rgba(118,192,67,.7),0 0 54px rgba(118,192,67,.45)}
.neon-mid{font-size:clamp(2.8rem,6vw,5.2rem)}
.btn-neon{color:#dff5cd}
.stamp{position:absolute;right:56px;top:56px;z-index:3;width:clamp(130px,15vw,190px);height:auto;transform:rotate(-10deg)}
.arches{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin:80px 30px 0}
.arch{border-radius:260px 260px 26px 26px;padding:78px 40px 44px;text-align:center;min-height:440px;border:3px solid #9be26a;box-shadow:0 0 12px rgba(118,192,67,.95),inset 0 0 12px rgba(118,192,67,.6),0 0 44px rgba(118,192,67,.35)}
.arch--day{border-color:#ff6b5a;box-shadow:0 0 12px rgba(237,59,47,.9),inset 0 0 12px rgba(237,59,47,.6),0 0 44px rgba(237,59,47,.35)}
.arch h3{font-family:var(--disp);font-weight:400;font-size:clamp(2.4rem,4.6vw,3.6rem);line-height:1;margin:0 0 6px;color:#eaffd9;text-shadow:0 0 6px #b8f58f,0 0 18px rgba(118,192,67,.9)}
.arch--day h3{color:#ffe1dc;text-shadow:0 0 6px #ff8f80,0 0 18px rgba(237,59,47,.9)}
.arch-hrs{font:400 .9rem/1 var(--sign);letter-spacing:.14em;text-transform:uppercase;color:#bdb4a8;margin:0 0 24px}
.arch ul{list-style:none;margin:0;padding:0;font-size:1.1rem;line-height:2.1;color:#e9e3da}
.flicker{animation:flick 1s steps(1) 1}
@keyframes flick{0%,18%,24%,58%,62%{opacity:1}20%,60%{opacity:.35}}
.music{display:grid;grid-template-columns:1fr 1.1fr;gap:34px;align-items:center;margin-top:80px}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 22px}
.pill-neon{font:400 .9rem/1 var(--sign);letter-spacing:.1em;text-transform:uppercase;padding:.65em .85em .6em;border-radius:999px;border:2px solid var(--verde);color:#dff5cd;box-shadow:0 0 14px rgba(118,192,67,.3)}
.music-glow{display:grid;place-items:center;min-height:280px;border-radius:20px;background:radial-gradient(circle at 50% 50%,rgba(118,192,67,.25),transparent 60%),#101010;border:2px solid rgba(118,192,67,.35)}
.music-glow span{font-family:var(--disp);font-size:clamp(3rem,7vw,6rem);color:#eaffd9;text-shadow:0 0 12px rgba(118,192,67,.95),0 0 40px rgba(118,192,67,.5)}

/* ── el lugar ───────────────────────────────────────────── */
.lugar{background:var(--noche);color:#eee;border-top:1px solid #1a1a1a}
.mosaic{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:230px 230px;gap:14px;margin-top:10px}
.mosaic figure{margin:0;border-radius:16px;overflow:hidden}
.mosaic figure:first-child{grid-row:span 2}
.mosaic img{width:100%;height:100%;object-fit:cover}
.g-row{display:flex;align-items:center;gap:26px;flex-wrap:wrap;margin-top:40px}
.b-google{position:relative;width:160px;height:160px;font-size:2rem}
.b-google small{display:block;font-size:.8rem;letter-spacing:.12em}
.g-row p{margin:0;max-width:28rem;color:#cfc6ba;line-height:1.55}
.g-row p b{color:#fff}

/* ── visítanos ──────────────────────────────────────────── */
.visit{background:var(--noche);color:#eee;border-top:1px solid #1a1a1a}
.v-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:start}
.num{font:400 clamp(8rem,17vw,15rem)/.82 var(--sign);color:transparent;-webkit-text-stroke:3px var(--rojo);letter-spacing:.02em;margin:14px 0 6px}
.addr{font:400 1.9rem/1.15 var(--sign);letter-spacing:.06em;text-transform:uppercase;margin:0 0 18px}
.addr small{display:block;font:500 1rem/1.4 var(--body);letter-spacing:0;text-transform:none;color:#bdb4a8;margin-top:6px}
.hours-t{width:100%;border-collapse:collapse;font-size:1rem;margin:4px 0 22px}
.hours-t th,.hours-t td{padding:12px 10px;border-bottom:1px solid #222;text-align:left;font-weight:400}
.hours-t td{text-align:right}
.hours-t tr.today th,.hours-t tr.today td{background:rgba(118,192,67,.12);color:#dff5cd;font-weight:700}
.visit .map{width:100%;height:260px;border:0;border-radius:18px;filter:grayscale(.2) contrast(1.05)}

/* ── barra fija móvil ───────────────────────────────────── */
.mbar{display:none}

/* ── responsive ─────────────────────────────────────────── */
@media(max-width:1024px){
  .favs{grid-template-columns:repeat(2,1fr)}
  .shelf{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:768px){
  .m-grid,.redpanel,.board-row,.t-head,.arches,.music,.v-grid{grid-template-columns:1fr}
  .m-art{min-height:420px;width:100%;max-width:420px;margin:0 auto}
  .m-main{right:10px;width:62%}
  .st-1{width:130px;height:130px;bottom:20px}
  .st-2{width:96px;height:96px}
  .st-3{width:110px;height:110px;right:4px;bottom:-10px}
  .b-open{left:10px;top:10px;width:108px;height:108px;font-size:.9rem}
  .redpanel{margin-bottom:40px}
  .rp-copy{padding:34px 24px 10px}
  .rp-pic{min-height:380px}
  .rp-plate{position:relative;right:auto;top:auto;width:calc(100% - 48px);height:360px;margin:0 24px -40px}
  .b-today{left:auto;right:18px;bottom:-10px;width:120px;height:120px;font-size:.95rem}
  .board-row{margin-top:60px}
  .favs{gap:14px}
  .fav-ph{height:150px}
  .shelf{grid-template-columns:1fr 1fr}
  .n-banner{min-height:0}
  .n-banner::before{background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.55) 35%,rgba(0,0,0,.9) 70%)}
  .n-copy{padding:260px 22px 30px}
  .stamp{right:16px;top:16px}
  .arches{margin:56px 0 0;gap:28px}
  .arch{min-height:0;padding:64px 24px 34px}
  .mosaic{grid-template-columns:1fr 1fr;grid-template-rows:200px 150px 150px}
  .mosaic figure:first-child{grid-column:span 2;grid-row:span 1}
  .num{-webkit-text-stroke-width:2px}
  .mbar{position:fixed;left:10px;right:10px;bottom:10px;z-index:90;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px;border-radius:18px;background:rgba(13,13,13,.96);box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .3s var(--ease),opacity .3s}
  .mbar a{font-weight:700;font-size:.82rem;color:#fff;text-align:center;padding:13px 4px;border-radius:12px}
  .mbar .mbar-go{background:var(--rojo)}
  .mbar.is-hidden{transform:translateY(130%);opacity:0;pointer-events:none}
  body{padding-bottom:78px}
}
@media(max-width:420px){
  .favs{grid-template-columns:1fr}
  .fav,.fav:nth-child(even){transform:none}
}
```

- [ ] **Step 10: Ejecutar todos los tests**

Run: `node --test`
Expected: PASS de todo, incluido `site-consistency` (4 tests nuevos, 38 en total).

- [ ] **Step 11: Verificar en el navegador (dev server en http://localhost:8123, Playwright)**

Con `browser_run_code_unsafe` a 1440×900 y a 375×812, en `http://localhost:8123/`, comprueba:
- consola sin errores;
- 0 imágenes rotas: `[...document.images].filter(i => i.complete && !i.naturalWidth).length === 0`;
- sin overflow-x: `document.documentElement.scrollWidth <= innerWidth`;
- existen `#favs .fav` (4), `#shelf .tile` (6), `#cartas .arch` (2) y `#hoursBody tr.today` (1);
- `#nowState` no dice «Open daily from 8 am».

Pulsa `.lang-toggle` y comprueba que `#mananaTitle` dice «Café.» y que `#hoursBody` contiene «Hoy».

Haz una captura de página completa a 1440 y otra a 375, y revísalas.

Expected: todo en verde. La página se ve como `diseno-dia.html` y `diseno-tarde-noche.html` del companion.

- [ ] **Step 12: Commit**

```bash
git add web/index.html web/css web/js/landing.js web/js/nav.js web/js/focus-trap.js web/js/hero.js tests/site-consistency.test.mjs
git commit -m "feat(un-dia): portada nueva — mañana, mediodía, market vitrina, noche, el lugar y visítanos" -m "Sale Swiper, la línea de tiempo, el menú embebido, el market con carrito y las reseñas de ejemplo." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 6: Arreglos del hero y del nav (#13 #14 #20 #21 #22 #24)

**Files:**
- Modify: `web/index.html` (preload del `<head>` y bloque del hero)
- Modify: `web/css/landing.css` (HERO)
- Modify: `web/css/base.css` (media query del nav y reduced-motion)
- Modify: `web/js/hero.js`

**Interfaces:**
- Consumes: `initHero()` de la Task 5 (misma firma).

- [ ] **Step 1: Medir el estado actual (Playwright, 375×812)**

Run: con `browser_run_code_unsafe` en `http://localhost:8123/`, recoge:
- `performance.getEntriesByType('resource').filter(r => /hero-(drink|burger-ring)/.test(r.name)).length`
- el LCP con `new PerformanceObserver(l => …).observe({type:'largest-contentful-paint', buffered:true})`

Expected: descarga 2 imágenes ocultas (#22) y el elemento LCP es `img.grill-t`.

- [ ] **Step 2: `index.html`, preload al plato y no descargar lo oculto en móvil**

En el `<head>`, sustituye el `<link rel="preload" as="image" href="assets/img/hero-fire-1440.webp" …>` por:

```html
<link rel="preload" as="image" href="assets/img/hero-grill.webp"
      imagesrcset="assets/img/hero-grill-480.webp 480w, assets/img/hero-grill.webp 582w"
      imagesizes="(max-width:700px) 90vw, 740px" fetchpriority="high">
```

En el hero:
- quita `fetchpriority="high"` de `img.hero-fire`;
- añade `fetchpriority="high"` a `img.grill-t`;
- envuelve las dos decoraciones que se ocultan en móvil:

```html
  <picture><source media="(max-width:700px)" srcset="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><img class="dec dec-drink" src="assets/img/hero-drink.webp" alt="" width="330" height="484" aria-hidden="true"></picture>
```

```html
  <picture><source media="(max-width:700px)" srcset="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="><img class="dec dec-ringburger" src="assets/img/hero-burger-ring.webp" alt="" width="283" height="330" aria-hidden="true"></picture>
```

- [ ] **Step 3: `landing.css`, contraste de los CTA (#20) y título sin parpadeo (#13)**

Sustituye:

```css
.hbtn-terra{background:#D4542C}
.hbtn-green{background:#6CB41C}
```

por:

```css
.hbtn-terra{background:#C24A22}                 /* blanco = 4,9:1 (antes 4,1:1) */
.hbtn-green{background:#6CB41C;color:#10210a}   /* texto oscuro = 6,4:1 (antes 2,6:1) */
@media(hover:hover) and (pointer:fine){.hbtn-green:hover{color:#fff}}
/* el texto del hero arranca oculto SOLO con JS; GSAP lo muestra. Red de seguridad a los 2,5 s */
.js .hero-copy > *{opacity:0;animation:heroShow 0s 2.5s forwards}
@keyframes heroShow{to{opacity:1}}
```

- [ ] **Step 4: `base.css`, nav a hamburguesa desde 1024 px (#24) y reduced-motion**

Cambia `@media(max-width:860px){` de la sección NAVBAR por `@media(max-width:1024px){`.

En la regla `@media(prefers-reduced-motion:reduce){…}` final, justo después de `.js .reveal{opacity:1;transform:none}`, añade `.js .hero-copy > *{opacity:1}`.

- [ ] **Step 5: `hero.js`, entrada con `fromTo`, loops pausados fuera de pantalla y chispas sin frames vacíos**

Sustituye `initHero` por:

```js
export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const copy = hero.querySelectorAll('.hero-copy > *');
  const show = () => copy.forEach(el => { el.style.opacity = 1; });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { show(); return; }
  sparks(hero);
  if (!window.gsap) { show(); return; }
  gsap.fromTo(copy, { y: 34, opacity: 0 }, { y: 0, opacity: 1, stagger: .1, duration: .9, ease: 'power3.out' }); // #13
  const loops = [['.dec-chips', 12, 3.6], ['.dec-leaf-a', 10, 2.8], ['.dec-leaf-b', 9, 3.2]]
    .map(([sel, amp, dur]) => gsap.to(sel, { y: -amp, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  loops.push(gsap.to('#platterDisc', { rotation: 360, duration: 48, repeat: -1, ease: 'none' }));
  new IntersectionObserver(([e]) => loops.forEach(tw => (e.isIntersecting ? tw.resume() : tw.pause()))).observe(hero); // #21
  parallax(hero);
}
```

En `sparks()`, cambia los bucles para que solo haya frames mientras existan partículas (#21):
- (a) Tras `let lx = -1, ly = -1, raf = 0, visible = true;` añade `const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };`.
- (b) El IntersectionObserver pasa a ser `new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible) kick(); }).observe(hero);`.
- (c) Al final del handler `mousemove` (dentro del `if` que añade partículas) añade `kick();`.
- (d) Dentro del `setInterval` de los botones, tras `P.push({…});` añade `kick();`.
- (e) En `tick()` sustituye `if (visible) raf = requestAnimationFrame(tick);` por `if (visible && P.length) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H);`.
- (f) Borra la última línea `raf = requestAnimationFrame(tick);`.

- [ ] **Step 6: Verificar (Playwright, 375×812 y 1440×900)**

Repite las medidas del Step 1:
- 0 descargas de `hero-drink` y `hero-burger-ring` a 375 px;
- sigue habiendo descargas a 1440 px;
- LCP en `img.grill-t`.

Con GSAP bloqueado (`page.route('**/gsap*', r => r.abort())`), el título se ve a los ≤ 2,5 s. Con reduced-motion (`page.emulateMedia({reducedMotion:'reduce'})`), se ve al momento. A 900 px el nav es hamburguesa.

Contraste: `getComputedStyle(document.querySelector('.hbtn-green')).color === 'rgb(16, 33, 10)'`.

Expected: todo como se describe, y `node --test` sigue en verde.

- [ ] **Step 7: Commit**

```bash
git add web/index.html web/css/landing.css web/css/base.css web/js/hero.js
git commit -m "fix(hero): LCP, contraste de CTAs, sin parpadeo ni animaciones fuera de pantalla; nav hasta 1024px (#13 #14 #20 #21 #22 #24)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 7: Página de menú y carrito (#5 #9 #10 #16 #17)

**Files:**
- Modify: `web/menu.html`: nav, footer, `og:type`, `aria-label` traducibles y `h1` enfocable
- Modify: `web/js/menu.js`: usa `initNav`, badge dentro del nombre, chip activo al pulsar, `aria-label` del «+» y sincroniza el carrito antes de añadir
- Modify: `web/js/cart.js`: `syncFromStorage`, `revalidate`, trampa de foco, foco estable, `pageshow` y `storage`
- Modify: `web/css/menu.css:15` (`scroll-margin-top`)

**Interfaces:**
- Consumes:
  - `createCart().load/revalidate` (Task 3);
  - `trapFocus` e `initNav` (Task 5);
  - `MENU` (menu-data.js).
- Produces: `cart.js` exporta `cart`, `refresh()`, `syncFromStorage()` e `initCartUI()`.

- [ ] **Step 1: Reproducir #5 (Playwright)**

En `http://localhost:8123/menu.html`, abre una segunda página del mismo contexto. En A añade el primer plato; en B añade el segundo; vuelve a A y añade el primero otra vez.

Lee `localStorage['candela-cart']`.

Expected (antes del arreglo): falta el plato de B. Es el fallo #5.

- [ ] **Step 2: `web/js/cart.js`, sincronizar con lo guardado y revalidar contra la carta**

Sustituye las líneas 1-8 por:

```js
import { createCart, buildWaUrl } from './cart-core.js';
import { t } from './i18n.js';
import { PHONE, MENU } from './menu-data.js';
import { trapFocus } from './focus-trap.js';

const LS = 'candela-cart';
const read = () => { try { return localStorage.getItem(LS); } catch { return null; } };
const lookup = id => { for (const items of Object.values(MENU)) { const it = items.find(i => i.id === id); if (it) return it; } return null; };
export const cart = createCart(read());
cart.revalidate(lookup);

/** Relee lo guardado (otra pestaña o volver atrás) antes de tocar el carrito (#5). */
export function syncFromStorage() { cart.load(read()); cart.revalidate(lookup); }
```

Parte `refresh()` en dos: persistir y pintar. Pintar recoloca el foco (#16). Sustituye la función `refresh()` entera por:

```js
export function refresh() {
  try { localStorage.setItem(LS, cart.serialize()); } catch { /* private mode */ }
  render();
}

function render() {
  const focused = document.activeElement && document.activeElement.closest('#sheetBody button[data-d]');
  const keep = focused ? { id: focused.closest('.qty').dataset.id, d: focused.dataset.d } : null;
  const n = cart.count();
  fab.hidden = n === 0 && !sheet.classList.contains('open');
  document.getElementById('fabCount').textContent = n;
  document.getElementById('fabTotal').textContent = `$${cart.total().toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${cart.total().toFixed(2)}`;

  const body = document.getElementById('sheetBody');
  body.innerHTML = '';
  if (n === 0) {
    const p = document.createElement('p');
    p.className = 'cart-empty';
    p.textContent = t('cart.empty');
    body.appendChild(p);
  } else {
    cart.lines().forEach(l => {
      const row = document.createElement('div');
      row.className = 'sheet-line';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'mi-name';
      nameSpan.textContent = l.name;
      const qtySpan = document.createElement('span');
      qtySpan.className = 'qty';
      qtySpan.dataset.id = l.id;
      const btnMinus = document.createElement('button');
      btnMinus.dataset.d = '-1';
      btnMinus.setAttribute('aria-label', `${t('cart.less')} · ${l.name}`);
      btnMinus.textContent = '−';
      const qtyNum = document.createElement('b');
      qtyNum.textContent = l.qty;
      const btnPlus = document.createElement('button');
      btnPlus.dataset.d = '1';
      btnPlus.setAttribute('aria-label', `${t('cart.more')} · ${l.name}`);
      btnPlus.textContent = '+';
      qtySpan.append(btnMinus, qtyNum, btnPlus);
      const priceSpan = document.createElement('span');
      priceSpan.className = 'mi-price';
      priceSpan.textContent = `$${(l.price * l.qty).toFixed(2)}`;
      row.append(nameSpan, qtySpan, priceSpan);
      body.appendChild(row);
    });
  }

  const wa = document.getElementById('waSend');
  wa.setAttribute('aria-disabled', String(n === 0));
  wa.href = n === 0 ? '#' : buildWaUrl(cart, PHONE, t('wa.greeting'));

  if (keep) {
    const again = body.querySelector(`.qty[data-id="${CSS.escape(keep.id)}"] button[data-d="${keep.d}"]`);
    (again || document.getElementById('cartClose')).focus();
  }
}
```

Sustituye `initCartUI()` entera por:

```js
export function initCartUI() {
  let release = null;
  const close = () => {
    sheet.classList.remove('open'); overlay.hidden = true;
    if (release) release(); release = null;
    refresh();
    (fab.hidden ? document.getElementById('menuTitle') : fab).focus();
  };
  fab.addEventListener('click', () => {
    syncFromStorage();
    sheet.classList.add('open'); overlay.hidden = false; refresh();
    release = trapFocus(sheet);
    document.getElementById('cartClose').focus();
  });
  document.getElementById('cartClose').addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet.classList.contains('open')) close();
  });
  document.getElementById('waSend').addEventListener('click', e => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault();
  });
  document.getElementById('sheetBody').addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    syncFromStorage();
    const id = b.closest('.qty').dataset.id;
    const line = cart.lines().find(l => l.id === id);
    if (line) cart.setQty(id, line.qty + Number(b.dataset.d));
    refresh();
  });
  addEventListener('pageshow', e => { if (e.persisted) { syncFromStorage(); render(); } });
  addEventListener('storage', e => { if (e.key === LS) { syncFromStorage(); render(); } });
  document.addEventListener('langchange', render);
  refresh();
}
```

- [ ] **Step 3: `web/js/menu.js`**

Sustituye las líneas 1-15 (imports y la navbar duplicada) por:

```js
import { MENU, CATEGORIES } from './menu-data.js';
import { initLangToggle, t, getLang } from './i18n.js';
import { cart, refresh, initCartUI, syncFromStorage } from './cart.js';
import { initNav } from './nav.js';

initLangToggle();
initNav();
```

En `render()`:
- **#9:** sustituye la línea del nombre y el badge por
  `<span class="mi-name">${esc(it.name)}${it.badge ? ` <span class="badge">${esc(it.badge)}</span>` : ''}</span>`;
- cambia el `aria-label` del botón por `aria-label="${esc(t('cart.add'))} ${esc(it.name)}"`.

Después de `document.addEventListener('langchange', render);` añade (#10):

```js
chips.addEventListener('click', e => {
  const ch = e.target.closest('.chip');
  if (ch) chips.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === ch));
});
```

En el handler de `main` (añadir al carrito), justo antes de `cart.add(item);`, añade `syncFromStorage();`.

- [ ] **Step 4: `web/css/menu.css`, título visible bajo nav + chips**

En la línea 15 cambia `scroll-margin-top:84px` por `scroll-margin-top:150px`.

- [ ] **Step 5: `web/menu.html`**

Los enlaces del nav y del footer ya se cambiaron en la Task 5, Step 6b. Aquí:
- `og:type` pasa de `restaurant` a `website`.
- `<h1 class="display" data-i18n="menu.title">` pasa a `<h1 class="display" id="menuTitle" tabindex="-1" data-i18n="menu.title">`.
- `<button class="lang-toggle">` pasa a `<button class="lang-toggle" type="button">`.
- El burger lleva `data-i18n-aria="nav.burger"` y `type="button"`.
- `#cartClose` lleva `data-i18n-aria="modal.close"`.

- [ ] **Step 6: Verificar (Playwright)**

- Repite el Step 1. Expected: ahora están los dos platos.
- Guarda `localStorage['candela-cart']='{"x":1}'` y recarga. Expected: el menú carga y el FAB está oculto (#17).
- Guarda una línea `{id:'mk-cafe',name:'Café',price:14.99,qty:1}`. Expected: desaparece al cargar.
- Pulsa el chip «Burgers». Expected: el título `#burgers` queda por debajo de la barra de chips (`getBoundingClientRect().top >= 136`) y el chip está activo.
- Boar's Head: el `.badge` está dentro de `.mi-name` (#9).
- Con el carrito abierto, Tab desde el último control vuelve a `#cartClose`. Pulsa «+» y el foco se queda en el mismo «+» (#16).
- A 375 px, hamburguesa y Escape.
- `node --test` sigue en verde.

- [ ] **Step 7: Commit**

```bash
git add web/menu.html web/js/menu.js web/js/cart.js web/css/menu.css
git commit -m "fix(menú): carrito sincronizado entre pestañas, foco accesible, badge y chips (#5 #9 #10 #16 #17)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 8: SEO e infraestructura (#15 #25) y dato de Google

**Files:**
- Create: `web/robots.txt`, `web/sitemap.xml`
- Modify: `netlify.toml:5-7`, `web/netlify.toml:3-6` (cabecera de caché)
- Modify (si el dato cambió): `web/js/site-data.js` (`GOOGLE`) y `web/index.html` (`#gRating`, `#gReviews`)

- [ ] **Step 1: Crear `web/robots.txt` y `web/sitemap.xml`**

```text
User-agent: *
Allow: /
Sitemap: https://candelaycafe.com/sitemap.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://candelaycafe.com/</loc></url>
  <url><loc>https://candelaycafe.com/menu</loc></url>
</urlset>
```

- [ ] **Step 2: Caché de imágenes sin `immutable` (#15)**

En `netlify.toml` y en `web/netlify.toml`, en el bloque `for = "/assets/img/*"`, cambia `Cache-Control = "public, max-age=31536000, immutable"` por `Cache-Control = "public, max-age=604800"`.

- [ ] **Step 3: Verificar la nota de Google**

Abre en el navegador `https://www.google.com/maps/search/?api=1&query=Candela+y+Caf%C3%A9+Market%2C+507+N+Miami+Ave%2C+Miami%2C+FL` y lee la nota y el número de reseñas del perfil.

Si difieren de 4.6 / 136, actualiza `GOOGLE.rating`, `GOOGLE.count` y `GOOGLE.asOf` (fecha de hoy) en `site-data.js`, y los textos de `#gRating` y `#gReviews` en `index.html`.

Run: `node --test tests/site-consistency.test.mjs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add web/robots.txt web/sitemap.xml netlify.toml web/netlify.toml web/js/site-data.js web/index.html
git commit -m "chore(seo): robots.txt, sitemap.xml, caché de imágenes sin immutable y nota de Google verificada (#15 #25)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 9: Verificación final y preview

**Files:** ninguno, salvo los arreglos que salgan de las comprobaciones. Cada arreglo lleva su propio commit `fix(un-dia): …`.

- [ ] **Step 1: Todos los tests**

Run: `node --test`
Expected: PASS de todo, 0 fallos.

- [ ] **Step 2: Matriz en el navegador (Playwright) con las 5 líneas de Review Focus**

Anchos a revisar: 320×640, 375×812, 768×1024, 1024×768 y 1440×900, en `index.html` y `menu.html`.

En cada ancho:
- consola sin errores;
- 0 errores 404;
- sin overflow-x;
- la barra fija (≤ 768) no tapa ningún CTA: `elementFromPoint` en el centro de cada `.btn` visible devuelve el propio botón o un hijo;
- `body` tiene `padding-bottom` ≥ al alto de `.mbar`;
- la hamburguesa funciona después de hacer scroll (≤ 1024).

Además:
- **Sin JS** (`javaScriptEnabled:false`): se ven el texto del hero, las secciones y el horario de respaldo.
- **Otra zona horaria** (`timezoneId:'Europe/Madrid'`): el estado coincide con la hora de Miami.
- **EN ↔ ES:** cambian todos los textos, los `alt` y los `aria-label`.

- [ ] **Step 3: Lighthouse en móvil**

Run: `npx lighthouse http://localhost:8123/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,seo,best-practices --quiet --chrome-flags="--headless=new" --output=json --output-path=./lh.json`, y lee los scores.

Expected: rendimiento ≥ 90, accesibilidad ≥ 95 y CLS < 0.05. Si no se cumple, arregla, vuelve a medir y haz commit. `lh.json` no se commitea: bórralo al terminar.

- [ ] **Step 4: Preview en Netlify (no es producción)**

Run: `netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5 --message "preview un-dia"`
Expected: una URL `https://<hash>--candela-cafe-market.netlify.app`. Ábrela y repite el Step 2 a 375 y 1440.

- [ ] **Step 5: Revisión final de la rama**

Pide una revisión de toda la rama `feature/un-dia-en-candela` contra el spec a un revisor nuevo, con `superpowers:requesting-code-review` o `/code-review`. Aplica lo que se confirme.

- [ ] **Step 6: Entregar**

Pasa a Robert:
- la URL de la preview;
- lo que queda pendiente del cliente (spec §7);
- el recordatorio de que producción necesita su OK y que el merge a `master` espera al rescate.

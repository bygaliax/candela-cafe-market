# Rediseño web Candela & Café — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer la piel visual del sitio de Candela & Café al nivel de craft de sus posts (rojo/verde/negro sin amarillo, Architects Daughter, ritmo claro/oscuro) y añadir las interacciones nuevas (carrusel circular del hero, chips de categoría, timeline por scroll, modal de reserva, market e-commerce, reseñas Google), reusando toda la infra funcional que ya existe.

**Architecture:** Sitio estático en `web/` sin build step. Se CONSERVAN `cart-core.js`, `menu-data.js` (79 items reales), `i18n.js`, `menu.js`/`cart.js`, schema/SEO y el pipeline de imágenes. Se REHACEN `index.html`, `web/css/*` y `web/js/landing.js`, y se añaden `market-data.js` + un helper de reserva en `cart-core.js`. La CSS/markup aprobados viven verbatim en los mockups del visual companion (generados por `tools/build-*-mock.mjs`) — son la **fuente de verdad visual** a portar.

**Tech Stack:** HTML5, CSS custom properties, JS ES modules, GSAP 3 + ScrollTrigger (CDN), Swiper 11 (CDN, efecto "cards" de Live Music), sharp (tooling de imágenes), node:test. Netlify.

**Spec:** `docs/superpowers/specs/2026-06-10-candela-web-rediseno-design.md` (fuente de verdad de decisiones).

**Mockups aprobados (fuente visual a portar):**
- Hero → `tools/build-hero-mock.mjs` (genera `hero-v5.html`)
- Menú (chips), Historia (timeline), Live Music (modal + Swiper) → `tools/build-sections-mock.mjs` (`sections-4.html`)
- Market (e-commerce), Catering, Galería, Reseñas (Google), Visítanos, Footer → `tools/build-sections2-mock.mjs` (`sections-8.html`)

> **Regla de oro de este plan:** la CSS de cada sección ya está escrita y aprobada en esos scripts de mockup. "Portar" = copiar las reglas `.clase{...}` al CSS externo, reemplazar `data:`-URIs por `<img srcset>` reales, y cablear textos a `data-i18n`. NO reinventar estilos.

**Datos fijos (usar EXACTAMENTE):** `PHONE='17862547577'` · 507 N Miami Ave, Miami FL 33136 · Dom–Mar 8am–10pm / Mié–Sáb 8am–11:30pm · @candelaycafe · IG https://www.instagram.com/candelaycafe/

---

## File Structure

```
web/
├── index.html          ← REHACER (landing, 10 secciones, data-i18n, mount points)
├── menu.html           ← MODIFICAR (re-pintar con tokens nuevos; lógica intacta)
├── css/
│   ├── base.css        ← REHACER (tokens nuevos, utilidades, nav, footer, modo claro)
│   ├── landing.css     ← REHACER (estilos por sección, portados de mockups)
│   └── menu.css        ← MODIFICAR (ajustar a tokens nuevos)
├── js/
│   ├── i18n.js         ← MODIFICAR (añadir claves nuevas)
│   ├── menu-data.js    ← REUSO (sin tocar)
│   ├── market-data.js  ← CREAR (catálogo placeholder del market)
│   ├── cart-core.js    ← MODIFICAR (añadir buildReservationUrl + test)
│   ├── cart.js         ← REUSO (sin tocar)
│   ├── landing.js      ← REHACER (hero carousel, tabs, timeline, modal, swiper, market, reveals)
│   └── menu.js         ← REUSO (sin tocar)
└── assets/img/         ← + miami-skyline-*.webp
tools/
├── convert-images.mjs  ← MODIFICAR (añadir skyline de Miami)
tests/
├── cart-core.test.mjs  ← MODIFICAR (añadir tests de buildReservationUrl)
```

Responsabilidades: `cart-core.js` = lógica pura testeable (carrito + URLs WhatsApp). `market-data.js` = solo datos. `landing.js` = orquesta DOM/animación de la landing. `i18n.js` no conoce el menú ni el market (nombres no se traducen).

---

### Task 1: Tokens base y utilidades compartidas (`base.css`)

**Files:**
- Rehacer: `web/css/base.css`

- [ ] **Step 1: Reescribir `web/css/base.css`** con los tokens y utilidades nuevas (portar de los `:root` y reglas compartidas de los mockups). Contenido completo:

```css
/* ============ TOKENS ============ */
:root{
  --negro:#0d0d0d; --carbon:#141212;
  --rojo:#ED3B2F; --rojo-hover:#C92A1F; --verde:#76C043; --verde-d:#4f8a2a;
  --claro:#FBF7F0; --crema:#F5F0E8; --ink:#1c1c1c; --ink-2:#5b534a; --gris-d:#a89f95;
  --fuego:linear-gradient(95deg,#ff5a3c 0%,#ED3B2F 55%,#C92A1F 100%); /* ROJO→ROJO, sin amarillo */
  --disp:'Architects Daughter',cursive; --body:'DM Sans',system-ui,sans-serif;
  --maxw:1180px; --radius:14px; --ease:cubic-bezier(.22,.61,.36,1);
  --swiper-pagination-color:#76C043; --swiper-pagination-bullet-inactive-color:rgba(255,255,255,.5);
}
/* ============ RESET ============ */
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--body);background:var(--negro);color:var(--crema);line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block;height:auto}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
ul{list-style:none}
/* ============ UTILIDADES ============ */
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 40px}
.section{position:relative;overflow:hidden;padding:96px 0}
.kick{font-size:.72rem;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--verde);display:inline-flex;align-items:center;gap:10px}
.kick::before{content:"";width:26px;height:2px;background:var(--verde)}
.stitle{font-family:var(--disp);line-height:1.04;font-size:clamp(2.2rem,4.4vw,3.4rem);margin:12px 0 8px}
h1.display{font-family:var(--disp);line-height:1.02}
.fire{background:var(--fuego);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 16px rgba(237,59,47,.4))}
.ssub{max-width:56ch;font-size:1.02rem;color:var(--gris-d)}
.btn{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:9px;font-weight:700;font-size:.82rem;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:transform .2s var(--ease)}
.btn:hover{transform:translateY(-2px)}
.btn-p{background:var(--rojo);color:#fff;box-shadow:0 8px 24px rgba(237,59,47,.42)}
.btn-p:hover{background:var(--rojo-hover)}
.btn-g{background:var(--verde);color:#10210a;box-shadow:0 8px 24px rgba(118,192,67,.3)}
.btn-ghost{border:1.6px solid currentColor;background:transparent}
.seal{width:92px;height:92px;border-radius:50%;background:#0d0d0d;display:grid;place-items:center;box-shadow:0 8px 28px rgba(0,0,0,.45),0 0 0 2px rgba(237,59,47,.5)}
.seal img{width:78px;height:78px;border-radius:50%}
.frame{padding:7px;background:var(--fuego);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
.frame img{display:block;width:100%;border-radius:12px;object-fit:cover}
/* ============ MODO CLARO ============ */
.light{background:var(--claro);color:var(--ink)}
.light .kick{color:var(--verde-d)} .light .kick::before{background:var(--verde-d)}
.light .stitle{color:var(--ink)} .light .ssub{color:var(--ink-2)}
/* ============ NAVBAR (contenida al ancho del hero) ============ */
.nav{position:fixed;inset:0 0 auto;z-index:100;transition:background .3s,padding .3s}
.nav-inner{max-width:1240px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:22px 40px}
.nav.is-scrolled{background:rgba(13,13,13,.94);backdrop-filter:blur(10px)}
.nav.is-scrolled .nav-inner{padding:12px 40px}
.nav-logo{display:flex;align-items:center;gap:12px}
.nav-logo img{width:46px;height:46px;border-radius:50%}
.nav-logo b{font-family:var(--disp);font-size:1.15rem}
.nav-links{display:flex;gap:26px;align-items:center;font-size:.76rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
.nav-links a{position:relative;padding:4px 0}
.nav-links a::after{content:"";position:absolute;left:0;bottom:0;width:0;height:2px;background:var(--verde);transition:width .25s var(--ease)}
.nav-links a:hover::after{width:100%}
.lang-toggle{border:1.5px solid var(--verde);border-radius:999px;padding:5px 14px;font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--verde)}
.lang-toggle:hover{background:var(--verde);color:#10210a}
.nav-burger{display:none;flex-direction:column;gap:5px}
.nav-burger span{width:24px;height:2px;background:var(--crema)}
@media(max-width:860px){
  .nav-links{display:none;position:fixed;inset:0;background:var(--negro);flex-direction:column;justify-content:center;font-size:1.1rem;gap:34px}
  .nav-links.open{display:flex}
  .nav-burger{display:flex;z-index:101}
}
/* ============ FOOTER ============ */
.footer{background:#070707;border-top:1px solid rgba(255,255,255,.08);padding:64px 0 30px;color:var(--gris-d);font-size:.92rem}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px}
@media(max-width:760px){.footer-grid{grid-template-columns:1fr;gap:26px}}
.footer .brand{display:flex;align-items:center;gap:12px;color:var(--crema)}
.footer .brand img{width:50px;height:50px;border-radius:50%}
.footer .brand b{font-family:var(--disp);font-size:1.2rem}
.footer h4{color:#fff;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px}
.footer a{display:block;padding:4px 0}.footer a:hover{color:var(--verde)}
.foot-bottom{margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:.82rem}
/* ============ MOTION ============ */
.reveal{opacity:0;transform:translateY(26px)}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.reveal{opacity:1;transform:none}*,*::before,*::after{animation:none!important;transition:none!important}}
```

- [ ] **Step 2: Commit**

```powershell
git add web/css/base.css; git commit -m "feat(rediseño): tokens y utilidades base (rojo sin amarillo, modo claro, nav contenida)"
```

---

### Task 2: Ampliar i18n con las claves del rediseño

**Files:**
- Modificar: `web/js/i18n.js` (añadir claves al objeto `DICT`)

- [ ] **Step 1: Abrir `web/js/i18n.js` y añadir estas entradas dentro de `DICT`** (no borrar las existentes; añadir las que falten). Bloque a insertar:

```js
  /* ---- nav ---- */
  'nav.menu':{en:'Menu',es:'Menú'}, 'nav.history':{en:'Story',es:'Historia'},
  'nav.music':{en:'Live Music',es:'Música'}, 'nav.market':{en:'Market',es:'Market'},
  'nav.catering':{en:'Catering',es:'Catering'}, 'nav.visit':{en:'Visit',es:'Visítanos'},
  'nav.order':{en:'Order Now',es:'Ordena Ya'},
  /* ---- hero ---- */
  'hero.kicker':{en:'NY Deli · Dominican Soul · Downtown Miami',es:'NY Deli · Alma Dominicana · Downtown Miami'},
  'hero.t1':{en:'Born in NY,',es:'Nacidos en NY,'},
  'hero.t2':{en:'raised Dominican,',es:'criados dominicanos,'},
  'hero.t3a':{en:'served in',es:'servidos en'}, 'hero.t3b':{en:'Miami',es:'Miami'},
  'hero.sub':{en:'Classic deli craft, Dominican sazón and specialty coffee — plus live music every Friday, in the heart of Downtown Miami.',
              es:'Oficio de deli clásico, sazón dominicana y café de especialidad — más música en vivo los viernes, en el corazón de Downtown Miami.'},
  'hero.cta.order':{en:'Order Now',es:'Ordena Ya'}, 'hero.cta.music':{en:'Live Music Fridays',es:'Viernes en Vivo'},
  'hero.meta':{en:'Open daily from 8am · 507 N Miami Ave',es:'Abierto todos los días desde las 8am · 507 N Miami Ave'},
  /* ---- menú destacados ---- */
  'menu.kicker':{en:'The Menu · Explore by category',es:'El Menú · Explora por categoría'},
  'menu.title.a':{en:'Fresh,',es:'Fresco,'}, 'menu.title.b':{en:'every day',es:'todos los días'},
  'menu.cta':{en:'View full menu & order',es:'Ver menú completo & ordenar'},
  /* ---- historia ---- */
  'hist.kicker':{en:'Our Story',es:'Nuestra historia'},
  'hist.title.a':{en:'From New York to Miami, with Dominican',es:'De Nueva York a Miami, con'}, 'hist.title.b':{en:'candela',es:'candela'},
  'hist.sub':{en:'Scroll: the line lights up as the story moves from the roots to today.',es:'Haz scroll: la línea se enciende mientras la historia avanza de los orígenes hasta hoy.'},
  'hist.1.tag':{en:'The roots',es:'El origen'}, 'hist.1.title':{en:'New York deli craft',es:'Oficio deli de Nueva York'},
  'hist.1.body':{en:'Pastrami, bagels, Boar’s Head cold cuts — the craft of the classic NY delicatessen.',es:'Pastrami, bagels, embutidos Boar’s Head — el oficio del delicatessen neoyorquino.'},
  'hist.2.tag':{en:'The soul',es:'La herencia'}, 'hist.2.title':{en:'Dominican soul',es:'Alma dominicana'},
  'hist.2.body':{en:'Mangú, fritura, home sazón and coffee that tastes like the neighborhood. The candela that lights it all.',es:'Mangú, fritura, sazón de casa y café que sabe a barrio. La candela que lo enciende todo.'},
  'hist.3.tag':{en:'The leap',es:'El salto'}, 'hist.3.title':{en:'Lands in Downtown Miami',es:'Llega a Downtown Miami'},
  'hist.3.body':{en:'Candela & Café opens at 507 N Miami Ave — apartments above, loyal neighborhood below.',es:'Candela & Café abre en 507 N Miami Ave — apartamentos arriba, barrio fiel abajo.'},
  'hist.4.tag':{en:'Today',es:'Hoy'}, 'hist.4.title':{en:'Deli · Market · Music',es:'Deli · Market · Música'},
  'hist.4.body':{en:'Daily food, mini-market, and live music on Fridays. One place, a thousand flavors.',es:'Comida diaria, mini-market y música en vivo los viernes. Un solo lugar, mil sabores.'},
  /* ---- live music + reserva ---- */
  'music.kicker':{en:'Friday Nights',es:'Viernes por la noche'},
  'music.p1':{en:'Every Friday',es:'Todos los viernes'}, 'music.p2':{en:'Live music',es:'Música en vivo'}, 'music.p3':{en:'From 8pm',es:'Desde las 8pm'},
  'music.body':{en:'Every Friday the deli lights up: live music, wine, beer and the best vibe Downtown. Come for dinner, stay for the candela.',es:'Cada viernes el deli se enciende: música en vivo, vino, cerveza y el mejor ambiente de Downtown. Ven a cenar, quédate por la candela.'},
  'music.cta':{en:'Reserve a table',es:'Reservar mesa'},
  'res.title.a':{en:'Reserve your',es:'Reserva tu'}, 'res.title.b':{en:'Friday',es:'viernes'},
  'res.sub':{en:'Live music every Friday. Fill this in and we confirm by WhatsApp.',es:'Música en vivo todos los viernes. Completa y confirmamos por WhatsApp.'},
  'res.name':{en:'Name',es:'Nombre'}, 'res.phone':{en:'Phone',es:'Teléfono'}, 'res.day':{en:'Friday',es:'Viernes'}, 'res.time':{en:'Time',es:'Hora'}, 'res.guests':{en:'Guests',es:'Personas'},
  'res.go':{en:'Confirm via WhatsApp',es:'Confirmar por WhatsApp'}, 'res.note':{en:'We’ll reply to confirm availability.',es:'Te responderemos para confirmar disponibilidad.'},
  'res.greeting':{en:'Hi Candela & Café! I’d like to reserve for live music',es:'¡Hola Candela & Café! Quiero reservar para la música en vivo'},
  /* ---- market ---- */
  'market.kicker':{en:'Daily Market · Bodega',es:'Daily Market · Bodega'},
  'market.title.a':{en:'The neighborhood',es:'El mercado del'}, 'market.title.b':{en:'market',es:'barrio'},
  'market.sub':{en:'The basics and the good stuff, around the corner. Coffee, fresh, pantry and treats — pick up or we deliver.',es:'Lo básico y lo rico, a la vuelta de tu casa. Café, frescos, despensa y antojos — pide y recoge, o te lo enviamos.'},
  'market.cta':{en:'See the whole market',es:'Ver todo el market'}, 'market.add':{en:'Add',es:'Agregar'}, 'market.instore':{en:'In-store',es:'En tienda'},
  /* ---- catering ---- */
  'catering.kicker':{en:'Corporate Catering',es:'Catering Corporativo'},
  'catering.title.a':{en:'Elevate your',es:'Eleva tus'}, 'catering.title.b':{en:'events',es:'eventos'},
  'catering.body':{en:'Breakfast trays, sandwich platters and Dominican specialties for offices and events Downtown. Tell us the date and headcount — we handle the rest.',es:'Bandejas de desayuno, tablas de sándwiches y especialidades dominicanas para oficinas y eventos en Downtown. Dinos fecha y cantidad — nosotros hacemos el resto.'},
  'catering.b1':{en:'Breakfast & coffee trays',es:'Bandejas de desayuno & café'}, 'catering.b2':{en:'Boar’s Head sandwich platters',es:'Tablas de sándwiches Boar’s Head'}, 'catering.b3':{en:'Dominican specialties',es:'Especialidades dominicanas'},
  'catering.cta':{en:'Get a quote',es:'Pide tu cotización'},
  'catering.wa':{en:'Hi! I’d like a catering quote.',es:'¡Hola! Quiero una cotización de catering.'},
  /* ---- galería ---- */
  'gallery.kicker':{en:'The vibe',es:'El ambiente'}, 'gallery.title.a':{en:'Follow the',es:'Sigue la'}, 'gallery.title.b':{en:'candela',es:'candela'},
  'gallery.cta':{en:'Follow @candelaycafe',es:'Síguenos @candelaycafe'},
  /* ---- reseñas ---- */
  'reviews.kicker':{en:'What people say',es:'Lo que dicen'}, 'reviews.title.a':{en:'The neighborhood already',es:'El barrio ya lo'}, 'reviews.title.b':{en:'knows',es:'sabe'},
  'reviews.rating':{en:'Real Google reviews',es:'Reseñas reales de Google'}, 'reviews.write':{en:'Write a review',es:'Escribe tu reseña'},
  /* ---- visítanos ---- */
  'visit.kicker':{en:'Visit Us',es:'Visítanos'}, 'visit.title.a':{en:'Downtown Miami, with',es:'Downtown Miami, con'}, 'visit.title.b':{en:'parking',es:'parking'},
  'visit.h1':{en:'Sun–Tue · 8:00am – 10:00pm',es:'Dom–Mar · 8:00am – 10:00pm'}, 'visit.h2':{en:'Wed–Sat · 8:00am – 11:30pm',es:'Mié–Sáb · 8:00am – 11:30pm'},
  'visit.call':{en:'Call us',es:'Llámanos'}, 'visit.dir':{en:'Get directions',es:'Cómo llegar'},
  /* ---- footer ---- */
  'footer.tag':{en:'NY Deli · Market & Café — made with candela in Downtown Miami.',es:'NY Deli · Market & Café — hecho con candela en Downtown Miami.'},
  'footer.explore':{en:'Explore',es:'Explora'}, 'footer.orders':{en:'Orders & Social',es:'Pedidos & Redes'},
```

- [ ] **Step 2: Smoke test del diccionario** (no debe haber claves sin en/es):

```powershell
node -e "import('./web/js/i18n.js').then(m=>{const bad=Object.entries(m.DICT).filter(([k,v])=>!v.en||!v.es);if(bad.length){console.error('claves incompletas',bad.map(b=>b[0]));process.exit(1)}console.log('DICT ok',Object.keys(m.DICT).length,'claves')})"
```

Expected: `DICT ok <n> claves` (sin errores).

- [ ] **Step 3: Commit** — `git add web/js/i18n.js; git commit -m "feat(rediseño): claves i18n de todas las secciones nuevas"`

---

### Task 3: `market-data.js` — catálogo placeholder del market

**Files:**
- Crear: `web/js/market-data.js`

- [ ] **Step 1: Crear `web/js/market-data.js`**:

```js
// Catálogo del Market. PLACEHOLDER de muestra — reemplazar por el inventario real del cliente.
// item: { id, cat:{en,es}, name, price:Number(0=en tienda), img:slug|null }
export const MARKET = [
  { id: 'mk-cafe',     cat:{en:'Coffee',es:'Café'},      name:'Café en grano de la casa',     price:14.99, img:'mk-cafe' },
  { id: 'mk-aceite',   cat:{en:'Gourmet',es:'Gourmet'},  name:'Aceite de oliva extra virgen', price:12.99, img:'mk-aceite' },
  { id: 'mk-frutas',   cat:{en:'Fresh',es:'Frescos'},    name:'Frutas & vegetales',           price:0,     img:'mk-frutas' },
  { id: 'mk-cereal',   cat:{en:'Breakfast',es:'Desayuno'},name:'Cereales & granola',          price:6.99,  img:'mk-cereal' },
  { id: 'mk-despensa', cat:{en:'Pantry',es:'Despensa'},  name:'Básicos de despensa',          price:0,     img:'mk-despensa' },
  { id: 'mk-verdes',   cat:{en:'Organic',es:'Orgánico'}, name:'Verdes orgánicos',             price:0,     img:'mk-verdes' },
];
// ⚠ Las imágenes mk-* aún no existen como WebP reales: Task 11 las añade desde tools/prod
// (placeholders de stock) o el cliente entrega las suyas.
```

- [ ] **Step 2: Commit** — `git add web/js/market-data.js; git commit -m "feat(rediseño): market-data placeholder del e-commerce"`

---

### Task 4: Helper de reserva en `cart-core.js` (TDD)

**Files:**
- Modificar: `web/js/cart-core.js`
- Modificar: `tests/cart-core.test.mjs`

- [ ] **Step 1: Escribir el test que falla** — añadir al final de `tests/cart-core.test.mjs`:

```js
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
```

- [ ] **Step 2: Verificar que falla** — `node --test tests/` → Expected: FAIL (`buildReservationUrl is not a function` / export inexistente).

- [ ] **Step 3: Implementar en `web/js/cart-core.js`** (añadir al final, después de `buildWaUrl`):

```js
export function buildReservationUrl(data, phone, greeting) {
  const { day, time, guests, name, phone: tel } = data;
  let msg = `${greeting} del ${day} a las ${time}, para ${guests} personas.`;
  if (name) msg += ` Nombre: ${name}.`;
  if (tel)  msg += ` Tel: ${tel}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
```

- [ ] **Step 4: Verificar que pasa** — `node --test tests/` → Expected: todos PASS (los 5 previos + 2 nuevos).

- [ ] **Step 5: Commit** — `git add web/js/cart-core.js tests/cart-core.test.mjs; git commit -m "feat(rediseño): buildReservationUrl con tests (node:test)"`

---

### Task 5: `index.html` — estructura completa de la landing

**Files:**
- Rehacer: `web/index.html`

- [ ] **Step 1: Reescribir `web/index.html`.** Cargar fuentes + Swiper CSS (SRI) + GSAP/Swiper (defer, SRI) + `js/landing.js`. Estructura con `data-i18n` en cada texto y mount points (`id`) para lo que renderiza JS. Esqueleto completo:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Candela & Café Market — NY Deli, Dominican Soul & Live Music | Downtown Miami</title>
<meta name="description" content="NY-style deli sandwiches, Dominican specialties, specialty coffee, daily market and live music Fridays. 507 N Miami Ave, Downtown Miami. Order via WhatsApp.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="css/base.css"><link rel="stylesheet" href="css/landing.css">
<!-- OG + schema.org: portar del index.html anterior (Task 12 los reverifica) -->
</head>
<body>
<nav class="nav" id="nav"><div class="nav-inner">
  <a class="nav-logo" href="#"><img src="assets/img/logo-96.webp" alt="Candela & Café" width="46" height="46"><b>CANDELA & CAFÉ</b></a>
  <div class="nav-links" id="navLinks">
    <a href="#menu" data-i18n="nav.menu">Menu</a>
    <a href="#historia" data-i18n="nav.history">Story</a>
    <a href="#music" data-i18n="nav.music">Live Music</a>
    <a href="#market" data-i18n="nav.market">Market</a>
    <a href="#catering" data-i18n="nav.catering">Catering</a>
    <a href="#visit" data-i18n="nav.visit">Visit</a>
    <button class="lang-toggle" aria-label="Language">ES</button>
    <a class="btn btn-p nav-cta" href="menu.html" data-i18n="nav.order">Order Now</a>
  </div>
  <button class="nav-burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
</div></nav>

<header class="hero" id="hero">
  <div class="hero-bg"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="ghost" aria-hidden="true">CANDELA</span>
      <span class="kick" data-i18n="hero.kicker">NY Deli · Dominican Soul · Downtown Miami</span>
      <h1 class="display hero-title">
        <span class="l1" data-i18n="hero.t1">Born in NY,</span>
        <span class="l1" data-i18n="hero.t2">raised Dominican,</span>
        <span class="l2"><span data-i18n="hero.t3a">served in</span> <span class="fire" data-i18n="hero.t3b">Miami</span></span>
      </h1>
      <p class="ssub" data-i18n="hero.sub">…</p>
      <div class="hero-ctas">
        <a class="btn btn-p" href="menu.html" data-i18n="hero.cta.order">Order Now</a>
        <a class="btn btn-ghost" href="#music" data-i18n="hero.cta.music">Live Music Fridays</a>
      </div>
      <p class="hero-meta" data-i18n="hero.meta">Open daily from 8am · 507 N Miami Ave</p>
    </div>
    <div class="hero-visual">
      <div class="ring"><div class="hero-carousel" id="heroCarousel"><!-- slides inyectados por landing.js --></div>
        <div class="seal"><img src="assets/img/logo-96.webp" alt="" width="78" height="78"></div></div>
    </div>
  </div>
</header>

<section class="section s-menu" id="menu">
  <div class="miami"></div><div class="glow"></div>
  <div class="wrap">
    <div class="menu-head"><div>
      <span class="kick" data-i18n="menu.kicker">The Menu · Explore by category</span>
      <h2 class="stitle"><span data-i18n="menu.title.a">Fresh,</span> <span class="fire" data-i18n="menu.title.b">every day</span></h2>
    </div></div>
    <div class="chips" id="menuChips"><!-- chips inyectados --></div>
    <div class="dishes" id="menuDishes"><!-- cards inyectadas --></div>
    <div class="menu-cta"><a class="btn btn-p" href="menu.html" data-i18n="menu.cta">View full menu & order</a></div>
  </div>
</section>

<section class="section s-time" id="historia">
  <div class="time-head wrap">
    <span class="kick" data-i18n="hist.kicker">Our Story</span>
    <h2 class="stitle"><span data-i18n="hist.title.a">From New York to Miami, with Dominican</span> <span class="fire" data-i18n="hist.title.b">candela</span></h2>
    <p class="ssub" data-i18n="hist.sub">…</p>
  </div>
  <div class="timeline" id="timeline">
    <div class="spine"><div class="spine-fill" id="spineFill"></div></div>
    <!-- 4 hitos: cada uno .ms.ms--l/.ms--r con .ms-photo (img real), .ms-node, .ms-text (tag/title/body con data-i18n hist.N.*) -->
  </div>
</section>

<section class="section s-music" id="music">
  <div class="wrap music-grid">
    <div>
      <span class="kick" data-i18n="music.kicker">Friday Nights</span>
      <h2 class="neon">Live Music<br>Fridays</h2>
      <div class="ev-pills"><span class="pill" data-i18n="music.p1">Every Friday</span><span class="pill" data-i18n="music.p2">Live music</span><span class="pill" data-i18n="music.p3">From 8pm</span></div>
      <p class="ssub" data-i18n="music.body">…</p>
      <button class="btn btn-g" id="openRes" data-i18n="music.cta">Reserve a table</button>
    </div>
    <div class="swiper live-swiper"><div class="swiper-wrapper" id="liveSlides"><!-- slides inyectados --></div><div class="swiper-pagination"></div></div>
  </div>
</section>

<section class="section light s-market" id="market">
  <div class="wrap"><div class="shop-head"><div>
    <span class="kick" data-i18n="market.kicker">Daily Market · Bodega</span>
    <h2 class="stitle"><span data-i18n="market.title.a">The neighborhood</span> <span class="fire" data-i18n="market.title.b">market</span></h2>
    <p class="ssub" data-i18n="market.sub">…</p>
  </div><a class="btn btn-p" href="#" data-i18n="market.cta">See the whole market</a></div>
  <div class="shop" id="marketShop"><!-- productos inyectados --></div></div>
</section>

<section class="section light s-catering" id="catering">
  <div class="wrap grid2">
    <div class="photo-wrap reveal" style="order:-1"><div class="frame"><img src="assets/img/catering-960.webp" srcset="assets/img/catering-480.webp 480w, assets/img/catering-960.webp 960w" sizes="(max-width:860px) 100vw, 46vw" alt="Catering" loading="lazy"></div><div class="seal"><img src="assets/img/logo-96.webp" alt="" width="78" height="78"></div></div>
    <div class="reveal">
      <span class="kick" data-i18n="catering.kicker">Corporate Catering</span>
      <h2 class="stitle"><span data-i18n="catering.title.a">Elevate your</span> <span class="fire" data-i18n="catering.title.b">events</span></h2>
      <p class="ssub" data-i18n="catering.body">…</p>
      <ul class="bullets"><li data-i18n="catering.b1">…</li><li data-i18n="catering.b2">…</li><li data-i18n="catering.b3">…</li></ul>
      <a class="btn btn-p" id="cateringWa" href="#" target="_blank" rel="noopener" data-i18n="catering.cta">Get a quote</a>
    </div>
  </div>
</section>

<section class="section s-gallery" id="gallery">
  <div class="wrap">
    <span class="kick" data-i18n="gallery.kicker">The vibe</span>
    <h2 class="stitle"><span data-i18n="gallery.title.a">Follow the</span> <span class="fire" data-i18n="gallery.title.b">candela</span></h2>
    <div class="gallery"><!-- 9 <a.g-item><img real> (g-0 destacado). Ver Task 6 -->
    </div>
    <a class="btn btn-ghost" href="https://www.instagram.com/candelaycafe/" target="_blank" rel="noopener" data-i18n="gallery.cta">Follow @candelaycafe</a>
  </div>
</section>

<section class="section light s-reviews" id="reviews">
  <div class="wrap">
    <span class="kick" data-i18n="reviews.kicker">What people say</span>
    <h2 class="stitle"><span data-i18n="reviews.title.a">The neighborhood already</span> <span class="fire" data-i18n="reviews.title.b">knows</span></h2>
    <div class="rev-top"><div class="g-rate"><span class="g-num">4.8</span><span class="g-stars">★★★★★</span><span class="g-sub" data-i18n="reviews.rating">Real Google reviews</span></div>
      <a class="btn btn-p" id="googleWrite" href="https://www.google.com/maps/search/Candela+y+Caf%C3%A9+Market,+507+N+Miami+Ave,+Miami,+FL" target="_blank" rel="noopener" data-i18n="reviews.write">Write a review</a></div>
    <div class="reviews"><!-- 3 .rev (placeholder, ver Task 6); reemplazar por reseñas reales con Place ID --></div>
  </div>
</section>

<section class="section s-visit" id="visit">
  <div class="wrap grid2">
    <div>
      <span class="kick" data-i18n="visit.kicker">Visit Us</span>
      <h2 class="stitle"><span data-i18n="visit.title.a">Downtown Miami, with</span> <span class="fire" data-i18n="visit.title.b">parking</span></h2>
      <address>507 N Miami Ave, Miami, FL 33136</address>
      <div class="hours"><span data-i18n="visit.h1">Sun–Tue · 8:00am – 10:00pm</span><span data-i18n="visit.h2">Wed–Sat · 8:00am – 11:30pm</span></div>
      <div class="visit-ctas"><a class="btn btn-p" href="tel:+17862547577" data-i18n="visit.call">Call us</a>
        <a class="btn btn-ghost" href="https://maps.google.com/?q=507+N+Miami+Ave,+Miami,+FL+33136" target="_blank" rel="noopener" data-i18n="visit.dir">Get directions</a></div>
    </div>
    <iframe class="map" loading="lazy" title="Candela & Café map" src="https://www.google.com/maps?q=507+N+Miami+Ave,+Miami,+FL+33136&output=embed"></iframe>
  </div>
</section>

<footer class="footer"><div class="wrap"><div class="footer-grid">
  <div><div class="brand"><img src="assets/img/logo-96.webp" alt="" width="50" height="50"><b>CANDELA & CAFÉ</b></div><p style="margin-top:14px;max-width:38ch" data-i18n="footer.tag">…</p></div>
  <div><h4 data-i18n="footer.explore">Explore</h4><a href="#menu" data-i18n="nav.menu">Menu</a><a href="#historia" data-i18n="nav.history">Story</a><a href="#music" data-i18n="nav.music">Live Music</a><a href="#market" data-i18n="nav.market">Market</a><a href="#catering" data-i18n="nav.catering">Catering</a><a href="#visit" data-i18n="nav.visit">Visit</a></div>
  <div><h4 data-i18n="footer.orders">Orders & Social</h4>
    <a href="https://www.ubereats.com/store/candela-y-cafe-market/oa35cIfwWWuJm-ND4o9G1g" target="_blank" rel="noopener">Uber Eats</a>
    <a href="https://www.doordash.com/store/candela-y-caf%C3%A9-market-miami-26069377/" target="_blank" rel="noopener">DoorDash</a>
    <a href="https://www.instagram.com/candelaycafe/" target="_blank" rel="noopener">@candelaycafe</a>
    <a href="tel:+17862547577">+1 (786) 254-7577</a></div>
</div><div class="foot-bottom"><span>© 2026 Candela & Café Market</span><span>507 N Miami Ave, Miami FL</span></div></div></footer>

<!-- MODAL DE RESERVA -->
<div class="modal" id="resModal" aria-hidden="true">
  <div class="modal-ov" data-close></div>
  <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="resTitle">
    <button class="modal-x" data-close aria-label="Close">×</button>
    <div class="modal-seal"><img src="assets/img/logo-96.webp" alt="" width="54" height="54"></div>
    <span class="kick" data-i18n="music.kicker">Friday Nights</span>
    <h3 id="resTitle" class="modal-title"><span data-i18n="res.title.a">Reserve your</span> <span class="fire" data-i18n="res.title.b">Friday</span></h3>
    <p class="modal-sub" data-i18n="res.sub">…</p>
    <label class="fld"><span data-i18n="res.name">Name</span><input id="resName" type="text"></label>
    <label class="fld"><span data-i18n="res.phone">Phone</span><input id="resPhone" type="tel" placeholder="(786) 000-0000"></label>
    <div class="fld-row"><label class="fld"><span data-i18n="res.day">Friday</span><select id="resDate"></select></label>
      <label class="fld"><span data-i18n="res.time">Time</span><select id="resTime"><option>8:00 PM</option><option>9:00 PM</option><option>10:00 PM</option></select></label></div>
    <div class="fld"><span data-i18n="res.guests">Guests</span><div class="stepper"><button type="button" id="gMinus" aria-label="-">−</button><b id="gCount">2</b><button type="button" id="gPlus" aria-label="+">+</button></div></div>
    <button class="btn btn-g modal-go" id="resGo" data-i18n="res.go">Confirm via WhatsApp</button>
    <p class="modal-note" data-i18n="res.note">…</p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" defer crossorigin="anonymous"></script>
<script type="module" src="js/landing.js"></script>
</body>
</html>
```

Reglas: rellenar los `…` con el texto EN de la clave i18n correspondiente (Task 2) como fallback no-JS. Los 4 hitos de la timeline, las 9 fotos de galería y las 3 reseñas placeholder se escriben en duro en el HTML siguiendo el markup del mockup (Task 6 trae el CSS). Las SRI (`integrity=`) de GSAP/Swiper se añaden en Task 12.

- [ ] **Step 2: Commit** — `git add web/index.html; git commit -m "feat(rediseño): estructura index.html (10 secciones, i18n, mount points, modal)"`

---

### Task 6: `landing.css` — estilos por sección (portados de los mockups)

**Files:**
- Rehacer: `web/css/landing.css`

> Cada bloque se copia VERBATIM del script de mockup indicado (ya aprobado), cambiando solo selectores duplicados de `base.css`. Abrir el script, copiar las reglas dentro de su `<style>`.

- [ ] **Step 1: Hero** — portar de `tools/build-hero-mock.mjs` las reglas: `.hero`, `.hero-bg` (foto Miami con `mask-image` fundido transparente→foto; usar `assets/img/miami-skyline-1440.webp`), `.hero-grid`, `.hero-copy`, `.ghost`, `.hero-title .l1/.l2`, `.hero-ctas`, `.hero-meta`, `.hero-visual`, `.ring` (+ anillo punteado `::before` girando), `.hero-carousel`, `.slide`/`.slide.active` (cross-fade), `.seal` (ya en base). Sustituir el `<img>` único por el contenedor `#heroCarousel`.

- [ ] **Step 2: Menú** — portar de `tools/build-sections-mock.mjs`: `.s-menu`, `.s-menu .miami` (Miami muy tenue con `mask-image`), `.s-menu .glow`, `.menu-head`, `.chips` (scrollbar oculto + `mask-image` fade derecha), `.chip`/`.chip.active`, `.dishes`, `.dish`/`.dish-img`/`.dish-body`/`.dish-foot`, `.price`, `.add` + **`.add:hover`** (relleno verde + glow).

- [ ] **Step 3: Historia/timeline** — portar de `tools/build-sections-mock.mjs`: `.s-time`, `.time-head`, `.timeline`, `.spine`/`.spine-fill`, `.ms`/`.ms--l`/`.ms--r`, `.ms-node`, `.ms-photo`/`.ms-frame`, `.ms-tag`/`.ms-text`, y las reglas de reveal (`.ms{opacity:0…}`, `.ms.in{…}`) + media query móvil.

- [ ] **Step 4: Live Music + modal** — portar de `tools/build-sections-mock.mjs`: `.s-music`, `.music-grid`, `.neon`, `.ev-pills`/`.pill`, `.live-swiper` y `.live-swiper .swiper-slide/.lcard/.lcap`, y TODO el bloque `/* ===== MODAL DE RESERVA ===== */` (`.modal`, `.modal-ov`, `.modal-card` [SIN la regla `::before` de línea de fuego, ya eliminada], `.modal-x`, `.modal-seal`, `.modal-title`, `.modal-sub`, `.fld`, `.fld-row`, `.stepper`, `.modal-go`, `.modal-note`).

- [ ] **Step 5: Market/Catering/Galería/Reseñas/Visit/Footer** — portar de `tools/build-sections2-mock.mjs`: `.shop-head`, `.shop`, `.product`/`.p-img`/`.p-body`/`.p-cat`/`.p-foot`/`.p-price`/`.p-add` + `.p-add:hover` + `.light .product`; `.bullets`; `.s-gallery`/`.gallery` (con `grid-auto-flow:dense`)/`.g-item`/`.g-0`; `.s-reviews`/`.rev-top`/`.g-rate`/`.reviews`/`.rev`/`.rev-head`/`.avatar`/`.stars` (gold `#f5b400`)/`.rev-note`; `.s-visit`/`address`/`.hours`/`.visit-ctas`/`.map`. (El footer ya está en base.css.)

- [ ] **Step 6: Vista rápida** — abrir `web/index.html` en el navegador (doble clic o Playwright MCP). Verificar: nav contenida, hero con carrusel + Miami tenue, todas las secciones presentes, modo claro en Market/Catering/Reseñas, sin overflow horizontal en 375px. (Aún sin animación/JS de datos — eso es Tasks 7-10.)

- [ ] **Step 7: Commit** — `git add web/css/landing.css; git commit -m "feat(rediseño): landing.css por sección (portado de mockups aprobados)"`

---

### Task 7: `landing.js` — nav, carrusel del hero, chips de categoría, CTAs

**Files:**
- Rehacer: `web/js/landing.js`

- [ ] **Step 1: Reescribir el inicio de `web/js/landing.js`** (imports, nav, esc, hero carousel, category tabs, CTAs WhatsApp):

```js
import { initLangToggle, t, getLang } from './i18n.js';
import { MENU, CATEGORIES, PHONE } from './menu-data.js';
import { MARKET } from './market-data.js';

initLangToggle();

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* navbar scroll + burger */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
const burger = document.getElementById('burger'), navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => { const o = navLinks.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
navLinks.addEventListener('click', e => { if (e.target.closest('a')) { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded','false'); } });

/* hero carousel: cross-fade cada 2s entre fotos reales */
const HERO_SLUGS = ['hero-sandwich','pastrami','breakfast-platter','food-1','local-interior'];
const heroC = document.getElementById('heroCarousel');
heroC.innerHTML = HERO_SLUGS.map((s,i) =>
  `<img class="slide${i===0?' active':''}" src="assets/img/${s}-960.webp" srcset="assets/img/${s}-480.webp 480w, assets/img/${s}-960.webp 960w" sizes="430px" alt="" ${i===0?'fetchpriority="high"':'loading="lazy"'}>`
).join('');
(function heroLoop(){ const sl = heroC.querySelectorAll('.slide'); if (sl.length<2) return; let i=0;
  setInterval(()=>{ sl[i].classList.remove('active'); i=(i+1)%sl.length; sl[i].classList.add('active'); }, 2000);
})();

/* chips de categoría del menú: click cambia el contenido */
const chipsEl = document.getElementById('menuChips'), dishesEl = document.getElementById('menuDishes');
function dishCard(it, lang){
  const price = it.price>0 ? `$${it.price.toFixed(2)}` : esc(t('market.instore'));
  const media = it.img ? `<div class="dish-img"><img src="assets/img/${esc(it.img)}-480.webp" alt="${esc(it.name)}" loading="lazy" width="480" height="360"></div>` : '';
  return `<article class="dish${it.img?'':' dish--text'}">${media}<div class="dish-body"><h3>${esc(it.name)}</h3>${it.desc?`<p>${esc(it.desc[lang])}</p>`:'<p></p>'}<div class="dish-foot"><span class="price">${price}</span><a class="add" href="menu.html">${esc(t('market.add'))} +</a></div></div></article>`;
}
function renderDishes(catId){ const lang=getLang(); dishesEl.innerHTML = MENU[catId].slice(0,6).map(it=>dishCard(it,lang)).join(''); }
function renderChips(){ const lang=getLang();
  chipsEl.innerHTML = CATEGORIES.map((c,i)=>`<button class="chip${i===6?' active':''}" data-cat="${esc(c.id)}">${esc(c.label[lang])}</button>`).join('');
  chipsEl.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{ chipsEl.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); ch.classList.add('active'); renderDishes(ch.dataset.cat); }));
}
function renderMenu(){ renderChips(); renderDishes(CATEGORIES[6].id); } // default: signature
renderMenu();
document.addEventListener('langchange', renderMenu);

/* CTA catering → WhatsApp (idioma) */
function renderLangBits(){ document.getElementById('cateringWa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t('catering.wa'))}`; }
renderLangBits(); document.addEventListener('langchange', renderLangBits);
```

- [ ] **Step 2: Verificar en navegador** — el hero rota fotos cada 2s; los chips cambian los platos; el toggle ES re-renderiza chips/platos; el botón de catering apunta a `wa.me/17862547577`. Sin errores en consola.

- [ ] **Step 3: Commit** — `git add web/js/landing.js; git commit -m "feat(rediseño): landing.js nav + hero carousel + chips de categoría"`

---

### Task 8: `landing.js` — market, reveals, timeline scroll, Swiper

**Files:**
- Modificar: `web/js/landing.js` (añadir al final)

- [ ] **Step 1: Añadir render del market + reveals + timeline + Swiper** al final de `web/js/landing.js`:

```js
/* market e-commerce */
const shopEl = document.getElementById('marketShop');
function renderMarket(){ const lang=getLang();
  shopEl.innerHTML = MARKET.map(p=>{ const price = p.price>0?`$${p.price.toFixed(2)}`:esc(t('market.instore'));
    const media = p.img ? `<div class="p-img"><img src="assets/img/${esc(p.img)}-480.webp" alt="${esc(p.name)}" loading="lazy" width="480" height="480"></div>` : '';
    return `<article class="product">${media}<div class="p-body"><span class="p-cat">${esc(p.cat[lang])}</span><h3>${esc(p.name)}</h3><div class="p-foot"><span class="p-price">${price}</span><button class="p-add">${esc(t('market.add'))} +</button></div></div></article>`;
  }).join('');
}
renderMarket(); document.addEventListener('langchange', renderMarket);

/* timeline: relleno de la espina según scroll */
const tl = document.getElementById('timeline'), fill = document.getElementById('spineFill');
if (tl && fill){ const onScroll=()=>{ const r=tl.getBoundingClientRect(); const passed=Math.min(Math.max(innerHeight*0.55 - r.top,0), r.height); fill.style.height=(passed/r.height*100)+'%'; };
  addEventListener('scroll', onScroll, {passive:true}); onScroll(); }

/* Swiper "cards" de Live Music */
const LIVE = [
  {slug:'local-interior', h:'Live music', p:'Friday · 8pm'},
  {slug:'gal-3',          h:'Tapas & wine', p:'Friday'},
  {slug:'gal-4',          h:'The vibe',    p:'Downtown Miami'},
  {slug:'food-1',         h:'Live kitchen',p:'Sazón & candela'},
];
const liveSlides = document.getElementById('liveSlides');
if (liveSlides){ liveSlides.innerHTML = LIVE.map(s=>`<div class="swiper-slide"><div class="lcard"><img src="assets/img/${s.slug}-480.webp" alt=""><div class="lcap"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></div></div>`).join(''); }

/* esperar a GSAP/Swiper (deferred) */
addEventListener('DOMContentLoaded', () => {
  if (window.Swiper && liveSlides){ new Swiper('.live-swiper', { effect:'cards', grabCursor:true, loop:true, autoplay:{delay:2600,disableOnInteraction:false}, pagination:{el:'.live-swiper .swiper-pagination',clickable:true} }); }
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches){ document.querySelectorAll('.reveal,.ms').forEach(el=>{el.style.opacity=1;el.style.transform='none';}); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-copy > *', { y:34, opacity:0, stagger:.1, duration:.9, ease:'power3.out' });
  document.querySelectorAll('.reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));
  document.querySelectorAll('.ms').forEach(el=>{ const x = el.classList.contains('ms--r')?40:-40;
    gsap.fromTo(el,{opacity:0,x},{opacity:1,x:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 80%',once:true}}); });
});
```

(Nota: `.ms` usa `gsap.fromTo` para no depender de la clase `.in`; el CSS portado mantiene `.ms{opacity:0}` solo como fallback que GSAP sobreescribe. Si GSAP no carga, el primer `if` quita el opacity:0.)

- [ ] **Step 2: Verificar en navegador** — market renderiza 6 productos; al scrollear, la espina de la timeline se rellena y los hitos entran; el carrusel de Live Music gira (efecto cards); reveals disparan una vez. `prefers-reduced-motion` muestra todo sin animar.

- [ ] **Step 3: Commit** — `git add web/js/landing.js; git commit -m "feat(rediseño): market render + timeline scroll + reveals + Swiper live music"`

---

### Task 9: Modal de reserva (JS)

**Files:**
- Modificar: `web/js/landing.js` (añadir al final)

- [ ] **Step 1: Añadir la lógica del modal** al final de `web/js/landing.js` (usa `buildReservationUrl` de Task 4):

```js
import { buildReservationUrl } from './cart-core.js';  // mover este import arriba con los demás
/* === modal de reserva === */
const modal = document.getElementById('resModal');
if (modal){
  const dsel = document.getElementById('resDate');
  // próximos 6 viernes (idioma actual)
  function fillFridays(){ dsel.innerHTML=''; const d=new Date(); let n=0;
    while(n<6){ if(d.getDay()===5){ const o=document.createElement('option'); o.textContent=d.toLocaleDateString(getLang()==='es'?'es-ES':'en-US',{weekday:'short',day:'2-digit',month:'short'}); dsel.appendChild(o); n++; } d.setDate(d.getDate()+1); } }
  fillFridays(); document.addEventListener('langchange', fillFridays);
  let g=2; const gc=document.getElementById('gCount');
  document.getElementById('gPlus').onclick=()=>{ if(g<12){g++;gc.textContent=g;} };
  document.getElementById('gMinus').onclick=()=>{ if(g>1){g--;gc.textContent=g;} };
  let lastFocus=null;
  const open=()=>{ lastFocus=document.activeElement; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.getElementById('resName').focus(); };
  const close=()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); if(lastFocus) lastFocus.focus(); };
  document.getElementById('openRes').onclick=open;
  modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && modal.classList.contains('open')) close(); });
  document.getElementById('resGo').onclick=()=>{
    const data={ name:document.getElementById('resName').value.trim(), phone:document.getElementById('resPhone').value.trim(),
      day:dsel.value, time:document.getElementById('resTime').value, guests:g };
    window.open(buildReservationUrl(data, PHONE, t('res.greeting')), '_blank');
  };
}
```

- [ ] **Step 2: Verificar en navegador** — "Reservar mesa" abre el modal; stepper sube/baja personas; el select muestra próximos viernes; "Confirmar por WhatsApp" abre `wa.me/17862547577` con el mensaje correcto; Escape/click-afuera/X cierran y devuelven foco.

- [ ] **Step 3: Commit** — `git add web/js/landing.js; git commit -m "feat(rediseño): modal de reserva → WhatsApp (a11y + steppers + viernes)"`

---

### Task 10: Re-pintar `menu.html` + `menu.css`

**Files:**
- Modificar: `web/menu.html`, `web/css/menu.css`

- [ ] **Step 1: `menu.html`** — actualizar el `<nav>` a la estructura `.nav > .nav-inner` (igual que `index.html`), añadir el `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">` solo si se usa (no se usa en menú → omitir), y verificar que carga `css/base.css` + `css/menu.css`. NO tocar la lógica de `js/menu.js`/`js/cart.js`.

- [ ] **Step 2: `menu.css`** — ajustar a los tokens nuevos (fondo `--negro`, chips con el estilo de `.chip` de la landing, precios en `--rojo`, `.mi-add`/FAB/cart-sheet con `--verde`/`--rojo`). Reusar el patrón visual de las cards del menú de la landing. Sin amarillo. Mantener accesibilidad (focus-visible, touch targets).

- [ ] **Step 3: Verificar** — abrir `web/menu.html`: navbar consistente con la landing, chips scroll-spy funcionan, agregar item anima y actualiza FAB/total, "Send order via WhatsApp" genera `wa.me` correcto. Toggle ES traduce labels.

- [ ] **Step 4: Commit** — `git add web/menu.html web/css/menu.css; git commit -m "feat(rediseño): re-pintar menu.html con el sistema visual nuevo"`

---

### Task 11: Imágenes (skyline Miami + productos del market)

**Files:**
- Modificar: `tools/convert-images.mjs`
- Output: `web/assets/img/miami-skyline-*.webp`, `web/assets/img/mk-*.webp`

- [ ] **Step 1: Añadir fuentes al `IMAGES` de `tools/convert-images.mjs`** (o un bloque nuevo) para generar:
  - `miami-skyline` desde `tools/miami.jpg` (anchos 960/1440).
  - `mk-cafe`,`mk-aceite`,`mk-frutas`,`mk-cereal`,`mk-despensa`,`mk-verdes` desde `tools/prod/p5,p7,p8,p9,p6,p10.jpg` (ancho 480/960). Estas son **placeholders de stock** hasta que el cliente entregue su catálogo.

```js
// añadir a convert-images.mjs (mapa aparte por estar fuera de wetransfer/Candela)
const EXTRA = {
  'miami-skyline': '../tools/miami.jpg',
  'mk-cafe':'../tools/prod/p5.jpg','mk-aceite':'../tools/prod/p7.jpg','mk-frutas':'../tools/prod/p8.jpg',
  'mk-cereal':'../tools/prod/p9.jpg','mk-despensa':'../tools/prod/p6.jpg','mk-verdes':'../tools/prod/p10.jpg',
};
for (const [slug, rel] of Object.entries(EXTRA)) {
  for (const w of [480,960,1440]) {
    await sharp(path.join(import.meta.dirname, rel)).rotate().resize({width:w, withoutEnlargement:true}).webp({quality:74}).toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  console.log('ok', slug);
}
```

- [ ] **Step 2: Ejecutar** — `node tools/convert-images.mjs`. Expected: `ok miami-skyline`, `ok mk-*`. Verificar que existen los `.webp` en `web/assets/img/`.

- [ ] **Step 3: Commit** — `git add tools/convert-images.mjs web/assets/img; git commit -m "feat(rediseño): WebP del skyline de Miami + productos placeholder del market"`

---

### Task 12: Librerías (SRI), SEO/OG/schema y performance

**Files:**
- Modificar: `web/index.html`, `web/menu.html`

- [ ] **Step 1: Portar al `<head>` de `index.html` los bloques de SEO del index anterior.** El build anterior YA tenía OG + schema en `web/index.html`; al reescribirlo en Task 5 se perdieron, recupéralos de git: `git log --oneline -- web/index.html` (commit anterior a este plan) → `git show <hash>:web/index.html` y copia el `<meta name="description">`, los `<meta property="og:*">` (con `og:image` propia), la Twitter card, y el `<script type="application/ld+json">` de `schema.org/Restaurant` (horario, geo, telephone, enlace a menú). Igual recupera/mantén el `schema.org/Menu` en `menu.html`. Actualiza textos que cambiaron (titular/keywords del hero nuevo).

- [ ] **Step 2: Añadir SRI a GSAP y Swiper** en `index.html` (y Swiper en ningún otro sitio). Obtener los hashes:

```powershell
foreach($u in @('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js','https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js','https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js')){ $b=(Invoke-WebRequest $u).RawContentStream.ToArray(); $h=[Convert]::ToBase64String([Security.Cryptography.SHA384]::Create().ComputeHash($b)); "$u`n  integrity=sha384-$h" }
```

Añadir `integrity="sha384-…" crossorigin="anonymous"` a cada `<script>`. (La Swiper CSS de `<head>` puede quedar sin SRI o pinear igual.)

- [ ] **Step 3: Performance** — confirmar fonts `display=swap` + preload del WebP del primer slide del hero (`<link rel="preload" as="image" href="assets/img/hero-sandwich-960.webp">`); GSAP/Swiper `defer`; CSS crítico del hero opcionalmente inline. El fondo Miami y el carrusel no deben bloquear el render.

- [ ] **Step 4: Commit** — `git add web/index.html web/menu.html; git commit -m "feat(rediseño): SEO/OG/schema + SRI en CDNs + preload del hero"`

---

### Task 13: Verificación end-to-end

**Files:**
- (sin cambios de código; correcciones puntuales si algo falla)

- [ ] **Step 1: Tests del núcleo** — `node --test tests/` → Expected: todos PASS (carrito + reserva).

- [ ] **Step 2: Playwright (carrito)** — en `menu.html`: agregar 2 items, abrir carrito, cambiar cantidad, pulsar "Send order via WhatsApp"; verificar que la URL es `https://wa.me/17862547577?text=…` con items y `Total`.

- [ ] **Step 3: Playwright (reserva)** — en `index.html`: abrir modal, llenar nombre/teléfono, elegir viernes/hora, stepper a 4, "Confirmar por WhatsApp"; verificar URL `wa.me/17862547577` con día, hora, "4 personas", nombre y tel.

- [ ] **Step 4: Tabs + i18n** — cada chip del menú cambia a su categoría; toggle ES traduce todos los `data-i18n` (sin texto en bruto); nombres de platos/productos NO se traducen.

- [ ] **Step 5: Responsive** — revisar 375 / 768 / 1440: sin overflow horizontal; nav hamburguesa en móvil; timeline en una columna; shop/dishes/gallery se reflowean.

- [ ] **Step 6: Lighthouse móvil** — `index.html` y `menu.html` ≥ 90 en Performance/SEO/Accessibility/Best-Practices. Corregir lo que baje de 90 (lazy/medidas de img, contraste, labels).

- [ ] **Step 7: Commit final** — `git add -A; git commit -m "test(rediseño): verificación e2e (carrito, reserva, i18n, responsive, Lighthouse)"`

---

## Notas para el ejecutor

- **No pushear** sin aprobación visual explícita de Robert (regla global). Push siempre con la cuenta `irisdigitllab`.
- **Contenido pendiente del cliente** (dejar placeholders marcados, NO inventar como definitivo): catálogo real del market, Place ID de Google + reseñas reales + link de "escribir reseña", foto real de música en vivo, fotos históricas de la timeline. Hoy se usan stock/placeholder.
- **Sin amarillo** en ningún acento; degradado fuego = rojo→rojo. Sin textura de dots.
- La fuente de verdad VISUAL son los mockups en `tools/build-*-mock.mjs`; ante duda de estilo, copiar de ahí, no improvisar.
```

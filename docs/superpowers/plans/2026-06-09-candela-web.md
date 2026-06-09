# Candela & Café Market — Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitio de 2 páginas (landing + menú con pedidos por WhatsApp) para Candela & Café con la identidad real de marca (rojo/verde lima/negro + Architects Daughter), bilingüe EN/ES, vanilla + GSAP, Lighthouse móvil ≥ 90.

**Architecture:** HTML/CSS/JS estático en `web/` sin build step. El menú vive como datos en `js/menu-data.js` y se renderiza en cliente; el carrito tiene un núcleo puro testeable con `node:test` (`cart-core.js`) y una capa DOM (`cart.js`) que genera la URL `wa.me`. i18n por diccionario plano + atributos `data-i18n`. Animación GSAP/ScrollTrigger por CDN, solo transform/opacity.

**Tech Stack:** HTML5, CSS custom properties, JS ES modules, GSAP 3 (CDN), sharp (solo tooling de imágenes), node:test (solo tests), Netlify.

**Spec:** `docs/superpowers/specs/2026-06-09-candela-web-design.md` — fuente de verdad de decisiones.

**Datos clave (usar EXACTAMENTE estos):**
- Teléfono/WhatsApp: `17862547577` (mostrar como `+1 (786) 254-7577`)
- Dirección: `507 N Miami Ave, Miami, FL 33136`
- Horario: Sun–Tue 8:00am–10:00pm · Wed–Sat 8:00am–11:30pm
- Instagram: `@candelaycafe` → https://www.instagram.com/candelaycafe/
- Música en vivo: viernes
- Colores: negro `#121212`, carbón `#1C1C1C`, rojo `#ED3B2F`, rojo hover `#C92A1F`, verde `#76C043`, claro `#FBF7F0`, crema texto `#F5F0E8`
- Fuentes: Architects Daughter (display, 400 + bold sintetizado), DM Sans (body)

---

## File Structure

```
web/
├── index.html          ← landing (13 secciones, HTML estático completo)
├── menu.html           ← menú + carrito (shell estático, items renderizados por JS)
├── css/
│   ├── base.css        ← tokens, reset, tipografía, utilidades, navbar, footer
│   ├── landing.css     ← estilos de las secciones de la landing
│   └── menu.css        ← chips, listas de menú, FAB, cart sheet
├── js/
│   ├── i18n.js         ← diccionario EN/ES + toggle (localStorage)
│   ├── menu-data.js    ← menú real completo (export const MENU, FEATURED)
│   ├── cart-core.js    ← lógica pura: add/remove/total/mensaje WhatsApp
│   ├── cart.js         ← capa DOM del carrito (FAB, sheet, render)
│   ├── landing.js      ← GSAP, marquee, navbar, menú móvil, daily special
│   └── menu.js         ← render del menú, chips scroll-spy, integra cart
├── assets/img/         ← WebP responsive + logo + og-image
└── netlify.toml
tools/
├── package.json        ← sharp (no se despliega)
├── convert-images.mjs  ← genera WebP 480/960/1440
└── crop-menu.mjs       ← recorta los JPG del menú impreso para transcripción
tests/
└── cart-core.test.mjs  ← node:test del núcleo del carrito
```

Responsabilidades: `cart-core.js` no toca el DOM (testeable); `cart.js` solo DOM+eventos; `menu-data.js` solo datos; `i18n.js` no conoce el menú (los nombres de platos no se traducen).

---

### Task 1: Scaffold, rama y tokens base

**Files:**
- Create: `web/css/base.css`
- Create: `web/assets/img/.gitkeep`, carpetas `web/js/`, `tools/`, `tests/`

- [ ] **Step 1: Crear rama de trabajo**

```powershell
git checkout -b feature/web-redesign
```

- [ ] **Step 2: Crear estructura de carpetas**

```powershell
New-Item -ItemType Directory -Force web\css, web\js, web\assets\img, tools, tests | Out-Null
New-Item -ItemType File web\assets\img\.gitkeep | Out-Null
```

- [ ] **Step 3: Escribir `web/css/base.css` completo**

```css
/* ============ TOKENS ============ */
:root{
  --negro:#121212;
  --carbon:#1C1C1C;
  --rojo:#ED3B2F;
  --rojo-hover:#C92A1F;
  --verde:#76C043;
  --claro:#FBF7F0;
  --crema:#F5F0E8;
  --gris:#8a837a;          /* texto secundario sobre claro */
  --gris-oscuro:#b8b1a6;   /* texto secundario sobre oscuro */

  --display:'Architects Daughter', cursive;
  --body:'DM Sans', system-ui, sans-serif;

  --maxw:1180px;
  --radius:12px;
  --shadow:0 10px 30px rgba(0,0,0,.12);
  --shadow-dark:0 12px 36px rgba(0,0,0,.45);
  --ease:cubic-bezier(.22,.61,.36,1);
}

/* ============ RESET ============ */
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--body);background:var(--claro);color:var(--carbon);line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block;height:auto}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
ul{list-style:none}

/* ============ TIPOGRAFÍA ============ */
.display{font-family:var(--display);font-weight:700;line-height:1.08;letter-spacing:-.01em}
h1.display{font-size:clamp(2.4rem,6vw,4.2rem)}
h2.display{font-size:clamp(1.9rem,4.2vw,3rem)}
.kicker{font-size:.72rem;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:var(--verde)}
.section-sub{font-size:1.05rem;color:var(--gris);max-width:54ch}

/* ============ LAYOUT / UTILIDADES ============ */
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.section{padding:96px 0}
.dark{background:var(--negro);color:var(--crema)}
.dark .section-sub{color:var(--gris-oscuro)}
.dark h2.display{color:#fff}
.accent{color:var(--rojo)}

/* ============ BOTONES ============ */
.btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:8px;
  font-weight:700;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;
  transition:transform .25s var(--ease), background .25s, box-shadow .25s;will-change:transform}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--rojo);color:#fff;box-shadow:0 6px 20px rgba(237,59,47,.35)}
.btn-primary:hover{background:var(--rojo-hover)}
.btn-ghost{border:1.5px solid currentColor;background:transparent}
.btn-green{background:var(--verde);color:#10210a}

/* ============ NAVBAR (compartida) ============ */
.nav{position:fixed;inset:0 0 auto;z-index:100;display:flex;align-items:center;justify-content:space-between;
  padding:16px 32px;transition:background .3s,padding .3s;color:var(--crema)}
.nav.is-scrolled{background:rgba(18,18,18,.94);backdrop-filter:blur(10px);padding:10px 32px;box-shadow:0 4px 20px rgba(0,0,0,.35)}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-logo img{width:46px;height:46px;border-radius:50%}
.nav-logo b{font-family:var(--display);font-size:1.05rem;letter-spacing:.02em}
.nav-links{display:flex;gap:28px;align-items:center;font-size:.8rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
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

/* ============ FOOTER (compartido) ============ */
.footer{background:var(--negro);color:var(--gris-oscuro);padding:72px 0 32px;font-size:.9rem}
.footer a:hover{color:var(--verde)}

/* ============ MOTION ============ */
.reveal{opacity:0;transform:translateY(28px)}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .reveal{opacity:1;transform:none}
  *,*::before,*::after{animation:none!important;transition:none!important}
}
```

- [ ] **Step 4: Commit**

```powershell
git add web tools tests; git commit -m "feat: scaffold web/ con tokens y base.css"
```

---

### Task 2: Pipeline de imágenes (WebP responsive)

**Files:**
- Create: `tools/package.json`, `tools/convert-images.mjs`
- Modify: `.gitignore` (añadir `node_modules/`)
- Output: `web/assets/img/*.webp`, `web/assets/img/logo.png`

- [ ] **Step 1: Añadir `node_modules/` al `.gitignore`** (línea nueva al final).

- [ ] **Step 2: Crear tooling**

```powershell
Set-Location tools; npm init -y | Out-Null; npm install sharp | Out-Null; Set-Location ..
```

- [ ] **Step 3: Escribir `tools/convert-images.mjs`**

```js
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'wetransfer_4-fold_2026-06-04_1950', '4 Fold', 'Candela');
const OUT = path.join(ROOT, 'web', 'assets', 'img');
mkdirSync(OUT, { recursive: true });

// slug → archivo fuente (fotos REALES del cliente, seleccionadas)
const IMAGES = {
  'hero-sandwich':      'IMG_7266.jpg',                                    // sub Boar's Head + local de fondo
  'breakfast-platter':  'IMG_0483.jpg',                                    // breakfast time platos
  'caesar-salad':       path.join('Nuevas', 'IMG-20250425-WA0013.jpg'),
  'local-interior':     'IMG_0829.jpg',
  'pastrami':           'new-york-deli-pastrami-sandwich.jpg',
  'catering':           'WhatsApp Image 2025-03-25 at 16.10.24_59503bed.jpg',
  'gal-1':              path.join('Nuevas', 'IMG-20250425-WA0005.jpg'),
  'gal-2':              path.join('Nuevas', 'IMG-20250425-WA0006.jpg'),
  'gal-3':              path.join('Nuevas', 'IMG-20250425-WA0007.jpg'),
  'gal-4':              path.join('Nuevas', 'IMG-20250425-WA0008.jpg'),
  'gal-5':              path.join('Nuevas', 'IMG-20250425-WA0009.jpg'),
  'gal-6':              path.join('Nuevas', 'IMG-20250425-WA0010.jpg'),
  'food-1':             'IMG_3565.jpg',
  'food-2':             path.join('Nuevas', 'IMG-20250425-WA0014.jpg'),
  'food-3':             path.join('Nuevas', 'IMG-20250425-WA0015.jpg'),
};

const WIDTHS = [480, 960, 1440];
for (const [slug, rel] of Object.entries(IMAGES)) {
  const src = path.join(SRC, rel);
  for (const w of WIDTHS) {
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  console.log('ok', slug);
}
```

**Nota al ejecutor:** antes de convertir, abre (Read) cada fuente y confirma que el contenido coincide con el slug; si una foto está borrosa/oscura, sustitúyela por otra de `Candela/` o `Nuevas/` y anota el cambio. `IMG_7266.jpg` (sub con aceitunas y el local de fondo) es la foto del hero salvo mejor candidata.

- [ ] **Step 4: Ejecutar y copiar logo**

```powershell
node tools/convert-images.mjs
Copy-Item "assets\branding\logopng.png" web\assets\img\logo.png
```

Expected: `ok <slug>` × 15 y 45 archivos `.webp` en `web/assets/img/`.

- [ ] **Step 5: Optimizar logo** — generar `logo-96.webp` (navbar) con sharp:

```powershell
node -e "import('sharp').then(({default:s})=>s('web/assets/img/logo.png').resize(96).webp({quality:90}).toFile('web/assets/img/logo-96.webp'))" --input-type=module
```

(Si falla por cwd, ejecutar desde `tools/` con rutas `../web/...`.)

- [ ] **Step 6: Commit**

```powershell
git add -A; git commit -m "feat: fotos reales convertidas a WebP responsive + logo"
```

---

### Task 3: Transcripción del menú real → `menu-data.js`

**Files:**
- Create: `tools/crop-menu.mjs`
- Create: `web/js/menu-data.js`

El menú fuente son dos JPG de ~7000px: `wetransfer_4-fold_2026-06-04_1950/4 Fold/OUTPUT/FourFold Menu-01.jpg` (Bakery, Coffee Bar, Protein Shakes, Juices, Smoothies) y `FourFold Menu-02.jpg` (Breakfast, Appetizer/Side, Avocado Toast, Salads & Wraps, Dominican Spot, Soup, Signature Sandwiches, NY Signature Sandwiches, Panini, Burger). A resolución completa no caben en una lectura; hay que recortar por paneles y leer cada recorte.

- [ ] **Step 1: Escribir `tools/crop-menu.mjs`**

```js
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'wetransfer_4-fold_2026-06-04_1950', '4 Fold', 'OUTPUT');
const OUT = path.join(ROOT, 'tools', 'crops');
mkdirSync(OUT, { recursive: true });

for (const f of ['FourFold Menu-01.jpg', 'FourFold Menu-02.jpg']) {
  const img = sharp(path.join(DIR, f));
  const { width, height } = await img.metadata();
  const cols = 4, rows = 2; // 8 recortes por archivo, con solape del 6%
  const cw = Math.floor(width / cols), ch = Math.floor(height / rows);
  const ov = Math.floor(cw * 0.06);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const left = Math.max(0, c * cw - ov), top = Math.max(0, r * ch - ov);
    await sharp(path.join(DIR, f))
      .extract({ left, top,
        width: Math.min(cw + 2 * ov, width - left),
        height: Math.min(ch + 2 * ov, height - top) })
      .resize({ width: 1400 })
      .jpeg({ quality: 85 })
      .toFile(path.join(OUT, `${path.parse(f).name}-r${r}c${c}.jpg`));
  }
  console.log('cropped', f);
}
```

- [ ] **Step 2: Ejecutar** — `node tools/crop-menu.mjs`. Expected: 16 archivos en `tools/crops/`.

- [ ] **Step 3: Leer los 16 recortes con la herramienta Read** y transcribir TODOS los items con nombre, descripción y precio EXACTOS. No inventar nada: si un precio no se lee, recortar más fino esa zona (ajustar cols/rows) hasta leerlo.

- [ ] **Step 4: Escribir `web/js/menu-data.js`** con este esquema (ejemplo con datos ilustrativos — los reales salen de los recortes):

```js
// Fuente de verdad: FourFold Menu-01/02.jpg (menú impreso). NO editar precios sin cotejar.
export const PHONE = '17862547577';
export const DAILY_SPECIAL = {
  en: 'Ask about our daily food specials!',
  es: '¡Pregunta por nuestros especiales del día!',
};

export const CATEGORIES = [
  { id: 'breakfast',      label: { en: 'Breakfast',                es: 'Desayunos' } },
  { id: 'appetizers',     label: { en: 'Appetizers & Sides',       es: 'Aperitivos' } },
  { id: 'avocado-toast',  label: { en: 'Avocado Toast',            es: 'Avocado Toast' } },
  { id: 'salads-wraps',   label: { en: 'Salads & Wraps',           es: 'Ensaladas y Wraps' } },
  { id: 'dominican-spot', label: { en: 'Dominican Spot',           es: 'Rincón Dominicano' } },
  { id: 'soups',          label: { en: 'Soups',                    es: 'Sopas' } },
  { id: 'signature',      label: { en: 'Signature Sandwiches',     es: 'Sándwiches de la Casa' } },
  { id: 'ny-signature',   label: { en: 'NY Signature Sandwiches',  es: 'Sándwiches NY' } },
  { id: 'panini',         label: { en: 'Panini',                   es: 'Panini' } },
  { id: 'burgers',        label: { en: 'Burgers',                  es: 'Hamburguesas' } },
  { id: 'bakery',         label: { en: 'Bakery & More',            es: 'Panadería' } },
  { id: 'coffee',         label: { en: 'Coffee Bar',               es: 'Barra de Café' } },
  { id: 'juices',         label: { en: 'Juices',                   es: 'Jugos' } },
  { id: 'smoothies',      label: { en: 'Smoothies',                es: 'Batidos' } },
  { id: 'shakes',         label: { en: 'Protein Shakes',           es: 'Batidos de Proteína' } },
];

// item: { id, name, desc:{en,es}|null, price:Number, badge:String|null, img:slug|null }
// name SIEMPRE en el idioma original del menú impreso (no se traduce).
// img: slug de Task 2 si hay foto real del plato; null si no.
export const MENU = {
  breakfast: [
    { id: 'bk-downtown', name: 'Downtown Platter',
      desc: { en: '2 eggs any style with your choice of bacon, ham or sausage. Home fries and toast.',
              es: '2 huevos al gusto con bacon, jamón o salchicha. Papas caseras y tostadas.' },
      price: 8.49, badge: null, img: 'breakfast-platter' },
    // ... resto transcrito de los recortes
  ],
  // ... una clave por categoría, mismo orden que CATEGORIES
};

// Platos estrella de la landing (6–8): [categoryId, itemId]
export const FEATURED = [
  ['signature', 'sg-prosciutto'],
  ['ny-signature', 'ny-ruben'],
  ['breakfast', 'bk-downtown'],
  ['dominican-spot', 'dm-XXX'],
  ['burgers', 'bg-candela'],
  ['salads-wraps', 'sw-caesar'],
];
```

Reglas: ids con prefijo de categoría (`bk-`, `sg-`, `ny-`…); `badge` solo si el impreso lo trae (p. ej. `'Boar's Head'`); descripciones ES = traducción fiel de la EN impresa; items con variantes de tamaño (MD/LR en juices/smoothies/shakes) → un item por tamaño con el sufijo en el nombre (`'Banana Berry (MD)'`, `'Banana Berry (LR)'`) — el carrito no maneja variantes (YAGNI).

- [ ] **Step 5: Verificar** — releer los 16 recortes comparando contra `menu-data.js` categoría por categoría: mismo nº de items, nombres y precios idénticos. Corregir cualquier desviación.

- [ ] **Step 6: Commit**

```powershell
git add tools/crop-menu.mjs web/js/menu-data.js; git commit -m "feat: menú real completo transcrito del four-fold impreso"
```

---

### Task 4: i18n — diccionario y toggle

**Files:**
- Create: `web/js/i18n.js`

- [ ] **Step 1: Escribir `web/js/i18n.js`** (diccionario completo + motor):

```js
export const DICT = {
  /* ---- nav ---- */
  'nav.menu':      { en: 'Menu',        es: 'Menú' },
  'nav.music':     { en: 'Live Music',  es: 'Música en Vivo' },
  'nav.market':    { en: 'Market',      es: 'Market' },
  'nav.catering':  { en: 'Catering',    es: 'Catering' },
  'nav.visit':     { en: 'Visit Us',    es: 'Visítanos' },
  'nav.order':     { en: 'Order Now',   es: 'Ordena Ya' },

  /* ---- hero ---- */
  'hero.kicker':   { en: 'NY Deli · Market & Café · Downtown Miami', es: 'NY Deli · Market & Café · Downtown Miami' },
  'hero.title.1':  { en: 'New York flavor,', es: 'Sabor neoyorquino,' },
  'hero.title.2':  { en: 'Caribbean fire',   es: 'fuego caribeño' },
  'hero.sub':      { en: 'NY-style deli sandwiches, Dominican soul food, specialty coffee and live music every Friday — in the heart of Downtown Miami.',
                     es: 'Sándwiches estilo NY, sazón dominicana, café de especialidad y música en vivo todos los viernes — en el corazón de Downtown Miami.' },
  'hero.cta.order': { en: 'Order Now',          es: 'Ordena Ya' },
  'hero.cta.music': { en: 'Live Music Fridays', es: 'Viernes de Música' },
  'hero.hours':    { en: 'Open daily from 8am', es: 'Abierto todos los días desde las 8am' },

  /* ---- marquee (no se traduce: nombres propios) ---- */

  /* ---- about ---- */
  'about.kicker':  { en: 'Our Story', es: 'Nuestra Historia' },
  'about.title':   { en: 'NY in the craft, Dominican at heart', es: 'NY en la ejecución, dominicano en el alma' },
  'about.body':    { en: 'Candela & Café brings the energy of a classic New York delicatessen to Downtown Miami — Boar’s Head cold cuts, bagels and pastrami — and lights it up with Dominican warmth: mangú, live merengue and coffee that tastes like home.',
                     es: 'Candela & Café trae la energía de un delicatessen clásico de Nueva York a Downtown Miami — embutidos Boar’s Head, bagels y pastrami — y lo enciende con calor dominicano: mangú, merengue en vivo y café que sabe a casa.' },

  /* ---- menu teaser ---- */
  'teaser.kicker': { en: 'The Menu', es: 'El Menú' },
  'teaser.title':  { en: 'Made fresh, every day', es: 'Fresco, todos los días' },
  'teaser.cta':    { en: 'View full menu & order', es: 'Ver menú completo y ordenar' },

  /* ---- live music ---- */
  'music.kicker':  { en: 'Friday Nights', es: 'Viernes por la Noche' },
  'music.title':   { en: 'Live Music Fridays', es: 'Viernes de Música en Vivo' },
  'music.body':    { en: 'Every Friday the deli turns up: live music, wine, beer and the best vibe in Downtown. Come for dinner, stay for the candela.',
                     es: 'Cada viernes el deli se enciende: música en vivo, vino, cerveza y el mejor ambiente de Downtown. Ven a cenar, quédate por la candela.' },
  'music.cta':     { en: 'Reserve via WhatsApp', es: 'Reserva por WhatsApp' },
  'music.wa':      { en: 'Hi! I’d like to reserve a table for Friday live music.',
                     es: '¡Hola! Quiero reservar una mesa para el viernes de música en vivo.' },

  /* ---- market ---- */
  'market.kicker': { en: 'Daily Market', es: 'Market Diario' },
  'market.title':  { en: 'Wines, beers & gourmet finds', es: 'Vinos, cervezas y antojos gourmet' },
  'market.body':   { en: 'A curated selection of wines and craft beers — the perfect pairing for your sandwich or your Friday night.',
                     es: 'Una selección curada de vinos y cervezas artesanales — el maridaje perfecto para tu sándwich o tu viernes.' },

  /* ---- catering ---- */
  'catering.kicker': { en: 'Corporate Catering', es: 'Catering Corporativo' },
  'catering.title':  { en: 'Elevate your events',  es: 'Eleva tus eventos' },
  'catering.body':   { en: 'Breakfast trays, sandwich platters and Dominican specialties for offices and events. Tell us the date and headcount — we handle the rest.',
                       es: 'Bandejas de desayuno, tablas de sándwiches y especialidades dominicanas para oficinas y eventos. Dinos fecha y cantidad de personas — nosotros hacemos el resto.' },
  'catering.cta':    { en: 'Get a quote', es: 'Pide tu cotización' },
  'catering.wa':     { en: 'Hi! I’d like a catering quote.', es: '¡Hola! Quiero una cotización de catering.' },

  /* ---- gallery ---- */
  'gallery.kicker': { en: 'The Vibe', es: 'El Ambiente' },
  'gallery.title':  { en: 'Follow the candela', es: 'Sigue la candela' },
  'gallery.cta':    { en: 'Follow @candelaycafe', es: 'Sigue a @candelaycafe' },

  /* ---- reviews ---- */
  'reviews.kicker': { en: 'What people say', es: 'Lo que dicen' },
  'reviews.title':  { en: 'Neighbors already know', es: 'El barrio ya lo sabe' },

  /* ---- visit ---- */
  'visit.kicker':   { en: 'Visit Us', es: 'Visítanos' },
  'visit.title':    { en: 'Downtown Miami, with parking', es: 'Downtown Miami, con parking' },
  'visit.hours.title': { en: 'Hours', es: 'Horario' },
  'visit.hours.1':  { en: 'Sun–Tue · 8:00am – 10:00pm',  es: 'Dom–Mar · 8:00am – 10:00pm' },
  'visit.hours.2':  { en: 'Wed–Sat · 8:00am – 11:30pm',  es: 'Mié–Sáb · 8:00am – 11:30pm' },
  'visit.call':     { en: 'Call us',        es: 'Llámanos' },
  'visit.directions': { en: 'Get directions', es: 'Cómo llegar' },

  /* ---- footer ---- */
  'footer.tag':     { en: 'NY Deli · Market & Café — made with candela in Downtown Miami.',
                      es: 'NY Deli · Market & Café — hecho con candela en Downtown Miami.' },
  'footer.delivery': { en: 'Also on', es: 'También en' },

  /* ---- menú page / carrito ---- */
  'menu.title':     { en: 'The Menu', es: 'El Menú' },
  'menu.sub':       { en: 'Order online — we confirm by WhatsApp.', es: 'Ordena online — confirmamos por WhatsApp.' },
  'cart.label':     { en: 'Your order', es: 'Tu pedido' },
  'cart.empty':     { en: 'Your order is empty. Add something tasty!', es: 'Tu pedido está vacío. ¡Agrega algo rico!' },
  'cart.total':     { en: 'Total', es: 'Total' },
  'cart.send':      { en: 'Send order via WhatsApp', es: 'Enviar pedido por WhatsApp' },
  'cart.add':       { en: 'Add', es: 'Agregar' },
  'cart.items':     { en: 'items', es: 'items' },
  'cart.note':      { en: 'Pickup / delivery details are confirmed by WhatsApp.', es: 'Recogida / delivery se confirman por WhatsApp.' },
  'wa.greeting':    { en: 'Hi Candela & Café! I’d like to order:', es: '¡Hola Candela & Café! Quiero ordenar:' },
  'noscript':       { en: 'This menu needs JavaScript. Call us at +1 (786) 254-7577 — 507 N Miami Ave.',
                      es: 'Este menú necesita JavaScript. Llámanos al +1 (786) 254-7577 — 507 N Miami Ave.' },
};

const KEY = 'candela-lang';
export function getLang() { return localStorage.getItem(KEY) || 'en'; }
export function setLang(lang) { localStorage.setItem(KEY, lang); apply(); }
export function t(key) { const e = DICT[key]; return e ? e[getLang()] : key; }

export function apply() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const e = DICT[el.dataset.i18n];
    if (e) el.textContent = e[lang];
  });
  document.querySelectorAll('.lang-toggle').forEach(b => { b.textContent = lang === 'en' ? 'ES' : 'EN'; });
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

export function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach(b =>
    b.addEventListener('click', () => setLang(getLang() === 'en' ? 'es' : 'en')));
  apply();
}
```

- [ ] **Step 2: Smoke test en Node** (el módulo no debe romper sin DOM — solo importar DICT):

```powershell
node -e "import('./web/js/i18n.js').then(m=>{const bad=Object.entries(m.DICT).filter(([k,v])=>!v.en||!v.es);if(bad.length){console.error('claves incompletas',bad.map(b=>b[0]));process.exit(1)}console.log('DICT ok',Object.keys(m.DICT).length,'claves')})"
```

Expected: `DICT ok <n> claves`. (Si `localStorage` rompe el import en Node, mover el acceso dentro de las funciones — como está escrito arriba ya es lazy.)

- [ ] **Step 3: Commit** — `git add web/js/i18n.js; git commit -m "feat: i18n EN/ES con diccionario completo"`

---

### Task 5: Núcleo del carrito (TDD)

**Files:**
- Create: `tests/cart-core.test.mjs`
- Create: `web/js/cart-core.js`

- [ ] **Step 1: Escribir el test que falla**

```js
// tests/cart-core.test.mjs
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
  const url = buildWaUrl(c, '17862547577', 'Hi! I’d like to order:');
  assert.ok(url.startsWith('https://wa.me/17862547577?text='));
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.match(msg, /2x Downtown Platter — \$16\.98/);
  assert.match(msg, /Total: \$16\.98/);
});
```

- [ ] **Step 2: Verificar que falla** — `node --test tests/` → Expected: FAIL (`Cannot find module ... cart-core.js`).

- [ ] **Step 3: Implementar `web/js/cart-core.js`**

```js
// Núcleo puro del carrito — sin DOM. Testeado en tests/cart-core.test.mjs.
export function createCart(serialized) {
  let lines = [];
  if (serialized) { try { lines = JSON.parse(serialized) || []; } catch { lines = []; } }

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
    lines: () => lines.map(l => ({ ...l })),
    count: () => lines.reduce((n, l) => n + l.qty, 0),
    total: () => Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100,
    clear() { lines = []; },
    serialize: () => JSON.stringify(lines),
  };
}

export function buildWaUrl(cart, phone, greeting) {
  const fmt = n => `$${n.toFixed(2)}`;
  const body = cart.lines()
    .map(l => `${l.qty}x ${l.name} — ${fmt(l.price * l.qty)}`)
    .join('\n');
  const msg = `${greeting}\n\n${body}\n\nTotal: ${fmt(cart.total())}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
```

- [ ] **Step 4: Verificar que pasa** — `node --test tests/` → Expected: 5 pass, 0 fail.

- [ ] **Step 5: Commit** — `git add tests web/js/cart-core.js; git commit -m "feat: núcleo de carrito con tests (node:test)"`

---

### Task 6: index.html + landing.css

**Files:**
- Create: `web/index.html`
- Create: `web/css/landing.css`

- [ ] **Step 1: Escribir `web/index.html`** — estructura completa (los textos visibles llevan `data-i18n` con el contenido EN ya escrito dentro como fallback; nombres propios y datos de contacto en duro):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Candela & Café Market — NY Deli, Dominican Soul & Live Music | Downtown Miami</title>
<meta name="description" content="NY-style deli sandwiches, Dominican specialties, specialty coffee, daily market and live music Fridays. 507 N Miami Ave, Downtown Miami. Order via WhatsApp.">
<!-- Open Graph + schema.org se completan en Task 9 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/landing.css">
</head>
<body>

<nav class="nav" id="nav">
  <a class="nav-logo" href="#"><img src="assets/img/logo-96.webp" alt="Candela & Café logo" width="46" height="46"><b>CANDELA & CAFÉ</b></a>
  <div class="nav-links" id="navLinks">
    <a href="menu.html" data-i18n="nav.menu">Menu</a>
    <a href="#music" data-i18n="nav.music">Live Music</a>
    <a href="#market" data-i18n="nav.market">Market</a>
    <a href="#catering" data-i18n="nav.catering">Catering</a>
    <a href="#visit" data-i18n="nav.visit">Visit Us</a>
    <button class="lang-toggle">ES</button>
    <a class="btn btn-primary nav-cta" href="menu.html" data-i18n="nav.order">Order Now</a>
  </div>
  <button class="nav-burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>

<header class="hero dark" id="hero">
  <picture class="hero-img">
    <img src="assets/img/hero-sandwich-960.webp"
         srcset="assets/img/hero-sandwich-480.webp 480w, assets/img/hero-sandwich-960.webp 960w, assets/img/hero-sandwich-1440.webp 1440w"
         sizes="100vw" alt="Signature Boar's Head sandwich at Candela & Café" fetchpriority="high">
  </picture>
  <div class="hero-overlay"></div>
  <div class="wrap hero-content">
    <p class="kicker" data-i18n="hero.kicker">NY Deli · Market & Café · Downtown Miami</p>
    <h1 class="display"><span data-i18n="hero.title.1">New York flavor,</span><br><span class="accent" data-i18n="hero.title.2">Caribbean fire</span></h1>
    <p class="section-sub" data-i18n="hero.sub">NY-style deli sandwiches, Dominican soul food, specialty coffee and live music every Friday — in the heart of Downtown Miami.</p>
    <div class="hero-ctas">
      <a class="btn btn-primary" href="menu.html" data-i18n="hero.cta.order">Order Now</a>
      <a class="btn btn-ghost" href="#music" data-i18n="hero.cta.music">Live Music Fridays</a>
    </div>
    <p class="hero-meta"><span data-i18n="hero.hours">Open daily from 8am</span> · 507 N Miami Ave, Miami FL</p>
  </div>
</header>

<div class="marquee" aria-hidden="true"><div class="marquee-track" id="marqueeTrack">
  <span>Breakfast</span><i>✶</i><span>Lunch</span><i>✶</i><span>NY Deli</span><i>✶</i><span>Dominican Spot</span><i>✶</i><span>Live Music Fridays</span><i>✶</i><span>Daily Market</span><i>✶</i>
</div></div>

<section class="section about" id="about">
  <div class="wrap about-grid">
    <div class="reveal">
      <p class="kicker" data-i18n="about.kicker">Our Story</p>
      <h2 class="display" data-i18n="about.title">NY in the craft, Dominican at heart</h2>
      <p class="section-sub" data-i18n="about.body">…</p>
    </div>
    <figure class="about-photo reveal">
      <img src="assets/img/local-interior-960.webp" srcset="assets/img/local-interior-480.webp 480w, assets/img/local-interior-960.webp 960w" sizes="(max-width:860px) 100vw, 46vw" alt="Inside Candela & Café" loading="lazy">
    </figure>
  </div>
</section>

<div class="daily-special"><div class="wrap"><span id="dailySpecial"></span></div></div>

<section class="section teaser" id="teaser">
  <div class="wrap">
    <p class="kicker" data-i18n="teaser.kicker">The Menu</p>
    <h2 class="display" data-i18n="teaser.title">Made fresh, every day</h2>
    <div class="teaser-grid" id="teaserGrid"><!-- render desde FEATURED en landing.js --></div>
    <div class="teaser-cta"><a class="btn btn-primary" href="menu.html" data-i18n="teaser.cta">View full menu & order</a></div>
  </div>
</section>

<section class="section dark music" id="music">
  <div class="wrap music-grid">
    <div class="reveal">
      <p class="kicker" data-i18n="music.kicker">Friday Nights</p>
      <h2 class="display neon" data-i18n="music.title">Live Music Fridays</h2>
      <p class="section-sub" data-i18n="music.body">…</p>
      <a class="btn btn-primary" id="musicWa" href="#" target="_blank" rel="noopener" data-i18n="music.cta">Reserve via WhatsApp</a>
    </div>
    <div class="music-photos reveal">
      <img src="assets/img/food-1-480.webp" alt="" loading="lazy">
      <img src="assets/img/gal-1-480.webp" alt="" loading="lazy">
    </div>
  </div>
</section>

<section class="section market" id="market">…misma estructura kicker/título/body + foto `food-2`…</section>

<section class="section catering" id="catering">…kicker/título/body + foto `catering` + botón `id="cateringWa"`…</section>

<section class="section gallery" id="gallery">
  <div class="wrap">
    <p class="kicker" data-i18n="gallery.kicker">The Vibe</p>
    <h2 class="display" data-i18n="gallery.title">Follow the candela</h2>
    <div class="gallery-grid">
      <!-- 6 imgs gal-1..gal-6, loading="lazy", alt descriptivo -->
    </div>
    <a class="btn btn-ghost" href="https://www.instagram.com/candelaycafe/" target="_blank" rel="noopener" data-i18n="gallery.cta">Follow @candelaycafe</a>
  </div>
</section>

<section class="section reviews" id="reviews">
  <div class="wrap">
    <p class="kicker" data-i18n="reviews.kicker">What people say</p>
    <h2 class="display" data-i18n="reviews.title">Neighbors already know</h2>
    <div class="reviews-grid">
      <!-- 3 blockquote: ★★★★★ + cita corta + "— Name, Yelp/Google".
           El ejecutor toma 2–3 citas REALES de los enlaces del spec (Yelp/Restaurantji).
           Si no puede acceder, usar las del cache de búsqueda y marcarlas para validación de Robert. -->
    </div>
  </div>
</section>

<section class="section visit" id="visit">
  <div class="wrap visit-grid">
    <div>
      <p class="kicker" data-i18n="visit.kicker">Visit Us</p>
      <h2 class="display" data-i18n="visit.title">Downtown Miami, with parking</h2>
      <address>507 N Miami Ave, Miami, FL 33136</address>
      <h3 data-i18n="visit.hours.title">Hours</h3>
      <p data-i18n="visit.hours.1">Sun–Tue · 8:00am – 10:00pm</p>
      <p data-i18n="visit.hours.2">Wed–Sat · 8:00am – 11:30pm</p>
      <div class="visit-ctas">
        <a class="btn btn-primary" href="tel:+17862547577" data-i18n="visit.call">Call us</a>
        <a class="btn btn-ghost" href="https://maps.google.com/?q=507+N+Miami+Ave,+Miami,+FL+33136" target="_blank" rel="noopener" data-i18n="visit.directions">Get directions</a>
      </div>
    </div>
    <iframe class="visit-map" loading="lazy" title="Map: Candela & Café"
      src="https://www.google.com/maps?q=507+N+Miami+Ave,+Miami,+FL+33136&output=embed"></iframe>
  </div>
</section>

<footer class="footer">
  <div class="wrap footer-grid">
    <div><img src="assets/img/logo-96.webp" alt="" width="56" height="56"><p data-i18n="footer.tag">…</p></div>
    <div class="footer-links"><!-- repite enlaces nav --></div>
    <div>
      <p><span data-i18n="footer.delivery">Also on</span>:
        <a href="https://www.ubereats.com/store/candela-y-cafe-market/oa35cIfwWWuJm-ND4o9G1g" target="_blank" rel="noopener">Uber Eats</a> ·
        <a href="https://www.doordash.com/store/candela-y-caf%C3%A9-market-miami-26069377/" target="_blank" rel="noopener">DoorDash</a></p>
      <p>© 2026 Candela & Café Market</p>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer
  integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer
  integrity="sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d" crossorigin="anonymous"></script>
<script type="module" src="js/landing.js"></script>
</body>
</html>
```

Los bloques marcados `…misma estructura…` se construyen calcando el patrón de la sección anterior (kicker + h2.display + section-sub + CTA/foto) con las claves i18n de Task 4 (`market.*`, `catering.*`). No dejar ningún `…` literal en el archivo final.

- [ ] **Step 2: Escribir `web/css/landing.css`** — reglas por sección. Directivas obligatorias:

```css
/* HERO: foto a sangre con overlay para legibilidad */
.hero{position:relative;min-height:92vh;display:flex;align-items:center}
.hero-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(100deg,rgba(18,18,18,.92) 30%,rgba(18,18,18,.45) 70%,rgba(237,59,47,.25))}
.hero-content{position:relative;z-index:1;max-width:640px;display:grid;gap:22px;padding-top:90px}
.hero-ctas{display:flex;gap:14px;flex-wrap:wrap}
.hero-meta{font-size:.85rem;color:var(--gris-oscuro)}

/* MARQUEE: cinta roja continua */
.marquee{background:var(--rojo);color:#fff;overflow:hidden;padding:12px 0}
.marquee-track{display:flex;gap:28px;white-space:nowrap;font-family:var(--display);font-size:1.05rem;will-change:transform}
.marquee-track i{color:var(--verde);font-style:normal}

/* ABOUT / MUSIC / MARKET / CATERING / VISIT: grids 2 col → 1 col móvil */
.about-grid,.music-grid,.visit-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
@media(max-width:860px){.about-grid,.music-grid,.visit-grid{grid-template-columns:1fr}}
.about-photo img{border-radius:var(--radius);box-shadow:var(--shadow)}

/* DAILY SPECIAL: banda fina verde */
.daily-special{background:var(--verde);color:#10210a;text-align:center;padding:10px 0;font-weight:700}

/* TEASER: cards de platos estrella */
.teaser-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;margin:42px 0}
.dish-card{background:#fff;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);transition:transform .3s var(--ease),box-shadow .3s}
.dish-card:hover{transform:translateY(-6px);box-shadow:0 18px 44px rgba(0,0,0,.16)}
.dish-card img{aspect-ratio:4/3;object-fit:cover;width:100%}
.dish-card .dc-body{padding:18px;display:grid;gap:6px}
.dish-card .dc-name{font-weight:700}
.dish-card .dc-price{font-family:var(--display);color:var(--rojo);font-size:1.2rem}

/* MUSIC: neón */
.neon{color:#fff;text-shadow:0 0 18px rgba(237,59,47,.85),0 0 42px rgba(237,59,47,.4)}
.music{background:radial-gradient(ellipse at 75% 20%, #2a1010 0%, var(--negro) 60%)}
.music-photos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.music-photos img{border-radius:var(--radius);aspect-ratio:3/4;object-fit:cover}

/* GALLERY: mosaico */
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:40px 0}
.gallery-grid img{aspect-ratio:1;object-fit:cover;border-radius:8px;transition:transform .3s var(--ease)}
.gallery-grid img:hover{transform:scale(1.03)}
@media(max-width:640px){.gallery-grid{grid-template-columns:repeat(2,1fr)}}

/* REVIEWS */
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;margin-top:42px}
.reviews-grid blockquote{background:#fff;border-radius:var(--radius);padding:26px;box-shadow:var(--shadow)}
.reviews-grid .stars{color:var(--verde);letter-spacing:3px}

/* VISIT */
.visit-map{width:100%;height:380px;border:0;border-radius:var(--radius)}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px}
@media(max-width:860px){.footer-grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: Vista rápida** — abrir `web/index.html` en el navegador (Playwright MCP o doble clic) y verificar: navbar fija, hero con foto, todas las secciones presentes, sin overflow horizontal en 375px.

- [ ] **Step 4: Commit** — `git add web/index.html web/css/landing.css; git commit -m "feat: landing completa (13 secciones, patrón dual)"`

---

### Task 7: landing.js — animación e interacción

**Files:**
- Create: `web/js/landing.js`

- [ ] **Step 1: Escribir `web/js/landing.js`**

```js
import { initLangToggle, t, getLang } from './i18n.js';
import { MENU, FEATURED, PHONE, DAILY_SPECIAL } from './menu-data.js';

initLangToggle();

/* navbar scroll state + burger */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
document.getElementById('burger').addEventListener('click', () =>
  document.getElementById('navLinks').classList.toggle('open'));

/* daily special + CTAs WhatsApp */
function renderLangBits() {
  document.getElementById('dailySpecial').textContent = DAILY_SPECIAL[getLang()];
  document.getElementById('musicWa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t('music.wa'))}`;
  document.getElementById('cateringWa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t('catering.wa'))}`;
}
renderLangBits();
document.addEventListener('langchange', renderLangBits);

/* teaser de platos estrella */
const grid = document.getElementById('teaserGrid');
function renderTeaser() {
  grid.innerHTML = FEATURED.map(([cat, id]) => {
    const it = MENU[cat].find(i => i.id === id);
    const img = it.img ? `<img src="assets/img/${it.img}-480.webp" alt="${it.name}" loading="lazy">` : '';
    return `<article class="dish-card">${img}<div class="dc-body">
      <span class="dc-name">${it.name}</span>
      <span class="dc-desc">${it.desc ? it.desc[getLang()] : ''}</span>
      <span class="dc-price">$${it.price.toFixed(2)}</span></div></article>`;
  }).join('');
}
renderTeaser();
document.addEventListener('langchange', renderTeaser);

/* GSAP: reveals + marquee + parallax (espera al CDN deferred) */
addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.remove('reveal'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-content > *', { y: 36, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' });
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' } });
  });
  const track = document.getElementById('marqueeTrack');
  track.innerHTML += track.innerHTML;                       // duplicar para loop
  gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
  gsap.to('.hero-img img', { yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
});
```

(El HTML de Task 6 carga este módulo; las dish-card del teaser no entran al carrito — pedido solo en menu.html, YAGNI.)

- [ ] **Step 2: Verificar en navegador** — scroll completo: navbar cambia, marquee corre sin saltos, reveals disparan una vez, toggle ES cambia textos y teaser, botones de música/catering abren `wa.me/17862547577` con mensaje correcto.

- [ ] **Step 3: Commit** — `git add web/js/landing.js; git commit -m "feat: interacción y animación GSAP de la landing"`

---

### Task 8: menu.html + menu.css + menu.js + cart.js

**Files:**
- Create: `web/menu.html`, `web/css/menu.css`, `web/js/menu.js`, `web/js/cart.js`

- [ ] **Step 1: Escribir `web/menu.html`** — head igual a index (título: `Menu — Candela & Café Market | Order via WhatsApp`), navbar compartida (CTA del nav apunta a `#` propio), y cuerpo:

```html
<header class="menu-hero dark">
  <div class="wrap">
    <h1 class="display" data-i18n="menu.title">The Menu</h1>
    <p class="section-sub" data-i18n="menu.sub">Order online — we confirm by WhatsApp.</p>
  </div>
</header>
<nav class="chips" id="chips"><!-- chips por categoría, render JS --></nav>
<main class="wrap menu-main" id="menuMain">
  <noscript><p class="noscript" data-i18n="noscript">This menu needs JavaScript. Call us at +1 (786) 254-7577 — 507 N Miami Ave.</p></noscript>
</main>

<button class="cart-fab" id="cartFab" hidden>
  <span class="fab-count" id="fabCount">0</span>
  <span data-i18n="cart.label">Your order</span>
  <b id="fabTotal">$0.00</b>
</button>
<div class="overlay" id="overlay" hidden></div>
<aside class="cart-sheet" id="cartSheet" role="dialog" aria-label="Your order" hidden>
  <header><b data-i18n="cart.label">Your order</b><button id="cartClose" aria-label="Close">✕</button></header>
  <div class="sheet-body" id="sheetBody"></div>
  <footer class="sheet-footer">
    <p class="cart-note" data-i18n="cart.note">Pickup / delivery details are confirmed by WhatsApp.</p>
    <div class="total-row"><span data-i18n="cart.total">Total</span><b id="cartTotal">$0.00</b></div>
    <a class="btn btn-green wa-send" id="waSend" href="#" target="_blank" rel="noopener" data-i18n="cart.send">Send order via WhatsApp</a>
  </footer>
</aside>
<script type="module" src="js/menu.js"></script>
```

- [ ] **Step 2: Escribir `web/css/menu.css`**

```css
.menu-hero{padding:140px 0 56px}
.chips{position:sticky;top:0;z-index:90;display:flex;gap:10px;overflow-x:auto;padding:14px 24px;
  background:rgba(18,18,18,.94);backdrop-filter:blur(10px);scrollbar-width:none}
.chip{flex:0 0 auto;padding:8px 18px;border-radius:999px;border:1.5px solid #3a3a3a;color:var(--crema);
  font-size:.8rem;font-weight:600;letter-spacing:.06em;transition:all .2s}
.chip.active{background:var(--rojo);border-color:var(--rojo);color:#fff}
.menu-main{padding:48px 24px 140px}
.cat-title{font-family:var(--display);font-size:1.7rem;color:var(--rojo);margin:46px 0 18px;scroll-margin-top:84px}
.menu-item{display:grid;grid-template-columns:1fr auto auto;gap:8px 16px;align-items:center;
  padding:16px 0;border-bottom:1px dashed #d8cfc2}
.menu-item.has-img{grid-template-columns:84px 1fr auto auto}
.menu-item img{width:84px;height:84px;object-fit:cover;border-radius:10px}
.mi-name{font-weight:700}
.mi-name .badge{background:var(--verde);color:#10210a;font-size:.62rem;font-weight:700;
  letter-spacing:.06em;border-radius:4px;padding:2px 7px;margin-left:8px;vertical-align:2px;text-transform:uppercase}
.mi-desc{grid-column:1/-1;color:var(--gris);font-size:.9rem}
.menu-item.has-img .mi-desc{grid-column:2/-1}
.mi-price{font-family:var(--display);color:var(--carbon);font-size:1.1rem}
.mi-add{width:38px;height:38px;border-radius:50%;background:var(--rojo);color:#fff;font-size:1.3rem;
  display:grid;place-items:center;transition:transform .2s,background .2s}
.mi-add:hover{transform:scale(1.1);background:var(--rojo-hover)}
.cart-fab{position:fixed;right:20px;bottom:20px;z-index:95;display:flex;gap:12px;align-items:center;
  background:var(--negro);color:var(--crema);padding:14px 22px;border-radius:999px;box-shadow:var(--shadow-dark)}
.fab-count{background:var(--rojo);color:#fff;border-radius:50%;width:26px;height:26px;display:grid;place-items:center;font-weight:700;font-size:.8rem}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:96}
.cart-sheet{position:fixed;z-index:97;background:var(--claro);border-radius:18px 18px 0 0;
  inset:auto 0 0 0;max-height:82vh;display:flex;flex-direction:column;
  transform:translateY(100%);transition:transform .35s var(--ease)}
.cart-sheet.open{transform:none}
@media(min-width:861px){.cart-sheet{inset:0 0 0 auto;width:420px;border-radius:0;transform:translateX(100%)}}
.cart-sheet header{display:flex;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e3dacd}
.sheet-body{overflow-y:auto;padding:8px 24px;flex:1}
.sheet-line{display:grid;grid-template-columns:1fr auto;gap:4px 14px;padding:14px 0;border-bottom:1px dashed #d8cfc2}
.qty{display:inline-flex;gap:10px;align-items:center}
.qty button{width:26px;height:26px;border-radius:50%;border:1.5px solid var(--carbon)}
.sheet-footer{padding:18px 24px 24px;border-top:1px solid #e3dacd;display:grid;gap:12px}
.total-row{display:flex;justify-content:space-between;font-size:1.15rem}
.wa-send{justify-content:center}
.wa-send[aria-disabled="true"]{opacity:.45;pointer-events:none}
.cart-empty{text-align:center;color:var(--gris);padding:40px 0}
```

- [ ] **Step 3: Escribir `web/js/cart.js`** (capa DOM):

```js
import { createCart, buildWaUrl } from './cart-core.js';
import { t } from './i18n.js';
import { PHONE } from './menu-data.js';

const LS = 'candela-cart';
export const cart = createCart(localStorage.getItem(LS));

const fab = document.getElementById('cartFab');
const sheet = document.getElementById('cartSheet');
const overlay = document.getElementById('overlay');

export function refresh() {
  localStorage.setItem(LS, cart.serialize());
  const n = cart.count();
  fab.hidden = n === 0 && !sheet.classList.contains('open');
  document.getElementById('fabCount').textContent = n;
  document.getElementById('fabTotal').textContent = `$${cart.total().toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${cart.total().toFixed(2)}`;

  const body = document.getElementById('sheetBody');
  body.innerHTML = n === 0 ? `<p class="cart-empty">${t('cart.empty')}</p>` :
    cart.lines().map(l => `<div class="sheet-line">
      <span class="mi-name">${l.name}</span>
      <span class="qty" data-id="${l.id}">
        <button data-d="-1">−</button><b>${l.qty}</b><button data-d="1">+</button>
      </span>
      <span class="mi-price">$${(l.price * l.qty).toFixed(2)}</span></div>`).join('');

  const wa = document.getElementById('waSend');
  wa.setAttribute('aria-disabled', n === 0);
  wa.href = n === 0 ? '#' : buildWaUrl(cart, PHONE, t('wa.greeting'));
}

export function initCartUI() {
  fab.addEventListener('click', () => { sheet.classList.add('open'); sheet.hidden = overlay.hidden = false; });
  const close = () => { sheet.classList.remove('open'); overlay.hidden = true; refresh(); };
  document.getElementById('cartClose').addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.getElementById('sheetBody').addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    const id = b.closest('.qty').dataset.id;
    const line = cart.lines().find(l => l.id === id);
    cart.setQty(id, line.qty + Number(b.dataset.d));
    refresh();
  });
  document.addEventListener('langchange', refresh);
  refresh();
}
```

- [ ] **Step 4: Escribir `web/js/menu.js`**

```js
import { MENU, CATEGORIES } from './menu-data.js';
import { initLangToggle, getLang } from './i18n.js';
import { cart, refresh, initCartUI } from './cart.js';

initLangToggle();

const chips = document.getElementById('chips');
const main = document.getElementById('menuMain');

function render() {
  const lang = getLang();
  chips.innerHTML = CATEGORIES.map(c =>
    `<a class="chip" href="#${c.id}" data-cat="${c.id}">${c.label[lang]}</a>`).join('');
  main.innerHTML = CATEGORIES.map(c => `
    <h2 class="cat-title" id="${c.id}">${c.label[lang]}</h2>
    ${MENU[c.id].map(it => `
      <div class="menu-item${it.img ? ' has-img' : ''}" data-id="${it.id}" data-cat="${c.id}">
        ${it.img ? `<img src="assets/img/${it.img}-480.webp" alt="${it.name}" loading="lazy">` : ''}
        <span class="mi-name">${it.name}${it.badge ? `<span class="badge">${it.badge}</span>` : ''}</span>
        <span class="mi-price">$${it.price.toFixed(2)}</span>
        <button class="mi-add" aria-label="Add ${it.name}">+</button>
        ${it.desc ? `<span class="mi-desc">${it.desc[lang]}</span>` : ''}
      </div>`).join('')}`).join('');
}
render();
document.addEventListener('langchange', render);

main.addEventListener('click', e => {
  const btn = e.target.closest('.mi-add');
  if (!btn) return;
  const el = btn.closest('.menu-item');
  const item = MENU[el.dataset.cat].find(i => i.id === el.dataset.id);
  cart.add(item);
  btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 240);
  refresh();
});

/* scroll-spy de chips */
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    document.querySelectorAll('.chip').forEach(ch =>
      ch.classList.toggle('active', ch.dataset.cat === en.target.id));
  });
}, { rootMargin: '-15% 0px -75% 0px' });
document.querySelectorAll('.cat-title').forEach(h => spy.observe(h));

initCartUI();
```

- [ ] **Step 5: Probar el flujo completo en navegador** — agregar 2 items (uno repetido), abrir carrito, subir/bajar cantidades, verificar que el href del botón verde es `https://wa.me/17862547577?text=...` y que decodificado contiene `2x <nombre> — $<subtotal>` y `Total: $<total>`. Toggle ES: chips, descripciones y UI del carrito cambian; nombres de platos NO.

- [ ] **Step 6: Re-correr tests** — `node --test tests/` → 5 pass.

- [ ] **Step 7: Commit** — `git add web/menu.html web/css/menu.css web/js/menu.js web/js/cart.js; git commit -m "feat: página de menú con carrito y pedido por WhatsApp"`

---

### Task 9: SEO, schema, netlify.toml, favicon/OG

**Files:**
- Modify: `web/index.html`, `web/menu.html` (head)
- Create: `web/netlify.toml`, `web/assets/img/og-image.webp`, `web/favicon.ico` (o PNG)

- [ ] **Step 1: Generar OG image y favicon** desde el logo/hero con sharp (1200×630 para OG: foto hero con overlay oscuro; favicon 48px desde el logo):

```powershell
node -e "import('sharp').then(({default:s})=>s('web/assets/img/hero-sandwich-1440.webp').resize(1200,630,{fit:'cover'}).webp({quality:80}).toFile('web/assets/img/og-image.webp'))" --input-type=module
node -e "import('sharp').then(({default:s})=>s('web/assets/img/logo.png').resize(48,48).png().toFile('web/favicon.png'))" --input-type=module
```

- [ ] **Step 2: Añadir al `<head>` de ambas páginas** (ajustando título/desc/url por página):

```html
<link rel="icon" type="image/png" href="favicon.png">
<meta property="og:type" content="restaurant">
<meta property="og:title" content="Candela & Café Market — NY Deli & Live Music | Downtown Miami">
<meta property="og:description" content="NY-style deli, Dominican soul food, specialty coffee and live music Fridays. Order via WhatsApp.">
<meta property="og:image" content="https://candelaycafe.netlify.app/assets/img/og-image.webp">
<meta property="og:url" content="https://candelaycafe.netlify.app/">
<meta name="twitter:card" content="summary_large_image">
```

(El dominio definitivo lo confirma Robert; usar el subdominio Netlify hasta entonces.)

- [ ] **Step 3: JSON-LD en index.html** (antes de `</head>`):

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Restaurant",
  "name": "Candela & Café Market",
  "servesCuisine": ["Deli", "Dominican", "Coffee"],
  "telephone": "+17862547577",
  "address": { "@type": "PostalAddress", "streetAddress": "507 N Miami Ave",
    "addressLocality": "Miami", "addressRegion": "FL", "postalCode": "33136", "addressCountry": "US" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Sunday","Monday","Tuesday"], "opens": "08:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Wednesday","Thursday","Friday","Saturday"], "opens": "08:00", "closes": "23:30" } ],
  "menu": "https://candelaycafe.netlify.app/menu.html",
  "sameAs": ["https://www.instagram.com/candelaycafe/"] }
</script>
```

- [ ] **Step 4: `web/netlify.toml`**

```toml
[[headers]]
  for = "/assets/img/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

- [ ] **Step 5: Commit** — `git add -A; git commit -m "feat: SEO, schema.org, OG y config de Netlify"`

---

### Task 10: Verificación final

**Files:** los que requieran fixes.

- [ ] **Step 1: Tests** — `node --test tests/` → 5 pass.

- [ ] **Step 2: Flujo de pedido end-to-end con Playwright MCP** — servir `web/` (`npx serve web` o `python -m http.server -d web 8080`), navegar, y validar:
  1. Landing: navbar, marquee, toggle ES→EN, CTAs WhatsApp con número `17862547577`.
  2. Menú: agregar 3 items → FAB muestra 3 → abrir sheet → bajar uno a 0 → total recalcula → href de WhatsApp decodificado coincide con líneas y total.
  3. Recarga de página: el carrito persiste (localStorage).
  4. 375px: sin overflow horizontal en ambas páginas; chips scrolleables; sheet usable.

- [ ] **Step 3: Cotejo del menú** — releer los recortes de `tools/crops/` contra `menu-data.js` (muestreo: 3 items por categoría, nombres y precios exactos). Cualquier desviación se corrige y se anota.

- [ ] **Step 4: i18n audit** — en consola del navegador:

```js
[...document.querySelectorAll('[data-i18n]')].filter(el => el.textContent.trim() === el.dataset.i18n)
```

Expected: `[]` en ambas páginas y en ambos idiomas.

- [ ] **Step 5: Lighthouse móvil** — `npx lighthouse http://localhost:8080 --preset=perf --form-factor=mobile --screenEmulation.mobile --quiet` (y para `menu.html`). Objetivo ≥ 90 en Performance/SEO/Accessibility/Best Practices. Si Performance < 90: revisar peso del hero (≤ 120 KB), `preload` de la fuente display, y que GSAP esté `defer`.

- [ ] **Step 6: Commit de fixes** — `git add -A; git commit -m "fix: ajustes de verificación (Lighthouse/responsive/i18n)"`

- [ ] **Step 7: Reporte a Robert** — resumen con: resultados Lighthouse, captura del flujo WhatsApp, y pendientes que requieren su decisión (dominio definitivo, archivar `candela-cafe/` y `candela-cafe-menu/`, crear repo `irisdigitllab/candela-cafe-market` y push — **nunca push sin su OK**).

---

## Self-Review (hecho)

- **Cobertura del spec:** sistema visual → T1; fotos WebP → T2; menú real → T3; i18n → T4; carrito+WhatsApp → T5/T8; landing 13 secciones → T6/T7; menu.html UX → T8; SEO/schema/netlify → T9; verificación (Playwright/i18n/Lighthouse/cotejo) → T10; git/rama → T1; `noscript` → T8. Reviews reales → T6 (con nota de validación por Robert).
- **Placeholders:** los `…` de Task 6 están explícitamente definidos como "calcar el patrón con claves i18n de Task 4" — las claves existen todas en T4. Sin TBD.
- **Consistencia de tipos:** `createCart/add/setQty/lines/count/total/serialize/buildWaUrl` idénticos en T5 test, T5 impl y T8 uso. `MENU[cat]` array de items con `{id,name,desc,price,badge,img}` consistente en T3/T7/T8. `FEATURED` como pares `[cat,id]` consistente T3/T7. Claves i18n usadas en T6/T8 existen todas en T4.

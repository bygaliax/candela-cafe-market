# Rebrand Candela y Café → Next.js + nuevo branding "fuego"

**Fecha:** 2026-06-09
**Estado:** Aprobado para plan de implementación

## 1. Objetivo

Rebrandear por completo el sitio de Candela y Café guiándonos por el nuevo
branding del Figma (archivo `IRIS-SOCIAL-MEDIA`, fileKey `i8khdC1vnhbDPeGXe10oNG`),
y reestructurar el proyecto de dos HTML monolíticos a una arquitectura real con
Next.js + TypeScript + Tailwind, separando HTML/JSX, CSS, JS y datos.

El cambio es doble:
- **Visual:** paleta cálida espresso/crema → paleta **fuego** (negro + rojo + verde lima), motivo de llama, fuentes nuevas.
- **Concepto:** de menú **dominicano** → **eatery casual de Miami** (burgers, sandwiches, wraps, salads, parrilla, vinos & cervezas, catering, live music).

## 2. Decisiones tomadas (brainstorming)

| Decisión | Elección |
|---|---|
| Páginas a rebrandear | **Ambas** (landing `index` + menú QR) |
| Contenido | **Cambiar el concepto** (de dominicano a eatery casual) |
| Fidelidad al branding | **Fiel pero legible** (alto impacto, menú legible) |
| Assets | **Extraer del Figma** (logo + fotos) |
| Carta | **Borrador generado** con precios placeholder (editable luego) |
| Funcionalidad del menú | **Mantener carrito + toggle aquí/llevar**, reestilizados |
| Stack | **Next.js (App Router) + TypeScript** |
| Estilos | **Tailwind CSS** con tokens de marca |
| Despliegue | **Static export** (`output: 'export'`) en **Netlify** |

## 3. Sistema de diseño

### Colores (extraídos del Figma)

| Token | HEX | Uso |
|---|---|---|
| `fuego` | `#e33125` | Rojo marca primario, fondos de acento, categorías |
| `fuego-cta` | `#bc1d1a` | Botones "Order Now", hover |
| `granate` | `#54150d` | Píldoras de contacto, fondos profundos |
| `carbon` | `#0a0a0a` | Fondo principal (negro) |
| `carbon-2` | `#161616` | Tarjetas/superficies elevadas |
| `lima` | `#68b51b` | Acento verde, detalles Memphis, barras |
| `crema` | `#fff7d5` | Títulos y texto sobre oscuro |
| `crema-2` | `#f1ddc2` | Display manuscrito |
| `hueso` | `#f5f5f0` | Texto de UI/contacto |

### Tipografías (Google Fonts vía `next/font/google`)

- **Anton** → `font-display`: titulares grandes, CTAs (condensada, uppercase, alto impacto).
- **Architects Daughter** → `font-hand`: acentos manuscritos / eyebrows (tipo *Authentic Flavors!*).
- **Sora** → `font-body`: cuerpo, navegación, ítems de menú, precios (legibilidad).

### Motivos gráficos
- Textura de **llamas** sobre negro (overlay sutil en secciones oscuras).
- Puntos **Memphis** (verde/blanco) en esquinas.
- Triángulos y círculos verdes outline.
- **Fotos en círculos**.
- **Píldora de contacto**: teléfono + web + botón "ORDER NOW".
- **Sello dentado** rojo alrededor del logo de llama.

## 4. Arquitectura

### Stack
- Next.js (App Router) + TypeScript, **static export** (`output: 'export'`).
- Tailwind CSS con tokens de marca en `tailwind.config.ts`.
- Sin backend; el carrito es 100% client-side (Context + `localStorage`).
- Deploy en Netlify (publish dir `out/`); `netlify.toml` actualizado.

### Estructura de carpetas
```
app/
  layout.tsx          fuentes + Header/Footer globales + CartProvider
  page.tsx            landing
  menu/page.tsx       menú QR
  globals.css         Tailwind base + tokens/utilidades
components/
  layout/   Header.tsx · Footer.tsx · ContactPill.tsx
  landing/  Hero.tsx · ConceptSection.tsx · LiveMusic.tsx · Catering.tsx
  menu/     SearchBar.tsx · CategoryTabs.tsx · MenuCard.tsx · Cart.tsx · OrderTypeToggle.tsx
  ui/       FlameBadge.tsx (logo) · MemphisDots.tsx · Button.tsx
lib/
  cart-context.tsx    estado carrito (Context + useReducer + localStorage)
data/
  menu.ts             carta: categorías, platos, precios (borrador)
  site.ts             contacto, redes, secciones del landing
public/
  img/   fotos extraídas del Figma
  logo/  insignia de llama
tailwind.config.ts · next.config.ts · netlify.toml
```

### Tokens en Tailwind
- `theme.extend.colors`: fuego, fuego-cta, granate, carbon, carbon-2, lima, crema, crema-2, hueso.
- `theme.extend.fontFamily`: display (Anton), hand (Architects Daughter), body (Sora).

## 5. Componentes (responsabilidad)

| Componente | Responsabilidad |
|---|---|
| `Header` | Logo (FlameBadge), nav, CTA "Order Now". Sticky en menú. |
| `Footer` | ContactPill + redes. |
| `ContactPill` | Píldora reutilizable: tel · web · botón Order Now. |
| `FlameBadge` | Logo de llama (SVG/PNG del Figma) en sello dentado. |
| `MemphisDots` | Decoración de puntos/figuras (props de color/posición). |
| `Hero` | Hero del landing (titular + foto circular + CTA). |
| `ConceptSection` | Bloque reutilizable por concepto (burgers, sandwiches, etc.): título, foto, copy, link al menú. |
| `LiveMusic` / `Catering` | Secciones especiales del landing. |
| `SearchBar` | Filtra ítems del menú por texto. |
| `CategoryTabs` | Tabs sticky de categorías; scroll/anchor a secciones. |
| `MenuCard` | Tarjeta de plato: nombre, descripción, precio, tags, botón +. |
| `OrderTypeToggle` | Toggle "para comer aquí / para llevar". |
| `Cart` | FAB + panel: líneas, cantidades, total, tipo de pedido. |

## 6. Modelo de datos

```ts
// data/menu.ts
export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;          // USD
  tags?: ('spicy' | 'veggie' | 'popular' | 'new')[];
  image?: string;         // ruta en /img
};

export type MenuCategory = {
  id: string;             // slug usado por tabs (anchor)
  label: string;          // display
  accent?: 'fuego' | 'lima';
  items: MenuItem[];
};

export const menu: MenuCategory[];
```

```ts
// data/site.ts
export const site = {
  name: 'Candela & Café',
  phone: '(786) 254-7577',
  url: 'www.candelaycafe.com',
  social: { instagram: '' },
};
```

```ts
// lib/cart-context.tsx
type CartLine = { itemId: string; qty: number };
type OrderType = 'dine-in' | 'to-go';   // aquí / llevar
// estado persistido en localStorage
```

## 7. Carta borrador (placeholder — editable)

Precios en USD, placeholder. El usuario los ajusta luego.

- **Burgers** (`fuego`): Candela Classic $12 · Smokehouse BBQ $14 · Spicy Fire 🌶️ $14 · Veggie 🌱 $11
- **Signature Sandwiches** (`fuego`): Cubano $11 · Grilled Chicken Pesto $12 · Steak & Cheese $13 · Pavo & Swiss $11
- **Wraps** (`lima`): Buffalo Chicken $11 · Caesar Chicken $11 · Veggie Hummus 🌱 $10
- **Salads** (`lima`): Caesar $9 (+pollo $4) · Mediterranean $11 · Cobb $12
- **Parrilla / Grill** (`fuego`): Mixed Grill (parrillada) $24 · Churrasco $19 · Pollo a la Parrilla $15 · Grilled Shrimp Skewers $18
- **Sides** (`lima`): Maduros $5 · Fries $4 · Yuca Frita $5 · House Salad $5
- **Wines & Beers / Bebidas** (`fuego`): Vino casa (copa) $8 · Botella $28 · Craft Beer $7 · Domestic Beer $5 · Sangría $9 · Café/Espresso $3 · Jugos naturales $4
- **Postres** (`lima`): Tres Leches $7 · Flan $6 · Cheesecake $7 · Churros $6

> Los emojis son solo notación de tags en el spec; en UI los tags se renderizan como etiquetas de estilo (no emojis), respetando "sin emojis en el menú".

## 8. Landing — secciones (de arriba a abajo)

1. **Hero** — fondo negro + textura fuego, titular Anton + acento Architects Daughter ("Authentic Flavors!"), foto circular de parrilla mixta, CTA "Order Now" → /menu.
2. **Best Burgers** — ConceptSection con foto + copy + link al menú.
3. **Signature Sandwiches** — ConceptSection.
4. **Salads & Wraps** — ConceptSection.
5. **Wines & Beers** — ConceptSection.
6. **Corporate Catering** — bloque CTA ("Elevate your events…").
7. **Live Music Nights** — bloque evento (foto guitarrista).
8. **Footer** — ContactPill (786) 254-7577 · www.candelaycafe.com + redes.

## 9. Menú — comportamiento

- Header sticky con logo + buscador + CTA.
- `CategoryTabs` sticky; al tocar una categoría hace scroll a su sección.
- `SearchBar` filtra ítems por nombre/descr.
- `MenuCard` con botón **+** que añade al carrito.
- `OrderTypeToggle` (aquí/llevar) afecta el estado del pedido.
- `Cart` FAB muestra cantidad/total; panel con líneas, +/−, total y tipo de pedido.
- Estado del carrito persistido en `localStorage`; tema oscuro on-brand, alto contraste.
- Se **elimina** la identidad dominicana (bandera RD, categorías frituras, etc.).

## 10. Assets a extraer del Figma

fileKey `i8khdC1vnhbDPeGXe10oNG`. Por post (nodeId → foto):

| Sección | nodeId del post |
|---|---|
| Mixed grill (hero) | `376:185` |
| Signature Sandwiches | `376:259` |
| Corporate Catering | `376:333` |
| Wines & Beers | `376:403` |
| Salads & Wraps | `376:438` |
| Best Burgers | `376:471` |
| Live Music Nights | `377:596` |

- **Logo de llama** ("MARKET / CANDELA & CAFÉ"): extraer la insignia (preferible SVG; si no, PNG a máxima resolución) → `public/logo/`.
- Fotos → `public/img/` (optimizar tamaño/peso).
- Si algún asset del Figma sale en baja resolución o compuesto, se re-solicita a mayor `maxDimension` o se recorta.

## 11. Migración

- Reescribir el markup actual de `index.html` y `menu.html` como componentes React.
- Reimplementar el JS de carrito/tabs/toggle como estado React (Context + useReducer).
- **Eliminar** `index.html` y `menu.html` viejos al final (quedan en git history).
- Conservar/actualizar `netlify.toml`, `.gitignore`, y mover `assets/` y `design/` según corresponda (los docs de `design/` se mantienen como referencia).

## 12. Fuera de alcance (YAGNI)

- Backend real de pedidos, pagos, o envío de la orden a cocina.
- Autenticación / cuentas de usuario.
- CMS / panel de administración de la carta.
- i18n completo (la UI sigue en español con nombres de platos en inglés, como el branding).
- Animaciones complejas más allá de hover/transiciones básicas.

## 13. Verificación / criterios de aceptación

- `next build` con `output: 'export'` compila sin errores y genera `out/`.
- Landing y `/menu` se ven on-brand (comparación visual contra los posts del Figma): paleta fuego, fuentes Anton/Architects Daughter/Sora, logo de llama, motivos gráficos.
- Responsive mobile-first verificado (es un menú QR → se escanea en móvil).
- Carrito funciona: añadir/quitar/total, persistencia en `localStorage`, toggle aquí/llevar.
- No quedan referencias a la identidad dominicana ni a la paleta vieja.
- Lighthouse razonable (sitio estático, imágenes optimizadas).

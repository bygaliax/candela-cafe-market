# Spec — Web Candela & Café Market

**Fecha:** 2026-06-09
**Proyecto:** candela-cafe-market (X:\Proyectos\Candela y Cafe Market)
**Estado:** Aprobado por Robert (4 bloques)

## Resumen

Sitio web de 2 páginas para **Candela & Café | NY Deli Market & Café** (507 N Miami Ave, Miami FL 33136 · +1 786 254-7577 · @candelaycafe): landing (`index.html`) + menú completo con pedidos por WhatsApp (`menu.html`). Reemplaza las dos webs existentes (`candela-cafe/`, `candela-cafe-menu/`), que usan una identidad obsoleta (marrón/crema) y contenido inventado.

**Identidad correcta** (fuente: diseños de Figma en `figma/Frame *.jpg`, logo y menú impreso en `wetransfer.../OUTPUT/FourFold Menu-01/02.jpg`): rojo + verde lima + negro, tipografía display **Architects Daughter**, logo circular con llama.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Dirección visual | **Dual noche + día**: bloques oscuros (hero, live music, footer) + bloques claros (menú, market, catering) |
| Estructura | Un sitio, dos páginas: `index.html` + `menu.html` |
| Idioma | Bilingüe EN/ES con toggle, **EN por defecto**. Nombres de platos siempre en idioma original |
| Fotos de menú | Solo fotos reales en destacados (~15); resto en lista tipográfica. **Sin stock** |
| Stack | HTML/CSS/JS vanilla estructurado + GSAP ScrollTrigger (CDN). Sin build step. Netlify |
| WhatsApp | Pedidos, reservas y catering → `wa.me/17862547577` (constante única `PHONE`) |
| Repo | Git en la raíz del proyecto; sitio nuevo en `web/`; `.gitignore` excluye material pesado |
| Animación | "Dinámica con criterio": reveals, marquee, parallax sutil, hovers vivos — solo transform/opacity |

## 1. Sistema visual

### Tokens de color

```css
--negro:        #121212;  /* fondos oscuros: hero, música, footer, navbar */
--carbon:       #1C1C1C;  /* texto sobre claro */
--rojo:         #ED3B2F;  /* CTAs, titulares destacados, marquee, acento primario */
--rojo-hover:   #c92a1f;  /* estados hover/active del rojo */
--verde:        #76C043;  /* badges, kickers, detalles — siempre secundario al rojo */
--claro:        #FBF7F0;  /* fondo de secciones de comida/menú/market */
--crema-texto:  #F5F0E8;  /* texto sobre oscuro */
```

Regla de jerarquía: el rojo manda, el verde acompaña (nunca verde como color dominante de una sección). La paleta vieja (Espresso/Crema/Ámbar de `assets/branding/color_palette.md`) queda **descartada**.

### Tipografía

- **Display:** Architects Daughter (Google Fonts, solo peso 400; el efecto "bold" de los posts se logra con `font-weight:700` sintetizado). Uso: titulares de sección, hero, nombres de categoría.
- **Body/UI:** DM Sans (400/500/700). Uso: descripciones, precios, botones, navegación, nombres de platos en listas.
- Carga con `display=swap` + preload; subsets latinos.

### Patrón dual

Bloques oscuros = candela/noche (hero, Live Music Fridays, footer). Bloques claros = apetito/día (about, menú, market, catering, reseñas, visítanos). Mismo patrón que el menú impreso del cliente: portada negra, paneles interiores claros.

## 2. index.html — Landing

Secciones en orden:

1. **Navbar** — sticky, oscuro, logo + wordmark, enlaces ancla, toggle EN/ES, CTA rojo "Order Now" → menu.html. En móvil: menú hamburguesa.
2. **Hero (oscuro)** — foto real protagonista, kicker verde "NY DELI · MARKET & CAFÉ · MIAMI", titular Architects Daughter con palabra clave en rojo, sub con propuesta de valor, CTAs "Order Now" + "Live Music Fridays" (ancla), horario y dirección visibles.
3. **Marquee rojo** — cinta en movimiento continuo: Breakfast · Lunch · NY Deli · Dominican Spot · Live Music Fridays · Daily Market.
4. **About (claro)** — "NY en la ejecución, dominicano en el alma" / historia breve, foto del local (neón "Wine Lover"), datos rápidos.
5. **Daily Specials** — banner fino editable (texto en constante JS, fácil de cambiar antes de cada deploy).
6. **Menú teaser (claro)** — 6–8 platos estrella con foto real + precio agrupados por categoría (Signature Sandwiches, Breakfast, Dominican Spot, Burgers…) → CTA "View full menu & order".
7. **Live Music Fridays (oscuro)** — sección con más energía: estética neón, fotos del ambiente, viernes en vivo, CTA "Reserve via WhatsApp".
8. **Market & Wine (claro)** — vinos, cervezas y productos del market ("Variety of wines and beers").
9. **Corporate Catering** — bloque con CTA WhatsApp para cotizar eventos ("Elevate your events").
10. **Galería** — mosaico de fotos reales + enlace a Instagram @candelaycafe.
11. **Reseñas (claro)** — 2–3 quotes reales (Yelp/Google) con estrellas.
12. **Visítanos** — horario completo (Dom–Mar 8am–10pm · Mié–Sáb 8am–11:30pm), mapa embebido (iframe lazy), dirección, botones tel: / WhatsApp / Google Maps directions.
13. **Footer (oscuro)** — logo, redes, enlaces de delivery (Uber Eats, DoorDash), navegación, copyright.

## 3. menu.html — Menú + pedidos

### Contenido

Menú **real completo** del four-fold impreso (fuente de verdad: `wetransfer.../OUTPUT/FourFold Menu-01.jpg` y `FourFold Menu-02.jpg`), con precios reales. Categorías:

Breakfast · Appetizers/Sides · Avocado Toast · Salads & Wraps · Dominican Spot · Soups · Signature Sandwiches · New York Signature Sandwiches · Panini · Burgers · Bakery & More · Coffee Bar · Juices · Smoothies · Protein Shakes

Se elimina todo el contenido inventado del sitio actual (platos placeholder, fotos Unsplash, teléfono/dirección falsos).

### UX

- Navegación por categorías: chips horizontales sticky con scroll-spy.
- Items destacados (~15) con foto real WebP; el resto en lista tipográfica con precio alineado a la derecha.
- Badges del menú impreso donde apliquen (p. ej. "Boar's Head").
- **Carrito:** FAB flotante (contador + total, animado) → bottom sheet con items, cantidades +/-, total → botón **"Send order via WhatsApp"**.
- Mensaje de WhatsApp formateado: lista de items con cantidades, total, y campo de nombre/nota opcional. URL: `https://wa.me/17862547577?text=...`.
- Estado de carrito vacío claro; botón de envío deshabilitado sin items.
- Carrito persiste en `localStorage` durante la sesión de navegación.

## 4. Arquitectura técnica

### Estructura de archivos

```
web/
├── index.html
├── menu.html
├── css/
│   ├── base.css        (tokens, reset, tipografía, utilidades)
│   ├── landing.css
│   └── menu.css
├── js/
│   ├── i18n.js         (diccionario EN/ES + toggle, persiste en localStorage)
│   ├── menu-data.js    (menú completo como objeto JS)
│   ├── cart.js         (carrito + mensaje WhatsApp)
│   ├── landing.js      (animaciones GSAP, marquee, nav)
│   └── menu.js         (render del menú, scroll-spy, filtros)
├── assets/
│   └── img/            (WebP responsive + logo)
└── netlify.toml        (headers de cache, redirects)
```

### Datos y constantes

- `PHONE = '17862547577'` — constante única para pedidos/reservas/catering.
- `DAILY_SPECIAL` — texto editable del banner de especiales.
- i18n: diccionario plano `{ key: { en, es } }`; atributos `data-i18n` en el HTML; preferencia en `localStorage`.

### Imágenes

- Selección de las mejores fotos reales de `wetransfer.../Candela/` y `Nuevas/`.
- Conversión a WebP con variantes responsive (`srcset` 480/960/1440) + `loading="lazy"` (excepto hero, con `fetchpriority="high"`).
- Logo desde `assets/branding/logopng.png` (recortado/optimizado).

### Animación (GSAP por CDN, deferred)

- Reveals al scroll (ScrollTrigger), entrada cinematográfica del hero, parallax sutil en fotos, marquee continuo, hovers con vida en cards/botones, contador de carrito animado.
- Solo `transform`/`opacity` (GPU). `prefers-reduced-motion: reduce` desactiva animaciones no esenciales.

### SEO / Performance

- Meta tags + Open Graph (imagen OG propia) + `schema.org/Restaurant` con horario, geo y enlace a menú; `schema.org/Menu` en menu.html.
- CSS crítico del hero inline; fonts preload + swap; GSAP deferred.
- Objetivo: Lighthouse móvil ≥ 90 en Performance/SEO/Accessibility/Best Practices.

### Git

- `git init` en la raíz del proyecto (repo destino: `irisdigitllab/candela-cafe-market`).
- `.gitignore`: `wetransfer_*/`, `*.zip`, `*.ai`, `Design System-handoff/`, `.netlify/`, `.superpowers/`, `Thumbs.db`.
- Las webs viejas (`candela-cafe/`, `candela-cafe-menu/`) se mantienen sin tocar como referencia durante el desarrollo; se archivan al terminar (mover a `_archive` o eliminar del repo, decisión de Robert al final).
- Push solo con aprobación explícita de Robert (regla global).

## Manejo de errores

- WhatsApp: `wa.me` abre app en móvil y WhatsApp Web en desktop — sin fallback adicional necesario.
- Carrito vacío: estado visual claro, CTA deshabilitado.
- Sin JS: el menú se renderiza desde `menu-data.js`, así que sin JS no hay menú interactivo — se muestra un `<noscript>` con teléfono, dirección y enlace a delivery. La landing es HTML estático y funciona completa sin JS (las animaciones son progresivas).
- Mapa: iframe lazy con enlace directo a Google Maps como alternativa.

## Verificación

1. **Playwright** — flujo crítico: agregar items → abrir carrito → modificar cantidades → verificar URL `wa.me` generada (número correcto + mensaje con items y total).
2. **i18n** — toggle EN/ES cubre todos los textos; sin claves huérfanas.
3. **Responsive** — revisión visual 375px / 768px / 1440px.
4. **Lighthouse** — móvil ≥ 90 en las cuatro categorías.
5. **Datos** — menú cotejado item por item contra el four-fold impreso (nombres y precios).

## Fuera de alcance

- Pagos online (el flujo es WhatsApp).
- CMS / panel de administración (especiales del día se editan en una constante).
- Integración con APIs de delivery (solo enlaces salientes).
- Rediseño de redes sociales o material impreso.

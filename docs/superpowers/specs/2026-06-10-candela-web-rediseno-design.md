# Spec — Rediseño web Candela & Café (dirección "craft de tus posts")

**Fecha:** 2026-06-10
**Proyecto:** candela-cafe-market (`X:\Proyectos\Candela y Cafe Market`)
**Estado:** Diseño aprobado por Robert vía mockups del visual companion. Sustituye al spec `2026-06-09-candela-web-design.md` (build rechazado por "muy simple/genérico").

## Resumen

Rediseño de la piel visual del sitio de Candela & Café manteniendo TODA la infraestructura funcional del build anterior. El sitio sigue siendo 2 páginas: **landing** (`index.html`) + **menú completo con carrito y pedido por WhatsApp** (`menu.html`). El rechazo anterior fue por ejecución plana, no por la marca ni la fuente: se conserva la paleta rojo/verde/negro y la fuente **Architects Daughter**, pero se sube el nivel de craft al de los posts de redes (capas, sello, recortes, profundidad, fundidos) y se añaden interacciones nuevas.

## Qué se REUSA del build anterior (no rehacer)

- `web/js/cart-core.js` — núcleo de carrito puro testeado (node:test).
- `web/js/menu-data.js` — menú real completo (79 items, 15 categorías, precios cotejados del four-fold impreso). `PHONE`, `DAILY_SPECIAL`, `CATEGORIES`, `MENU`, `FEATURED`.
- `web/js/i18n.js` — diccionario EN/ES + toggle (localStorage). Se ampliará con las claves nuevas.
- Pipeline de imágenes (`tools/convert-images.mjs`, WebP responsive 480/960/1440).
- SEO/Open Graph/schema.org (Restaurant + Menu), `netlify.toml`, objetivo Lighthouse móvil ≥ 90.

Se REHACE: `index.html`, `web/css/*`, `web/js/landing.js`, y se añaden módulos de interacción nuevos. `menu.html` se re-pinta con el sistema nuevo (su lógica de carrito/render se conserva).

## Sistema visual (tokens)

```css
--negro:#0d0d0d; --rojo:#ED3B2F; --rojo-hover:#C92A1F; --verde:#76C043;
--verde-d:#4f8a2a;            /* kicker/acento sobre fondos claros */
--claro:#FBF7F0; --crema:#F5F0E8; --ink:#1c1c1c; --ink-2:#5b534a; --gris-d:#a89f95;
--fuego:linear-gradient(95deg,#ff5a3c 0%,#ED3B2F 55%,#C92A1F 100%);  /* ROJO→ROJO, sin amarillo */
--disp:'Architects Daughter',cursive;  --body:'DM Sans',system-ui,sans-serif;
```

Reglas:
- **Sin ámbar/amarillo.** El degradado "fuego" es rojo→rojo. Se usa SOLO como relleno de la palabra clave de los titulares, nunca como líneas/barras decorativas.
- **Architects Daughter** para titulares (relleno de fuego en la palabra clave) y categorías; DM Sans para cuerpo/UI.
- **Sin textura de dots** de fondo.
- **Ritmo claro/oscuro alternado** (no todo oscuro). Modo claro = crema con texto tinta, kicker verde oscuro.
- Recursos recurrentes: sello del logo sobre círculo negro, marcos con borde rojo (degradado fuego), ornamentos de olas `〜`, kicker verde con guion, scroll-reveal.

## Páginas y secciones

### `index.html` (landing) — orden final

1. **Navbar** — sticky, **contenida al ancho del hero** (no full-width); logo+wordmark, enlaces ancla, toggle EN/ES, CTA rojo "Order Now" → `menu.html`. Hamburguesa en móvil.
2. **Hero** (oscuro) — kicker verde "NY Deli · Dominican Soul · Downtown Miami"; titular Architects Daughter **"Born in NY, raised Dominican, served in *Miami*"** (fuego en "Miami"); palabra fantasma "CANDELA" en capas detrás; sub; CTAs (Order Now + Live Music Fridays). Visual derecho: **recorte circular con carrusel de fotos** (cross-fade automático cada 2s) + anillo + **sello**; **foto del skyline de Miami/Brickell** muy tenue con fundido transparente→foto ocupando el lado derecho del fondo. (Sin marquesina.)
3. **Menú (destacados)** (oscuro) — fondo con foto de Miami muy tenue; **chips de categoría interactivos** (las 15 categorías) que **cambian el contenido al hacer click** (render desde `menu-data.js`); cards con foto donde exista, tipográficas si no; precio en rojo; **"Order +" con hover** (relleno verde + glow). Scrollbar de chips oculta (fade a la derecha). CTA "Ver menú completo & ordenar" → `menu.html`.
4. **Historia** (oscuro) — **línea de tiempo activada por scroll**: espina central que se enciende (rellena de rojo) según el progreso de scroll; hitos alternados izq/der que aparecen al entrar en viewport; arco origen (NY) → herencia (RD) → llegada a Miami → hoy. *(Fechas/fotos reales pendientes.)*
5. **Live Music** (oscuro neón) — verde neón lidera; pills "Todos los viernes · Música en vivo · Desde las 8pm"; **botón "Reservar mesa" → modal** (nombre, teléfono, viernes [auto-calcula próximos viernes], hora, personas con stepper) que arma un mensaje y abre `wa.me/17862547577`; **carrusel Swiper efecto "cards"** con fotos del ambiente. *(Foto real de música en vivo pendiente.)*
6. **Market** (claro) — **e-commerce**: grid de productos (foto, categoría, nombre, precio, "Agregar +"). Datos desde un `market-data.js` nuevo. CTA "Ver todo el market". *(Catálogo/fotos reales pendientes; arranca con placeholders marcados.)*
7. **Catering** (claro) — foto en marco + "Eleva tus *eventos*" + lista de servicios + CTA "Pide tu cotización" → WhatsApp.
8. **Galería** (oscuro) — mosaico de fotos reales (relleno, sin huecos) + hover + "Síguenos @candelaycafe".
9. **Reseñas** (claro) — **estilo Google**: cabecera con rating + botón **"Escribe tu reseña"** (→ link de Google), tarjetas con avatar/nombre/fecha/"vía Google". *(Conectar a reseñas reales vía Place ID / widget; placeholders mientras tanto.)*
10. **Visítanos** (oscuro) — dirección 507 N Miami Ave, horario Dom–Mar 8am–10pm / Mié–Sáb 8am–11:30pm, botones Llámanos / Cómo llegar, **mapa Google embebido**.
11. **Footer** (oscuro) — sello+wordmark, tagline, columnas (Explora · Pedidos & Redes: Uber Eats / DoorDash / Instagram / tel), copyright.

**ELIMINADO:** sección de Vinos/Cava (Robert la quitó 2026-06-10).

### `menu.html` (menú + pedido)

Sin cambios de alcance: menú real completo con chips scroll-spy, destacados con foto, carrito FAB → bottom sheet → "Send order via WhatsApp". Se re-pinta con el sistema visual nuevo (tokens, fuente, sello, sin amarillo).

## Arquitectura técnica

```
web/
├── index.html              ← landing re-hecha
├── menu.html               ← re-pintada (lógica conservada)
├── css/  base.css · landing.css · menu.css
├── js/
│   ├── i18n.js             (reuso + claves nuevas)
│   ├── menu-data.js        (reuso, 79 items)
│   ├── market-data.js      (NUEVO: productos del market)
│   ├── cart-core.js        (reuso)
│   ├── cart.js             (reuso/re-pintado)
│   ├── landing.js          (re-hecho: hero carousel, category tabs, timeline scroll, reservation modal, swiper init, reveals)
│   └── menu.js             (reuso/re-pintado)
└── assets/img/             (WebP responsive + logo + skyline Miami para el fondo tenue)
```

- **Librerías (CDN, con `integrity`/SRI):** GSAP + ScrollTrigger (reveals, timeline, parallax hero), Swiper 11 (carrusel "cards" de Live Music). Sin jQuery (la sección de vinos que lo requería fue eliminada).
- **Interacciones nuevas (vanilla salvo Swiper):** carrusel circular del hero (cross-fade 2s), tabs de categoría del menú (render por categoría), timeline por scroll (ScrollTrigger), modal de reserva (focus-trap, Escape, click-outside, genera `wa.me`), grid e-commerce del market.
- **Seguridad:** render del menú/productos escapando contenido (no `innerHTML` con input no confiable); SRI en todos los scripts externos.
- **Imágenes:** skyline de Miami (Brickell) para el fondo tenue del hero/menú — actualmente de Unsplash (licencia libre comercial); sustituible por foto propia. Fotos reales en WebP responsive.

## Datos / contenido pendiente de Robert (no bloquea construir; se usan placeholders marcados)

- Catálogo real del **Market** (productos, precios, fotos) → `market-data.js`.
- **Place ID de Google** + link exacto de "escribir reseña" + reseñas reales.
- Foto real de **música en vivo**; **fotos históricas** para la timeline.

## SEO / Performance

- Mantener meta + OG + schema.org (Restaurant + Menu). Objetivo Lighthouse móvil ≥ 90 en las 4 categorías.
- Fuentes async + preload del hero; CSS crítico inline; librerías deferred. Solo `transform`/`opacity` en animación; `prefers-reduced-motion` desactiva lo no esencial.
- El peso extra (Swiper, skyline) no debe degradar Lighthouse < 90.

## Verificación

1. **Playwright** — flujo de carrito en `menu.html` (agregar → modificar → URL `wa.me` con items+total) y flujo de **reserva** (modal → `wa.me` con datos).
2. **Tabs de menú** — cada chip cambia el contenido a la categoría correcta.
3. **i18n** — toggle EN/ES cubre textos nuevos; sin claves huérfanas.
4. **Responsive** — 375 / 768 / 1440.
5. **Lighthouse** — móvil ≥ 90.
6. **Datos** — menú cotejado contra el four-fold (ya hecho); market marcado como placeholder hasta catálogo real.

## Fuera de alcance

- Pagos online (el flujo es WhatsApp).
- CMS/admin (especiales y catálogo se editan en constantes JS).
- Integración real de delivery (solo enlaces) y de reseñas de Google (placeholders + link, hasta tener Place ID/widget).
- Sección de Vinos/Cava (eliminada).

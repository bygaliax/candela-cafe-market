# Revisión de código: web en vivo (commit 7039542), 2026-09-24

- **Qué se revisó:** una revisión estática más una prueba en navegador con Playwright a 375×812 y 1440×900, sobre `index.html` y `menu.html`.
- **Resultado base:**
  - tests 7/7;
  - 0 errores de consola y 0 respuestas 404;
  - sin overflow-x;
  - SRI de GSAP, ScrollTrigger y Swiper válido.
- **Qué hace cada número:** el spec `2026-09-24-candela-un-dia-design.md` §8 dice qué número se arregla y cómo. Estado: ✅ = arreglado en el parche `fe9a3ff`.

## Crítico / Alto
1. ✅ **Reseñas inventadas en producción.**
   - Dónde: `web/index.html:177-190` (nota 4.8) y el rótulo «Real Google reviews» en `web/js/i18n.js:146`.
2. ✅ **El banner de cookies (snippet de Netlify) tapaba los CTA en móvil.**
   - Medía 318 px de alto con z-index máximo.
   - El snippet se borró de Netlify; hay una copia de seguridad en `_material/candela-cafe/`.
3. ✅ **Canonical, og y JSON-LD apuntaban a `candelaycafe.netlify.app`**, que da 404.
4. ✅ **El menú hamburguesa se rompía después de hacer scroll.**
   - Causa: el `backdrop-filter` de `.nav.is-scrolled` (`web/css/base.css:47`) convertía el nav en el bloque contenedor del overlay fixed.
5. **El carrito pierde productos con bfcache o con dos pestañas.**
   - Causa: `web/js/cart.js:6-8,15` lee una sola vez y cada `refresh()` escribe encima.
   - Arreglo: releer antes de cada cambio y refrescar en `pageshow` (persisted) y en `storage`.
6. ✅ (oculto) **El market de ejemplo se podía pedir** (`web/js/market-data.js:1-12`).

## Medio
7. **Productos «In-store» entraban al carrito a $0.00.**
   - Dónde: `web/js/landing.js:46-49`; `menu.js:78` sí lo bloquea.
8. **Botones de la landing que no hacen lo que dicen.**
   - «Add +» es un enlace que no añade nada (`web/js/landing.js:24`).
   - «See the whole market» es `href="#"` (`web/index.html:153`).
9. **El badge de los Boar's Head cae en otra fila del grid** (`web/js/menu.js:59`, `web/css/menu.css:17-19`).
   - Arreglo: meterlo dentro de `.mi-name`.
10. **Al pulsar un chip, el título queda tapado.**
    - Causa: `scroll-margin-top:84px` (`web/css/menu.css:15`) es menor que el nav más los chips (~136 px).
    - Arreglo: 150 px y marcar como activo el chip pulsado.
11. **El mensaje de reserva mezcla idiomas** (`web/js/cart-core.js:39-41`).
    - Arreglo: plantilla por idioma, con plural.
12. **i18n incompleto.**
    - Claves que no existen: `menu.cta` (`index.html:99`) y `visit.dir` (`:203`; la que existe es `visit.directions`).
    - Sin `data-i18n`: el h2 «Live Music Fridays» (`:138`).
    - Fijos en inglés: los textos del carrusel (`landing.js:66-71`) y los aria-labels.
    - Cambiar de idioma resetea la categoría elegida (`landing.js:34`).
13. **Hero: el título parpadea cuando llega GSAP.**
    - Causa: `gsap.from` en `web/js/landing.js:85`.
    - Arreglo: ocultar de entrada con `.js .hero-copy > *{opacity:0}`.
14. **Hero: la prioridad de carga va a la imagen equivocada.**
    - Qué pasa: el preload y `fetchpriority` van al fondo de fuego, pero el LCP es el plato (`img.grill-t`).
    - Medido con 4G lento: LCP de 2,71 s a 1,81 s priorizando el plato.
15. **Caché `immutable` de un año en imágenes sin hash** (`netlify.toml:5-7` y `web/netlify.toml:3-6`).
16. **Foco y teclado.**
    - El modal y el drawer no atrapan el foco.
    - Los «+/−» del carrito pierden el foco.
    - Al cerrar el carrito vacío el foco va a `<body>`.
    - La hamburguesa no se cierra con Escape.
    - El toggle de idioma se anuncia como «ES» y los chips no tienen `aria-pressed`.
    - Dónde: `landing.js:16,191-195`, `cart.js:23,72-92`, `index.html:53` y `landing.js:29`.
17. **Un carrito guardado no válido rompe toda la landing** (`web/js/cart-core.js:4`).
    - Causa: acepta cualquier JSON que no sea un array.
    - Arreglo: `Array.isArray` y reconstruir cada línea por id desde MENU y MARKET.
18. **Carrusel de Live Music sin pausa y atascado con reduced-motion** (`landing.js:78`, `base.css:77`).
19. **Línea de tiempo en móvil desalineada** (`landing.css:95,108`) y los hitos se quedan con `translateY(26px)`.
20. **Contraste por debajo de AA.**
    - «Order Now!» blanco sobre `#6CB41C` = 2,57:1 (`landing.css:29-30`).
    - «View menu» = 4,11:1 (`base.css:42`).
    - Kicker en secciones claras = 3,93:1; `.p-cat` = 4,2:1 (`landing.css:147`).

## Bajo
21. **Animaciones que siguen fuera de pantalla** (`landing.js:88-92,173`).
    - El plato giratorio y las flotaciones siguen con el hero oculto.
    - El bucle de chispas pide frames aunque no haya partículas.
22. **~200 KB invisibles en cada visita móvil** (`index.html:66,69`, `landing.css:43,56`).
    - Se descargan `hero-drink` y `hero-burger-ring` aunque estén ocultas.
    - El skyline va detrás de un velo al 92–99 %.
23. **Alts incorrectos** (`index.html:117,122,165,169`, `landing.js:67`).
24. **El nav no cabe entre 861 y 960 px** (`base.css:52,60`).
    - Arreglo: hamburguesa desde ~1024 px.
25. **SEO y seguridad menores.**
    - `og:type="restaurant"` no es válido.
    - Al JSON-LD le faltan `url`, `priceRange` y `geo`, y usa `menu` en vez de `hasMenu`.
    - `robots.txt` y `sitemap.xml` dan 404.
    - La hoja CSS de Swiper no tiene SRI.
    - `window.open` sin `noopener` (`landing.js:198`).

## Bien hecho (no romper)
- `cart-core` está testeado. Los importes cuadran al céntimo y la URL de wa.me está bien codificada.
- Render seguro: `textContent` o `esc()`. localStorage va en try/catch. `lang` se actualiza al cambiar de idioma.
- Hero: CLS entre 0,001 y 0,005; imágenes con width/height; reduced-motion apaga GSAP y las chispas.
- CDN con versión fija y SRI; `_blank` con `noopener`; guarda `.js` para que se vea sin JS; no hay IDs duplicados.

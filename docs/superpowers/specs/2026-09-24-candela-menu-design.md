# Candela & Café — menú digital «Carta de papel»

- **Fecha:** 2026-09-24
- **Estado:** diseño y fotos aprobados en el visual companion; pendiente de revisar este documento
- **Rama:** `feature/un-dia-en-candela` (sigue a la portada «Un día en Candela»)
- **Boceto aprobado:** `.superpowers/brainstorm/10460-1790290261/content/menu-propuesta.html`. Es local: `.superpowers/` no se versiona.
- **Spec de la portada:** `docs/superpowers/specs/2026-09-24-candela-un-dia-design.md`

## 1. Objetivo

Rehacer `web/menu.html` para que la carta se vea como el resto de la web nueva y enseñe fotos reales de los platos que coinciden. El pedido no cambia: carrito → WhatsApp.

**Cómo sabremos que funciona:**
- Cada foto de la carta es la del plato que acompaña. Ninguna foto «parecida» va en otro plato.
- En el móvil se llega a cualquier categoría con un toque (chips) y a cualquier plato escribiendo su nombre (buscador).
- Desde un favorito de la portada se llega a ese plato, no al principio de la carta.
- No hay scroll horizontal a 320 px.
- Lighthouse en móvil da ≥ 90 en rendimiento y ≥ 95 en accesibilidad.

## 2. Decisiones de Robert (24-sep, visual companion)

1. **Diseño A · Carta de papel:**
   - fondo crema, carteles en Anton y precios a mano en rojo;
   - los platos con foto van en tarjetas de dos columnas, arriba de su categoría;
   - los platos sin foto van en filas compactas debajo;
   - las categorías se agrupan por momento del día: mañana, café y jugos, mediodía.
2. **Las 15 parejas foto ↔ plato de la propuesta:** no marcó ninguna como incorrecta (tabla en §5.1).
3. **Se mantienen las fotos actuales** de Downtown Platter, Chicken Caesar Salad, Fritura Mixta e Italian Panini.
4. **Las fotos sin plato en la carta no van en ningún plato:** desayuno dominicano, sancocho, salmón, ceviche, flan, jugo de china y G-1.

## 3. Decisiones mías que Robert tiene que revisar

1. **Las fotos que muestran varios productos van de cabecera de su categoría, no repetidas en tarjetas.**
   - La propuesta ponía la misma foto en Empanadas y en Tequeños, y la de la sopa en Soup of the Day M y en LG. Con tarjetas de dos columnas, eso son dos fotos iguales una al lado de la otra.
   - Esas fotos van una sola vez, como cabecera ancha de su categoría: Panadería (empanadas y tequeños), Sopas (sopa del día) y Barra de Café (tazas bajo el neón).
   - Rincón Dominicano lleva de cabecera la mesa caliente, como sugería la propuesta.
2. **El buscador es nuevo.** La propuesta decía que las dos opciones «mantienen» el buscador, pero el menú actual no tiene: fue un error mío. Entra como pieza nueva (§4.4). Si no lo quieres, se quita sin tocar el resto.
3. **Los favoritos de la portada enlazan al plato** (`menu.html#ny-chopped-cheese`), no a su categoría. Al llegar, la tarjeta se marca un momento.
4. **La Candela Burger usa la foto E-2**, que es la que se aprobó en la propuesta. La portada sigue con E-1, la misma burger desde otro ángulo.

## 4. La página (`web/menu.html`)

### 4.1 Estructura, de arriba abajo

1. **Nav:** la de la portada, pero negra y compacta desde arriba. La nav transparente no se ve sobre crema.
2. **Cabecera:**
   - antetítulo «Pide · recoge en el 507»;
   - título «La carta.» en Architects Daughter;
   - el subtítulo de ahora, «Ordena online — confirmamos por WhatsApp.»;
   - el buscador.
3. **Chips:**
   - fijos bajo la nav, uno por categoría y en el orden de la carta;
   - el activo va relleno de rojo;
   - hasta 1023 px se desplazan en horizontal y el activo se queda a la vista;
   - desde 1024 px van en dos líneas centradas.
4. **La carta:** los tres momentos del día (§4.2). En cada categoría, en este orden: cartel, cabecera (si la tiene), tarjetas y filas.
5. **Botón de pedido y hoja del carrito:** funcionan igual que ahora, con la piel de papel.
6. **Footer:** el de la portada, sin cambios.

### 4.2 Momentos y orden de las categorías

| Momento (ES / EN) | Categorías, en este orden |
|---|---|
| Mañana / Morning | Desayunos, Avocado Toast, Panadería |
| Café y jugos / Coffee & juices | Barra de Café, Jugos, Batidos, Batidos de Proteína |
| Mediodía / Midday | Sándwiches NY, Sándwiches de la Casa, Panini, Hamburguesas, Rincón Dominicano, Ensaladas y Wraps, Sopas, Aperitivos |

**Los `id` de las categorías y de los platos no cambian.** Dependen de ellos el carrito guardado, los favoritos de la portada y los enlaces `menu.html#…`.

### 4.3 Tarjetas, filas y cabeceras

- **Tarjeta (plato con foto):**
  - foto 4:3, nombre en Anton y descripción de dos líneas como mucho;
  - precio a mano en rojo y botón «+»;
  - dos columnas en móvil; desde 600 px, las que quepan (mínimo 220 px cada una).
- **Tarjeta ancha:** si una categoría tiene un número impar de tarjetas, la primera ocupa todo el ancho. Hoy son The Ruben, la Quesadilla, la Candela Burger y la Fritura Mixta. Durante una búsqueda la regla se recalcula con las tarjetas que se ven.
- **Fila (plato sin foto):**
  - nombre, descripción corta, precio y «+»;
  - separadas por una línea discontinua;
  - desde 900 px, en dos columnas, como una carta impresa.
- **Precio 0** (panadería y café, que el impreso no trae): «Pregunta en tienda» y sin «+», como ahora.
- **«Boar's Head»:** etiqueta verde junto al nombre.
- **Cabecera de categoría:** foto ancha bajo el cartel. Rincón Dominicano lleva además el aviso «¡Pregunta por nuestros especiales del día!» (`DAILY_SPECIAL`, que hoy el menú no usa).
- **Texto alternativo:** las fotos de tarjeta y las cabeceras son decorativas (`alt=""`), porque el nombre del plato o de la categoría va justo al lado.

### 4.4 Buscador

- Campo `type="search"` con etiqueta accesible. Empieza a filtrar desde 2 letras.
- **Dónde busca:** en el nombre del plato, en su descripción (EN y ES) y en el nombre de la categoría (EN y ES).
- **Cómo compara:** sin distinguir mayúsculas ni tildes. «cafe» encuentra «Café»; «burger» encuentra toda la categoría.
- **Qué oculta:** los platos que no coinciden, y las categorías, momentos y chips que se quedan vacíos.
- **Aviso accesible:** anuncia «N platos» en una región viva, con retardo (no letra a letra).
- **Sin resultados:** «No lo encontramos.» y un enlace «Pregúntanos por WhatsApp» con el texto «¡Hola! ¿Tienen <lo buscado>?».
- **Vuelta a la carta entera:** al borrar el campo o pulsar Esc.
- **Idioma:** cambiar de idioma mantiene la búsqueda.

### 4.5 Navegación

- **Scroll-spy:** el chip activo sigue a la categoría que está en pantalla. Al tocar un chip, el spy se pausa hasta que acaba el desplazamiento. Así se arregla el parpadeo anotado en la revisión final de la portada.
- **Anclas:** `menu.html#<categoría>` y `menu.html#<plato>` llegan a su sitio, justo bajo la barra de chips, también viniendo de otra página. Como la carta se pinta con JS, se re-ancla después de pintarla, igual que en la portada.
- **Etiquetas `aria-label` de la página:** pasan por i18n. Hoy «Menu categories» y «Your order» salen siempre en inglés.

## 5. Fotos

### 5.1 Plato ↔ foto (aprobado)

Originales en `X:/Proyectos/_material/candela-cafe/fotos-2026-09-24/`. Varias ya están convertidas para la portada y se reutilizan tal cual.

| Plato (`id`) | Foto original | Archivo web |
|---|---|---|
| The Ruben (`ny-the-ruben-sandwich`) | `zip-18-sep/A-1.jpg` | `deli-ruben` (existe) |
| Chopped Cheese (`ny-chopped-cheese`) | `zip-18-sep/D-1.jpg` | `deli-chopped-cheese` (existe) |
| Phili Cheese Steak (`ny-phili-cheese-steak`) | `descargas-24-sep/01 (16).png` | `lugar-terraza` (existe) |
| Central Park Club (`ny-central-park-club-sandwiches`) | `descargas-24-sep/01 (11).png` | `menu-central-park-club` (nuevo) |
| Manhattan Hero (`ny-manhattan-hero`) | `descargas-24-sep/01 (13).png` | `lugar-neon-sub` (existe) |
| Prosciutto (`sg-prosciutto-sandwich`) | `descargas-24-sep/01 (15).png` | `lugar-interior` (existe) |
| California Turkey (`sg-california-turkey-sandwich`) | `descargas-24-sep/01 (12).png` | `menu-california-turkey` (nuevo) |
| Grilled Chicken Panini (`pn-grilled-chicken-panini`) | `zip-18-sep/C-1.jpg` | `deli-chicken-panini` (existe) |
| Candela Burger (`bg-candela-burger`) | `zip-18-sep/E-2.jpg` | `menu-candela-burger` (nuevo) |
| Chicken or Steak Quesadilla (`sw-chicken-steak-quesadilla`) | `zip-18-sep/F-1.jpg` | `menu-quesadilla` (nuevo) |
| Greek Salad (`sw-greek-salad`) | `descargas-24-sep/01 (10).png` | `menu-greek-salad` (nuevo) |
| Pancakes, French Toast o Waffles (`bk-pancakes-french-toast-wafles`) | `descargas-24-sep/01 (2).png` | `manana-fachada` (existe) |

| Cabecera de categoría | Foto original | Archivo web |
|---|---|---|
| Panadería (`bakery`) | `descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.08.jpeg` | `manana-pastelitos` (existe) |
| Barra de Café (`coffee`) | `descargas-24-sep/WhatsApp Image 2026-09-24 at 14.13.31.jpeg` | `noche-neon` (existe) |
| Sopas (`soups`) | `zip-18-sep/B-1.jpg` | `menu-sopa` (nuevo) |
| Rincón Dominicano (`dominican-spot`) | `descargas-24-sep/01 (7).png` | `mediodia-mesa-caliente` (existe) |

- **Se mantienen:** `breakfast-platter` (Downtown Platter), `caesar-salad` (Chicken Caesar Salad), `food-2` (Fritura Mixta 2 ps) y `food-3` (Italian Panini).
- **Se borran** `pastrami-*` y `hero-sandwich-*`: el Ruben y el Prosciutto cambian de foto y nada más las usa.

### 5.2 Conversión y carga

- `tools/convert-menu.mjs` convierte las 6 nuevas con sharp, igual que `convert-un-dia.mjs`: WebP de 480, 960 y 1440 (solo anchos ≤ al original), calidad 76.
- Las tarjetas llevan `srcset` de 480 y 960; las cabeceras, también la de 1440 si existe. Todas con `width` y `height`, para que la página no salte al cargar.
- Si el plato no está centrado en la foto, su encuadre (`object-position`) va en los datos. Por ejemplo, las tortitas se sostienen delante de la puerta del 507. Se revisa a 375 y a 1440 px.
- Carga diferida en todas las fotos salvo las de Desayunos, que se ven al entrar.

## 6. Datos (`web/js/menu-data.js`)

- **`PARTS` (nuevo):** los tres momentos, en orden, con su nombre en EN y ES, igual que las categorías: `[{ id: 'morning', label }, { id: 'coffee', label }, { id: 'midday', label }]`.
- **`CATEGORIES`:**
  - se reordena según §4.2;
  - cada categoría gana `part` (`'morning' | 'coffee' | 'midday'`);
  - la que tenga cabecera gana `cover: { img, focus? }`.
- **Platos:**
  - `img` apunta al archivo web de §5.1;
  - campo nuevo y opcional `focus`, el encuadre (p. ej. `'50% 70%'`);
  - precios, nombres, descripciones e `id` no se tocan.
- **Nada inventado:** ni platos, ni precios, ni fotos.

## 7. Código

- **`web/js/menu-render.js` (nuevo):** funciones puras, sin DOM:
  - agrupar las categorías por momento;
  - pintar la carta y los chips en HTML escapado;
  - `normalize()` (minúsculas y sin tildes) y `matches(plato, categoría, búsqueda)`.
- **`web/js/menu.js`:** pinta, chips y scroll-spy, buscador, anclas y alta al carrito.
- **`web/js/cart.js` y `web/js/cart-core.js`:** sin cambios de lógica. El mensaje de WhatsApp y la clave `candela-cart` de `localStorage` siguen iguales.
- **`web/css/menu.css`:** se rehace con la piel de papel, usando los tokens de `base.css`.
- **`web/js/i18n.js`:** claves nuevas en EN y ES, y soporte de `data-i18n-placeholder`.
- **`web/js/sections.js`:** el favorito enlaza a `menu.html#<id del plato>`.

## 8. Accesibilidad y contraste

- **Encabezados:** h1 «La carta.», h2 por momento y h3 por categoría.
- **Contraste sobre crema:**
  - precios en rojo `#C42A1F` (5,3:1);
  - texto verde pequeño con un verde más oscuro, `#3F7021` (5,5:1), porque `--verde-d` da 3,9:1;
  - rellenos rojos con texto blanco en `--rojo-txt` (4,7:1).
- **Botones «+»:** 40 px como mínimo.
- **Foco:** visible en chips, buscador y botones. La hoja del carrito conserva su trampa de foco y Esc.

## 9. Contenido pendiente del cliente

- Precios de panadería y café: el impreso no los trae.
- Fotos de los platos que aún no tienen: avocado toasts, omelettes, jugos y batidos, entre otros.

## 10. Fuera de alcance

- Carta de noche (vinos): falta el contenido del cliente.
- Cambiar precios o platos.
- Pago online.
- Datos estructurados de cada plato (`hasMenuSection`).

## 11. Pruebas

**Unitarias (`node --test tests/*.test.mjs`):**
- Cada plato sale una sola vez, y cada categoría en un solo momento, en el orden de §4.2.
- Las tarjetas son los platos con foto y van antes que las filas. La primera tarjeta es ancha si son impares.
- Precio 0 → «Pregunta en tienda» y sin «+». El «+» lleva el nombre del plato en su etiqueta.
- Las parejas de §5.1 quedan fijadas en un test, como el de los favoritos.
- Cada `img` y cada `cover` tiene sus archivos -480 y -960 en `web/assets/img`.
- Buscador: tildes y mayúsculas, EN y ES, por categoría, sin resultados.
- Ningún `id` de plato coincide con uno de categoría, para que las anclas no choquen.
- Las claves de i18n nuevas existen en EN y en ES (test que ya existe).

**En el navegador (Playwright contra `:8124`, con la caché desactivada):**
- Sin scroll horizontal a 320, 375, 768 y 1440 px.
- Chips: el activo sigue al scroll y no parpadea al tocar uno.
- Buscar «cafe», «burger» y «xyz»; limpiar con Esc; cambiar de idioma con una búsqueda puesta.
- De un favorito de la portada al plato, bajo los chips. `menu.html#breakfast` igual.
- Carrito:
  - añadir y cambiar cantidades;
  - sincronía entre pestañas;
  - enlace de WhatsApp.

**Lighthouse en móvil, contra la preview de Netlify:** ≥ 90 en rendimiento y ≥ 95 en accesibilidad.

## 12. Despliegue

Preview de Netlify (sin `--prod`) para que Robert lo vea. A producción solo con su OK, y saldría junto con la portada nueva.

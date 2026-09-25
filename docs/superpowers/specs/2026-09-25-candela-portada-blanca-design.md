# Candela & Café — portada en blanco, al estilo del menú

- **Fecha:** 2026-09-25
- **Estado:** diseño aprobado por Robert en el visual companion; pendiente de revisar este documento
- **Rama:** `feature/portada-blanca`, que sale de `master` (la web en vivo desde el 24-sep)
- **Bocetos aprobados:** `.superpowers/brainstorm/1067-1790354076/content/`: `mezcla-a-b.html` (estructura), `arriba-barra-portada.html` (barra y portada) y `resto-portada.html` (el resto). Son locales: `.superpowers/` no se versiona.
- **Sustituye a** la portada de `2026-09-24-candela-un-dia-design.md`. El menú de `2026-09-24-candela-menu-design.md` se queda; solo cambian su barra y su pie, que son compartidos.

## 1. Objetivo

La portada en vivo («Un día en Candela») no convence a Robert: demasiados efectos, el fondo pintado por horas y secciones oscuras. El menú «Carta de papel» sí le gusta. La portada se rehace con el estilo del menú.

El objetivo del local no cambia: **que la gente vaya al local.**

**Cómo sabremos que funciona:**
- La portada y el menú se ven como la misma web: mismo papel, mismos carteles, mismas tarjetas.
- En el móvil, en la primera pantalla, se ve si está abierto, hasta qué hora y el botón «Cómo llegar».
- No hay secciones oscuras, degradados de fondo ni animaciones.
- La portada mide como mucho 5.000 px de alto a 1440 px de ancho. La de ahora mide 8.900.
- No hay scroll horizontal a 320 px.
- Lighthouse en móvil da ≥ 90 en rendimiento y ≥ 95 en accesibilidad.

## 2. Decisiones de Robert (25-sep)

| Tema | Decisión |
|---|---|
| Estilo | El del menú, **hero incluido**: papel, carteles en Anton, precios a mano y fotos limpias. Sin degradados ni neones. Revoca la decisión del 24-sep de no tocar el hero. |
| Recorrido del día | **Fuera.** No hay secciones por horas. |
| Fondo | **Toda la página en blanco**: el papel del menú (`#FBF7F0`). Ninguna sección oscura. |
| Estructura | **Mezcla de los bocetos B y A**: la base corta de la B, más la comida dominicana y «El local» de la A. |
| Barra | **Clara y la misma en la portada y en el menú.** «Cómo llegar» ocupa el sitio de «Order Now». |
| Foto de arriba | **La puerta del 507 con el desayuno** (`manana-fachada`). |
| Horario | El aviso cambia solo: abierto, cierra pronto o cerrado. |
| Movimiento | **Nada se mueve arriba.** |
| Móvil | Barra fija abajo con «Cómo llegar · Llamar · Carta», que aparece cuando los botones de arriba salen de la pantalla. Menú con las cuatro secciones en letra de cartel, el horario de hoy y los botones de llegar, llamar y WhatsApp. |
| Market | **Cartel con la lista de categorías, sin foto**, hasta tener fotos de su tienda. |
| Resto de secciones | Aprobadas como en el boceto: favoritos, comida dominicana, café y market, los viernes, el local, visítanos y pie. |
| Menú | Se queda como está («el menú sí está bien»): sin las 3 fotos viejas y con el plato destacado a 2 columnas. |

## 3. Decisiones mías que Robert tiene que revisar

1. **Sin animaciones en toda la portada, no solo arriba.** Se quitan GSAP, ScrollTrigger y las entradas al hacer scroll. Solo quedan los cambios de color al pasar el ratón por botones y tarjetas. La página pesa menos y carga antes.
2. **En español, «Menú» pasa a llamarse «Carta»** en la barra, el pie y la barra del móvil, como el título de la página del menú. En inglés sigue «Menu».
3. **Se van las cartas en arcos «Coffee now / Wine later».** Su contenido está sin confirmar por el cliente y repetía lo de los viernes.
4. **Se borran de `web/assets/img` las imágenes que ya no usa nadie:** el hero de fuego (`hero-*`), las fotos provisionales del market (`mk-*`) y las viejas de la galería y la carta (`gal-*`, `food-*`, `breakfast-platter`, `catering`, `miami-skyline`, `lugar-flan`, `manana-tres-golpes`). Los originales siguen en `_material\candela-cafe\`.
5. **Las anclas no cambian** (`#market`, `#noche` y `#visit`), para no romper los enlaces del menú ni los que haya fuera.
6. **El modal de reserva se queda** con el mismo funcionamiento, pero en papel.
7. **El aviso del especial usa el texto que ya tiene la carta** (`DAILY_SPECIAL`): «¡Pregunta por nuestros especiales del día!». En el boceto ponía «¡Pregunta por el especial del día!».

## 4. La página (`web/index.html`), de arriba abajo

El ancho máximo del contenido es 1180 px. Las secciones van separadas por 92 px en escritorio y 56 px en móvil. El móvil es todo a una columna.

### 4.1 Barra (compartida con `menu.html`)

- **Aspecto:** papel, raya fina abajo y fija arriba al hacer scroll. Mide 80 px de alto en escritorio y 64 px en móvil.
- **Izquierda:** el logo (46 px) y «Candela & Café» en Architects Daughter. Enlaza a la portada.
- **Derecha:**
  - enlaces Carta (`menu.html`) · Market (`#market`) · Noches (`#noche`) · Visítanos (`#visit`), en mayúsculas con tracking, con una raya roja al pasar el ratón;
  - selector de idioma «EN / ES», con el idioma actual en negrita;
  - botón rojo «Cómo llegar», que abre la ruta en Google Maps.
- **Hasta 1024 px:** los enlaces y el botón se esconden. Se ven el selector de idioma y la hamburguesa.
- **Menú de la hamburguesa:**
  - pantalla completa en papel, con el logo y un ✕ arriba;
  - las cuatro secciones en Anton grande, con una flecha roja y separadas por rayas finas;
  - abajo, el estado de hoy, «Cómo llegar» (rojo, a todo el ancho), «Llamar» y «WhatsApp» (contorno, a medias) y el selector de idioma;
  - se cierra con ✕, con Esc o al tocar un enlace, y el foco queda atrapado dentro mientras está abierto.

### 4.2 Portada (`#hero`)

- **Escritorio:** dos columnas (texto y foto).
- **Texto:**
  - `h1` «Candela & Café» en Architects Daughter, 104 px (58 en móvil), repartido en dos líneas equilibradas;
  - fila de carteles: NY Deli · Comida dominicana (en rojo) · Café y jugos · Market;
  - la frase de marca en rojo a mano: «Born in NY, raised Dominican, served in Miami.» (igual en los dos idiomas);
  - el estado: punto verde, «Abierto ahora · hasta las 11:30 pm · 507 N Miami Ave». Los estados salen de `renderStatus` (§7);
  - botones «Cómo llegar» (rojo) y «Ver la carta» (contorno).
- **Foto:** `manana-fachada` en 4:5 y encuadrada arriba, para que se vea el «507». En móvil va debajo del texto, en 4:3.
- Nada se mueve.

### 4.3 Los favoritos

- Antetítulo «Del deli de Nueva York», título «Los favoritos» y botón «Ver la carta →», a la derecha. En móvil, el botón va debajo de las tarjetas: «Ver la carta completa».
- **Cuatro tarjetas iguales a las del menú**, rectas, sin giro:
  - foto 4:3;
  - nombre en Anton;
  - descripción de dos líneas como mucho;
  - precio a mano en rojo.
- Cada tarjeta entera enlaza a su plato (`menu.html#<id>`).
- Salen de `FAVORITES` y `MENU`, como ahora: The Ruben, Candela Burger, Chopped Cheese y Grilled Chicken Panini.
- Van a 4 columnas en escritorio y a 2 en móvil.

### 4.4 Comida dominicana

- Antetítulo «Hecha cada día» y título «Comida dominicana».
- Foto del sancocho (16:10) y, al lado:
  - «La mesa caliente: comida dominicana hecha hoy, como en casa.»;
  - si `DAILY_MENU` tiene platos para hoy, «Hoy en la mesa caliente:» y la lista. Si no, el aviso `DAILY_SPECIAL` escrito a mano en rojo. **Nunca platos inventados.**
  - botón «Pedir por WhatsApp» (contorno).

### 4.5 Café y market (`#market`)

- Antetítulo «Todo el día» y título «Café y market». Van dos tarjetas grandes, iguales de alto.
- **Café y desayunos:**
  - foto `manana-jugo` (16:10);
  - «Desde las 8 am: café, jugos naturales, desayunos y panadería.»;
  - botón «Ver desayunos» (`menu.html#breakfast`).
- **El market (cartel, sin foto):**
  - antetítulo «Básicos y productos naturales» y título «El market»;
  - las 6 categorías de `MARKET_CATEGORIES` en filas, con el nombre en Anton a la izquierda y los ejemplos a la derecha, separadas por una raya discontinua como las filas del menú;
  - nota a mano: «¿Lo tienes? Pregúntanos antes de venir.»;
  - botón «Preguntar por WhatsApp», con el mensaje actual «¿Tienen … en el market?».

### 4.6 Los viernes (`#noche`)

- Una tarjeta blanca con la foto del neón (4:3) a un lado y, al otro:
  - antetítulo «Los viernes» y título «Vino y música en vivo»;
  - «Vino, café hasta el cierre y música en vivo desde las 8 pm.»;
  - botón rojo «Reservar mesa», que abre el modal (§4.11).

### 4.7 El local

- Antetítulo «El local» y título «Ven a verlo».
- Tres fotos en 4:5: `lugar-interior`, `local-interior` y `lugar-terraza`. En móvil, la primera va ancha (4:3) y las otras dos cuadradas, debajo.
- **Línea de Google**, sin sello: «★ 4.6 en Google · 142 reseñas · Leer reseñas · Escribir una». Los datos salen de `GOOGLE` y se actualizan a mano.

### 4.8 Visítanos (`#visit`)

- **A la izquierda:**
  - antetítulo «Visítanos»;
  - «507» en Anton negro, 210 px (150 en móvil);
  - «N Miami Ave» y «Downtown Miami, FL 33136»;
  - botones «Cómo llegar» (rojo), «Llamar» y «WhatsApp».
- **A la derecha:**
  - la tabla de horario de lunes a domingo, con hoy marcado en arena y «música en vivo» el viernes (`renderHours`, como ahora);
  - debajo, el mapa de Google embebido y en carga diferida.

### 4.9 Pie (compartido con `menu.html`)

- **Aspecto:** papel, con una raya fina arriba.
- **Columnas:**
  - logo con «Candela & Café» y la frase de marca a mano;
  - «Explora»: Carta · Market · Noches · Visítanos;
  - «Pedidos y redes»: WhatsApp · Uber Eats · DoorDash · @candelaycafe · el teléfono.
- **Línea final:** «© 2026 Candela & Café Market» y «507 N Miami Ave, Miami, FL 33136».

### 4.10 Barra fija del móvil (≤ 768 px, solo en la portada)

- Papel con raya fina arriba. Lleva «Cómo llegar» (rojo), «Llamar» y «Carta».
- Aparece cuando los botones de la portada salen de la pantalla. Se vuelve a ocultar mientras Visítanos está en pantalla.
- Mientras está oculta no se puede enfocar con el teclado.

### 4.11 Modal de reserva

- Mismos campos y el mismo mensaje de WhatsApp que ahora (`buildReservationUrl`).
- Pasa a papel: tarjeta clara y título a mano «Reserva tu viernes».
- El botón es el verde de WhatsApp del carrito.
- Conserva la trampa de foco, Esc y la vuelta del foco al botón que lo abrió.

## 5. Sistema visual

El del menú, con los tokens de `base.css`:

| Uso | Color | Contraste sobre papel |
|---|---|---|
| Fondo | papel `#FBF7F0` (`--claro`) | — |
| Texto | tinta `#1c1c1c`; secundario `#5b534a` | 16:1 / 7:1 |
| Botón principal, cartel rojo | `#D8352A` (`--rojo-txt`) con texto blanco | 4,7:1 |
| Precios y notas a mano | `#C42A1F` | 5,3:1 |
| Antetítulos y «Abierto ahora» | `#3F7021` | 5,5:1 |
| Fila de hoy | arena `#F1DFC6` | — |

- **Tipografías:**
  - Architects Daughter solo para el `h1`, la frase de marca, las notas a mano y los precios;
  - Anton para los títulos de sección, los carteles, los nombres de las tarjetas y el «507»;
  - DM Sans para el texto, los botones y la barra.
- **Componentes:**
  - cartel: bloque negro o rojo con texto Anton;
  - antetítulo: verde, con una raya hasta el final de la línea;
  - tarjeta del menú, tarjeta grande y cartel del market;
  - botones: pastilla roja rellena o pastilla con contorno negro.
- **Prohibido en esta página:** degradados de fondo, neones, sellos de estrella, tramas de puntos sobre las fotos, fotos giradas y sombras de color.

## 6. Fotos

Todas existen ya en `web/assets/img` y no hace falta convertir ninguna.

| Uso | Archivo | Variantes |
|---|---|---|
| Portada | `manana-fachada` | 480 · 960 |
| Favoritos | `deli-ruben`, `deli-candela-burger`, `deli-chopped-cheese`, `deli-chicken-panini` | 480 · 960 |
| Comida dominicana | `mediodia-sancocho` | 480 · 960 |
| Café y desayunos | `manana-jugo` | 480 · 960 |
| Los viernes | `noche-neon` | 480 · 960 |
| El local | `lugar-interior`, `local-interior`, `lugar-terraza` | 480 · 960 (y 1440 en `local-interior`) |

- Todas llevan `width`/`height`, `srcset` y `sizes`, para que la página no salte al cargar.
- **La foto de la portada** lleva `fetchpriority="high"` y se precarga con `imagesrcset`. Sustituye a la precarga de `hero-grill`.
- El resto se carga en diferido.
- **Texto alternativo:**
  - la foto de la portada lo lleva descriptivo: «Plato de desayuno en la puerta del 507 N Miami Ave»;
  - las de las tarjetas son decorativas (`alt=""`), porque el nombre va al lado;
  - las de «El local» describen lo que se ve.

## 7. Datos y lógica

- **`site-data.js`:**
  - se quedan `ADDRESS`, `MAPS_DIRECTIONS`, `MAPS_LISTING`, `HOURS`, `GOOGLE`, `FAVORITES` y `DAILY_MENU`;
  - se van `DAYPARTS` y `DAY_NIGHT`, porque eran del recorrido del día.
- **`status.js`:** `statusAt(date, hours, tz)` pierde las franjas y el campo `part`. Lo demás no cambia.
- **`market-data.js`:** `MARKET_CATEGORIES` se queda con `id`, `name` y `examples` en EN y ES. Pierde `img` y `h`. La lista sigue a confirmar con el cliente.
- **`menu-data.js`:** sin cambios.
- **`sections.js`:** funciones puras que devuelven HTML escapado.
  - Se quedan `esc`, `findItem`, `renderHours` y `renderStatus`.
  - `renderFavorites` pinta la tarjeta del menú.
  - `renderBoard` pinta la lista del día o el aviso `DAILY_SPECIAL`.
  - **Nueva:** `renderMarketList(cats, lang)` pinta las filas del cartel del market.
  - Se borran `renderMarket`, `renderArches` y `burstSvg`.

## 8. Código

- **`web/index.html`:** se reescribe el cuerpo; se quedan el `<head>`, el SEO y el JSON-LD.
  - Se quitan GSAP y ScrollTrigger.
  - Se quitan la precarga de `hero-grill` y la de `sections.css`.
- **CSS:**
  - `home.css`, nueva, sustituye a `landing.css` y `sections.css`, que se borran;
  - `base.css`:
    - el `body` pasa a papel con texto tinta en las dos páginas;
    - la barra y el pie pasan a papel;
    - se borran las reglas que ya no usa ninguna página, como `.fire`, `.frame`, `.seal` y `.light`;
  - `menu.css`: se quita la barra negra (`.page-menu .nav{background:…}`). Los chips siguen bajo la barra con `--nav-h`.
- **JS:**
  - **`landing.js`** se simplifica. Se queda con:
    - los textos por idioma;
    - las secciones de §7;
    - el estado, en la portada y en el menú de la hamburguesa, recalculado cada minuto con la pestaña visible;
    - la barra del móvil;
    - las anclas al llegar desde otra página;
    - el modal de reserva.
  - `hero.js` se borra.
  - `nav.js` añade el menú de la hamburguesa en papel (§4.1), con `trapFocus` de `focus-trap.js`, y el selector «EN / ES».
  - `i18n.js`:
    - claves nuevas para los textos de §4;
    - «Carta» en `nav.menu` (ES);
    - se borran las claves que ya no usa ninguna página.
- **`web/menu.html`:** barra y pie nuevos, iguales a los de la portada.

## 9. Accesibilidad

- **Encabezados:**
  - un `h1` («Candela & Café»);
  - un `h2` por sección: Los favoritos, Comida dominicana, Café y market, Vino y música en vivo, Ven a verlo y el «507» de Visítanos, con `aria-label` «507 N Miami Ave»;
  - `h3` en las tarjetas.
- **Estado:** el de la portada es una región viva (`role="status"`) que solo se reescribe si cambia. El del menú de la hamburguesa es texto normal, para no anunciarlo dos veces.
- **Hamburguesa:** `aria-expanded` y `aria-controls`, trampa de foco, Esc, y el foco vuelve a la hamburguesa al cerrar.
- **Tamaño y foco:** los botones y enlaces táctiles miden al menos 44 px. El foco se ve en todo lo que se puede tocar.
- **Selector de idioma:** `aria-label` «Ver en español» / «View in English».

## 10. Contenido pendiente del cliente

No bloquea publicar; lo que falta se queda fuera de la página.
- Fotos de las estanterías del market. Al tenerlas, el cartel del market pasa a llevar foto.
- Qué platos pone la mesa caliente cada día (`DAILY_MENU`).
- La carta de vinos y cervezas, a qué hora empieza la noche y si la música es con entrada libre.
- Precios de panadería y café, que son de la carta.

## 11. Fuera de alcance

- Cambiar la carta (`menu.html`), salvo la barra, el pie y el fondo.
- Enlazar Netlify con GitHub: lo hace Robert en el panel.
- Analítica, reseñas con la API de Google y reservas online reales.

## 12. Pruebas

**Unitarias (`node --test tests/*.test.mjs`):**
- `renderFavorites`: 4 tarjetas con nombre, precio a mano y enlace a su plato; las fotos son las fijadas en `site-consistency`.
- `renderMarketList`: 6 filas con nombre y ejemplos en EN y ES, sin precios y con el texto escapado.
- `renderBoard`, `renderHours` y `renderStatus` siguen con sus pruebas.
- `statusAt` sin franjas: se adaptan las pruebas de `status.test.mjs`.
- **Coherencia (`site-consistency.test.mjs`):**
  - toda imagen que usan `index.html`, `menu.html` y los datos existe en `web/assets/img`;
  - la portada no carga GSAP ni ninguna imagen `hero-*` o `mk-*`;
  - siguen las pruebas del JSON-LD, la nota de Google, las claves de i18n y las fotos de los favoritos.
- Se borran las pruebas de las funciones que se van.

**En el navegador (Playwright, con la caché desactivada), a 320, 375, 768, 1280 y 1440 px:**
- sin scroll horizontal, consola limpia y ningún 404;
- a 375 × 812, en la primera pantalla se ven el `h1`, el estado y «Cómo llegar»;
- barra del móvil: oculta con los botones de la portada a la vista, visible al bajar y oculta en Visítanos;
- hamburguesa: abre, atrapa el foco, se cierra con Esc y con ✕, y sus enlaces llevan a su sección;
- EN ↔ ES cambia todos los textos;
- estado con el reloj simulado: abierto, cierra pronto y cerrado;
- `menu.html` con la barra nueva: los chips quedan bajo la barra sin taparse, a 320 px y a 1440 px, arriba y con scroll;
- la portada mide ≤ 5.000 px de alto a 1440 px.

**Lighthouse en móvil, contra la preview de Netlify:** ≥ 90 en rendimiento, ≥ 95 en accesibilidad y CLS < 0,05.

## 13. Despliegue

1. Se trabaja en `feature/portada-blanca` y se hace push de cada commit.
2. Preview en Netlify sin `--prod` (`netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5`) para que Robert la vea.
3. **A producción, solo con su OK:**
   - si el sitio ya está enlazado a GitHub, al unir la rama con `master` se publica sola;
   - si no, se publica a mano con `--prod`.
4. La unión con `master` se hace por PR y con su OK.

# Candela & Café — «Un día en Candela» (rediseño de la portada)

- **Fecha:** 2026-09-24
- **Estado:** diseño aprobado en el visual companion; pendiente de revisar este documento
- **Rama:** `feature/un-dia-en-candela`, que sale de `rediseno-web` (lo que está en vivo, más el parche del 24-sep)
- **Bocetos aprobados:** `.superpowers/brainstorm/10460-1790290261/content/`: `estructura-un-dia.html`, `moodboard-referencias.html`, `diseno-dia.html` y `diseno-tarde-noche.html`. Son locales: `.superpowers/` no se versiona.
- **Revisión de código a la que remiten los #n de §8:** `docs/superpowers/reviews/2026-09-24-revision-codigo.md`

## 1. Objetivo

**Objetivo número 1 de la web: que la gente vaya al local.** Lo decidió Robert el 24-sep.

Los pedidos por WhatsApp y el market quedan como objetivos secundarios. La portada tiene que vender el sitio y el momento del día: por qué ir y cuándo.

Candela & Café Market (507 N Miami Ave, Downtown Miami) tiene varios conceptos:
- deli neoyorquino;
- comida dominicana hecha cada día en la mesa caliente;
- café y jugos;
- mini-market de básicos y productos naturales, con clientela fija de los apartamentos de arriba;
- vino por la noche (su neón dice «Coffee now, Wine later»);
- música en vivo los viernes.

**Cómo sabremos que funciona:**
- Desde el móvil, en menos de 5 segundos, se ve si está abierto, a qué hora cierra y cómo llegar.
- Cada franja del día tiene su razón para ir, con fotos reales.
- No hay ningún salto brusco de negro a blanco al hacer scroll.
- Lighthouse en móvil da ≥ 90 en rendimiento y ≥ 95 en accesibilidad.

## 2. Decisiones de Robert (brainstorming del 24-sep)

| Tema | Decisión |
|---|---|
| Estructura | **«Un día en Candela»**: mañana → mediodía → tarde → noche → el lugar → visítanos |
| Hero | **No se toca el diseño.** Solo se arreglan fallos de código (§8) |
| Vino | **Vuelve** como plan de noche («Wine later»), sin catálogo de botellas |
| Market | **Vitrina**: categorías con foto y «¿Lo tienes? Pregunta por WhatsApp». Sin carrito ni precios |
| Transiciones | **Rampa de día**: tras el hero *amanece*, y cada sección es algo más oscura que la anterior hasta la noche. Nunca van dos tonos muy distintos seguidos |
| Se elimina | La línea de tiempo de «Historia», la carta completa dentro de la portada (queda en `menu.html`), el carrusel Swiper de música y las reseñas de ejemplo |
| Inspiración | Solo webs de restaurantes y markets. Referencias elegidas: Sunbeam Bagels, Frank's Burger, Regina's Grocery, Court Street Grocers, Maverick's, The Pearl, Grand Central Market, Gourou y Dante |

## 3. Estructura de la portada (`web/index.html`)

El orden es fijo. Las anclas nuevas van entre paréntesis.

1. **Nav.** Es la actual, con los enlaces nuevos: Menú (`menu.html`) · Market (`#market`) · Noches (`#noche`) · Visítanos (`#visit`), el selector EN/ES y «Order Now».
   - Con ≤ 1024 px pasa a menú hamburguesa (arregla el hallazgo #24).
2. **Hero.** Sin cambios de diseño.
3. **«Ahora en Candela».** Franja negra, idea de Sunbeam («Come on in»).
   - Punto verde, estado y horario de hoy: «Abierto ahora · hoy de 8 am a 11:30 pm · 507 N Miami Ave».
   - Botón «Cómo llegar →».
   - Los estados salen de §6.2: abierto, cierra pronto (menos de 60 min) o cerrado («Abrimos a las 8 am»).
4. **Amanece.** Degradado de 230 px de `#0d0d0d` a crema, con un resplandor cálido. Es solo decorativo.
5. **Mañana (`#manana`).** Fondo crema `#FBF7F0`.
   - Cartel «8:00 am · Coffee now».
   - Titular apilado «Café. / Jugos. / Desayuno.», con la última palabra en degradado de fuego (idea de Sunbeam).
   - Texto, etiquetas-cartel (Los tres golpes · Mangú · Pancakes · Pastelitos · Jugo de china) y CTAs «Ver desayunos» (`menu.html#breakfast`) y «Cómo llegar».
   - Composición:
     - foto de la puerta del 507 con marco negro de 10 px, girada 2° y con semitono (idea de Gourou);
     - tres stickers circulares con borde blanco: tres golpes, jugo y pastelitos (idea de Frank's);
     - sello de estrella «Abrimos 8 am».
6. **Mediodía (`#mediodia`).** Fondo de crema a arena `#F1DFC6`.
   - **Panel rojo** (idea de Regina's):
     - cartel «12:00 pm · Mediodía» y titular a mano «La comida del día.»;
     - foto del sancocho en un marco de arco con borde negro y sello «Hecho hoy»;
     - CTAs «Qué hay hoy» (baja a la pizarra) y «Pedir por WhatsApp».
   - **Mesa caliente**, dos piezas en fila:
     - la foto de las bandejas;
     - una pizarra negra «Hoy en la mesa caliente» (idea de Court Street), que se rellena con §6.3. Mientras no haya datos muestra «¡Pregunta por el especial del día!» (el `DAILY_SPECIAL` actual). **Nunca muestra platos inventados.**
   - **Los favoritos del deli.** Cuatro tarjetas-sticker ligeramente giradas, con foto de estudio, nombre en cartel, descripción y precio a mano.
     - Los datos salen de `MENU` por id: The Ruben, Candela Burger, Phili Cheese Steak y Grilled Chicken Panini.
     - Cada tarjeta enlaza a su categoría en `menu.html`. Con eso desaparecen los falsos «Add +» (#8).
     - Botón «Ver el menú completo →».
7. **Tarde, el market (`#market`).** Fondo de arena a terracota `#9a4a2c`.
   - **Toldo de bodega en SVG**: rojo, borde festoneado y texto «CANDELA & CAFÉ · MARKET · GROCERY · DELI · COFFEE» (idea de Court Street).
   - Cartel «3:00 pm · Tarde», titular «El market.» y texto.
   - Seis baldas: foto más cartel negro con nombre y ejemplos. Las categorías salen de §6.4.
   - CTA «¿Lo tienes? Pregunta por WhatsApp», que abre `wa.me` con el mensaje «Hola, ¿tienen …?».
8. **Anochece.** Degradado de terracota a negro y una línea de neón verde que se enciende.
9. **Noche (`#noche`).** Negro `#0a0a0a`.
   - **Banner** con la foto del interior y el neón (idea de Maverick's):
     - velo oscuro a la izquierda;
     - cartel «7:00 pm · Noche», titular en neón verde «Wine later.» y texto;
     - CTAs «Reservar mesa» (el modal actual a WhatsApp) y «Ver la carta de noche» (baja a los arcos);
     - sello redondo en SVG con texto circular «Todos los viernes · música en vivo · 8 pm».
   - **Dos cartas en arcos de neón** (ideas de Dante y The Pearl): «Coffee now» en rojo y «Wine later» en verde. Cada una lleva su franja horaria y una lista corta. El contenido sale de §6.5.
   - **Música en vivo:** cartel «Todos los viernes», titular en neón, pastillas (Viernes · Desde las 8 pm) y «Reservar mesa», más la foto de música en vivo (§7).
10. **El lugar (`#lugar`).** Negro.
    - Titular «Ven a verlo.».
    - Mosaico de 5 fotos (1 grande y 4 pequeñas), algunas con semitono; el neón real del local fotografiado es la idea de Grand Central.
    - **Nota de Google** en un sello de estrella: «4.6 · 136 reseñas en Google».
    - Enlaces «Leer las reseñas» y «Escribe la tuya».
    - **Solo datos reales, sin reseñas de ejemplo.**
11. **Visítanos (`#visit`).** Negro.
    - «507» gigante en Anton, solo contorno rojo (el número de la puerta).
    - «N Miami Ave · Downtown Miami, FL 33136».
    - Botones Cómo llegar (Google Maps con ruta), Llamar (`tel:`) y WhatsApp.
    - Tabla de horarios por día con **hoy marcado**.
    - El mapa embebido actual (`iframe` lazy).
12. **Footer.** «Born in NY, raised Dominican, served in Miami», enlaces, Instagram y EN/ES.
13. **Barra fija en móvil** (≤ 768 px): «Cómo llegar · Llamar · Menú».
    - Oscura, con «Cómo llegar» en rojo.
    - Se oculta mientras `#visit` está en pantalla, para no duplicar botones.
    - El FAB del carrito **sale de la portada**, porque en la portada ya no se añade nada. Se queda en `menu.html`.

**Móvil:** todo pasa a una columna.
- Las baldas del market pasan a una rejilla de 2 columnas (3 filas). Es más simple que el carrusel del boceto.
- Los arcos se apilan.
- Los stickers se reducen y no tapan el texto.
- No puede haber scroll horizontal en ningún ancho.

## 4. Sistema visual

- **Colores de marca:** negro `#0d0d0d`, rojo `#ED3B2F`, verde `#76C043` y verde oscuro `#4f8a2a`.
  - Degradado de fuego: `linear-gradient(95deg,#ff5a3c,#ED3B2F 55%,#C92A1F)`.
  - **Nada de amarillo ni ámbar.**
- **Rampa de fondos:** negro → degradado de amanecer → crema `#FBF7F0` → arena `#F1DFC6` / `#EBCDAA` → terracota `#d49a6c` → `#9a4a2c` → degradado de anochecer → `#0a0a0a`.
  - Los cambios son siempre degradados, nunca cortes.
  - Es una excepción deliberada a la regla de junio de «alternar claro y oscuro».
- **Tipografías:**
  - Architects Daughter para titulares y precios (fuente de marca).
  - DM Sans para el texto (≥ 16 px).
  - **Nueva: Anton**, un solo peso, **solo** para carteles, etiquetas, sellos y el «507». Siempre en mayúsculas y con tracking.
- **Componentes nuevos:**
  - `.sign`: cartel negro o rojo con texto Anton.
  - `.sticker`: círculo con foto, borde blanco de 9 px, sombra y giro.
  - `.burst`: sello de estrella en SVG generado.
  - `.stamp`: sello circular con `textPath`.
  - `.ht`: semitono con puntos en `::after`, `mix-blend-mode: multiply`, a pointer-events none.
  - `.arch-neon`: arco con borde de neón en `box-shadow`.
  - `.awning`: el toldo en SVG.
  - `.board`: la pizarra.
- **Motion (sutil):**
  - aparición al hacer scroll con el patrón `.reveal` actual (guard `.js`);
  - los stickers se mueven un poco al pasar el ratón (solo con puntero fino);
  - el neón parpadea una sola vez al entrar en pantalla;
  - el punto de «abierto» late.
  - **Todo se desactiva con `prefers-reduced-motion`.**
  - Solo se animan `transform` y `opacity`.

## 5. Fotos

Los originales están en `X:\Proyectos\_material\candela-cafe\fotos-2026-09-24\`. Se convierten con `tools/convert-images.mjs` (sharp) a WebP 480/960/1440 en `web/assets/img/`, con `width`/`height`, `srcset`/`sizes` y `loading="lazy"` en todo lo que está por debajo del hero.

| Uso | Archivo nuevo | Original |
|---|---|---|
| Mañana, foto principal / El lugar | `manana-fachada` | `descargas-24-sep/01 (2).png` |
| Sticker tres golpes | `manana-tres-golpes` | `01 (9).png` |
| Sticker jugo | `manana-jugo` | `01 (17).png` |
| Sticker pastelitos | `manana-pastelitos` | `WhatsApp Image … 14.13.08.jpeg` |
| Arco del panel rojo | `mediodia-sancocho` | `01 (14).png` |
| Mesa caliente | `mediodia-mesa-caliente` | `01 (7).png` |
| Favoritos: The Ruben / Candela Burger / Phili Cheese Steak / Chicken Panini | `deli-ruben` / `deli-candela-burger` / `deli-cheese-steak` / `deli-chicken-panini` | `zip-18-sep/A-1` / `E-1` / `D-1` / `C-1` |
| Banner de noche | `noche-neon` | `WhatsApp Image … 14.13.31.jpeg` |
| Mosaico del lugar | `lugar-neon-sub`, `lugar-terraza`, `lugar-interior`, `lugar-flan` | `01 (13)`, `01 (16)`, `01 (15)`, `01 (18)` |

- Las fotos que sobran (ensalada, club, turkey, salmón, ceviche, quesadilla, sopa + sub y el resto del zip) quedan para la página de menú, en otra fase.
- Las fotos del market siguen siendo las `mk-*` actuales, **marcadas como provisionales**.
- La cabecera `Cache-Control` de `/assets/img/*` deja de ser `immutable` y pasa a `public, max-age=604800` (#15).

## 6. Datos y lógica

### 6.1 `web/js/site-data.js` (nuevo, única fuente)

Contiene:
- `ADDRESS`, `PHONE` (+1 786 254-7577) y `WA`;
- `HOURS` por día de la semana: dom–mar 08:00–22:00, mié–sáb 08:00–23:30;
- `DAYPARTS`: mañana 08:00, mediodía 12:00, tarde 15:00, noche 19:00;
- `GOOGLE`: nota 4.6, reseñas 136, fecha del dato 2026-09-24, URL del perfil y URL para escribir reseña (la de búsqueda de Maps hasta tener el Place ID).

### 6.2 `status(now)`

Es una función pura con zona `America/New_York` que devuelve:
- `{ open, closesAt, opensAt, soon, part }`;
- `soon` cuando falta menos de 60 min para cerrar;
- `part` según `DAYPARTS`.

La franja «Ahora en Candela», la tabla de Visítanos (hoy marcado) y la barra móvil la usan. Se recalcula cada minuto mientras la pestaña está visible.

### 6.3 Mesa caliente

`DAILY_MENU` va por día de la semana y es opcional; **el cliente tiene que pasarlo**. Si falta, se muestra el especial del día actual y ningún plato inventado.

### 6.4 `web/js/market-data.js` (se reescribe)

- Pasa a ser `CATEGORIES` con 6 entradas: `{ id, name:{en,es}, examples:{en,es}, img }`, **sin precios ni carrito**.
- Categorías: Despensa, Básicos, Desayuno, Frutas y verduras, Naturales y Café.
- La lista final es a confirmar con el cliente.

### 6.5 Cartas de día y de noche

`DAY_NIGHT` en `site-data.js`: Coffee now de 08:00 a 19:00 y Wine later de 19:00 al cierre.
- **Día:** café cubano y cortadito, café con leche, jugos naturales.
- **Noche:** vino tinto, blanco y rosado por copa o botella, cervezas frías, café hasta el cierre.
- **Las líneas y las horas se confirman con el cliente antes de publicar.**

### 6.6 WhatsApp

- `buildMarketAskUrl(lang, category)` es nueva.
- `buildReservationUrl` pasa a tener una plantilla por idioma, con plural (#11).

Las dos van en `cart-core.js`, que ya tiene tests.

### 6.7 i18n

- Todos los textos nuevos van en `DICT` (en/es).
- Se corrigen las claves que faltan (`menu.cta`, `visit.dir`, el h2 de música, los aria-labels) (#12).
- «Coffee now, Wine later» se deja en inglés, porque es la frase de marca.

## 7. Contenido pendiente del cliente

Este contenido no bloquea construir: se usa lo provisional marcado. Sí bloquea publicar donde se indica.

1. **Fotos reales del market (6 categorías).** Hasta tenerlas se usan las provisionales.
2. **Foto de la música en vivo.** Hasta tenerla, el bloque va sin foto, con un fondo de neón.
3. **Carta de noche** (vinos y cervezas) y **a qué hora empieza «Wine later»**. Bloquea publicar los arcos.
4. **Rotación de la mesa caliente** por día. Es opcional.
5. **Si la música del viernes es con entrada libre.** Hasta confirmarlo, no se pone la pastilla.
6. **Place ID o enlace de reseña del Perfil de Google.** El perfil está verificado con candelaycafe5@gmail.com, en la PC del cliente.

## 8. Arreglos de la revisión de código (24-sep) que entran

- **Ya en vivo por el parche:** #1 (reseñas de ejemplo), #2 (banner de cookies), #3 (canonical) y #4 (menú hamburguesa).
- **Los resuelve el rediseño:** #6 y #7 (market pasa a vitrina), #8 (falsos «Add +»), #18 (sale Swiper), #19 (sale la línea de tiempo) y #23 (fotos y alts nuevos).
- **Se arreglan explícitamente:**
  - **Hero:** #13 parpadeo del título (ocultar de entrada con `.js`), #14 preload y `fetchpriority` en `hero-grill`, #20 contraste del CTA verde del hero (texto oscuro o verde `#4f8a2a`; es el único cambio visual en el hero), #21 pausar las animaciones del hero fuera de pantalla y #22 no descargar las imágenes ocultas en móvil.
  - **Carrito** (`menu.html`): #5 releer localStorage y refrescar en `pageshow`/`storage`, y #17 validar con `Array.isArray` y reconstruir cada línea por id.
  - **Menú:** #9 (badge de Boar's Head) y #10 (`scroll-margin-top` y chip activo).
  - **Accesibilidad:** #16 (trampa de foco en el modal y el drawer, restaurar el foco, Escape en la hamburguesa, `aria-pressed` y `aria-label` del idioma) y #20 (kickers y `.p-cat`).
  - **Otros:** #11 y #12 (i18n), #15 (caché) y #24 (nav).
  - **SEO:** #25 (`og:type` válido; JSON-LD con `url`, `priceRange`, `geo`, `hasMenu` y `openingHoursSpecification`; `robots.txt` y `sitemap.xml`; `noopener` en `window.open`).

## 9. Fuera de alcance

- Rediseñar visualmente `menu.html`. Solo recibe los arreglos de §8 y el nav nuevo.
- Integrar delivery o un widget de reseñas con la API de Google.
- Crear contenido nuevo del negocio (platos, precios, eventos) que no venga del cliente o de `menu-data.js`.
- Enlazar Netlify con GitHub (lo hace Robert en el panel) y el merge de `master` (lo ejecuta Robert).

## 10. Pruebas

- **Unitarias (`node --test`):**
  - `status()` con fechas fijas: mar 07:59 (cerrado, abre 8), mar 21:30 (abierto, `soon`), mar 22:00 (cerrado), sáb 23:29 (abierto, `soon`), mié 12:30 (`part` = mediodía).
  - Los constructores de WhatsApp: codificación, EN/ES y plural.
  - **Cobertura de i18n:** toda clave `data-i18n` de `index.html` y `menu.html` existe en `DICT.en` y en `DICT.es`.
  - **Coherencia:** el `openingHoursSpecification` del JSON-LD coincide con `HOURS`.
  - `cart-core` con un carrito guardado no válido.
  - Los 7 tests actuales siguen en verde.
- **En navegador (Playwright), a 375×812 y 1440×900:**
  - consola limpia, 0 errores 404 y sin overflow-x;
  - hamburguesa tras hacer scroll;
  - la barra fija no tapa ningún CTA;
  - foco atrapado en el modal de reserva;
  - EN↔ES cambia todos los textos nuevos;
  - la rampa no tiene cortes visibles.
- **Lighthouse móvil:** rendimiento ≥ 90, accesibilidad ≥ 95 y CLS < 0.05.

## 11. Despliegue

1. Se trabaja en `feature/un-dia-en-candela` y se hace push de cada commit.
2. Se hace una **preview** en Netlify (`netlify deploy --no-build --dir web --site 1bfbd3d7-f969-4d2a-b443-9eceeec058c5`, sin `--prod`) para enseñársela a Robert o al cliente.
3. Producción (`--prod`) solo con el OK de Robert y con los puntos de §7 que bloquean resueltos o retirados de la página.
4. Cuando Robert haya rescatado `master`, se abre un PR `feature/un-dia-en-candela` → `master`.

# Candela & Café — la carta del QR en menu.candelaycafe.com

- **Fecha:** 2026-10-09
- **Estado:** diseño aprobado por Robert desde el móvil, con maquetas A/B; pendiente de revisar este documento
- **Rama:** `feature/qr-menu`, que sale de `master`. Ya lleva un QR a `candelaycafe.com/menu`, que se rehace.
- **Maquetas aprobadas (variante A):** `Desktop\Galiax\2026-10-09\maquetas-carta-qr\A-1-portada.jpg`, `A-2-platos.jpg` y `A-3-pedido.jpg`. Son capturas a 390 px de un prototipo desechable, hecho sobre el HTML de abril.
- **No cambia:** la carta de la web (`2026-09-24-candela-menu-design.md`) ni la portada.

## 1. Objetivo

Los QR del local abren `menu.candelaycafe.com`. Hoy ese subdominio sirve el prototipo de abril (sitio de Netlify
`candela-cafe-menu`). Tiene 22 platos que el local no vende, fotos de banco y la dirección falsa «1248 Coral Way».
Los pedidos por WhatsApp van al número ficticio +1 305-555-1248. A Robert le gusta más ese diseño que la carta de
la web, así que se queda el diseño y se cambia todo lo demás: sobre blanco y con la carta real.

**Cómo sabremos que funciona:**
- `menu.candelaycafe.com` enseña los 79 platos de `web/js/menu-data.js` con sus precios, y solo fotos que son el plato.
- No queda nada inventado: ni el 555, ni Coral Way, ni platos, ofertas o eventos que no existen.
- Un pedido llega a (786) 254-7577 con los platos, las cantidades, el total con céntimos, el tipo (mesa o para
  llevar), el nombre y la mesa.
- El QR nuevo se lee como `https://menu.candelaycafe.com` con los dos lectores de OpenCV y con jsQR en Chrome, y abre
  la carta nueva.
- Solo DM Sans. No hay scroll horizontal a 320 px. Lighthouse en móvil da ≥ 90 en rendimiento y ≥ 95 en accesibilidad.
- No sale en Google: para Google está `candelaycafe.com/menu`.

## 2. Decisiones de Robert (9-oct)

| Tema | Decisión |
|---|---|
| Diseño | El de la carta vieja de `menu.candelaycafe.com`, que le gusta más que la de la web. |
| Fondo | Blanco. |
| Colores | **A, los de la vieja:** naranja `#C9571A`, franja dorada `#D4A83A` y texto espresso `#2C1810`. |
| Letra | **Solo DM Sans** (regla del 1-oct, por el B-01 de Beatriz). |
| Datos | Los reales de la web: platos, nombres, precios y fotos. |
| Subdominio | **No redirige a ningún sitio.** La información se arregla ahí mismo; tampoco hay redirección temporal mientras tanto. |
| Carta de la web | `candelaycafe.com/menu` se queda como está. |
| Pedidos | Para comer en mesa y para llevar, por WhatsApp al número real. |
| Forma | En el repo (`menu-qr/`), con los datos y el carrito de la web. Se publica en el mismo sitio de Netlify, con el mismo dominio. |
| QR | A `https://menu.candelaycafe.com`, con el estándar de QR de Galiax. |

## 3. Qué se ve

Las piezas son las de la carta vieja; cambian el fondo, los colores, la letra y los datos.

### 3.1 Cabecera (fija)
Logo (`logo-96.webp`) con aro dorado, «MARKET» encima de «Candela & Café», botón **EN / ES** y lupa. Al tocar la
lupa, la cabecera se convierte en buscador, como en la vieja (botón de volver y campo de texto).

### 3.2 Franja de avisos (fija, dorada)
Se desplaza en bucle y se para al tocarla. Con `prefers-reduced-motion` no se mueve. No lleva enlaces. Solo datos de
la web:

| ES | EN |
|---|---|
| 🎵 Música en vivo · todos los viernes desde las 8 pm | 🎵 Live music · every Friday from 8 pm |
| ⭐ Pregunta por los especiales del día | ⭐ Ask about our daily specials |
| 🛵 También en Uber Eats y DoorDash | 🛵 Also on Uber Eats and DoorDash |
| ☕ Abiertos todos los días desde las 8 am | ☕ Open every day from 8 am |
| 📍 507 N Miami Ave · Downtown Miami | 📍 507 N Miami Ave · Downtown Miami |

### 3.3 Portada
Raya con los colores de la bandera dominicana, «NY Deli Market & Café», «Candela & Café» (h1, DM Sans 900, el «&» en
naranja) y la frase de la web: «Deli de Nueva York y comida dominicana en Downtown Miami.» (EN: «NY deli & Dominican
food in Downtown Miami.»). Debajo, una píldora con la bandera: «Comida dominicana» (EN: «Dominican food»). Sin
palmeras: sobre blanco parecían rayas.

### 3.4 Pestañas (fijas bajo la franja)
Una por categoría, en el orden de `CATEGORIES`, con su emoji. La activa va en naranja y sigue al scroll, como en la
vieja.

| Categoría | Emoji | Categoría | Emoji | Categoría | Emoji |
|---|---|---|---|---|---|
| breakfast | ☀️ | juices | 🍊 | dominican-spot | 🇩🇴 |
| avocado-toast | 🥑 | smoothies | 🍓 | soups | 🍲 |
| bakery | 🥐 | shakes | 💪 | signature | 🥪 |
| coffee | ☕ | appetizers | 🍟 | ny-signature | 🗽 |
| salads-wraps | 🥗 | panini | 🥖 | burgers | 🍔 |

### 3.5 Secciones
Cada sección lleva el emoji, el momento del día de `PARTS` (Mañana / Café y jugos / Mediodía) y el nombre de la
categoría. Las 4 categorías con `cover` (Panadería, Barra de Café, Rincón Dominicano y Sopas) llevan su foto de
cabecera. Rincón Dominicano lleva además su `note`: «¡Pregunta por nuestros especiales del día!».

### 3.6 Filas de plato
- **Con `img`:** foto de 88×88 con la etiqueta `badge` encima (por ejemplo «Boar's Head»), nombre, descripción en el
  idioma (2 líneas como mucho), precio y botón «+».
- **Sin `img`:** la misma fila sin foto. Solo hay foto si es ese plato: 13 de los 79.
- **Precio:** con céntimos (`$11.49`), en naranja oscuro `#A8441A`, que da contraste AA sobre blanco.
- **Sin precio** (`price: 0`, los 13 de Panadería y Café): «Pregunta en tienda» (EN: «Ask in store») y sin «+».
- **Con el plato en el pedido,** el «+» pasa a contador −/+.

### 3.7 Pie
«507 N Miami Ave · Miami, FL 33136», «+1 (786) 254-7577» (enlace `tel:`), un enlace a `candelaycafe.com` y la firma
«— hecho con candela —».

### 3.8 Búsqueda
Busca en el nombre, en las dos descripciones y en el nombre de la categoría, sin importar tildes ni mayúsculas. Usa
`matches()` de la web. Esconde los platos y secciones que no coinciden. Si no queda nada: «No lo encontramos.
Pregúntanos en tienda.» (EN: «We couldn't find it. Ask us in store.»).

### 3.9 Idioma
Al entrar, el del móvil: si `navigator.language` empieza por `es`, español; si no, inglés. El botón EN / ES lo
cambia y se recuerda en el móvil. Los nombres de los platos van como en la carta impresa (en inglés). Las
descripciones y los textos de la página, en el idioma elegido.

### 3.10 Colores y letra

| Token | Valor | Uso |
|---|---|---|
| fondo | `#FFFFFF` | página, pestañas y hoja del pedido |
| texto | `#2C1810` | títulos, nombres y precios grandes |
| texto 2 | `#6B5A50` | descripciones, etiquetas y pie |
| naranja | `#C9571A` | pestaña activa, «+», botón flotante, «Para comer aquí» |
| naranja texto | `#A8441A` | precios, «Mañana / Mediodía…» y «MARKET» |
| dorado | `#D4A83A` | franja de avisos (texto `#2C1810`) y aro del logo |
| verde | `#3A4A3C` | «Para llevar» activo |
| WhatsApp | `#25D366` | botón de enviar el pedido |

Toda la página va en **DM Sans** (`web/assets/fonts/dm-sans-latin.woff2`, variable de 100 a 1000). La jerarquía la
marcan el peso (900 para el h1, 800 para los títulos, 700 para los nombres) y el tamaño.

En el móvil es a todo el ancho. A partir de 600 px, la carta va en una columna centrada de 560 px.

## 4. Pedido por WhatsApp

- **Botón flotante:** aparece al añadir el primer plato, con «Tu pedido», el número de platos y el total.
- **Hoja del pedido:**
  - Cada línea lleva la foto del plato (o el emoji de su categoría si no tiene), el nombre, el importe y el contador −/+.
  - Tipo de pedido: «Para comer aquí» (por defecto) o «Para llevar».
  - **Nombre**, que es obligatorio. Si falta, el botón no envía y se marca el campo.
  - **Mesa nº**, solo con «Para comer aquí». Es opcional.
  - **Nota para la cocina**, opcional.
  - El total y el botón «Enviar pedido por WhatsApp».
- **Destino:** `https://wa.me/17862547577` (`PHONE` de `menu-data.js`).
- **Mensaje en español:**

  ```
  ¡Hola! 🍽️ Pedido *Para comer aquí* · *Ana* · Mesa *4*:

  *Candela & Café Market*
  ━━━━━━━━━━━━
  • Downtown Platter x2 — $22.98
  • The Ruben Sandwich x1 — $15.49
  ━━━━━━━━━━━━
  *Total: $38.47*

  📝 _Sin cebolla_
  ```
- **Para llevar:** empieza por «¡Hola! 🥡 Pedido *Para llevar* · *Ana*:», sin mesa.
- **Mensaje en inglés:** la misma estructura, con «Hi! 🍽️ Order *Dine in* · *Ana* · Table *4*:» y «🥡 *Takeout*».
- **Carrito:**
  - Usa `createCart` de `web/js/cart-core.js` y se guarda en el móvil, con la clave `candela-qr-cart`.
  - Al cargar se revisa contra la carta actual (`revalidate`): si cambió un precio o desapareció un plato, el pedido
    se corrige.
  - Solo entran platos con precio.

## 5. Cómo se hace y se publica

- **`menu-qr/`** (nuevo):
  - `index.html`, `css/menu-qr.css` y `js/menu-qr.js`, más un módulo `js/qr-render.js` con funciones puras que
    devuelven HTML y el mensaje de WhatsApp, para poder probarlas;
  - los textos de la página en ES/EN;
  - `netlify.toml` con las cabeceras de seguridad de la web (CSP con los scripts por archivo o por hash) y
    `X-Robots-Tag: noindex`. La página lleva también `<meta name="robots" content="noindex">`.
- **Importa de la web, sin copiar código:**
  - `web/js/menu-data.js`: platos, categorías, momentos y `PHONE`;
  - `web/js/cart-core.js`: el carrito;
  - `web/js/menu-render.js`: `normalize` y `matches`, para el buscador.
- **Mismas rutas en el repo y publicado.** La página usa `../web/...` y `js/` usa `../../web/js/...`. Al publicar,
  `dist-menu-qr/` replica la carpeta `web/` que hace falta, así que las rutas valen tal cual en los dos sitios.
- **`tools/build-menu-qr.mjs`** genera `dist-menu-qr/` (ignorada en git):
  - copia `menu-qr/` a la raíz;
  - copia `web/js/` entero a `dist-menu-qr/web/js/`;
  - copia solo lo que se usa de `web/assets/`: las 17 fotos (13 platos y 4 cabeceras) a 480 y 960, el logo, los
    iconos y DM Sans.
- **Para probar en el PC:** servir la raíz del repo y abrir `/menu-qr/`.
- **Publicación manual, como la web:**
  - **Prueba:** `netlify deploy --dir dist-menu-qr --no-build --site 1260f03f-9e5d-4992-9259-6021bbd3814e` da un
    enlace de prueba, que Robert mira en el móvil.
  - **Producción:** lo mismo con `--prod`, y solo con su OK.
  - **Vuelta atrás:** restaurar en Netlify el deploy anterior. El de abril es `69ef98ba21fb2a48de572d62`.
- **No se tocan** el dominio, los DNS ni el sitio de Netlify. Los QR que ya existan siguen abriendo el mismo subdominio.
- **Si cambia la carta** (`menu-data.js`), **hay que publicar las dos**: la web y la carta del QR. Va a la checklist
  del cerebro.

## 6. El QR

- **`qr/generar.py`:**
  - `URL = "https://menu.candelaycafe.com"`, que con 29 caracteres sigue siendo versión 4-H;
  - las mismas tres versiones (limpia, hueco cuadrado y hueco circular) en SVG, PDF y PNG;
  - la máscara se vuelve a elegir con la batería de degradaciones y el barrido de tamaños grandes, porque la 2 se
    eligió para la URL anterior.
- **Verificación:**
  - los dos lectores de OpenCV y jsQR en Chrome, sobre SVG, PDF y PNG;
  - abrir en Chrome el enlace leído;
  - después de publicar, otra vez contra producción.
- **`tests/qr-menu.test.mjs`:**
  - el QR apunta al subdominio;
  - existe `menu-qr/index.html`;
  - se mantiene la guarda de `/menu` de la web, porque la usan el perfil de Google y la barra de la web.
- **Cerebro y pendientes:**
  - el sitio `candela-cafe-menu` no puede perder el dominio `menu.candelaycafe.com`, como pasó el 11-ago;
  - tampoco se puede borrar el registro DNS `menu` en Squarespace;
  - `candelaycafe.com` vence el 2-jul-2027.

## 7. Pruebas

**`tests/menu-qr.test.mjs`** (con `node:test`, como el resto):
- **Datos:** la página no trae platos propios. Salen las 15 categorías y los 79 platos de `menu-data.js`, en su orden.
- **Filas:** foto solo con `img`; «Pregunta en tienda» y sin «+» cuando `price` es 0; precios con dos decimales.
- **Pedido:**
  - el mensaje en ES y EN, para mesa y para llevar, con nombre, mesa y nota;
  - el destino es `wa.me/17862547577`;
  - el total va con céntimos;
  - sin nombre no se genera el enlace.
- **Nada inventado:** ni `menu-qr/` ni `dist-menu-qr/` contienen `555`, `Coral Way`, `unsplash`, `Sancocho de los
  domingos`, `Trío Buenos Aires` ni `Semana Santa`.
- **Solo DM Sans:** una sola `@font-face` y ninguna otra familia, como en `tests/web-ready`.
- **Publicación:** `dist-menu-qr/` tiene `index.html` y `web/js/menu-data.js`, y existen todas las fotos que referencia.
- **Cabeceras:** `noindex` y una CSP sin `unsafe-inline` en `script-src`.

**A mano, con Playwright:**
- capturas a 390 px para Robert;
- sin scroll horizontal a 320 px;
- el buscador y el pedido completo, hasta generar el enlace, sin enviarlo;
- Lighthouse en móvil sobre el enlace de prueba.

## 8. Fuera de alcance

- La carta y la portada de `candelaycafe.com`.
- Enlazar Netlify con GitHub (pendiente aparte).
- Market, eventos o reservas en el subdominio.
- Analítica.

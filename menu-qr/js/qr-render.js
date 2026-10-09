// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): funciones PURAS que devuelven HTML en texto o el pedido.
// Probadas en tests/menu-qr.test.mjs. Los platos son los de la web (web/js/menu-data.js); todo dato pasa por esc().
import { esc } from '../../web/js/sections.js';
import { matches } from '../../web/js/menu-render.js';
import { waUrl } from '../../web/js/cart-core.js';
import { PHONE } from '../../web/js/menu-data.js';

/** Fotos de la web. Relativo a la página: vale en el repo (/menu-qr/) y publicado (/), ver tools/build-menu-qr.mjs. */
export const IMG = '../web/assets/img/';

export const EMOJI = {
  breakfast: '☀️', 'avocado-toast': '🥑', bakery: '🥐', coffee: '☕', juices: '🍊', smoothies: '🍓',
  shakes: '💪', appetizers: '🍟', 'salads-wraps': '🥗', 'dominican-spot': '🇩🇴', soups: '🍲',
  signature: '🥪', 'ny-signature': '🗽', panini: '🥖', burgers: '🍔',
};
const emoji = cat => EMOJI[cat] || '🍽️';

/** Franja de avisos: solo datos que ya están en la web. */
export const MARQUEE = [
  { es: '🎵 Música en vivo · todos los viernes desde las 8 pm', en: '🎵 Live music · every Friday from 8 pm' },
  { es: '⭐ Pregunta por los especiales del día', en: '⭐ Ask about our daily specials' },
  { es: '🛵 También en Uber Eats y DoorDash', en: '🛵 Also on Uber Eats and DoorDash' },
  { es: '☕ Abiertos todos los días desde las 8 am', en: '☕ Open every day from 8 am' },
  { es: '📍 507 N Miami Ave · Downtown Miami', en: '📍 507 N Miami Ave · Downtown Miami' },
];

/** Textos de la página. En index.html van en data-t (texto), data-t-ph (placeholder) y data-t-aria (aria-label). */
export const TXT = {
  title:       { es: 'Carta — Candela & Café Market', en: 'Menu — Candela & Café Market' },
  skip:        { es: 'Ir a la carta', en: 'Skip to the menu' },
  search:      { es: 'Buscar en la carta…', en: 'Search the menu…' },
  searchBtn:   { es: 'Buscar', en: 'Search' },
  back:        { es: 'Volver', en: 'Back' },
  cats:        { es: 'Categorías', en: 'Categories' },
  eyebrow:     { es: 'NY Deli Market & Café', en: 'NY Deli Market & Café' },
  sub:         { es: 'Deli de Nueva York y comida dominicana en Downtown Miami.', en: 'NY deli & Dominican food in Downtown Miami.' },
  pill:        { es: 'Comida dominicana', en: 'Dominican food' },
  ask:         { es: 'Pregunta en tienda', en: 'Ask in store' },
  add:         { es: 'Añadir', en: 'Add' },
  less:        { es: 'Quitar uno', en: 'Remove one' },
  more:        { es: 'Añadir otro', en: 'Add one more' },
  empty:       { es: 'No lo encontramos. Pregúntanos en tienda.', en: "We couldn't find it. Ask us in store." },
  order:       { es: 'Tu pedido', en: 'Your order' },
  cartEmpty:   { es: 'Tu pedido está vacío. ¡Escoge algo rico!', en: 'Your order is empty. Pick something good!' },
  type:        { es: 'Tipo de pedido', en: 'Order type' },
  here:        { es: 'Para comer aquí', en: 'Dine in' },
  togo:        { es: 'Para llevar', en: 'Takeout' },
  name:        { es: 'Tu nombre', en: 'Your name' },
  namePh:      { es: 'Nombre', en: 'Name' },
  nameMissing: { es: 'Escribe tu nombre para enviar el pedido.', en: 'Add your name to send the order.' },
  table:       { es: 'Mesa nº', en: 'Table #' },
  tablePh:     { es: 'Ej: 4', en: 'E.g. 4' },
  note:        { es: 'Nota para la cocina', en: 'Note for the kitchen' },
  notePh:      { es: 'Sin picante, alergias, sin sal…', en: 'No spice, allergies, no salt…' },
  total:       { es: 'Total', en: 'Total' },
  send:        { es: 'Enviar pedido por WhatsApp', en: 'Send order on WhatsApp' },
  close:       { es: 'Cerrar', en: 'Close' },
};
export const tr = (key, lang) => TXT[key][lang];

export const money = n => `$${n.toFixed(2)}`;
export const itemsLabel = (n, lang) => (lang === 'es' ? `${n} ${n === 1 ? 'plato' : 'platos'}` : `${n} ${n === 1 ? 'item' : 'items'}`);

/** El idioma guardado; si no hay, el del móvil (español si empieza por «es»); si no, inglés. */
export const pickLang = (stored, nav) =>
  (['es', 'en'].includes(stored) ? stored : /^es\b/i.test(String(nav || '')) ? 'es' : 'en');

/** Dos tandas iguales: la animación mueve la pista un 50 % y vuelve sin salto. La segunda no se lee en voz alta. */
export function renderMarquee(lang) {
  const one = MARQUEE.map(m => `<span class="mq-item">${esc(m[lang])}</span><span class="mq-sep" aria-hidden="true">✦</span>`).join('');
  return `${one}<span class="mq-dup" aria-hidden="true">${one}</span>`;
}

export function renderTabs(categories, lang) {
  return categories.map((c, i) => `<button class="cat-tab${i === 0 ? ' active' : ''}" type="button" data-cat="${esc(c.id)}">`
    + `<span aria-hidden="true">${emoji(c.id)}</span> ${esc(c.label[lang])}</button>`).join('');
}

/** Fila de plato: foto solo si es el plato; sin precio, «Pregunta en tienda» y sin botón; con el plato en el pedido, contador. */
export function renderCard(item, lang, qty = 0) {
  const id = esc(item.id), name = esc(item.name);
  const photo = item.img
    ? `<div class="card-img"><img src="${IMG}${esc(item.img)}-480.webp" alt="" width="88" height="88" loading="lazy" decoding="async"`
      + `${item.focus ? ` style="object-position:${esc(item.focus)}"` : ''}>`
      + `${item.badge ? `<span class="card-badge-label">${esc(item.badge)}</span>` : ''}</div>`
    : '';
  // sin foto, la etiqueta (p. ej. «Boar's Head») va encima del nombre, como en la carta de la web
  const tag = !item.img && item.badge ? `<span class="card-badge-inline">${esc(item.badge)}</span>` : '';
  const desc = item.desc ? `<p class="card-desc">${esc(item.desc[lang])}</p>` : '';
  const priced = item.price > 0;
  const price = priced
    ? `<span class="card-price">${money(item.price)}</span>`
    : `<span class="card-price ask">${tr('ask', lang)}</span>`;
  const ctrl = !priced ? ''
    : qty === 0
      ? `<button class="add-btn" type="button" data-action="add" data-id="${id}" aria-label="${tr('add', lang)}: ${name}">+</button>`
      : `<div class="stepper"><button class="step-btn" type="button" data-action="dec" data-id="${id}" aria-label="${tr('less', lang)}: ${name}">−</button>`
        + `<span class="step-qty">${qty}</span>`
        + `<button class="step-btn step-add" type="button" data-action="inc" data-id="${id}" aria-label="${tr('more', lang)}: ${name}">+</button></div>`;
  return `<article class="menu-card${item.img ? '' : ' no-img'}" data-id="${id}">${photo}<div class="card-body">`
    + `<div>${tag}<h3 class="card-name">${name}</h3>${desc}</div><div class="card-footer">${price}${ctrl}</div></div></article>`;
}

/** Las secciones de la carta, en el orden de CATEGORIES. qtyOf(id) dice cuántos hay de ese plato en el pedido. */
export function renderSections(categories, menu, parts, lang, qtyOf = () => 0) {
  const part = Object.fromEntries(parts.map(p => [p.id, p.label[lang]]));
  return categories.map(c => {
    const id = esc(c.id);
    const cover = c.cover
      ? `<figure class="sec-cover"><img src="${IMG}${esc(c.cover.img)}-${c.cover.w[0]}.webp" `
        + `srcset="${c.cover.w.map(w => `${IMG}${esc(c.cover.img)}-${w}.webp ${w}w`).join(', ')}" `
        + `sizes="(min-width: 600px) 528px, calc(100vw - 32px)" alt="" loading="lazy" decoding="async"`
        + `${c.cover.focus ? ` style="object-position:${esc(c.cover.focus)}"` : ''}></figure>`
      : '';
    const note = c.note ? `<p class="sec-note">${esc(c.note[lang])}</p>` : '';
    const cards = (menu[c.id] || []).map(i => renderCard(i, lang, qtyOf(i.id))).join('');
    return `<section class="menu-section" id="sec-${id}" data-section="${id}" aria-labelledby="h-${id}">`
      + `<div class="sec-head"><div class="sec-icon" aria-hidden="true">${emoji(c.id)}</div>`
      + `<div><p class="sec-label">${esc(part[c.part] || '')}</p><h2 class="sec-name" id="h-${id}">${esc(c.label[lang])}</h2></div></div>`
      + `<div class="sec-divider"></div>${cover}${note}${cards}</section>`;
  }).join('');
}

/** El plato y su categoría, por id; null si ya no está en la carta. */
export function findInMenu(categories, menu, id) {
  for (const c of categories) {
    const item = (menu[c.id] || []).find(i => i.id === id);
    if (item) return { item, cat: c.id };
  }
  return null;
}

/** Líneas de la hoja del pedido: la foto del plato o, si no tiene, el emoji de su categoría. */
export function renderCartLines(lines, lang, lookup) {
  return lines.map(l => {
    const found = lookup(l.id), id = esc(l.id), name = esc(l.name);
    const pic = found && found.item.img
      ? `<img src="${IMG}${esc(found.item.img)}-480.webp" alt="" loading="lazy" decoding="async">`
      : `<span class="ci-emoji" aria-hidden="true">${emoji(found && found.cat)}</span>`;
    return `<div class="ci"><div class="ci-img">${pic}</div>`
      + `<div class="ci-info"><p class="ci-name">${name}</p><p class="ci-price">${money(l.price * l.qty)}</p></div>`
      + `<div class="ci-ctrl"><button class="ci-btn" type="button" data-ci="dec" data-id="${id}" aria-label="${tr('less', lang)}: ${name}">−</button>`
      + `<span class="ci-qty">${l.qty}</span>`
      + `<button class="ci-btn" type="button" data-ci="inc" data-id="${id}" aria-label="${tr('more', lang)}: ${name}">+</button></div></div>`;
  }).join('');
}

/** Qué platos y secciones se ven con una búsqueda (la de la web: sin tildes, en las dos lenguas y con todas las palabras). */
export function searchHits(categories, menu, query) {
  const items = new Set(), cats = new Set();
  for (const c of categories) {
    for (const i of menu[c.id] || []) {
      if (matches(i, c, query)) { items.add(i.id); cats.add(c.id); }
    }
  }
  return { items, cats };
}

const RULE = '━'.repeat(12);

/** Texto del pedido para WhatsApp. Sin nombre o sin platos no hay pedido (null). La mesa solo va «para comer aquí». */
export function orderText({ lines, total, type, name, table, note }, lang) {
  const who = String(name || '').trim(), mesa = String(table || '').trim(), nota = String(note || '').trim();
  if (!who || !lines.length) return null;
  const es = lang === 'es';
  const head = type === 'llevar'
    ? `${es ? '¡Hola! 🥡 Pedido *Para llevar*' : 'Hi! 🥡 Order *Takeout*'} · *${who}*`
    : `${es ? '¡Hola! 🍽️ Pedido *Para comer aquí*' : 'Hi! 🍽️ Order *Dine in*'} · *${who}*`
      + (mesa ? ` · ${es ? 'Mesa' : 'Table'} *${mesa}*` : '');
  const body = lines.map(l => `• ${l.name} x${l.qty} — ${money(l.price * l.qty)}`).join('\n');
  return `${head}:\n\n*Candela & Café Market*\n${RULE}\n${body}\n${RULE}\n*Total: ${money(total)}*${nota ? `\n\n📝 _${nota}_` : ''}`;
}

/** Enlace de WhatsApp al número del local (PHONE de la web), o null si aún no hay pedido. */
export function orderUrl(order, lang) {
  const text = orderText(order, lang);
  return text ? waUrl(PHONE, text) : null;
}

// Carta «Carta de papel» (2026-09): funciones PURAS que devuelven HTML en texto.
// Testeadas en tests/menu-render.test.mjs. Todo dato pasa por esc().
import { DICT } from './i18n.js';
import { esc } from './sections.js';
import { waUrl } from './cart-core.js';
import { PHONE } from './menu-data.js';

const tx = (key, lang) => (DICT[key] && DICT[key][lang]) || key;
const IMG = 'assets/img/';
const srcset = (img, widths) => widths.map(w => `${IMG}${esc(img)}-${w}.webp ${w}w`).join(', ');
const pos = focus => (focus ? ` style="object-position:${esc(focus)}"` : '');

/** Momentos del día con sus categorías, en el orden de PARTS y de CATEGORIES. Sin momentos vacíos. */
export function groupByPart(categories, parts) {
  return parts
    .map(part => ({ part, cats: categories.filter(c => c.part === part.id) }))
    .filter(g => g.cats.length);
}

/** Con un número impar de tarjetas, la primera va a todo el ancho: su id, o null. */
export const wideId = withImg => (withImg.length % 2 === 1 ? withImg[0].id : null);

function buy(item, lang) {
  return item.price > 0
    ? `<span class="it-price">$${item.price.toFixed(2)}</span>`
      + `<button class="it-add" type="button" aria-label="${esc(tx('cart.add', lang))} ${esc(item.name)}">+</button>`
    : `<span class="it-ask">${esc(tx('cart.ask', lang))}</span>`;
}

function card(item, lang, wide, eager) {
  return `<li class="card${wide ? ' card--wide' : ''}" id="${esc(item.id)}" data-id="${esc(item.id)}">`
    + `<img src="${IMG}${esc(item.img)}-480.webp" srcset="${srcset(item.img, [480, 960])}"`
    + ` sizes="${wide ? '(max-width:599px) 92vw, 540px' : '(max-width:599px) 46vw, 270px'}"`
    + ` alt="" width="480" height="360"${eager ? '' : ' loading="lazy"'} decoding="async"${pos(item.focus)}>`
    + `<span class="it-name">${esc(item.name)}</span>`
    + (item.badge ? `<span class="badge">${esc(item.badge)}</span>` : '')
    + (item.desc ? `<span class="it-desc">${esc(item.desc[lang])}</span>` : '')
    + `<span class="it-buy">${buy(item, lang)}</span></li>`;
}

function row(item, lang) {
  return `<li class="row" id="${esc(item.id)}" data-id="${esc(item.id)}">`
    + `<span class="it-text"><span class="it-name">${esc(item.name)}</span>`
    + (item.badge ? `<span class="badge">${esc(item.badge)}</span>` : '')
    + (item.desc ? `<span class="it-desc">${esc(item.desc[lang])}</span>` : '')
    + `</span>${buy(item, lang)}</li>`;
}

function cover(c, eager) {
  return `<figure class="cat-cover"><img src="${IMG}${esc(c.img)}-960.webp" srcset="${srcset(c.img, c.w)}"`
    + ` sizes="(max-width:1180px) 100vw, 1100px" alt="" width="960" height="400"`
    + `${eager ? '' : ' loading="lazy"'} decoding="async"${pos(c.focus)}></figure>`;
}

function category(cat, items, lang, eager) {
  const withImg = items.filter(i => i.img), noImg = items.filter(i => !i.img);
  const wide = wideId(withImg);
  return `<section class="cat" id="${esc(cat.id)}" aria-labelledby="h-${esc(cat.id)}">`
    + `<h3 class="cat-sign" id="h-${esc(cat.id)}">${esc(cat.label[lang])}</h3>`
    + (cat.cover ? cover(cat.cover, eager) : '')
    + (cat.note ? `<p class="cat-note">${esc(cat.note[lang])}</p>` : '')
    + (withImg.length ? `<ul class="cards">${withImg.map(i => card(i, lang, i.id === wide, eager)).join('')}</ul>` : '')
    + (noImg.length ? `<ul class="rows">${noImg.map(i => row(i, lang)).join('')}</ul>` : '')
    + '</section>';
}

/** La carta entera: h2 por momento y h3 por categoría. Solo la primera categoría carga sus fotos sin lazy. */
export function renderMenu(categories, menu, parts, lang) {
  let first = true;
  return groupByPart(categories, parts).map(({ part, cats }) =>
    `<section class="part" data-part="${esc(part.id)}" aria-labelledby="p-${esc(part.id)}">`
    + `<h2 class="part-label" id="p-${esc(part.id)}">${esc(part.label[lang])}</h2>`
    + cats.map(c => { const html = category(c, menu[c.id] || [], lang, first); first = false; return html; }).join('')
    + '</section>').join('');
}

/** Un chip por categoría, en el orden en que salen en la carta. */
export function renderChips(categories, parts, lang) {
  return groupByPart(categories, parts).flatMap(g => g.cats)
    .map(c => `<a class="chip" href="#${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.label[lang])}</a>`).join('');
}

/* ── buscador ─────────────────────────────────────────────── */

/** Minúsculas, sin tildes y sin espacios sobrantes: «Café » → «cafe». */
export const normalize = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Busca en nombre, descripción (EN y ES) y nombre de la categoría (EN y ES). Tienen que estar todas las palabras. */
export function matches(item, cat, query) {
  const q = normalize(query);
  if (q.length < 2) return true;
  const hay = [item.name, item.desc && item.desc.en, item.desc && item.desc.es, cat.label.en, cat.label.es]
    .filter(Boolean).map(normalize).join(' | ');
  return q.split(/\s+/).every(w => hay.includes(w));
}

/** Qué se ve con una búsqueda: platos, categorías, momentos, tarjetas anchas y cuántos platos. */
export function filterMenu(categories, menu, query) {
  const items = new Set(), cats = new Set(), parts = new Set(), wide = new Set();
  for (const c of categories) {
    const hits = (menu[c.id] || []).filter(i => matches(i, c, query));
    if (!hits.length) continue;
    hits.forEach(i => items.add(i.id));
    cats.add(c.id);
    parts.add(c.part);
    const w = wideId(hits.filter(i => i.img));
    if (w) wide.add(w);
  }
  return { items, cats, parts, wide, count: items.size };
}

/** Texto de la región viva: «1 plato», «12 platos» o «No lo encontramos.». */
export function searchStatus(count, lang) {
  if (count === 0) return tx('menu.search.none', lang);
  return count === 1 ? tx('menu.search.one', lang) : tx('menu.search.many', lang).replace('{n}', String(count));
}

/** «¿Tienen …?» por WhatsApp, con lo que se buscó. */
export const askUrl = (query, lang) => waUrl(PHONE, tx('menu.search.wa', lang).replace('{q}', query.trim()));

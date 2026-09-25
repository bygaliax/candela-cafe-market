// Secciones dinámicas de la portada. Funciones PURAS: devuelven HTML en texto
// (testeadas en tests/sections.test.mjs). Todo dato pasa por esc().
import { DICT } from './i18n.js';
import { MENU, DAILY_SPECIAL } from './menu-data.js';
import { fmtTime } from './status.js';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const tx = (key, lang) => (DICT[key] && DICT[key][lang]) || key;

const DAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
};
const WEEK_FROM_MONDAY = [1, 2, 3, 4, 5, 6, 0];

export function findItem(id) {
  for (const [cat, items] of Object.entries(MENU)) {
    const item = items.find(i => i.id === id);
    if (item) return { cat, item };
  }
  return null;
}

export function renderFavorites(favs, lang) {
  return favs.map(f => {
    const hit = findItem(f.id);
    if (!hit) return '';
    const { item } = hit;
    const src = `assets/img/${esc(f.img)}`;
    return `<a class="fav" href="menu.html#${esc(item.id)}">`
      + `<img src="${src}-480.webp" srcset="${src}-480.webp 480w, ${src}-960.webp 960w" sizes="(max-width:900px) 45vw, 270px" alt="" loading="lazy" width="480" height="${Number(f.h)}">`
      + `<h3 class="fav-n">${esc(item.name)}</h3>`
      + `<p class="fav-d">${esc(item.desc ? item.desc[lang] : '')}</p>`
      + `<p class="fav-p">$${item.price.toFixed(2)}</p></a>`;
  }).join('');
}

/** Filas del cartel del market: nombre en Anton y ejemplos a la derecha. */
export function renderMarketList(cats, lang) {
  return cats.map(c => `<li><b>${esc(c.name[lang])}</b><span>${esc(c.examples[lang])}</span></li>`).join('');
}

export function renderBoard(daily, weekday, lang) {
  const dishes = daily[weekday];
  if (!dishes || !dishes.length) return `<p class="note">${esc(DAILY_SPECIAL[lang])}</p>`;
  return `<p class="board-h">${esc(tx('home.dom.today', lang))}</p>`
    + `<ul class="board-list">${dishes.map(d => `<li>${esc(d[lang])}</li>`).join('')}</ul>`;
}

export function renderHours(hours, today, lang) {
  return WEEK_FROM_MONDAY.map(d => {
    const h = hours[d];
    let label = DAY_NAMES[lang][d];
    if (d === 5) label += ` · ${tx('visit.livemusic', lang)}`;
    if (d === today) label = `${tx('visit.today', lang)} · ${label}`;
    const time = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : tx('visit.closed', lang);
    return `<tr${d === today ? ' class="today" aria-current="date"' : ''}><th scope="row">${esc(label)}</th><td>${esc(time)}</td></tr>`;
  }).join('');
}

export function renderStatus(st, lang) {
  if (st.open && st.soon) return { cls: 'is-soon', text: `${tx('now.soon', lang)} · ${tx('now.closesat', lang)} ${fmtTime(st.closesAt)}` };
  if (st.open) return { cls: 'is-open', text: `${tx('now.open', lang)} · ${tx('now.until', lang)} ${fmtTime(st.closesAt)}` };
  const when = st.opensDay === st.day ? tx('now.today', lang)
    : st.opensDay === (st.day + 1) % 7 ? tx('now.tomorrow', lang)
    : `${DAY_NAMES[lang][st.opensDay]} ${tx('now.at', lang)}`;
  return { cls: 'is-closed', text: `${tx('now.closed', lang)} · ${tx('now.opens', lang)} ${when} ${fmtTime(st.opensAt)}` };
}

/** Estado con la primera parte en negrita: «<b>Abierto ahora</b> · hasta las 11:30 pm · 507 N Miami Ave». */
export function statusHTML(st, lang, suffix = '') {
  const { cls, text } = renderStatus(st, lang);
  const [head, ...rest] = text.split(' · ');
  if (suffix) rest.push(suffix);
  return { cls, html: `<b>${esc(head)}</b>${rest.map(p => ` · ${esc(p)}`).join('')}` };
}

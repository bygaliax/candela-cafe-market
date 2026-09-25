// Secciones dinámicas de la portada «Un día en Candela». Funciones PURAS: devuelven HTML
// en texto (testeadas en tests/sections.test.mjs). Todo dato pasa por esc().
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
      + `<span class="fav-ph"><img src="${src}-480.webp" srcset="${src}-480.webp 480w, ${src}-960.webp 960w" sizes="(max-width:768px) 45vw, 280px" alt="${esc(item.name)}" loading="lazy" width="480" height="${Number(f.h)}"></span>`
      + `<span class="fav-n">${esc(item.name)}</span>`
      + `<span class="fav-d">${esc(item.desc ? item.desc[lang] : '')}</span>`
      + `<span class="fav-p">$${item.price.toFixed(2)}</span></a>`;
  }).join('');
}

export function renderMarket(cats, lang) {
  return cats.map(c => `<figure class="tile"><img src="assets/img/${esc(c.img)}-480.webp" alt="" loading="lazy" width="480" height="${Number(c.h)}">`
    + `<figcaption><b>${esc(c.name[lang])}</b><span>${esc(c.examples[lang])}</span></figcaption></figure>`).join('');
}

export function renderArches(list, lang) {
  return list.map(a => {
    const to = a.to === 'close' ? tx('nightmenu.close', lang) : fmtTime(a.to);
    return `<article class="arch arch--${esc(a.id)}"><h3>${esc(a.title)}</h3>`
      + `<p class="arch-hrs">${esc(fmtTime(a.from))} – ${esc(to)}</p>`
      + `<ul>${a.items.map(i => `<li>${esc(i[lang])}</li>`).join('')}</ul></article>`;
  }).join('');
}

export function renderBoard(daily, weekday, lang) {
  const dishes = daily[weekday];
  if (!dishes || !dishes.length) return `<p class="board-special">${esc(DAILY_SPECIAL[lang])}</p>`;
  return `<ul>${dishes.map(d => `<li>${esc(d[lang])}</li>`).join('')}</ul>`;
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

/** Sello de estrella (starburst) de 22 puntas, como los stickers de Frank's. */
export function burstSvg(color) {
  const n = 22, R = 100, r = 88, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI * i / n, rad = i % 2 ? r : R;
    pts.push(`${(100 + rad * Math.cos(a)).toFixed(1)},${(100 + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><polygon points="${pts.join(' ')}" fill="${esc(color)}"/>`
    + '<circle cx="100" cy="100" r="74" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 6"/></svg>';
}

// Portada en blanco, al estilo del menú (2026-09-25). Spec: docs/superpowers/specs/2026-09-25-candela-portada-blanca-design.md
import { initLangToggle, t, getLang } from './i18n.js';
import { PHONE } from './menu-data.js';
import { MARKET_CATEGORIES } from './market-data.js';
import { ADDRESS, HOURS, FAVORITES, DAILY_MENU, GOOGLE } from './site-data.js';
import { statusAt } from './status.js';
import { renderFavorites, renderMarketList, renderBoard, renderHours, statusHTML } from './sections.js';
import { waUrl, buildReservationUrl } from './cart-core.js';
import { initNav } from './nav.js';
import { trapFocus } from './focus-trap.js';

initLangToggle();
initNav();
const $ = id => document.getElementById(id);

/* ── estado del local, horario y mesa caliente (hora de Miami) ──
   Solo se escribe si cambia: #heroStatus es una región viva y reescribirla la vuelve a anunciar. */
const last = new Map();
const setHTML = (el, html) => { if (last.get(el) !== html) { el.innerHTML = html; last.set(el, html); } };
function updateNow() {
  const lang = getLang();
  const st = statusAt(new Date(), HOURS);
  const { cls, html } = statusHTML(st, lang, ADDRESS.street);
  const box = $('heroStatus');
  if (!box.classList.contains(cls)) { box.classList.remove('is-open', 'is-soon', 'is-closed'); box.classList.add(cls); }
  setHTML($('heroStatusText'), html);
  setHTML($('hoursBody'), renderHours(HOURS, st.day, lang));
  setHTML($('board'), renderBoard(DAILY_MENU, st.day, lang));
}

/* ── lo que cambia con el idioma ── */
function renderAll() {
  const lang = getLang();
  $('favs').innerHTML = renderFavorites(FAVORITES, lang);
  $('shopList').innerHTML = renderMarketList(MARKET_CATEGORIES, lang);
  $('domWa').href = waUrl(PHONE, t('wa.greeting'));
  $('marketAsk').href = waUrl(PHONE, t('home.market.askmsg'));
  $('visitWa').href = waUrl(PHONE, t('wa.hello'));
  updateNow();
}
renderAll();
document.addEventListener('langchange', renderAll);
setInterval(() => { if (!document.hidden) updateNow(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateNow(); });

/* ── Google: el dato vive en site-data.js ── */
$('gRating').textContent = String(GOOGLE.rating);
$('gReviews').textContent = String(GOOGLE.count);
$('gRead').href = GOOGLE.url;
$('gWrite').href = GOOGLE.reviewUrl;

/* ── anclas al llegar desde la carta (index.html#visit) ──
   Chrome corta el scroll al fragmento mientras la página carga y cambia de alto;
   se re-ancla sin animación en cada punto de carga, salvo que el usuario ya se haya movido. */
let userMoved = false;
['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { userMoved = true; }, { once: true, passive: true }));
function reanchor() {
  if (userMoved || !location.hash) return;
  let target = null;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; } // hash mal codificado
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
}
reanchor();
addEventListener('load', () => { reanchor(); setTimeout(reanchor, 300); });
if (document.fonts) document.fonts.ready.then(reanchor);

/* ── barra fija del móvil: sale cuando los botones de la portada se van y se esconde en Visítanos ── */
const mbar = $('mbar');
const seen = { ctas: true, visit: false };
const syncBar = () => mbar.classList.toggle('is-shown', !seen.ctas && !seen.visit);
new IntersectionObserver(([e]) => { seen.ctas = e.isIntersecting; syncBar(); }).observe($('heroCtas'));
new IntersectionObserver(([e]) => { seen.visit = e.isIntersecting; syncBar(); }, { threshold: 0.15 }).observe($('visit'));

/* ── modal de reserva → WhatsApp ── */
const modal = $('resModal'), dsel = $('resDate');
function fillFridays() {
  dsel.innerHTML = '';
  const d = new Date(); let n = 0;
  while (n < 6) {
    if (d.getDay() === 5) {
      const o = document.createElement('option');
      o.textContent = d.toLocaleDateString(getLang() === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short' });
      dsel.appendChild(o); n++;
    }
    d.setDate(d.getDate() + 1);
  }
}
fillFridays();
document.addEventListener('langchange', fillFridays);
let guests = 2;
$('gPlus').addEventListener('click', () => { if (guests < 12) $('gCount').textContent = ++guests; });
$('gMinus').addEventListener('click', () => { if (guests > 1) $('gCount').textContent = --guests; });
let lastFocus = null, release = null;
const openRes = () => {
  lastFocus = document.activeElement;
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('menu-open');
  release = trapFocus(modal); $('resName').focus();
};
const closeRes = () => {
  modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('menu-open');
  if (release) release(); release = null;
  if (lastFocus) lastFocus.focus();
};
document.querySelectorAll('[data-open-res]').forEach(b => b.addEventListener('click', openRes));
modal.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeRes));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeRes(); });
$('resGo').addEventListener('click', () => {
  const data = { name: $('resName').value.trim(), phone: $('resPhone').value.trim(), day: dsel.value, time: $('resTime').value, guests };
  window.open(buildReservationUrl(data, PHONE, getLang()), '_blank', 'noopener');
});

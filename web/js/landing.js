// Portada «Un día en Candela» (2026-09). Spec: docs/superpowers/specs/2026-09-24-candela-un-dia-design.md
import { initLangToggle, t, getLang } from './i18n.js';
import { PHONE } from './menu-data.js';
import { MARKET_CATEGORIES } from './market-data.js';
import { HOURS, DAYPARTS, FAVORITES, DAILY_MENU, DAY_NIGHT, GOOGLE } from './site-data.js';
import { statusAt } from './status.js';
import { renderFavorites, renderMarket, renderArches, renderBoard, renderHours, renderStatus, burstSvg } from './sections.js';
import { buildReservationUrl, waUrl } from './cart-core.js';
import { initNav } from './nav.js';
import { trapFocus } from './focus-trap.js';
import { initHero } from './hero.js';

initLangToggle();
initNav();
const $ = id => document.getElementById(id);

/* ── «Ahora en Candela», horario y mesa caliente (hora de Miami) ── */
function updateNow() {
  const lang = getLang();
  const st = statusAt(new Date(), HOURS, DAYPARTS);
  const { cls, text } = renderStatus(st, lang);
  const bar = $('now');
  bar.classList.remove('is-open', 'is-soon', 'is-closed');
  bar.classList.add(cls);
  $('nowState').textContent = text;
  $('hoursBody').innerHTML = renderHours(HOURS, st.day, lang);
  $('board').innerHTML = renderBoard(DAILY_MENU, st.day, lang);
}

/* ── contenido que cambia con el idioma ───────────────────── */
function renderAll() {
  const lang = getLang();
  $('favs').innerHTML = renderFavorites(FAVORITES, lang);
  $('shelf').innerHTML = renderMarket(MARKET_CATEGORIES, lang);
  $('cartas').innerHTML = renderArches(DAY_NIGHT, lang);
  $('middayWa').href = waUrl(PHONE, t('wa.greeting'));
  $('marketAsk').href = waUrl(PHONE, t('day.market.askmsg'));
  $('visitWa').href = waUrl(PHONE, t('wa.hello'));
  updateNow();
}
renderAll();
document.addEventListener('langchange', renderAll);
setInterval(() => { if (!document.hidden) updateNow(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateNow(); });

/* ── Google: el dato vive en site-data.js ─────────────────── */
$('gRating').textContent = String(GOOGLE.rating);
$('gReviews').textContent = String(GOOGLE.count);
$('gRead').href = GOOGLE.url;
$('gWrite').href = GOOGLE.reviewUrl;

/* ── sellos de estrella ───────────────────────────────────── */
document.querySelectorAll('[data-burst]').forEach(el => el.insertAdjacentHTML('afterbegin', burstSvg(el.dataset.burst)));

/* ── barra fija del móvil: se esconde al llegar a Visítanos ─ */
const mbar = $('mbar');
new IntersectionObserver(([e]) => mbar.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.15 }).observe($('visit'));

/* ── neón: parpadea una vez al aparecer ───────────────────── */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('flicker');
    io.unobserve(e.target);
  }), { threshold: 0.5 });
  document.querySelectorAll('.neon-big').forEach(el => io.observe(el));
}

/* ── modal de reserva → WhatsApp ──────────────────────────── */
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
  release = trapFocus(modal); $('resName').focus();
};
const closeRes = () => {
  modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
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

/* ── hero + entradas al hacer scroll (GSAP es deferred) ───── */
addEventListener('DOMContentLoaded', () => {
  initHero();
  const reveals = document.querySelectorAll('.reveal');
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  reveals.forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
});

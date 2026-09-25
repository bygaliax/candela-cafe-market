// Carta «Carta de papel» (2026-09). Spec: docs/superpowers/specs/2026-09-24-candela-menu-design.md
// El HTML lo pinta menu-render.js (puro, testeado); aquí solo se conecta el DOM.
import { MENU, CATEGORIES, PARTS } from './menu-data.js';
import { initLangToggle, getLang } from './i18n.js';
import { cart, refresh, initCartUI, syncFromStorage } from './cart.js';
import { initNav } from './nav.js';
import { renderMenu, renderChips } from './menu-render.js';

initLangToggle();
initNav();

const $ = id => document.getElementById(id);
const chips = $('chips'), main = $('menuMain');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* ── alto de nav + chips: anclas y foco quedan justo debajo (scroll-padding-top en menu.css) ── */
const setMenuTop = () => document.documentElement.style.setProperty('--menu-top', `${$('nav').offsetHeight + chips.offsetHeight}px`);
const sizes = new ResizeObserver(setMenuTop); // la nav cambia de alto cuando carga la fuente del logo
sizes.observe(chips);
sizes.observe($('nav'));

/* ── chip activo: la categoría que cruza el 30 % de la pantalla ── */
let pausedUntil = 0;
function setActive(id) {
  let on = null;
  chips.querySelectorAll('.chip').forEach(ch => {
    const is = ch.dataset.cat === id;
    ch.classList.toggle('active', is);
    if (is) { ch.setAttribute('aria-current', 'true'); on = ch; } else ch.removeAttribute('aria-current');
  });
  if (on && chips.scrollWidth > chips.clientWidth) {
    chips.scrollTo({ left: on.offsetLeft - (chips.clientWidth - on.offsetWidth) / 2, behavior: reduce.matches ? 'auto' : 'smooth' });
  }
}
function syncActive() {
  const line = innerHeight * 0.3;
  const visible = [...main.querySelectorAll('.cat:not([hidden])')];
  const cur = visible.find(s => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > line; });
  setActive((cur || visible[0] || {}).id);
}
let spy = null;
function initSpy() {
  if (spy) spy.disconnect();
  spy = new IntersectionObserver(entries => {
    if (Date.now() < pausedUntil) return;
    const hit = entries.find(en => en.isIntersecting);
    if (hit) setActive(hit.target.id);
  }, { rootMargin: '-30% 0px -69% 0px' });
  main.querySelectorAll('.cat').forEach(s => spy.observe(s));
}
// Al tocar un chip, el spy calla hasta que acaba el scroll suave; si no, el chip parpadea entre categorías.
chips.addEventListener('click', e => {
  const ch = e.target.closest('.chip');
  if (!ch) return;
  setActive(ch.dataset.cat);
  pausedUntil = Date.now() + 1500;
  addEventListener('scrollend', () => { pausedUntil = Date.now() + 150; }, { once: true });
});

/* ── pintar (y repintar al cambiar de idioma) ─────────────── */
function render() {
  const lang = getLang();
  chips.innerHTML = renderChips(CATEGORIES, PARTS, lang);
  main.innerHTML = renderMenu(CATEGORIES, MENU, PARTS, lang);
  initSpy();
  syncActive();
}
render();
document.addEventListener('langchange', render);

/* ── menu.html#categoría o #plato ─────────────────────────────
   La carta se pinta con JS y Chrome corta el scroll al fragmento mientras la página cambia de alto:
   se re-ancla sin animación en cada punto de carga, salvo que el usuario ya se haya movido. */
let userMoved = false, marked = false;
['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { userMoved = true; }, { once: true, passive: true }));
function reanchor() {
  if (userMoved || !location.hash) return;
  let el = null;
  try { el = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; } // hash mal codificado
  if (!el || !main.contains(el)) return;
  el.scrollIntoView({ behavior: 'instant', block: 'start' });
  syncActive();
  if (el.dataset.id && !marked) { // es un plato: se marca un momento
    marked = true;
    el.classList.add('is-target');
    setTimeout(() => el.classList.remove('is-target'), 2500);
  }
}
setMenuTop();
reanchor();
addEventListener('load', () => { reanchor(); setTimeout(reanchor, 300); });
if (document.fonts) document.fonts.ready.then(reanchor);

/* ── «+» → carrito ───────────────────────────────────────── */
main.addEventListener('click', e => {
  const btn = e.target.closest('.it-add');
  if (!btn) return;
  const item = (MENU[btn.closest('.cat').id] || []).find(i => i.id === btn.closest('[data-id]').dataset.id);
  if (!item || item.price <= 0) return;
  syncFromStorage();
  cart.add(item);
  if (!reduce.matches) btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 240);
  refresh();
});

initCartUI();

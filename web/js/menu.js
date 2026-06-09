import { MENU, CATEGORIES } from './menu-data.js';
import { initLangToggle, t, getLang } from './i18n.js';
import { cart, refresh, initCartUI } from './cart.js';

initLangToggle();

/* navbar (compartida con la landing) */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});

const chips = document.getElementById('chips');
const main  = document.getElementById('menuMain');

/** Escape HTML special chars — defense-in-depth for static data rendered via innerHTML. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* scroll-spy de chips (re-creado en cada render) */
let spy = null;
function initSpy() {
  if (spy) spy.disconnect();
  spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      document.querySelectorAll('.chip').forEach(ch =>
        ch.classList.toggle('active', ch.dataset.cat === en.target.id));
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  document.querySelectorAll('.cat-title').forEach(h => spy.observe(h));
}

function render() {
  const lang = getLang();

  // All values come from the static MENU/CATEGORIES bundle — not user input.
  // Every interpolated string is passed through esc() for defense-in-depth.
  chips.innerHTML = CATEGORIES.map(c =>
    `<a class="chip" href="#${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.label[lang])}</a>`
  ).join('');

  // Same static-data guarantee applies to main.innerHTML below.
  main.innerHTML = CATEGORIES.map(c => `
    <h2 class="cat-title" id="${esc(c.id)}">${esc(c.label[lang])}</h2>
    ${MENU[c.id].map(it => `
      <div class="menu-item${it.img ? ' has-img' : ''}" data-id="${esc(it.id)}" data-cat="${esc(c.id)}">
        ${it.img ? `<img src="assets/img/${esc(it.img)}-480.webp" alt="${esc(it.name)}" loading="lazy" width="84" height="84">` : ''}
        <span class="mi-name">${esc(it.name)}</span>${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ''}
        ${it.price > 0
          ? `<span class="mi-price">$${it.price.toFixed(2)}</span>
             <button class="mi-add" aria-label="Add ${esc(it.name)}">+</button>`
          : `<span class="mi-ask">${esc(t('cart.ask'))}</span><span></span>`}
        ${it.desc ? `<span class="mi-desc">${esc(it.desc[lang])}</span>` : ''}
      </div>`).join('')}`
  ).join('');

  initSpy();
}
render();
document.addEventListener('langchange', render);

main.addEventListener('click', e => {
  const btn = e.target.closest('.mi-add');
  if (!btn) return;
  const el  = btn.closest('.menu-item');
  const item = MENU[el.dataset.cat].find(i => i.id === el.dataset.id);
  if (!item || item.price <= 0) return;
  cart.add(item);
  btn.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
    240
  );
  refresh();
});

initCartUI();

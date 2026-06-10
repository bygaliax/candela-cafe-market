import { initLangToggle, t, getLang } from './i18n.js';
import { MENU, CATEGORIES, PHONE } from './menu-data.js';
import { MARKET } from './market-data.js';
import { buildReservationUrl } from './cart-core.js';
import { cart, refresh, initCartUI } from './cart.js';

initLangToggle();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const WA = msg => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

/* ── navbar scroll + burger ───────────────────────────────── */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
const burger = document.getElementById('burger'), navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => { const o = navLinks.classList.toggle('open'); burger.setAttribute('aria-expanded', String(o)); });
navLinks.addEventListener('click', e => { if (e.target.closest('a')) { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });

/* ── hero carousel: cross-fade cada 2s ────────────────────── */
const HERO_SLUGS = ['hero-sandwich', 'pastrami', 'breakfast-platter', 'food-1', 'local-interior'];
const heroC = document.getElementById('heroCarousel');
if (heroC) {
  heroC.innerHTML = HERO_SLUGS.map((s, i) =>
    `<img class="slide${i === 0 ? ' active' : ''}" src="assets/img/${s}-960.webp" srcset="assets/img/${s}-480.webp 480w, assets/img/${s}-960.webp 960w" sizes="430px" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`
  ).join('');
  const sl = heroC.querySelectorAll('.slide');
  if (sl.length > 1) { let i = 0; setInterval(() => { sl[i].classList.remove('active'); i = (i + 1) % sl.length; sl[i].classList.add('active'); }, 2000); }
}

/* ── menú: chips de categoría que cambian el contenido ────── */
const chipsEl = document.getElementById('menuChips'), dishesEl = document.getElementById('menuDishes');
function dishCard(it, lang) {
  const price = it.price > 0 ? `$${it.price.toFixed(2)}` : esc(t('market.instore'));
  const media = it.img ? `<div class="dish-img"><img src="assets/img/${esc(it.img)}-480.webp" alt="${esc(it.name)}" loading="lazy" width="480" height="360"></div>` : '';
  return `<article class="dish${it.img ? '' : ' dish--text'}">${media}<div class="dish-body"><h3>${esc(it.name)}</h3>${it.desc ? `<p>${esc(it.desc[lang])}</p>` : '<p></p>'}<div class="dish-foot"><span class="price">${price}</span><a class="add" href="menu.html">${esc(t('market.add'))} +</a></div></div></article>`;
}
function renderDishes(catId) { const lang = getLang(); dishesEl.innerHTML = MENU[catId].slice(0, 6).map(it => dishCard(it, lang)).join(''); }
function renderChips() {
  const lang = getLang();
  chipsEl.innerHTML = CATEGORIES.map((c, i) => `<button class="chip${i === 6 ? ' active' : ''}" data-cat="${esc(c.id)}">${esc(c.label[lang])}</button>`).join('');
  chipsEl.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    chipsEl.querySelectorAll('.chip').forEach(x => x.classList.remove('active')); ch.classList.add('active'); renderDishes(ch.dataset.cat);
  }));
}
function renderMenu() { if (!chipsEl) return; renderChips(); renderDishes(CATEGORIES[6].id); }
renderMenu();
document.addEventListener('langchange', renderMenu);

/* ── market e-commerce (Agregar → WhatsApp con el producto) ─ */
const shopEl = document.getElementById('marketShop');
function renderMarket() {
  if (!shopEl) return;
  const lang = getLang();
  shopEl.innerHTML = MARKET.map(p => {
    const price = p.price > 0 ? `$${p.price.toFixed(2)}` : esc(t('market.instore'));
    const media = p.img ? `<div class="p-img"><img src="assets/img/${esc(p.img)}-480.webp" alt="${esc(p.name)}" loading="lazy" width="480" height="480"></div>` : '';
    return `<article class="product">${media}<div class="p-body"><span class="p-cat">${esc(p.cat[lang])}</span><h3>${esc(p.name)}</h3><div class="p-foot"><span class="p-price">${price}</span><button class="p-add" data-id="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${p.price}">${esc(t('market.add'))} +</button></div></div></article>`;
  }).join('');
  shopEl.querySelectorAll('.p-add').forEach(b => b.addEventListener('click', () => {
    cart.add({ id: b.dataset.id, name: b.dataset.name, price: +b.dataset.price });
    refresh();
    b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 240);
  }));
}
renderMarket();
document.addEventListener('langchange', renderMarket);
initCartUI();

/* ── timeline: relleno de la espina según scroll ──────────── */
const tl = document.getElementById('timeline'), fill = document.getElementById('spineFill');
if (tl && fill) {
  const onScroll = () => { const r = tl.getBoundingClientRect(); const passed = Math.min(Math.max(innerHeight * 0.55 - r.top, 0), r.height); fill.style.height = (passed / r.height * 100) + '%'; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

/* ── Swiper "cards" de Live Music ─────────────────────────── */
const LIVE = [
  { slug: 'local-interior', h: 'Live music', p: 'Friday · 8pm' },
  { slug: 'gal-3', h: 'Tapas & wine', p: 'Friday' },
  { slug: 'gal-4', h: 'The vibe', p: 'Downtown Miami' },
  { slug: 'food-1', h: 'Live kitchen', p: 'Sazón & candela' },
];
const liveSlides = document.getElementById('liveSlides');
if (liveSlides) liveSlides.innerHTML = LIVE.map(s => `<div class="swiper-slide"><div class="lcard"><img src="assets/img/${s.slug}-480.webp" alt=""><div class="lcap"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></div></div>`).join('');

/* ── animación (espera a GSAP/Swiper deferred) ────────────── */
addEventListener('DOMContentLoaded', () => {
  if (window.Swiper && liveSlides) {
    new Swiper('.live-swiper', { effect: 'cards', grabCursor: true, rewind: true, autoplay: { delay: 2600, disableOnInteraction: false }, pagination: { el: '.live-swiper .swiper-pagination', clickable: true } });
  }
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal,.ms').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-copy > *', { y: 34, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out' });
  document.querySelectorAll('.reveal:not(.ms)').forEach(el =>
    gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%', once: true } }));
  document.querySelectorAll('.ms').forEach(el => {
    const x = el.classList.contains('ms--r') ? 40 : -40;
    gsap.fromTo(el, { opacity: 0, x }, { opacity: 1, x: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
  });
});

/* ── modal de reserva → WhatsApp ──────────────────────────── */
const modal = document.getElementById('resModal');
if (modal) {
  const dsel = document.getElementById('resDate');
  function fillFridays() {
    dsel.innerHTML = ''; const d = new Date(); let n = 0;
    while (n < 6) { if (d.getDay() === 5) { const o = document.createElement('option'); o.textContent = d.toLocaleDateString(getLang() === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short' }); dsel.appendChild(o); n++; } d.setDate(d.getDate() + 1); }
  }
  fillFridays(); document.addEventListener('langchange', fillFridays);
  let g = 2; const gc = document.getElementById('gCount');
  document.getElementById('gPlus').onclick = () => { if (g < 12) { g++; gc.textContent = g; } };
  document.getElementById('gMinus').onclick = () => { if (g > 1) { g--; gc.textContent = g; } };
  let lastFocus = null;
  const open = () => { lastFocus = document.activeElement; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.getElementById('resName').focus(); };
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); if (lastFocus) lastFocus.focus(); };
  document.getElementById('openRes').onclick = open;
  modal.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  document.getElementById('resGo').onclick = () => {
    const data = { name: document.getElementById('resName').value.trim(), phone: document.getElementById('resPhone').value.trim(), day: dsel.value, time: document.getElementById('resTime').value, guests: g };
    window.open(buildReservationUrl(data, PHONE, t('res.greeting')), '_blank');
  };
}

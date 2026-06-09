import { initLangToggle, t, getLang } from './i18n.js';
import { MENU, FEATURED, PHONE, DAILY_SPECIAL } from './menu-data.js';

initLangToggle();

/* navbar scroll state + burger */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });

const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
navLinks.addEventListener('click', e => {        // cerrar al navegar (móvil)
  if (e.target.closest('a')) { navLinks.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
});

/* daily special + CTAs WhatsApp (re-render al cambiar idioma) */
function renderLangBits() {
  document.getElementById('dailySpecial').textContent = DAILY_SPECIAL[getLang()];
  document.getElementById('musicWa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t('music.wa'))}`;
  document.getElementById('cateringWa').href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t('catering.wa'))}`;
}
renderLangBits();
document.addEventListener('langchange', renderLangBits);

/* teaser de platos estrella */
const grid = document.getElementById('teaserGrid');
function renderTeaser() {
  const lang = getLang();
  grid.innerHTML = FEATURED.map(([cat, id]) => {
    const it = MENU[cat].find(i => i.id === id);
    const img = it.img ? `<img src="assets/img/${it.img}-480.webp" alt="${it.name}" loading="lazy" width="480" height="360">` : '';
    return `<article class="dish-card">${img}<div class="dc-body">
      <span class="dc-name">${it.name}</span>
      ${it.desc ? `<span class="dc-desc">${it.desc[lang]}</span>` : ''}
      <span class="dc-price">$${it.price.toFixed(2)}</span></div></article>`;
  }).join('');
}
renderTeaser();
document.addEventListener('langchange', renderTeaser);

/* GSAP: hero, reveals (from → no oculta nada sin JS), marquee, parallax */
addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-content > *', { y: 36, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' });

  document.querySelectorAll('.reveal').forEach(el => {
    gsap.from(el, { opacity: 0, y: 28, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });

  const track = document.getElementById('marqueeTrack');
  track.innerHTML += track.innerHTML;                       // duplicar para loop continuo
  gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });

  gsap.to('.hero-img img', { yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
});

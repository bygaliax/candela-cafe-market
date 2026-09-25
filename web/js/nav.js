// Barra compartida (portada y carta): enlaces, idioma y menú de la hamburguesa en papel.
import { getLang, t } from './i18n.js';
import { HOURS } from './site-data.js';
import { statusAt } from './status.js';
import { statusHTML } from './sections.js';
import { PHONE } from './menu-data.js';
import { waUrl } from './cart-core.js';
import { trapFocus } from './focus-trap.js';

export function initNav() {
  const $ = id => document.getElementById(id);
  const burger = $('burger'), menu = $('navMenu'), close = $('navClose'), status = $('navStatus'), wa = $('navWa');
  let release = null;
  // El estado del menú es texto normal (no región viva): el de la portada ya se anuncia.
  const paint = () => {
    const { cls, html } = statusHTML(statusAt(new Date(), HOURS), getLang());
    status.classList.remove('is-open', 'is-soon', 'is-closed');
    status.classList.add(cls);
    status.querySelector('span').innerHTML = html;
    wa.href = waUrl(PHONE, t('wa.hello'));
  };
  const set = open => {
    if (open === !menu.hidden) return;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { paint(); release = trapFocus(menu); close.focus(); }
    else { if (release) release(); release = null; burger.focus(); }
  };
  burger.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) set(false); });
  matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) set(false); });
  document.addEventListener('langchange', () => { if (!menu.hidden) paint(); });
}

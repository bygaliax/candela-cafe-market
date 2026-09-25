// Barra de navegación compartida (portada y menú).
export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const set = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', () => set(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) { set(false); burger.focus(); }
  });
}

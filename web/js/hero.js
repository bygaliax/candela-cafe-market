// Hero (diseño aprobado el 2026-06-10): entrada del texto, flotación, plato giratorio,
// parallax y chispas. Movido desde landing.js; los arreglos (#13 #21) llegan en la Task 6.
export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  sparks(hero);
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from('.hero-copy > *', { y: 34, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out' });
  [['.dec-chips', 12, 3.6], ['.dec-leaf-a', 10, 2.8], ['.dec-leaf-b', 9, 3.2]].forEach(([sel, amp, dur]) =>
    gsap.to(sel, { y: -amp, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  gsap.to('#platterDisc', { rotation: 360, duration: 48, repeat: -1, ease: 'none' });
  parallax(hero);
}

function parallax(hero) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const movers = [
    ['.dec-chips', 26, 0], ['.dec-leaf-a', 30, 0], ['.dec-leaf-b', 22, 0],
    ['.dec-drink', 16, 10], ['.dec-ringburger', 18, 12], ['.dec-burger', 16, 10],
  ].map(([sel, fx, fy]) => {
    const el = document.querySelector(sel);
    return el && { fx, fy, x: gsap.quickTo(el, 'x', { duration: .7, ease: 'power2.out' }), y: fy ? gsap.quickTo(el, 'y', { duration: .7, ease: 'power2.out' }) : null };
  }).filter(Boolean);
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    movers.forEach(m => { m.x(nx * m.fx); if (m.y) m.y(ny * m.fy); });
  }, { passive: true });
  hero.addEventListener('mouseleave', () => movers.forEach(m => { m.x(0); if (m.y) m.y(0); }), { passive: true });
}

function sparks(hero) {
  const cv = document.getElementById('heroSparks');
  if (!cv || !matchMedia('(hover: hover) and (pointer: fine)').matches
    || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = cv.getContext('2d');
  let W, H;
  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit(); addEventListener('resize', fit, { passive: true });
  const P = [], COLORS = ['255,155,64', '255,90,60', '255,210,122'];
  let lx = -1, ly = -1, raf = 0, visible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }).observe(hero);
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (lx < 0 || Math.hypot(x - lx, y - ly) > 13) {
      lx = x; ly = y;
      for (let i = 0; i < 2 && P.length < 90; i++) P.push({
        x, y, vx: (Math.random() - .5) * 1.1, vy: -.4 - Math.random() * 1.1,
        r: 1.2 + Math.random() * 2.2, a: 1, d: .012 + Math.random() * .02, c: COLORS[Math.random() * 3 | 0],
      });
    }
  }, { passive: true });
  document.querySelectorAll('.hbtn').forEach(btn => {
    let iv = 0;
    btn.addEventListener('mouseenter', () => {
      iv = setInterval(() => {
        if (P.length >= 90) return;
        const br = btn.getBoundingClientRect(), hr = hero.getBoundingClientRect();
        P.push({
          x: br.left - hr.left + 6 + Math.random() * (br.width - 12), y: br.top - hr.top + 2,
          vx: (Math.random() - .5) * .7, vy: -.5 - Math.random() * .8,
          r: .8 + Math.random() * 1.3, a: 1, d: .022 + Math.random() * .025, c: COLORS[Math.random() * 3 | 0],
        });
      }, 150);
    });
    btn.addEventListener('mouseleave', () => clearInterval(iv));
  });
  function tick() {
    raf = 0; ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.x += p.vx; p.y += p.vy; p.vy -= .008; p.vx += (Math.random() - .5) * .08; p.a -= p.d;
      if (p.a <= 0) { P.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 7); ctx.fill();
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

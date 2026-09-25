import { createCart, buildWaUrl } from './cart-core.js';
import { t } from './i18n.js';
import { PHONE, MENU } from './menu-data.js';
import { trapFocus } from './focus-trap.js';

const LS = 'candela-cart';
const read = () => { try { return localStorage.getItem(LS); } catch { return null; } };
const lookup = id => { for (const items of Object.values(MENU)) { const it = items.find(i => i.id === id); if (it) return it; } return null; };
export const cart = createCart(read());
cart.revalidate(lookup);

/** Relee lo guardado (otra pestaña o volver atrás) antes de tocar el carrito (#5). */
export function syncFromStorage() { cart.load(read()); cart.revalidate(lookup); }

const fab = document.getElementById('cartFab');
const sheet = document.getElementById('cartSheet');
const overlay = document.getElementById('overlay');

export function refresh() {
  try { localStorage.setItem(LS, cart.serialize()); } catch { /* private mode */ }
  render();
}

function render() {
  const focused = document.activeElement && document.activeElement.closest('#sheetBody button[data-d]');
  const keep = focused ? { id: focused.closest('.qty').dataset.id, d: focused.dataset.d } : null;
  const n = cart.count();
  fab.hidden = n === 0 && !sheet.classList.contains('open');
  document.getElementById('fabCount').textContent = n;
  document.getElementById('fabTotal').textContent = `$${cart.total().toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${cart.total().toFixed(2)}`;

  const body = document.getElementById('sheetBody');
  body.innerHTML = '';
  if (n === 0) {
    const p = document.createElement('p');
    p.className = 'cart-empty';
    p.textContent = t('cart.empty');
    body.appendChild(p);
  } else {
    cart.lines().forEach(l => {
      const row = document.createElement('div');
      row.className = 'sheet-line';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'mi-name';
      nameSpan.textContent = l.name;

      const qtySpan = document.createElement('span');
      qtySpan.className = 'qty';
      qtySpan.dataset.id = l.id;

      const btnMinus = document.createElement('button');
      btnMinus.dataset.d = '-1';
      btnMinus.setAttribute('aria-label', `${t('cart.less')} · ${l.name}`);
      btnMinus.textContent = '−';

      const qtyNum = document.createElement('b');
      qtyNum.textContent = l.qty;

      const btnPlus = document.createElement('button');
      btnPlus.dataset.d = '1';
      btnPlus.setAttribute('aria-label', `${t('cart.more')} · ${l.name}`);
      btnPlus.textContent = '+';

      qtySpan.append(btnMinus, qtyNum, btnPlus);

      const priceSpan = document.createElement('span');
      priceSpan.className = 'mi-price';
      priceSpan.textContent = `$${(l.price * l.qty).toFixed(2)}`;

      row.append(nameSpan, qtySpan, priceSpan);
      body.appendChild(row);
    });
  }

  const wa = document.getElementById('waSend');
  wa.setAttribute('aria-disabled', String(n === 0));
  wa.href = n === 0 ? '#' : buildWaUrl(cart, PHONE, t('wa.greeting'));

  // Tras rehacer el DOM, el foco vuelve al mismo botón (o a «cerrar» si la línea desapareció) (#16).
  if (keep) {
    const again = body.querySelector(`.qty[data-id="${CSS.escape(keep.id)}"] button[data-d="${keep.d}"]`);
    (again || document.getElementById('cartClose')).focus();
  }
}

export function initCartUI() {
  let release = null;
  const close = () => {
    sheet.classList.remove('open'); overlay.hidden = true;
    if (release) release(); release = null;
    refresh();
    (fab.hidden ? document.getElementById('menuTitle') : fab).focus();
  };
  fab.addEventListener('click', () => {
    syncFromStorage();
    sheet.classList.add('open'); overlay.hidden = false; refresh();
    release = trapFocus(sheet);
    document.getElementById('cartClose').focus();
  });
  document.getElementById('cartClose').addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet.classList.contains('open')) close();
  });
  document.getElementById('waSend').addEventListener('click', e => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') e.preventDefault();
  });
  document.getElementById('sheetBody').addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b) return;
    syncFromStorage();
    const id = b.closest('.qty').dataset.id;
    const line = cart.lines().find(l => l.id === id);
    if (line) cart.setQty(id, line.qty + Number(b.dataset.d));
    refresh();
  });
  addEventListener('pageshow', e => { if (e.persisted) { syncFromStorage(); render(); } });
  addEventListener('storage', e => { if (e.key === LS) { syncFromStorage(); render(); } });
  document.addEventListener('langchange', render);
  refresh();
}

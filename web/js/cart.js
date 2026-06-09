import { createCart, buildWaUrl } from './cart-core.js';
import { t } from './i18n.js';
import { PHONE } from './menu-data.js';

const LS = 'candela-cart';
let stored = null;
try { stored = localStorage.getItem(LS); } catch { /* private mode */ }
export const cart = createCart(stored);

const fab = document.getElementById('cartFab');
const sheet = document.getElementById('cartSheet');
const overlay = document.getElementById('overlay');

export function refresh() {
  try { localStorage.setItem(LS, cart.serialize()); } catch { /* private mode */ }
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
      btnMinus.setAttribute('aria-label', t('cart.less'));
      btnMinus.textContent = '−';

      const qtyNum = document.createElement('b');
      qtyNum.textContent = l.qty;

      const btnPlus = document.createElement('button');
      btnPlus.dataset.d = '1';
      btnPlus.setAttribute('aria-label', t('cart.more'));
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
}

export function initCartUI() {
  const close = () => { sheet.classList.remove('open'); overlay.hidden = true; fab.focus(); refresh(); };
  fab.addEventListener('click', () => {
    sheet.classList.add('open'); overlay.hidden = false; refresh();
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
    const id = b.closest('.qty').dataset.id;
    const line = cart.lines().find(l => l.id === id);
    cart.setQty(id, line.qty + Number(b.dataset.d));
    refresh();
  });
  document.addEventListener('langchange', refresh);
  refresh();
}

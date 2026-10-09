// Carta del QR (menu.candelaycafe.com, spec 2026-10-09): pinta la carta y lleva el pedido.
// Lo puro (HTML, pedido, búsqueda) está en qr-render.js y se prueba en tests/menu-qr.test.mjs.
import { MENU, CATEGORIES, PARTS } from '../../web/js/menu-data.js';
import { createCart } from '../../web/js/cart-core.js';
import { trapFocus } from '../../web/js/focus-trap.js';
import { renderTabs, renderSections, renderCard, renderMarquee, renderCartLines, findInMenu, searchHits,
  orderUrl, money, tr, itemsLabel, pickLang } from './qr-render.js';

const LANG_KEY = 'candela-qr-lang', CART_KEY = 'candela-qr-cart';
const $ = id => document.getElementById(id);
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* modo privado: el pedido vive solo en la página */ } },
};
const lookup = id => findInMenu(CATEGORIES, MENU, id);

let lang = pickLang(store.get(LANG_KEY), navigator.language);
let orderType = 'aqui';
let releaseTrap = null, lastFocus = null, spy = null;
const cart = createCart(store.get(CART_KEY));
const save = () => store.set(CART_KEY, cart.serialize());
cart.revalidate(id => lookup(id)?.item);   // precios cambiados o platos que ya no están
save();
const qtyOf = id => cart.lines().find(l => l.id === id)?.qty ?? 0;
const header = $('appHeader'), searchInput = $('searchInput');

/* ---------- textos e idioma ---------- */
function applyTexts() {
  document.documentElement.lang = lang;
  document.title = tr('title', lang);
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = tr(el.dataset.t, lang); });
  document.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = tr(el.dataset.tPh, lang); });
  document.querySelectorAll('[data-t-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.tAria, lang)); });
  document.querySelectorAll('.lang-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

function renderAll() {
  applyTexts();
  $('marqueeTrack').innerHTML = renderMarquee(lang);
  $('catTabs').innerHTML = renderTabs(CATEGORIES, lang);
  $('menuSections').innerHTML = renderSections(CATEGORIES, MENU, PARTS, lang, qtyOf);
  $('menuSections').classList.remove('pending');
  bindTabs();
  applySearch();
  updateFab();
  if (isCartOpen()) renderSheet();
}

document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  store.set(LANG_KEY, lang);
  renderAll();
}));

/* ---------- pestañas ---------- */
function setActiveTab(cat) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  document.querySelector(`.cat-tab[data-cat="${CSS.escape(cat)}"]`)
    ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}
function bindTabs() {
  document.querySelectorAll('.cat-tab').forEach(tab => tab.addEventListener('click', () => {
    const sec = $(`sec-${tab.dataset.cat}`);
    if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' });
    setActiveTab(tab.dataset.cat);
  }));
  spy?.disconnect();
  spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) setActiveTab(e.target.dataset.section);
  }), { rootMargin: '-38% 0px -58% 0px', threshold: 0 });
  document.querySelectorAll('.menu-section').forEach(s => spy.observe(s));
}

/* ---------- carta: añadir y quitar ---------- */
function refreshCard(id, focusAction) {
  const old = document.querySelector(`.menu-card[data-id="${CSS.escape(id)}"]`);
  const found = lookup(id);
  if (!old || !found) return;
  const had = old.contains(document.activeElement);
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCard(found.item, lang, qtyOf(id));
  const neu = tmp.firstElementChild;
  neu.classList.toggle('hidden', old.classList.contains('hidden'));
  old.replaceWith(neu);
  if (had) (neu.querySelector(`[data-action="${focusAction}"]`) || neu.querySelector('[data-action]'))?.focus({ preventScroll: true });
}
function change(id, action) {
  const found = lookup(id);
  if (!found || !(found.item.price > 0)) return;
  if (action === 'dec') cart.setQty(id, qtyOf(id) - 1);
  else cart.add(found.item);
  save();
  refreshCard(id, action === 'dec' ? 'dec' : 'inc');
  updateFab();
}
$('menuSections').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) change(btn.dataset.id, btn.dataset.action);
});

/* ---------- botón flotante ---------- */
function updateFab() {
  const n = cart.count(), total = money(cart.total());
  $('fabCount').textContent = n;
  $('fabTotal').textContent = total;
  $('cartFab').classList.toggle('show', n > 0);
  $('cartFab').setAttribute('aria-label', `${tr('order', lang)}: ${itemsLabel(n, lang)}, ${total}`);
}

/* ---------- hoja del pedido ---------- */
const isCartOpen = () => $('cartSheet').classList.contains('open');
function openCart() {
  lastFocus = document.activeElement;
  renderSheet();
  $('cartSheet').inert = false;
  $('cartSheet').classList.add('open');
  $('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  releaseTrap = trapFocus($('cartSheet'));
  $('cartClose').focus();
}
function closeCart() {
  if (!isCartOpen()) return;
  $('cartSheet').classList.remove('open');
  $('cartSheet').inert = true;
  $('overlay').classList.remove('show');
  document.body.style.overflow = '';
  releaseTrap?.();
  releaseTrap = null;
  (lastFocus && document.contains(lastFocus) ? lastFocus : $('cartFab')).focus();
}
function syncOrderType() {
  document.querySelectorAll('.ot-btn').forEach(b => {
    const on = b.dataset.type === orderType;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  $('tableField').hidden = orderType !== 'aqui';
}
const currentOrder = () => ({ lines: cart.lines(), total: cart.total(), type: orderType,
  name: $('guestName').value, table: $('tableNum').value, note: $('orderNote').value });
function updateWaLink() {
  const url = orderUrl(currentOrder(), lang);
  $('waBtn').href = url || '#';
  $('waBtn').dataset.ready = url ? '1' : '';
}
function renderSheet() {
  const lines = cart.lines(), empty = lines.length === 0;
  $('cartCountLabel').textContent = itemsLabel(cart.count(), lang);
  $('cartLines').innerHTML = renderCartLines(lines, lang, lookup);
  $('cartEmpty').hidden = !empty;
  $('orderForm').hidden = empty;
  $('sheetFtr').hidden = empty;
  $('cartTotalAmt').textContent = money(cart.total());
  syncOrderType();
  updateWaLink();
}

$('cartFab').addEventListener('click', openCart);
$('cartClose').addEventListener('click', closeCart);
$('overlay').addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
$('cartLines').addEventListener('click', e => {
  const b = e.target.closest('[data-ci]');
  if (!b) return;
  const { id, ci } = b.dataset;
  change(id, ci === 'dec' ? 'dec' : 'inc');
  renderSheet();
  ($('cartLines').querySelector(`[data-ci="${ci}"][data-id="${CSS.escape(id)}"]`) || $('cartClose')).focus();
});
document.querySelectorAll('.ot-btn').forEach(b => b.addEventListener('click', () => {
  orderType = b.dataset.type;
  syncOrderType();
  updateWaLink();
}));
['guestName', 'tableNum', 'orderNote'].forEach(id => $(id).addEventListener('input', () => {
  if (id === 'guestName' && $('guestName').value.trim()) {
    $('guestName').removeAttribute('aria-invalid');
    $('nameError').hidden = true;
  }
  updateWaLink();
}));
$('waBtn').addEventListener('click', e => {
  updateWaLink();
  if ($('waBtn').dataset.ready) return;   // abre WhatsApp con el pedido
  e.preventDefault();
  $('guestName').setAttribute('aria-invalid', 'true');
  $('nameError').hidden = false;
  $('guestName').focus();
});

/* ---------- búsqueda ---------- */
function applySearch() {
  const { items, cats } = searchHits(CATEGORIES, MENU, searchInput.value);
  document.querySelectorAll('.menu-card').forEach(c => c.classList.toggle('hidden', !items.has(c.dataset.id)));
  document.querySelectorAll('.menu-section').forEach(s => s.classList.toggle('all-hidden', !cats.has(s.dataset.section)));
  $('emptyState').classList.toggle('visible', cats.size === 0);
}
$('searchBtn').addEventListener('click', () => {
  header.classList.add('search-active');
  setTimeout(() => searchInput.focus(), 60);
});
$('searchBack').addEventListener('click', () => {
  header.classList.remove('search-active');
  searchInput.value = '';
  applySearch();
  $('searchBtn').focus();
});
searchInput.addEventListener('input', applySearch);

/* ---------- franja: se para al tocarla ---------- */
$('marqueeStrip').addEventListener('click', () => $('marqueeStrip').classList.toggle('paused'));

renderAll();

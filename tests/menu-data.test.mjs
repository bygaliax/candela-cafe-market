import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { CATEGORIES, MENU, PARTS, DAILY_BUFFET, SIZES, COFFEE_NOTE, PANINI_NOTE, JUICES_NOTE } from '../web/js/menu-data.js';

const file = (slug, w) => new URL(`../web/assets/img/${slug}-${w}.webp`, import.meta.url);
const allItems = () => CATEGORIES.flatMap(c => MENU[c.id]);

test('Momentos: mañana, café y jugos, mediodía; cada categoría en uno y sin mezclarse', () => {
  const order = PARTS.map(p => p.id);
  assert.deepEqual(order, ['morning', 'coffee', 'midday']);
  const seq = CATEGORIES.map(c => order.indexOf(c.part));
  assert.ok(seq.every(i => i >= 0), 'hay una categoría sin momento válido');
  assert.deepEqual(seq, [...seq].sort((a, b) => a - b), 'las categorías de un momento no van seguidas');
  assert.deepEqual(CATEGORIES.map(c => c.id), [
    'breakfast', 'avocado-toast', 'bakery',
    'coffee', 'matcha', 'lattes', 'juices', 'smoothies', 'shakes',
    'daily-buffet', 'ny-signature', 'signature', 'panini', 'burgers', 'dominican-spot', 'salads-wraps', 'soups', 'appetizers', 'desserts',
  ]);
});

test('97 platos y precios (los del menú impreso de Praxis del 26-oct; el café, del PDF del 19-oct); ningún id se repite ni choca con una categoría', () => {
  const items = allItems();
  assert.equal(items.length, 97);
  assert.equal(items.reduce((s, i) => s + i.price, 0).toFixed(2), '1133.55');
  const ids = items.map(i => i.id);
  assert.equal(new Set(ids).size, 97);
  assert.ok(ids.every(id => !id.includes(':')), 'los «:» son de los tamaños del pedido (cf-cappuccino:lg)');
  const catIds = new Set(CATEGORIES.map(c => c.id));
  assert.deepEqual(ids.filter(id => catIds.has(id)), []);
  assert.deepEqual(Object.keys(MENU).sort(), [...catIds].sort());
});

test('Cada foto de la carta es la de ESE plato (parejas aprobadas por Robert el 24-sep)', () => {
  const PHOTO_OF = {
    'ny-the-ruben-sandwich': 'deli-ruben',
    'ny-chopped-cheese': 'deli-chopped-cheese',
    'ny-phili-cheese-steak': 'lugar-terraza',
    'ny-central-park-club-sandwiches': 'menu-central-park-club',
    'ny-manhattan-hero': 'lugar-neon-sub',
    'sg-prosciutto-sandwich': 'lugar-interior',
    'sg-california-turkey-sandwich': 'menu-california-turkey',
    'pn-grilled-chicken-panini': 'deli-chicken-panini',
    'bg-candela-burger': 'menu-candela-burger',
    'sw-chicken-steak-quesadilla': 'menu-quesadilla',
    'sw-greek-salad': 'menu-greek-salad',
    'bk-pancakes-french-toast-wafles': 'manana-fachada',
    // de las fotos que ya tenía la carta solo coincide la César: las del Downtown Platter,
    // la Fritura Mixta y el Italian Panini eran tortitas, una quesadilla y costillas (visto el 24-sep)
    'sw-chicken-caesar-salad': 'caesar-salad',
    // Coffee Bar (19-oct): fotos ilustrativas del PDF del cliente. Cada celda de su hoja se casó con la fila del PDF
    // que la recorta y se miró a ojo (tools/convert-cafe.mjs): el Espresso es la taza pequeña; el Double, la grande.
    'cf-espresso': 'cafe-espresso',
    'cf-cortadito': 'cafe-cortadito',
    'cf-cappuccino': 'cafe-cappuccino',
    'cf-americano': 'cafe-americano',
    'cf-coffee-latte': 'cafe-coffee-latte',
    'cf-colada': 'cafe-colada',
    'cf-double-espresso': 'cafe-double-espresso',
    'cf-hot-chocolate': 'cafe-hot-chocolate',
    'cf-iced-latte': 'cafe-iced-latte',
    'cf-macchiato': 'cafe-macchiato',
    'cf-regular-tea': 'cafe-regular-tea',
    'mt-matcha-latte': 'cafe-matcha-latte',
    'mt-strawberry-matcha': 'cafe-strawberry-matcha',
    'mt-dirty-matcha': 'cafe-dirty-matcha',
    'mt-passion-matcha': 'cafe-passion-matcha',
    'lt-pumpkin-spice-latte': 'cafe-pumpkin-spice-latte',
    'lt-pistachio-latte': 'cafe-pistachio-latte',
    'lt-dulce-de-leche-latte': 'cafe-dulce-de-leche-latte',
  };
  const withImg = Object.fromEntries(allItems().filter(i => i.img).map(i => [i.id, i.img]));
  assert.deepEqual(withImg, PHOTO_OF);
});

test('Cabeceras: Panadería, Barra de Café, Daily Buffet (la mesa caliente), Rincón Dominicano y Sopas', () => {
  const covers = Object.fromEntries(CATEGORIES.filter(c => c.cover).map(c => [c.id, c.cover.img]));
  assert.deepEqual(covers, {
    bakery: 'manana-pastelitos',
    coffee: 'noche-neon',
    // Robert (19-oct): la foto de la mesa caliente es la comida del Daily Buffet, no la de Dominican Spot
    'daily-buffet': 'mediodia-mesa-caliente',
    // el collage «Sabor Dominicano» con el rótulo «Dominican Spot»: chimi, fritura mixta, sancocho y mangú
    'dominican-spot': 'mediodia-dominican-spot',
    soups: 'menu-sopa',
  });
  const cat = id => CATEGORIES.find(c => c.id === id);
  assert.equal(cat('daily-buffet').note, DAILY_BUFFET);
  assert.deepEqual(MENU['daily-buffet'], []);   // cambia cada día: se pregunta en tienda
  assert.equal(cat('dominican-spot').note, undefined);
});

test('Menú impreso de Praxis (26-oct): sus platos nuevos con sus precios, sus avisos y sin sus erratas', () => {
  const price = id => allItems().find(i => i.id === id).price;
  assert.deepEqual(MENU.desserts.map(i => [i.name, i.price]), [
    ['Caramel Flan', 6.99], ['Chocolate Mousse', 6.99], ['Guava Cheesecake', 6.99], ['Passion Fruit Cheesecake', 6.99], ['Tres Leches Cake', 6.99],
  ]);
  assert.equal(price('bk-make-your-own-breakfast'), 0);   // el impreso no le pone precio: se pregunta en tienda
  assert.equal(price('dm-sancocho-dominicano'), 17.99);
  assert.equal(price('sp-half-sandwich-chicken-soup'), 14.99);
  assert.equal(price('pn-flat-panini-ready-to-go'), 14.99);
  assert.equal(price('ny-phili-cheese-steak'), 15.99);    // el único que sube $2
  const cat = id => CATEGORIES.find(c => c.id === id);
  assert.equal(cat('panini').note, PANINI_NOTE);
  assert.equal(cat('juices').note, JUICES_NOTE);
  // las erratas que traían el four-fold y el impreso (los ids viejos se quedan: son anclas)
  const text = allItems().flatMap(i => [i.name, i.desc ? i.desc.en : '']).join('\n');
  for (const typo of [/Wafles/, /Mozarella/, /Mix Cheese/, /Croton\b/, /Peta /, /Warp/, /Roaste[dr] Beef/, /Salsarito/,
    /Ruben/, /Phili /, /Baguete/, /Chedar/, /Tomates/, /\(LR\)/, /\( /]) assert.doesNotMatch(text, typo);
});

test('Coffee Bar, Matcha y Hot Lattes: los del PDF del cliente (19-oct) y el Mango Matcha del impreso, en su orden y con sus dos tamaños', () => {
  const row = i => [i.name, i.sizes ? [i.sizes.md, i.sizes.lg] : i.price];
  assert.deepEqual(MENU.coffee.map(row), [
    ['Espresso', 3.25], ['Cortadito', 3.51], ['Cappuccino', [3.99, 4.99]], ['Americano', [3.69, 4.69]],
    ['Coffee Latte', [3.99, 4.99]], ['Colada', 2.49], ['Double Espresso', 3.99], ['Hot Chocolate', [3.99, 4.99]],
    ['Iced Latte', [3.99, 4.99]], ['Macchiato', 3.49], ['Regular Tea', [2.49, 3.25]],
  ]);
  assert.deepEqual(MENU.matcha.map(row), [
    ['Matcha Latte', [6.99, 7.99]], ['Strawberry Matcha', [7.99, 8.99]], ['Dirty Matcha', [7.99, 8.99]], ['Passion Matcha', [7.99, 8.99]],
    ['Mango Matcha', [7.99, 8.99]],
  ]);
  assert.deepEqual(MENU.lattes.map(row), [['Pumpkin Spice Latte', [5.99, 6.99]], ['Pistachio Latte', [5.99, 6.99]], ['Dulce de Leche Latte', [5.99, 6.99]]]);
  // con tamaños, price es el del mediano y solo hay mediano y grande
  for (const i of allItems().filter(i => i.sizes)) {
    assert.deepEqual(Object.keys(i.sizes), ['md', 'lg'], i.id);
    assert.equal(i.price, i.sizes.md, i.id);
  }
  assert.deepEqual(SIZES, { md: { en: 'Medium', es: 'Mediano' }, lg: { en: 'Large', es: 'Grande' } });
  // el pie del PDF (leches y sabores) va en las tres, con el aviso de que las fotos son ilustrativas
  for (const id of ['coffee', 'matcha', 'lattes']) assert.equal(CATEGORIES.find(c => c.id === id).note, COFFEE_NOTE, id);
  assert.match(COFFEE_NOTE.en, /Photos are illustrative\.$/);
  assert.match(COFFEE_NOTE.es, /Fotos ilustrativas\.$/);
});

test('Cada foto existe en 480 y 960, y cada cabecera en los anchos que declara', () => {
  for (const it of allItems().filter(i => i.img)) {
    for (const w of [480, 960]) assert.ok(existsSync(file(it.img, w)), `falta ${it.img}-${w}.webp`);
  }
  for (const c of CATEGORIES.filter(c => c.cover)) {
    assert.ok(c.cover.w.includes(480) && c.cover.w.includes(960), `${c.id}: la cabecera necesita 480 y 960`);
    for (const w of c.cover.w) assert.ok(existsSync(file(c.cover.img, w)), `falta ${c.cover.img}-${w}.webp`);
  }
});

test('Los encuadres tienen formato «X% Y%»', () => {
  const foci = [...allItems().map(i => i.focus), ...CATEGORIES.map(c => c.cover && c.cover.focus)].filter(Boolean);
  assert.ok(foci.length > 0);
  for (const f of foci) assert.match(f, /^\d{1,3}% \d{1,3}%$/);
});

test('Las fotos viejas del Ruben y del Prosciutto ya no están', () => {
  for (const s of ['pastrami', 'hero-sandwich']) {
    for (const w of [480, 960, 1440]) assert.ok(!existsSync(file(s, w)), `sigue ${s}-${w}.webp`);
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, MENU, PARTS } from '../web/js/menu-data.js';
import { groupByPart, wideId, renderMenu, renderChips } from '../web/js/menu-render.js';

const count = (html, needle) => html.split(needle).length - 1;
const sectionOf = (html, id) => { const a = html.indexOf(`<section class="cat" id="${id}"`); return html.slice(a, html.indexOf('</section>', a)); };
const ES = renderMenu(CATEGORIES, MENU, PARTS, 'es');

test('groupByPart: tres momentos en orden, con todas las categorías', () => {
  const g = groupByPart(CATEGORIES, PARTS);
  assert.deepEqual(g.map(x => x.part.id), ['morning', 'coffee', 'midday']);
  assert.deepEqual(g[0].cats.map(c => c.id), ['breakfast', 'avocado-toast', 'bakery']);
  assert.equal(g.reduce((n, x) => n + x.cats.length, 0), CATEGORIES.length);
});

test('wideId: la primera si son impares, ninguna si son pares', () => {
  assert.equal(wideId([{ id: 'a' }, { id: 'b' }, { id: 'c' }]), 'a');
  assert.equal(wideId([{ id: 'a' }, { id: 'b' }]), null);
  assert.equal(wideId([]), null);
});

test('renderMenu: cada plato sale una sola vez, con su ancla', () => {
  for (const it of Object.values(MENU).flat()) assert.equal(count(ES, ` id="${it.id}"`), 1, it.id); // con espacio: data-id="…" también contiene id="…"
  assert.equal(count(ES, 'data-id="'), 79);
});

test('renderMenu: h2 por momento y h3 por categoría, en el orden de la carta', () => {
  assert.equal(count(ES, '<h2 class="part-label"'), 3);
  assert.equal(count(ES, '<h3 class="cat-sign"'), 15);
  assert.ok(ES.indexOf('>Mañana<') < ES.indexOf('>Café y jugos<'));
  assert.ok(ES.indexOf('>Café y jugos<') < ES.indexOf('>Mediodía<'));
  assert.ok(ES.indexOf('id="breakfast"') < ES.indexOf('id="coffee"'));
  assert.ok(ES.indexOf('id="coffee"') < ES.indexOf('id="ny-signature"'));
});

test('renderMenu: tarjetas = platos con foto, antes que las filas', () => {
  const ny = sectionOf(ES, 'ny-signature');
  assert.equal(count(ny, '<li class="card'), 5);
  assert.equal(count(ny, '<li class="row"'), 2);
  assert.ok(ny.indexOf('<ul class="cards">') < ny.indexOf('<ul class="rows">'));
  assert.equal(count(ES, '<li class="card'), 16);
});

test('renderMenu: con tarjetas impares la primera va ancha', () => {
  const wides = [...ES.matchAll(/<li class="card card--wide" id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(wides, ['ny-the-ruben-sandwich', 'bg-candela-burger', 'dm-fritura-mixta-2ps', 'sw-chicken-steak-quesadilla']);
});

test('renderMenu: precio 0 → «Pregunta en tienda» sin «+»; con precio, «+» con el nombre del plato', () => {
  const coffee = sectionOf(ES, 'coffee');
  assert.equal(count(coffee, 'class="it-add"'), 0);
  assert.equal(count(coffee, 'Pregunta en tienda'), 10);
  assert.match(ES, /<button class="it-add" type="button" aria-label="Agregar Chopped Cheese">\+<\/button>/);
  assert.match(sectionOf(ES, 'burgers'), /\$15\.99/);
});

test('renderMenu: foto de tarjeta con srcset 480/960, tamaño fijo, decorativa y con su encuadre', () => {
  const phili = MENU['ny-signature'].find(i => i.id === 'ny-phili-cheese-steak');
  const card = ES.match(/<li class="card[^"]*" id="ny-phili-cheese-steak"[\s\S]*?<\/li>/)[0];
  assert.match(card, /srcset="assets\/img\/lugar-terraza-480\.webp 480w, assets\/img\/lugar-terraza-960\.webp 960w"/);
  assert.match(card, /alt=""/);
  assert.match(card, /width="480" height="360"/);
  assert.ok(phili.focus, 'el Philly lleva encuadre');
  assert.ok(card.includes(`style="object-position:${phili.focus}"`));
  assert.match(card, /loading="lazy"/);
});

test('renderMenu: solo las fotos de Desayunos se cargan sin lazy', () => {
  assert.equal(count(sectionOf(ES, 'breakfast'), 'loading="lazy"'), 0);
  assert.equal(count(ES, '<img') - count(ES, 'loading="lazy"'), 2);
});

test('renderMenu: cabeceras decorativas con sus anchos y el aviso del especial en Rincón Dominicano', () => {
  assert.equal(count(ES, '<figure class="cat-cover">'), 4);
  const dom = sectionOf(ES, 'dominican-spot');
  assert.match(dom, /mediodia-mesa-caliente-1440\.webp 1440w/);
  assert.match(dom, /<p class="cat-note">¡Pregunta por nuestros especiales del día!<\/p>/);
  assert.doesNotMatch(sectionOf(ES, 'coffee'), /1440w/);
});

test('renderMenu: textos en el idioma pedido y todo escapado', () => {
  const EN = renderMenu(CATEGORIES, MENU, PARTS, 'en');
  assert.match(EN, />Morning</);
  assert.match(EN, /Ask in store/);
  const evil = [{ id: 'x', part: 'morning', label: { en: '<b>', es: '<b>' } }];
  const html = renderMenu(evil, { x: [{ id: 'y"', name: '<i>', desc: { en: '&', es: '&' }, price: 1, badge: null, img: null }] }, PARTS, 'en');
  assert.doesNotMatch(html, /<b>|<i>/);
  assert.match(html, /&lt;i&gt;/);
  assert.match(html, /id="y&quot;"/);
});

test('renderChips: un chip por categoría, en el orden de la carta', () => {
  const html = renderChips(CATEGORIES, PARTS, 'es');
  const cats = [...html.matchAll(/data-cat="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(cats, groupByPart(CATEGORIES, PARTS).flatMap(g => g.cats.map(c => c.id)));
  assert.match(html, /<a class="chip" href="#ny-signature" data-cat="ny-signature">Sándwiches NY<\/a>/);
});

// Checklist web-ready de Galiax (2026-10-01): compartir con foto, iconos, rastreadores, FAQ, privacidad y cabeceras.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { HOURS } from '../web/js/site-data.js';
import { DICT } from '../web/js/i18n.js';

const url = p => new URL(`../${p}`, import.meta.url);
const read = p => (existsSync(url(p)) ? readFileSync(url(p), 'utf8') : '');
const bin = p => readFileSync(url(p));
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const PAGES = { index: read('web/index.html'), menu: read('web/menu.html'), privacy: read('web/privacy.html') };
const meta = (html, attr, key) => (html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`)) || [])[1];
const canonical = html => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];

// medidas reales de los archivos, leídas de su cabecera
const jpegSize = b => {
  for (let i = 2; i < b.length; i += 2 + b.readUInt16BE(i + 2)) {
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
  }
};
const pngSize = b => [b.readUInt32BE(16), b.readUInt32BE(20)];
const webpSize = b => {
  const f = b.toString('ascii', 12, 16);
  if (f === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (f === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3FFF), 1 + ((n >>> 14) & 0x3FFF)]; }
  return [b.readUInt16LE(26) & 0x3FFF, b.readUInt16LE(28) & 0x3FFF];
};

test('Existe la página de privacidad', () => {
  assert.ok(PAGES.privacy, 'falta web/privacy.html');
});

test('Títulos de 30–60 caracteres y descripciones de 70–160, distintos en cada página; robots deja fotos grandes', () => {
  const titles = [], descs = [];
  for (const [name, html] of Object.entries(PAGES)) {
    const t = decode((html.match(/<title>([^<]+)<\/title>/) || [, ''])[1]);
    const d = decode(meta(html, 'name', 'description') || '');
    assert.ok(t.length >= 30 && t.length <= 60, `${name}: título de ${t.length} caracteres`);
    assert.ok(d.length >= 70 && d.length <= 160, `${name}: descripción de ${d.length} caracteres`);
    assert.equal(meta(html, 'name', 'robots'), 'index, follow, max-image-preview:large', name);
    titles.push(t); descs.push(d);
  }
  assert.equal(new Set(titles).size, titles.length, 'títulos repetidos');
  assert.equal(new Set(descs).size, descs.length, 'descripciones repetidas');
});

test('Al compartir cualquier página sale su foto: medidas reales, texto alternativo y tarjeta grande', () => {
  for (const [name, html] of Object.entries(PAGES)) {
    for (const k of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:locale', 'og:image', 'og:image:type', 'og:image:alt'])
      assert.ok(meta(html, 'property', k), `${name}: falta ${k}`);
    for (const k of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'])
      assert.ok(meta(html, 'name', k), `${name}: falta ${k}`);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image', name);
    assert.equal(meta(html, 'property', 'og:url'), canonical(html), `${name}: og:url = canonical`);
    const img = meta(html, 'property', 'og:image');
    assert.equal(meta(html, 'name', 'twitter:image'), img, `${name}: la misma foto en X`);
    assert.match(img, /^https:\/\/candelaycafe\.com\/.+\.jpg$/, `${name}: JPG con URL absoluta del dominio`);
    const file = `web/${img.slice('https://candelaycafe.com/'.length)}`;
    assert.ok(existsSync(url(file)), `${name}: no existe ${file}`);
    const [w, h] = jpegSize(bin(file));
    assert.deepEqual([meta(html, 'property', 'og:image:width'), meta(html, 'property', 'og:image:height')], [String(w), String(h)], `${name}: medidas de ${file}`);
    assert.ok(w >= 1200 && bin(file).length < 300 * 1024, `${name}: ${file} ≥1200 px y <300 KiB (WhatsApp)`);
  }
});

test('Iconos: favicon.ico, PNG de 16/32/180/192/512 y manifest; cada página los enlaza y todo existe', () => {
  for (const [f, s] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192], ['android-chrome-512x512.png', 512]])
    assert.deepEqual(pngSize(bin(`web/${f}`)), [s, s], f);
  assert.equal(bin('web/favicon.ico').readUInt32BE(0), 0x00000100, 'favicon.ico es un ICO');
  const man = JSON.parse(read('web/site.webmanifest'));
  assert.ok(man.name && man.short_name && man.theme_color && man.icons.length >= 2);
  for (const i of man.icons) assert.ok(existsSync(url(`web${i.src}`)), `manifest: ${i.src}`);
  for (const [name, html] of Object.entries(PAGES)) {
    for (const rel of ['icon', 'apple-touch-icon', 'manifest']) assert.match(html, new RegExp(`<link rel="${rel}"`), `${name}: ${rel}`);
    for (const m of html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="\/([^"]+)"/g))
      assert.ok(existsSync(url(`web/${m[1]}`)), `${name}: no existe /${m[1]}`);
    assert.match(html, /<meta name="theme-color" content="#[0-9a-fA-F]{6}">/, `${name}: theme-color`);
  }
});

test('El logo es cuadrado, como el círculo donde se pinta (si no, sale achatado)', () => {
  const [w, h] = webpSize(bin('web/assets/img/logo-96.webp'));
  assert.equal(w, h, `logo-96.webp mide ${w}×${h}`);
});

test('Rastreadores: robots con los bots de IA, el sitemap con cada página y su fecha, y llms.txt', () => {
  const robots = read('web/robots.txt');
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'])
    assert.match(robots, new RegExp(`User-agent: ${bot}\\r?\\nAllow: /`), bot);
  assert.match(robots, /^Sitemap: https:\/\/candelaycafe\.com\/sitemap\.xml\r?$/m);
  const sm = read('web/sitemap.xml');
  for (const [name, html] of Object.entries(PAGES))
    assert.match(sm, new RegExp(`<loc>${canonical(html)}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>`), `${name}: falta en el sitemap con lastmod`);
  assert.match(read('web/llms.txt'), /^# Candela & Café Market\r?\n\r?\n> /);
});

test('FAQ: el schema dice exactamente lo que se ve en la portada', () => {
  const html = PAGES.index;
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const faq = lds.flatMap(x => x['@graph'] || [x]).find(x => x['@type'] === 'FAQPage');
  assert.ok(faq, 'falta el schema FAQPage');
  const seen = [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/g)].map(m => [decode(m[1]), decode(m[2])]);
  assert.ok(seen.length >= 5, 'la FAQ visible tiene al menos 5 preguntas');
  assert.deepEqual(faq.mainEntity.map(q => [q.name, q.acceptedAnswer.text]), seen);
});

test('Los horarios escritos a mano (FAQ en EN/ES y llms.txt) son los de HOURS', () => {
  // Si cambia HOURS, esta prueba avisa: hay que reescribir la respuesta del horario y llms.txt.
  assert.deepEqual(HOURS.map(h => h && `${h.open}-${h.close}`),
    ['08:00-22:00', '08:00-22:00', '08:00-22:00', '08:00-23:30', '08:00-23:30', '08:00-23:30', '08:00-23:30']);
  const a = DICT['home.faq.a2'];
  assert.ok(a, 'falta home.faq.a2 (respuesta del horario)');
  for (const txt of [a.en, read('web/llms.txt')]) { assert.match(txt, /8 am to 10 pm/); assert.match(txt, /8 am to 11:30 pm/); }
  assert.match(a.es, /8 am a 10 pm/); assert.match(a.es, /8 am a 11:30 pm/);
});

test('El pie de la portada y de la carta enlaza la privacidad', () => {
  for (const name of ['index', 'menu']) assert.match(PAGES[name], /<a href="privacy\.html"[^>]*data-i18n="footer\.privacy"/, name);
});

test('Cabeceras de seguridad iguales en los dos netlify.toml; los scripts sin unsafe-*, cada inline por su hash', () => {
  const block = t => (t.match(/\[\[headers\]\]\s+for = "\/\*"\s+\[headers\.values\]([\s\S]*?)(?=\[\[|$)/) || [])[1];
  const root = block(read('netlify.toml')), web = block(read('web/netlify.toml'));
  assert.ok(root, 'faltan las cabeceras para /*');
  assert.equal(root.trim(), web.trim(), 'la raíz y web/ llevan las mismas cabeceras');
  for (const h of ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'])
    assert.match(root, new RegExp(`${h} = "`), h);
  const csp = root.match(/Content-Security-Policy = "([^"]+)"/)[1];
  // los estilos inline sí (la carta encuadra cada foto con style="object-position"); los scripts, nunca
  assert.doesNotMatch(csp.match(/script-src [^;]+/)[0], /unsafe-inline|unsafe-eval/);
  for (const [name, html] of Object.entries(PAGES))
    for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
      assert.ok(csp.includes(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`), `${name}: la CSP bloquea <script>${m[1].slice(0, 40)}`);
});

// Pedidos a domicilio (2026-10-01): botones con el color de cada marca en la carta y en la portada.
const UBER = 'https://www.ubereats.com/store/candela-y-cafe-market/oa35cIfwWWuJm-ND4o9G1g';
const DOOR = 'https://www.doordash.com/store/candela-y-caf%C3%A9-market-miami-26069377/';

test('Botones de Uber Eats y DoorDash en la carta y en la portada, con los mismos enlaces que el pie', () => {
  for (const name of ['index', 'menu']) {
    const html = PAGES[name];
    assert.match(html, new RegExp(`<a class="btn btn-ubereats" href="${UBER}" target="_blank" rel="noopener">`), `${name}: botón de Uber Eats`);
    assert.match(html, new RegExp(`<a class="btn btn-doordash" href="${DOOR}" target="_blank" rel="noopener">`), `${name}: botón de DoorDash`);
    for (const [host, link] of [['ubereats.com', UBER], ['doordash.com', DOOR]])
      assert.deepEqual([...new Set([...html.matchAll(new RegExp(`href="(https://www\\.${host.replace('.', '\\.')}[^"]*)"`, 'g'))].map(m => m[1]))], [link], `${name}: un solo enlace a ${host}`);
  }
});

test('Los colores de Uber Eats y DoorDash pasan el contraste AA (4,5:1) con su texto', () => {
  const css = read('web/css/base.css');
  const lum = hex => { const c = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const color = (sel, prop) => (css.match(new RegExp(`${sel.replace(/\./g, '\\.')}\\{[^}]*?${prop}:#([0-9A-Fa-f]{6})`)) || [])[1];
  const pairs = [['.btn-ubereats', 'background', '.btn-ubereats', 'color'], ['.btn-ubereats', 'background', '.btn-ubereats b', 'color'], ['.btn-doordash', 'background', '.btn-doordash', 'color']];
  for (const [s1, p1, s2, p2] of pairs) {
    const a = color(s1, p1), b = color(s2, p2);
    assert.ok(a && b, `faltan ${s1} ${p1} / ${s2} ${p2}`);
    assert.ok(ratio(a, b) >= 4.5, `${s2} sobre ${s1}: ${ratio(a, b).toFixed(2)}:1`);
  }
});

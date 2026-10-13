import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Los QR impresos del local abren https://menu.candelaycafe.com (qr/generar.py): la carta de menu-qr/, publicada en el
// sitio de Netlify «candela-cafe-menu». Esa URL no puede cambiar: el sitio no puede perder el dominio, ni Squarespace el
// registro DNS «menu». Desde el 13-oct es LA carta (Robert): /menu y /menu.html de la web redirigen aquí y sale en Google.
const url = p => new URL(`../${p}`, import.meta.url);
const read = p => readFileSync(url(p), 'utf8');

test('el QR impreso apunta a https://menu.candelaycafe.com', () => {
  assert.ok(read('qr/generar.py').includes('URL = "https://menu.candelaycafe.com"'));
});

test('la carta del QR está en el repo y se empaqueta para publicarla', () => {
  assert.ok(existsSync(url('menu-qr/index.html')));
  assert.ok(existsSync(url('tools/build-menu-qr.mjs')));
});

test('/menu y /menu.html redirigen (301) a la carta del QR en los dos netlify.toml, forzado porque menu.html sigue en web/', () => {
  for (const toml of ['netlify.toml', 'web/netlify.toml']) for (const from of ['/menu', '/menu.html']) {
    const rule = new RegExp(`\\[\\[redirects\\]\\]\\s*from = "${from.replace('.', '\\.')}"\\s*to = "https://menu\\.candelaycafe\\.com/"\\s*status = 301\\s*force = true`);
    assert.match(read(toml), rule, `${toml}: ${from}`);
  }
});

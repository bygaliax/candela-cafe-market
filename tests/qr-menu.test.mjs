import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Los QR impresos del local abren https://menu.candelaycafe.com (qr/generar.py): la carta de menu-qr/, publicada en el
// sitio de Netlify «candela-cafe-menu». Esa URL no puede cambiar: el sitio no puede perder el dominio, ni Squarespace el
// registro DNS «menu». La carta de la web (/menu) sigue viva porque la usan el perfil de Google y la barra de la web.
const url = p => new URL(`../${p}`, import.meta.url);
const read = p => readFileSync(url(p), 'utf8');

test('el QR impreso apunta a https://menu.candelaycafe.com', () => {
  assert.ok(read('qr/generar.py').includes('URL = "https://menu.candelaycafe.com"'));
});

test('la carta del QR está en el repo y se empaqueta para publicarla', () => {
  assert.ok(existsSync(url('menu-qr/index.html')));
  assert.ok(existsSync(url('tools/build-menu-qr.mjs')));
});

test('/menu sigue abriendo la carta de la web: existe menu.html o un 301 desde /menu en los dos netlify.toml', () => {
  const redirect = p => /from\s*=\s*"\/menu"/.test(read(p));
  assert.ok(existsSync(url('web/menu.html')) || (redirect('netlify.toml') && redirect('web/netlify.toml')));
});

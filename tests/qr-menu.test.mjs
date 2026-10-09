import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// El QR impreso en el local abre https://candelaycafe.com/menu (qr/generar.py) y no se reimprime
// con cada cambio de la web: /menu tiene que seguir abriendo la carta. Si menu.html cambia de
// nombre, hace falta un 301 desde /menu en los dos netlify.toml.
const url = p => new URL(`../${p}`, import.meta.url);
const read = p => readFileSync(url(p), 'utf8');

test('el QR impreso apunta a https://candelaycafe.com/menu', () => {
  assert.ok(read('qr/generar.py').includes('URL = "https://candelaycafe.com/menu"'));
});

test('/menu sigue abriendo la carta: existe menu.html o un 301 desde /menu en los dos netlify.toml', () => {
  const redirect = p => /from\s*=\s*"\/menu"/.test(read(p));
  assert.ok(existsSync(url('web/menu.html')) || (redirect('netlify.toml') && redirect('web/netlify.toml')));
});

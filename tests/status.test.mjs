import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusAt, zonedNow, fmtTime } from '../web/js/status.js';
import { HOURS, DAYPARTS } from '../web/js/site-data.js';

const at = iso => statusAt(new Date(iso), HOURS, DAYPARTS);

test('zonedNow usa la hora de Miami (EDT en septiembre)', () => {
  assert.deepEqual(zonedNow(new Date('2026-09-22T11:59:00Z')), { day: 2, min: 7 * 60 + 59 });
});

test('martes 7:59 am: cerrado, abre hoy a las 8', () => {
  const s = at('2026-09-22T11:59:00Z');
  assert.equal(s.open, false);
  assert.equal(s.opensAt, '08:00');
  assert.equal(s.opensDay, 2);
});

test('martes 9:30 pm: abierto, cierra pronto a las 10 pm, franja noche', () => {
  const s = at('2026-09-23T01:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, true);
  assert.equal(s.closesAt, '22:00');
  assert.equal(s.part, 'noche');
});

test('martes 9:00 pm: faltan 60 min, todavía no «cierra pronto»', () => {
  assert.equal(at('2026-09-23T01:00:00Z').soon, false);
});

test('martes 10:00 pm: cerrado, abre el miércoles a las 8', () => {
  const s = at('2026-09-23T02:00:00Z');
  assert.equal(s.open, false);
  assert.equal(s.opensDay, 3);
  assert.equal(s.opensAt, '08:00');
});

test('sábado 11:29 pm: abierto y cierra pronto (11:30 pm)', () => {
  const s = at('2026-09-27T03:29:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, true);
  assert.equal(s.closesAt, '23:30');
});

test('miércoles 12:30 pm: abierto, franja mediodía', () => {
  const s = at('2026-09-23T16:30:00Z');
  assert.equal(s.open, true);
  assert.equal(s.soon, false);
  assert.equal(s.part, 'mediodia');
});

test('invierno (EST): martes 7:30 am sigue cerrado', () => {
  // 12:30Z = 7:30 EST. Con un desfase fijo de verano saldría 8:30 y «abierto».
  assert.equal(at('2026-01-13T12:30:00Z').open, false);
});

test('el reloj del visitante no importa: siempre hora de Miami', () => {
  const prev = process.env.TZ;
  process.env.TZ = 'Europe/Madrid';
  try { assert.equal(at('2026-09-23T16:30:00Z').part, 'mediodia'); }
  finally { process.env.TZ = prev; }
});

test('fmtTime', () => {
  assert.equal(fmtTime('08:00'), '8 am');
  assert.equal(fmtTime('23:30'), '11:30 pm');
  assert.equal(fmtTime('12:00'), '12 pm');
  assert.equal(fmtTime('00:15'), '12:15 am');
});

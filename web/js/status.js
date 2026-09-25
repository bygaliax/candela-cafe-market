// «Ahora en Candela»: estado del local según la hora de Miami. Puro y testeable.
export const TZ = 'America/New_York';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Día (0 = dom) y minutos desde medianoche en la zona `tz`, sea cual sea la del visitante. */
export function zonedNow(date, tz = TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  return { day: DAYS.indexOf(get('weekday')), min: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** { open, soon (< 60 min para cerrar), closesAt, opensAt, opensDay, day } */
export function statusAt(date, hours, tz = TZ) {
  const { day, min } = zonedNow(date, tz);
  const today = hours[day];
  if (today && min >= toMin(today.open) && min < toMin(today.close)) {
    return { open: true, soon: toMin(today.close) - min < 60, closesAt: today.close, opensAt: null, opensDay: null, day };
  }
  let opensDay = null;
  if (today && min < toMin(today.open)) opensDay = day;
  else for (let i = 1; i <= 7; i++) { const d = (day + i) % 7; if (hours[d]) { opensDay = d; break; } }
  return { open: false, soon: false, closesAt: null, opensAt: opensDay === null ? null : hours[opensDay].open, opensDay, day };
}

/** '08:00' → '8 am' · '23:30' → '11:30 pm'. Mismo formato en EN y ES. */
export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = ((h + 11) % 12) + 1, ap = h < 12 ? 'am' : 'pm';
  return m ? `${h12}:${String(m).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
}

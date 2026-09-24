// Núcleo puro del carrito — sin DOM. Testeado en tests/cart-core.test.mjs.
const validLine = l => !!l && typeof l.id === 'string' && typeof l.name === 'string'
  && Number.isFinite(l.price) && l.price >= 0 && Number.isInteger(l.qty) && l.qty > 0;

/** Lo guardado solo vale si es una lista de líneas válidas (#17). */
function parseLines(serialized) {
  if (!serialized) return [];
  try {
    const v = JSON.parse(serialized);
    return Array.isArray(v) ? v.filter(validLine).map(l => ({ id: l.id, name: l.name, price: l.price, qty: l.qty })) : [];
  } catch { return []; }
}

export function createCart(serialized) {
  let lines = parseLines(serialized);
  const find = id => lines.find(l => l.id === id);
  return {
    add(item) {
      const l = find(item.id);
      if (l) l.qty += 1;
      else lines.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    },
    setQty(id, qty) {
      const l = find(id);
      if (!l) return;
      l.qty = qty;
      if (l.qty <= 0) lines = lines.filter(x => x.id !== id);
    },
    /** Sustituye el contenido por lo guardado en otra pestaña o al volver atrás (#5). */
    load(s) { lines = parseLines(s); },
    /** Toma nombre y precio de la carta actual y quita lo que ya no existe o no tiene precio (#17). */
    revalidate(lookup) {
      lines = lines.flatMap(l => {
        const it = lookup(l.id);
        return it && it.price > 0 ? [{ ...l, name: it.name, price: it.price }] : [];
      });
    },
    lines: () => lines.map(l => ({ ...l })),
    count: () => lines.reduce((n, l) => n + l.qty, 0),
    total: () => Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100,
    clear() { lines = []; },
    serialize: () => JSON.stringify(lines),
  };
}

export const waUrl = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

export function buildWaUrl(cart, phone, greeting) {
  const fmt = n => `$${n.toFixed(2)}`;
  const body = cart.lines().map(l => `${l.qty}x ${l.name} — ${fmt(l.price * l.qty)}`).join('\n');
  return waUrl(phone, `${greeting}\n\n${body}\n\nTotal: ${fmt(cart.total())}`);
}

// Mensaje de reserva (música en vivo) por idioma, con plural (#11).
const RES = {
  es: { head: (d, t, n) => `¡Hola Candela & Café! Quiero reservar para la música en vivo del ${d} a las ${t}, para ${n} ${n === 1 ? 'persona' : 'personas'}.`, name: 'Nombre', tel: 'Tel' },
  en: { head: (d, t, n) => `Hi Candela & Café! I'd like to reserve for live music on ${d} at ${t}, for ${n} ${n === 1 ? 'person' : 'people'}.`, name: 'Name', tel: 'Phone' },
};

export function buildReservationUrl(data, phone, lang = 'es') {
  const R = RES[lang] || RES.es;
  const { day, time, guests, name, phone: tel } = data;
  let msg = R.head(day, time, guests);
  if (name) msg += ` ${R.name}: ${name}.`;
  if (tel) msg += ` ${R.tel}: ${tel}.`;
  return waUrl(phone, msg);
}

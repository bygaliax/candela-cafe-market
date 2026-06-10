// Núcleo puro del carrito — sin DOM. Testeado en tests/cart-core.test.mjs.
export function createCart(serialized) {
  let lines = [];
  if (serialized) { try { lines = JSON.parse(serialized) || []; } catch { lines = []; } }

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
    lines: () => lines.map(l => ({ ...l })),
    count: () => lines.reduce((n, l) => n + l.qty, 0),
    total: () => Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100,
    clear() { lines = []; },
    serialize: () => JSON.stringify(lines),
  };
}

export function buildWaUrl(cart, phone, greeting) {
  const fmt = n => `$${n.toFixed(2)}`;
  const body = cart.lines()
    .map(l => `${l.qty}x ${l.name} — ${fmt(l.price * l.qty)}`)
    .join('\n');
  const msg = `${greeting}\n\n${body}\n\nTotal: ${fmt(cart.total())}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// Mensaje de reserva de mesa (Live Music) → wa.me. Puro/testeable.
export function buildReservationUrl(data, phone, greeting) {
  const { day, time, guests, name, phone: tel } = data;
  let msg = `${greeting} del ${day} a las ${time}, para ${guests} personas.`;
  if (name) msg += ` Nombre: ${name}.`;
  if (tel)  msg += ` Tel: ${tel}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

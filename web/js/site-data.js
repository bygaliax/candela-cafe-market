// Datos del local — ÚNICA fuente de horario, Google, favoritos y mesa caliente.
// Los usan el estado de la portada, la tabla de Visítanos y el test de coherencia del JSON-LD.

export const ADDRESS = { street: '507 N Miami Ave', city: 'Downtown Miami, FL 33136' };
export const MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=507+N+Miami+Ave%2C+Miami%2C+FL+33136';

// 0 = domingo … 6 = sábado. null = cerrado. Sin cierres después de medianoche.
export const HOURS = [
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '22:00' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
  { open: '08:00', close: '23:30' },
];

// Ficha exacta de Google Maps (CID del perfil «Candela y Café Market»).
export const MAPS_LISTING = 'https://www.google.com/maps?cid=6497021305409967970';

// Nota real del Perfil de Google. Se actualiza a mano, con su fecha (leída en Google Maps).
export const GOOGLE = { rating: 4.6, count: 142, asOf: '2026-09-24', url: MAPS_LISTING, reviewUrl: MAPS_LISTING };

// Favoritos del deli: id de MENU + foto nueva (h = alto de la variante de 480).
export const FAVORITES = [
  { id: 'ny-the-ruben-sandwich',     img: 'deli-ruben',          h: 720 },
  { id: 'bg-candela-burger',         img: 'deli-candela-burger', h: 320 },
  { id: 'ny-chopped-cheese',         img: 'deli-chopped-cheese', h: 320 },
  { id: 'pn-grilled-chicken-panini', img: 'deli-chicken-panini', h: 320 },
];

// Mesa caliente por día de la semana (0 = dom), p. ej. { 3: [{ en: 'Beef stew', es: 'Carne guisada' }] }.
// ⚠ La rellena el cliente. Vacío = se muestra el especial del día. NUNCA poner platos inventados.
export const DAILY_MENU = {};

// Cartas «Coffee now» / «Wine later». ⚠ Líneas y horas a confirmar con el cliente antes de publicar.
export const DAY_NIGHT = [
  { id: 'day', title: 'Coffee now', from: '08:00', to: '19:00', items: [
    { en: 'Espresso & cortadito', es: 'Espresso y cortadito' },
    { en: 'Cappuccino & latte',   es: 'Cappuccino y latte' },
    { en: 'Fresh juices',         es: 'Jugos naturales' },
  ] },
  { id: 'night', title: 'Wine later', from: '19:00', to: 'close', items: [
    { en: 'Red, white & rosé wine', es: 'Vino tinto, blanco y rosado' },
    { en: 'By the glass or bottle', es: 'Por copa o por botella' },
    { en: 'Cold beers',             es: 'Cervezas frías' },
    { en: 'Coffee until close',     es: 'Café hasta el cierre' },
  ] },
];

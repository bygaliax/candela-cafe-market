// Market = VITRINA (sin carrito ni precios). Decisión de Robert, 2026-09-24.
// ⚠ Categorías y ejemplos a confirmar con el cliente. Las fotos mk-* son PROVISIONALES
//   (stock) hasta tener las de las estanterías reales. h = alto de la variante de 480.
export const MARKET_CATEGORIES = [
  { id: 'despensa',  img: 'mk-despensa', h: 360, name: { en: 'Pantry',      es: 'Despensa' },          examples: { en: 'rice, beans, pasta',      es: 'arroz, habichuelas, pasta' } },
  { id: 'basicos',   img: 'mk-aceite',   h: 666, name: { en: 'Staples',     es: 'Básicos' },           examples: { en: 'oil, salt, spices',       es: 'aceite, sal, especias' } },
  { id: 'desayuno',  img: 'mk-cereal',   h: 360, name: { en: 'Breakfast',   es: 'Desayuno' },          examples: { en: 'cereal, milk, bread',     es: 'cereales, leche, pan' } },
  { id: 'frescos',   img: 'mk-frutas',   h: 360, name: { en: 'Fruit & veg', es: 'Frutas y verduras' }, examples: { en: 'plantain, yuca, avocado', es: 'plátano, yuca, aguacate' } },
  { id: 'naturales', img: 'mk-verdes',   h: 320, name: { en: 'Natural',     es: 'Naturales' },         examples: { en: 'natural products',        es: 'productos naturales' } },
  { id: 'cafe',      img: 'mk-cafe',     h: 320, name: { en: 'Coffee',      es: 'Café' },              examples: { en: 'to take home',            es: 'para llevar a casa' } },
];

// Catálogo del Market. PLACEHOLDER de muestra — reemplazar por el inventario real del cliente.
// item: { id, cat:{en,es}, name, price:Number(0=en tienda), img:slug|null }
export const MARKET = [
  { id: 'mk-cafe',     cat: { en: 'Coffee', es: 'Café' },        name: 'Café en grano de la casa',     price: 14.99, img: 'mk-cafe' },
  { id: 'mk-aceite',   cat: { en: 'Gourmet', es: 'Gourmet' },    name: 'Aceite de oliva extra virgen', price: 12.99, img: 'mk-aceite' },
  { id: 'mk-frutas',   cat: { en: 'Fresh', es: 'Frescos' },      name: 'Frutas & vegetales',           price: 0,     img: 'mk-frutas' },
  { id: 'mk-cereal',   cat: { en: 'Breakfast', es: 'Desayuno' }, name: 'Cereales & granola',           price: 6.99,  img: 'mk-cereal' },
  { id: 'mk-despensa', cat: { en: 'Pantry', es: 'Despensa' },    name: 'Básicos de despensa',          price: 0,     img: 'mk-despensa' },
  { id: 'mk-verdes',   cat: { en: 'Organic', es: 'Orgánico' },   name: 'Verdes orgánicos',             price: 0,     img: 'mk-verdes' },
];
// ⚠ Las imágenes mk-* son placeholders de stock (Task 11 las genera desde tools/prod);
// reemplazar por las fotos reales del catálogo del cliente.

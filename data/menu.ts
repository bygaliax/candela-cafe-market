export type ItemTag = 'spicy' | 'veggie' | 'popular' | 'new';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number; // USD
  tags?: ItemTag[];
  image?: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  accent: 'fuego' | 'lima';
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: 'burgers',
    label: 'Burgers',
    accent: 'fuego',
    items: [
      { id: 'burger-classic', name: 'Candela Classic Burger', description: 'Carne a la parrilla, lechuga, tomate, cebolla y salsa de la casa.', price: 12, tags: ['popular'] },
      { id: 'burger-bbq', name: 'Smokehouse BBQ Burger', description: 'Doble carne, queso cheddar, bacon y salsa BBQ ahumada.', price: 14 },
      { id: 'burger-spicy', name: 'Spicy Fire Burger', description: 'Jalapeños, pepper jack y mayo picante.', price: 14, tags: ['spicy'] },
      { id: 'burger-veggie', name: 'Veggie Burger', description: 'Medallón de vegetales, aguacate y brotes frescos.', price: 11, tags: ['veggie'] },
    ],
  },
  {
    id: 'sandwiches',
    label: 'Sandwiches',
    accent: 'fuego',
    items: [
      { id: 'sand-cubano', name: 'Cubano', description: 'Cerdo asado, jamón, queso suizo, pepinillos y mostaza.', price: 11, tags: ['popular'] },
      { id: 'sand-pesto', name: 'Grilled Chicken Pesto', description: 'Pollo a la parrilla, pesto, mozzarella y tomate.', price: 12 },
      { id: 'sand-steak', name: 'Steak & Cheese', description: 'Churrasco, cebolla caramelizada y queso provolone.', price: 13 },
      { id: 'sand-pavo', name: 'Pavo & Swiss', description: 'Pavo, queso suizo, lechuga y aderezo de la casa.', price: 11 },
    ],
  },
  {
    id: 'wraps',
    label: 'Wraps',
    accent: 'lima',
    items: [
      { id: 'wrap-buffalo', name: 'Buffalo Chicken Wrap', description: 'Pollo buffalo, ranch, lechuga y tomate.', price: 11, tags: ['spicy'] },
      { id: 'wrap-caesar', name: 'Caesar Chicken Wrap', description: 'Pollo a la parrilla, parmesano y aderezo César.', price: 11 },
      { id: 'wrap-veggie', name: 'Veggie Hummus Wrap', description: 'Hummus, vegetales asados y mix de hojas verdes.', price: 10, tags: ['veggie'] },
    ],
  },
  {
    id: 'salads',
    label: 'Salads',
    accent: 'lima',
    items: [
      { id: 'salad-caesar', name: 'Caesar Salad', description: 'Romana, crutones, parmesano y aderezo César. (+pollo $4)', price: 9 },
      { id: 'salad-med', name: 'Mediterranean Salad', description: 'Mix verde, feta, aceitunas, tomate y pepino.', price: 11, tags: ['veggie'] },
      { id: 'salad-cobb', name: 'Cobb Salad', description: 'Pollo, huevo, bacon, aguacate y queso azul.', price: 12 },
    ],
  },
  {
    id: 'parrilla',
    label: 'Parrilla',
    accent: 'fuego',
    items: [
      { id: 'grill-mixed', name: 'Mixed Grill (Parrillada)', description: 'Selección de carnes a la parrilla con guarniciones.', price: 24, tags: ['popular'] },
      { id: 'grill-churrasco', name: 'Churrasco', description: 'Skirt steak a la parrilla con chimichurri.', price: 19 },
      { id: 'grill-pollo', name: 'Pollo a la Parrilla', description: 'Pechuga marinada a la parrilla.', price: 15 },
      { id: 'grill-shrimp', name: 'Grilled Shrimp Skewers', description: 'Brochetas de camarón a la parrilla.', price: 18 },
    ],
  },
  {
    id: 'sides',
    label: 'Sides',
    accent: 'lima',
    items: [
      { id: 'side-maduros', name: 'Maduros', description: 'Plátano maduro frito.', price: 5 },
      { id: 'side-fries', name: 'Fries', description: 'Papas fritas crujientes.', price: 4 },
      { id: 'side-yuca', name: 'Yuca Frita', description: 'Yuca frita con mojo.', price: 5 },
      { id: 'side-salad', name: 'House Salad', description: 'Ensalada pequeña de la casa.', price: 5 },
    ],
  },
  {
    id: 'drinks',
    label: 'Wines & Beers',
    accent: 'fuego',
    items: [
      { id: 'drink-wine-glass', name: 'Vino de la Casa (copa)', description: 'Tinto o blanco.', price: 8 },
      { id: 'drink-wine-bottle', name: 'Botella de Vino', description: 'Selección de la casa.', price: 28 },
      { id: 'drink-craft', name: 'Craft Beer', description: 'Cervezas artesanales rotativas.', price: 7 },
      { id: 'drink-domestic', name: 'Domestic Beer', description: 'Cerveza nacional.', price: 5 },
      { id: 'drink-sangria', name: 'Sangría', description: 'Sangría de la casa.', price: 9 },
      { id: 'drink-cafe', name: 'Café / Espresso', description: 'Café recién hecho.', price: 3 },
      { id: 'drink-jugos', name: 'Jugos Naturales', description: 'Jugos frescos del día.', price: 4 },
    ],
  },
  {
    id: 'postres',
    label: 'Postres',
    accent: 'lima',
    items: [
      { id: 'dessert-tres-leches', name: 'Tres Leches', description: 'Bizcocho de tres leches.', price: 7, tags: ['popular'] },
      { id: 'dessert-flan', name: 'Flan', description: 'Flan de caramelo.', price: 6 },
      { id: 'dessert-cheesecake', name: 'Cheesecake', description: 'Cheesecake de la casa.', price: 7 },
      { id: 'dessert-churros', name: 'Churros', description: 'Churros con salsa de chocolate.', price: 6 },
    ],
  },
];

// Lookup global por id (usado por el carrito).
const itemIndex = new Map(menu.flatMap((c) => c.items).map((i) => [i.id, i]));

export function findItem(id: string): MenuItem | undefined {
  return itemIndex.get(id);
}

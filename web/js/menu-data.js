// Fuente de verdad: FourFold Menu-01/02.jpg (menú impreso). NO editar precios sin cotejar.
//
// Nota sobre precios: en el four-fold impreso, las secciones BAKERY & MORE y COFFEE BAR
// NO muestran precio por ítem. Para no inventar precios, esos ítems llevan price: 0
// (interpretar como "precio en tienda / preguntar"). Las secciones JUICES, SMOOTHIES y
// PROTEIN SHAKES traen precio a nivel de categoría (LR / MD) y se aplican a todos sus ítems.
export const PHONE = '17862547577';
export const DAILY_SPECIAL = {
  en: 'Ask about our daily food specials!',
  es: '¡Pregunta por nuestros especiales del día!',
};

// Momentos del día de la carta (spec del menú, §4.2). CATEGORIES va en este orden.
export const PARTS = [
  { id: 'morning', label: { en: 'Morning',         es: 'Mañana' } },
  { id: 'coffee',  label: { en: 'Coffee & juices', es: 'Café y jugos' } },
  { id: 'midday',  label: { en: 'Midday',          es: 'Mediodía' } },
];

// cover = foto de cabecera cuando la foto enseña varios productos o el lugar; w = anchos que existen en assets/img.
export const CATEGORIES = [
  { id: 'breakfast',      part: 'morning', label: { en: 'Breakfast',               es: 'Desayunos' } },
  { id: 'avocado-toast',  part: 'morning', label: { en: 'Avocado Toast',           es: 'Avocado Toast' } },
  { id: 'bakery',         part: 'morning', label: { en: 'Bakery & More',           es: 'Panadería' },
    cover: { img: 'manana-pastelitos', w: [480, 960] } },
  { id: 'coffee',         part: 'coffee',  label: { en: 'Coffee Bar',              es: 'Barra de Café' },
    cover: { img: 'noche-neon', w: [480, 960], focus: '50% 88%' } },
  { id: 'juices',         part: 'coffee',  label: { en: 'Juices',                  es: 'Jugos' } },
  { id: 'smoothies',      part: 'coffee',  label: { en: 'Smoothies',               es: 'Batidos' } },
  { id: 'shakes',         part: 'coffee',  label: { en: 'Protein Shakes',          es: 'Batidos de Proteína' } },
  { id: 'ny-signature',   part: 'midday',  label: { en: 'NY Signature Sandwiches', es: 'Sándwiches NY' } },
  { id: 'signature',      part: 'midday',  label: { en: 'Signature Sandwiches',    es: 'Sándwiches de la Casa' } },
  { id: 'panini',         part: 'midday',  label: { en: 'Panini',                  es: 'Panini' } },
  { id: 'burgers',        part: 'midday',  label: { en: 'Burgers',                 es: 'Hamburguesas' } },
  { id: 'dominican-spot', part: 'midday',  label: { en: 'Dominican Spot',          es: 'Rincón Dominicano' },
    cover: { img: 'mediodia-mesa-caliente', w: [480, 960, 1440] }, note: DAILY_SPECIAL },
  { id: 'salads-wraps',   part: 'midday',  label: { en: 'Salads & Wraps',          es: 'Ensaladas y Wraps' } },
  { id: 'soups',          part: 'midday',  label: { en: 'Soups',                   es: 'Sopas' },
    cover: { img: 'menu-sopa', w: [480, 960, 1440], focus: '50% 55%' } },
  { id: 'appetizers',     part: 'midday',  label: { en: 'Appetizers & Sides',      es: 'Aperitivos' } },
];

// item: { id, name, desc:{en,es}|null, price:Number, badge:String|null, img:slug|null, focus?:'X% Y%' }
export const MENU = {
  breakfast: [
    {
      id: 'bk-downtown-platter',
      name: 'Downtown Platter',
      desc: {
        en: '2 Eggs Any Style With Your Choice of Bacon, Ham or Sausage Home Fries and Toast',
        es: '2 huevos al gusto con tu elección de tocino, jamón o salchicha, papas caseras y tostada',
      },
      price: 11.49,
      badge: null,
      img: 'breakfast-platter',
    },
    {
      id: 'bk-pancakes-french-toast-wafles',
      name: '3 Pancakes / French Toast / Wafles',
      desc: {
        en: 'Your Choice of Fruit Topping / Nutella Spread',
        es: 'Tu elección de topping de fruta / crema de Nutella',
      },
      price: 13.99,
      badge: null,
      img: 'manana-fachada',
      focus: '50% 78%',
    },
    {
      id: 'bk-make-your-own-omelette',
      name: 'Make Your Own Omelette',
      desc: {
        en: 'Choose your protein, veggies, fries or toast',
        es: 'Elige tu proteína, vegetales, papas o tostada',
      },
      price: 12.99,
      badge: null,
      img: null,
    },
    {
      id: 'bk-acai-bowl',
      name: 'Açai Bowl',
      desc: {
        en: 'Açai and Banana, Topped with Fresh, Strawberries and Blueberries, Granola, Honey',
        es: 'Açai y banana, cubierto con fresas frescas y arándanos, granola, miel',
      },
      price: 12.49,
      badge: null,
      img: null,
    },
    {
      id: 'bk-build-your-own-omelette',
      name: 'Build Your Own Omelette',
      desc: {
        en: 'Your choice of Meat Your choice of Cheese',
        es: 'Tu elección de carne, tu elección de queso',
      },
      price: 13.49,
      badge: null,
      img: null,
    },
    {
      id: 'bk-omelette-supreme',
      name: 'Omelette Supreme',
      desc: {
        en: 'Ham, Bacon, Veggies-Green Pepper, Red Pepper, Onion, Black Olives, Tomato, With Choice of Toast or Home Fries, Cheese',
        es: 'Jamón, tocino, vegetales-pimiento verde, pimiento rojo, cebolla, aceitunas negras, tomate, con elección de tostada o papas caseras, queso',
      },
      price: 14.49,
      badge: null,
      img: null,
    },
    {
      id: 'bk-veggie-egg-white-omelette',
      name: 'Veggie Egg White Omelette',
      desc: {
        en: 'Veggies-onion, Mushrooms, Peppers, Tomato, Egg Whites, Whole Wheat, Toast',
        es: 'Vegetales-cebolla, champiñones, pimientos, tomate, claras de huevo, pan integral, tostada',
      },
      price: 14.49,
      badge: null,
      img: null,
    },
    {
      id: 'bk-ny-bacon-egg-cheese-sandwich',
      name: 'NY Style Bacon Egg & Cheese Sandwich',
      desc: {
        en: 'Choice of Bread: Hero, Roll or Bagel, Bacon Or Sausage, American Cheese',
        es: 'Elección de pan: hero, roll o bagel, tocino o salchicha, queso americano',
      },
      price: 12.49,
      badge: null,
      img: null,
    },
    {
      id: 'bk-smoked-salmon-platter',
      name: 'Smoked Salmon Platter',
      desc: {
        en: 'Lox and Cream Cheese on Bagel with Capers, Onions and Tomatoes',
        es: 'Salmón ahumado y queso crema en bagel con alcaparras, cebollas y tomates',
      },
      price: 15.99,
      badge: null,
      img: null,
    },
  ],

  appetizers: [
    { id: 'ap-bruschettas',     name: 'Bruschettas',     desc: null, price: 9.99,  badge: null, img: null },
    { id: 'ap-mozzarella-stick', name: 'Mozarella Stick', desc: null, price: 9.99,  badge: null, img: null },
    { id: 'ap-chicken-finger',  name: 'Chicken Finger',  desc: null, price: 10.99, badge: null, img: null },
    { id: 'ap-chicken-wings',   name: 'Chicken Wings',   desc: null, price: 12.99, badge: null, img: null },
    { id: 'ap-french-fries',    name: 'French Fries',    desc: null, price: 5.99,  badge: null, img: null },
  ],

  'avocado-toast': [
    {
      id: 'av-caprese',
      name: 'Caprese Avocado Toast',
      desc: {
        en: 'Multigrain Toast, Avocado Spread, Tomato, Mozzarella Cheese, Fresh Basil',
        es: 'Tostada multigrano, crema de aguacate, tomate, queso mozzarella, albahaca fresca',
      },
      price: 13.49,
      badge: null,
      img: null,
    },
    {
      id: 'av-greek',
      name: 'Greek Avocado Toast',
      desc: {
        en: 'Multigrain Toast, Avocado Spread, Spinach, Feta Cheese, Black Olives, Topped with Roasted Almonds, Drizzled Olive Oil, Fried Egg/ Boiled',
        es: 'Tostada multigrano, crema de aguacate, espinaca, queso feta, aceitunas negras, cubierta con almendras tostadas, aceite de oliva, huevo frito/hervido',
      },
      price: 13.49,
      badge: null,
      img: null,
    },
    {
      id: 'av-prosciutto',
      name: 'Prosciutto Avocado Toast',
      desc: {
        en: 'Multigrain Toast, Avocado Spread, Prosciutto, Mozzarella Cheese, Black Pepper, Drizzled Olive Oil',
        es: 'Tostada multigrano, crema de aguacate, prosciutto, queso mozzarella, pimienta negra, aceite de oliva',
      },
      price: 17.99,
      badge: null,
      img: null,
    },
    {
      id: 'av-salmon',
      name: 'Salmon Avocado Toast',
      desc: {
        en: 'Multigrain Toast, Avocado Spread, Lox and Cream Cheese, Smoked Salmon with Capers, Onions and Tomatoes',
        es: 'Tostada multigrano, crema de aguacate, salmón ahumado y queso crema, salmón ahumado con alcaparras, cebollas y tomates',
      },
      price: 16.49,
      badge: null,
      img: null,
    },
  ],

  'salads-wraps': [
    {
      id: 'sw-chicken-steak-quesadilla',
      name: 'Chicken or Steak Quesadilla',
      desc: {
        en: 'Chicken Steak, Mix Cheese, Pico De Gallo, Sour Cream',
        es: 'Pollo o bistec, mezcla de quesos, pico de gallo, crema agria',
      },
      price: 12.99,
      badge: null,
      img: 'menu-quesadilla',
    },
    {
      id: 'sw-build-your-own-salad',
      name: 'Build Your Own Salad',
      desc: {
        en: 'Choose From Various Selection Of Veggies, Proteins and Dressing',
        es: 'Elige entre una variada selección de vegetales, proteínas y aderezo',
      },
      price: 13.99,
      badge: null,
      img: null,
    },
    {
      id: 'sw-chicken-caesar-salad',
      name: 'Chicken Caesar Salad',
      desc: {
        en: 'Romaine Lettuce, Parmesan Cheese, Croton, Chicken',
        es: 'Lechuga romana, queso parmesano, crutones, pollo',
      },
      price: 13.99,
      badge: null,
      img: 'caesar-salad',
    },
    {
      id: 'sw-greek-salad',
      name: 'Greek Salad',
      desc: {
        en: 'Romaine Lettuce, Feta Cheese, Tomato, Red Onion, Green Pepper, Green and Black Olives, Peta Bread',
        es: 'Lechuga romana, queso feta, tomate, cebolla roja, pimiento verde, aceitunas verdes y negras, pan pita',
      },
      price: 13.99,
      badge: null,
      img: 'menu-greek-salad',
      focus: '45% 45%',
    },
    {
      id: 'sw-caprese-salad',
      name: 'Caprese Salad',
      desc: {
        en: 'Fresh Mozzarella, Tomato, Basil, Balsamic Vinegar, Olive Oil',
        es: 'Mozzarella fresca, tomate, albahaca, vinagre balsámico, aceite de oliva',
      },
      price: 11.99,
      badge: null,
      img: null,
    },
    {
      id: 'sw-turkey-avocado-wrap',
      name: 'Turkey Avocado Wrap',
      desc: {
        en: 'Turkey, Mozzarella Cheese, Avocado, Romaine Lettuce, Tomato, Honey Mustard',
        es: 'Pavo, queso mozzarella, aguacate, lechuga romana, tomate, mostaza con miel',
      },
      price: 12.49,
      badge: null,
      img: null,
    },
    {
      id: 'sw-grilled-chicken-caesar-wrap',
      name: 'Grilled Chicken Caesar Wrap',
      desc: {
        en: 'Grilled Chicken Breast, Romaine Lettuce, Grated Cheese, Roasted Pepper',
        es: 'Pechuga de pollo a la parrilla, lechuga romana, queso rallado, pimiento asado',
      },
      price: 11.99,
      badge: null,
      img: null,
    },
    {
      id: 'sw-chicken-tuna-salad-wrap',
      name: 'Chicken or Tuna Salad Wrap',
      desc: {
        en: 'Chicken or Tuna, Tomato, Lettuce, Mayo',
        es: 'Pollo o atún, tomate, lechuga, mayonesa',
      },
      price: 12.49,
      badge: null,
      img: null,
    },
    {
      id: 'sw-miami-roasted-beef-warp',
      name: 'Miami Roasted Beef Warp',
      desc: {
        en: 'Roasted Beef, Chopped Lettuce and Tomato, Cheddar Cheese, Grilled Onions, Russian Dressing',
        es: 'Roast beef, lechuga y tomate picados, queso cheddar, cebollas a la parrilla, aderezo ruso',
      },
      price: 13.99,
      badge: null,
      img: null,
    },
  ],

  'dominican-spot': [
    {
      id: 'dm-el-traditional-chimi',
      name: 'El Traditional Chimi',
      desc: {
        en: 'Chimi Style Ground Meat, Cole Slaw, Red Onions, Mayo And Ketchup',
        es: 'Carne molida estilo chimi, ensalada de col, cebollas rojas, mayonesa y ketchup',
      },
      price: 12.99,
      badge: null,
      img: null,
    },
    {
      id: 'dm-fritura-mixta-2ps',
      name: 'Fritura Mixta (2PS)',
      desc: null,
      price: 29.99,
      badge: null,
      img: 'food-2',
    },
    {
      id: 'dm-fritura-mixta-4ps',
      name: 'Fritura Mixta (4PS)',
      desc: null,
      price: 49.99,
      badge: null,
      img: null,
    },
  ],

  soups: [
    {
      id: 'sp-chicken-noodle-soup-m',
      name: 'Chicken Noodle Soup (M)',
      desc: null,
      price: 6.99,
      badge: null,
      img: null,
    },
    {
      id: 'sp-chicken-noodle-soup-lg',
      name: 'Chicken Noodle Soup (LG)',
      desc: null,
      price: 11.99,
      badge: null,
      img: null,
    },
    {
      id: 'sp-soup-of-the-day-m',
      name: 'Soup of the Day (M)',
      desc: null,
      price: 7.99,
      badge: null,
      img: null,
    },
    {
      id: 'sp-soup-of-the-day-lg',
      name: 'Soup of the Day (LG)',
      desc: null,
      price: 12.99,
      badge: null,
      img: null,
    },
  ],

  signature: [
    {
      id: 'sg-prosciutto-sandwich',
      name: 'Prosciutto Sandwich',
      desc: {
        en: 'Prosciutto, Fresh Mozzarella, Tomato, Basil, Balsamic Vinegar, & Olive Oil on a Baguette',
        es: 'Prosciutto, mozzarella fresca, tomate, albahaca, vinagre balsámico y aceite de oliva en baguette',
      },
      price: 15.49,
      badge: "Boar's Head",
      img: 'lugar-interior',
      focus: '50% 72%',
    },
    {
      id: 'sg-california-turkey-sandwich',
      name: 'California Turkey Sandwich',
      desc: {
        en: 'Oven Gold Roasted Turkey Breast, Muenster Cheese, Avocado, Lettuce, Tomato, Whole Wheat Thin Roll',
        es: 'Pechuga de pavo dorada al horno, queso muenster, aguacate, lechuga, tomate, pan integral fino',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: 'menu-california-turkey',
      focus: '50% 45%',
    },
    {
      id: 'sg-the-heat',
      name: 'The Heat',
      desc: {
        en: 'Salsarito Turkey, Tomato, Avocado, Pepper Jack Cheese, Lettuce, Chipotle Mayonnaise',
        es: 'Pavo salsarito, tomate, aguacate, queso pepper jack, lechuga, mayonesa chipotle',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: null,
    },
    {
      id: 'sg-cuban-sandwich',
      name: 'Cuban Sandwich',
      desc: {
        en: 'Ham, Pork, Swiss Cheese, Pickles, Mayonnaise, Mustard, Cuban Bread',
        es: 'Jamón, cerdo, queso suizo, pepinillos, mayonesa, mostaza, pan cubano',
      },
      price: 11.99,
      badge: "Boar's Head",
      img: null,
    },
    {
      id: 'sg-pan-con-bistec',
      name: 'Pan con Bistec',
      desc: {
        en: 'Steak, Onions, Lettuce, Tomatoes, Mayonnaise on Cuban Bread.',
        es: 'Bistec, cebollas, lechuga, tomates, mayonesa en pan cubano.',
      },
      price: 14.99,
      badge: "Boar's Head",
      img: null,
    },
    {
      id: 'sg-build-your-own-sandwich',
      name: 'Build Your Own Sandwich',
      desc: {
        en: 'Your Choice of Meat Your Choice of Cheese Your Choice of 2 Vegetables Your Choice of Dressing Feel Free to Add More Toppings',
        es: 'Tu elección de carne, tu elección de queso, tu elección de 2 vegetales, tu elección de aderezo. Agrega más toppings a tu gusto',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: null,
    },
  ],

  'ny-signature': [
    {
      id: 'ny-the-ruben-sandwich',
      name: 'The Ruben Sandwich',
      desc: {
        en: 'Hard Pastrami, Swiss Cheese, House Dressing, Rye Bread',
        es: 'Pastrami, queso suizo, aderezo de la casa, pan de centeno',
      },
      price: 15.49,
      badge: "Boar's Head",
      img: 'deli-ruben',
      focus: '50% 58%',
    },
    {
      id: 'ny-central-park-club-sandwiches',
      name: 'Central Park Club Sandwiches',
      desc: {
        en: 'Oven Gold Turkey Breast, American Cheese, Bacon, Lettuce, Tomato',
        es: 'Pechuga de pavo dorada al horno, queso americano, tocino, lechuga, tomate',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: 'menu-central-park-club',
    },
    {
      id: 'ny-chopped-cheese',
      name: 'Chopped Cheese',
      desc: {
        en: 'Ground Meat, American Cheese, Mayo And Ketchup on Hoagie Bread',
        es: 'Carne molida, queso americano, mayonesa y ketchup en pan hoagie',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: 'deli-chopped-cheese',
    },
    {
      id: 'ny-manhattan-hero',
      name: 'Manhattan Hero',
      desc: {
        en: 'Honey Ham, Honey Turkey, Swiss Cheese, Lettuce, Tomato, Olive Oil, Mayonnaise',
        es: 'Jamón con miel, pavo con miel, queso suizo, lechuga, tomate, aceite de oliva, mayonesa',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: 'lugar-neon-sub',
      focus: '50% 58%',
    },
    {
      id: 'ny-east-side-el-monstruo',
      name: 'East Side ( El Monstruo)',
      desc: {
        en: 'Honey Ham, Salami, Muenster Cheese, caramelized onion, Mayonnaise, on Baguete.',
        es: 'Jamón con miel, salami, queso muenster, cebolla caramelizada, mayonesa, en baguette.',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: null,
    },
    {
      id: 'ny-chicken-cutlet-bodega-style',
      name: 'Chicken Cutlet Bodega Style',
      desc: {
        en: 'Crisp Chicken, Cheddar Cheese, Lettuce, Tomato, Mayo and Mustard, Choice of Bread: Hero or Roll',
        es: 'Pollo crujiente, queso cheddar, lechuga, tomate, mayonesa y mostaza, elección de pan: hero o roll',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: null,
    },
    {
      id: 'ny-phili-cheese-steak',
      name: 'Phili Cheese Steak',
      desc: {
        en: 'Steak, Onions, American Cheese on Hoagie Bread',
        es: 'Bistec, cebollas, queso americano en pan hoagie',
      },
      price: 13.99,
      badge: "Boar's Head",
      img: 'lugar-terraza',
      focus: '50% 62%',
    },
  ],

  panini: [
    {
      id: 'pn-grilled-chicken-panini',
      name: 'Grilled Chicken Panini',
      desc: {
        en: 'Chicken, Tomato, Onions, Fresh Mozzarella, House Dressing',
        es: 'Pollo, tomate, cebollas, mozzarella fresca, aderezo de la casa',
      },
      price: 12.99,
      badge: null,
      img: 'deli-chicken-panini',
    },
    {
      id: 'pn-roaster-beef-panini',
      name: 'Roaster Beef Panini',
      desc: {
        en: 'Roaster Beef, Cheddar Cheese, Lettuce, Tomato, House Dressing',
        es: 'Roast beef, queso cheddar, lechuga, tomate, aderezo de la casa',
      },
      price: 13.99,
      badge: null,
      img: null,
    },
    {
      id: 'pn-caprese-panini',
      name: 'Caprese Panini',
      desc: {
        en: 'Tomatoes, Basil, Fresh Mozzarella, Olive Oil and Balsamic Glaze',
        es: 'Tomates, albahaca, mozzarella fresca, aceite de oliva y reducción balsámica',
      },
      price: 12.99,
      badge: null,
      img: null,
    },
    {
      id: 'pn-italian-panini',
      name: 'Italian Panini',
      desc: {
        en: 'Ham, Genoa Salami, Provolone Cheese, Roasted Peppers, Sun Dried Tomato Olive Oil and Balsamic Dressing',
        es: 'Jamón, salami Genoa, queso provolone, pimientos asados, aceite de oliva con tomate seco y aderezo balsámico',
      },
      price: 12.99,
      badge: null,
      img: 'food-3',
    },
  ],

  burgers: [
    {
      id: 'bg-candela-burger',
      name: 'Candela Burger',
      desc: {
        en: 'Meat, Cheese, Ham, Fried egg, Lettuce, Tomates.',
        es: 'Carne, queso, jamón, huevo frito, lechuga, tomates.',
      },
      price: 15.99,
      badge: null,
      img: 'menu-candela-burger',
      focus: '50% 42%',
    },
    {
      id: 'bg-bacon-cheese-burger',
      name: 'Bacon Cheese Burger',
      desc: {
        en: 'Meat, Chedar Cheese Smoked, Bacon, Lettuce, Tomates.',
        es: 'Carne, queso cheddar ahumado, tocino, lechuga, tomates.',
      },
      price: 14.99,
      badge: null,
      img: null,
    },
    {
      id: 'bg-mushroom-burger',
      name: 'Mushroom Burger',
      desc: {
        en: 'Meat, Swiss Cheese, Grilled Mushrooms.',
        es: 'Carne, queso suizo, champiñones a la parrilla.',
      },
      price: 14.99,
      badge: null,
      img: null,
    },
  ],

  bakery: [
    {
      id: 'by-croissants',
      name: 'Croissants',
      desc: {
        en: 'Almond, Chocolate, Nutella',
        es: 'Almendra, chocolate, Nutella',
      },
      price: 0,
      badge: null,
      img: null,
    },
    {
      id: 'by-gourmet-empanadas',
      name: 'Gourmet Empanadas',
      desc: {
        en: 'Beef, Chicken, Ham and Cheese, Spinach & Mozzarella',
        es: 'Res, pollo, jamón y queso, espinaca y mozzarella',
      },
      price: 0,
      badge: null,
      img: null,
    },
    {
      id: 'by-tequeno-pan-de-bono',
      name: 'Tequeño Pan de Bono',
      desc: null,
      price: 0,
      badge: null,
      img: null,
    },
  ],

  coffee: [
    { id: 'cf-espresso-double-espresso', name: 'Espresso Coffee / Double Espresso', desc: null, price: 0, badge: null, img: null },
    { id: 'cf-cortadito',                name: 'Cortadito',                         desc: null, price: 0, badge: null, img: null },
    { id: 'cf-macchiato',                name: 'Macchiato',                         desc: null, price: 0, badge: null, img: null },
    { id: 'cf-cappuccino',               name: 'Cappuccino',                        desc: null, price: 0, badge: null, img: null },
    { id: 'cf-coffee-latte-flavored',    name: 'Coffee Latte / Flavored',           desc: null, price: 0, badge: null, img: null },
    { id: 'cf-iced-coffee',              name: 'Iced Coffee',                       desc: null, price: 0, badge: null, img: null },
    { id: 'cf-flavored-coffee-latte',    name: 'Flavored Coffee / Latte',           desc: null, price: 0, badge: null, img: null },
    { id: 'cf-bagged-tea-flavored',      name: 'Bagged Tea / Flavored',             desc: null, price: 0, badge: null, img: null },
    { id: 'cf-drip-coffee',              name: 'Drip-Coffee',                       desc: null, price: 0, badge: null, img: null },
    { id: 'cf-americano',                name: 'Americano',                         desc: null, price: 0, badge: null, img: null },
  ],

  juices: [
    {
      id: 'ju-daily-detox',
      name: 'Daily Detox',
      desc: {
        en: 'Carrot, Cucumber, Apple, Ginger, Lemon',
        es: 'Zanahoria, pepino, manzana, jengibre, limón',
      },
      price: 9.99,
      badge: null,
      img: null,
    },
    {
      id: 'ju-fat-burner',
      name: 'Fat Burner',
      desc: {
        en: 'Cucumber, Celery, Apple, Ginger, Lemon',
        es: 'Pepino, apio, manzana, jengibre, limón',
      },
      price: 9.99,
      badge: null,
      img: null,
    },
    {
      id: 'ju-tropical-dream',
      name: 'Tropical Dream',
      desc: {
        en: 'Carrot, Apple, Pineapple',
        es: 'Zanahoria, manzana, piña',
      },
      price: 9.99,
      badge: null,
      img: null,
    },
  ],

  smoothies: [
    {
      id: 'sm-banana-berry-md',
      name: 'Banana Berry (MD)',
      desc: {
        en: 'Strawberry, Banana, Nonfat Vanilla Yogurt',
        es: 'Fresa, banana, yogur de vainilla sin grasa',
      },
      price: 8.99,
      badge: null,
      img: null,
    },
    {
      id: 'sm-banana-berry-lr',
      name: 'Banana Berry (LR)',
      desc: {
        en: 'Strawberry, Banana, Nonfat Vanilla Yogurt',
        es: 'Fresa, banana, yogur de vainilla sin grasa',
      },
      price: 11.49,
      badge: null,
      img: null,
    },
    {
      id: 'sm-love-my-body-md',
      name: 'Love My Body (MD)',
      desc: {
        en: 'Orange, Mango, Pineapple, Nonfat Vanilla Yogurt',
        es: 'Naranja, mango, piña, yogur de vainilla sin grasa',
      },
      price: 8.99,
      badge: null,
      img: null,
    },
    {
      id: 'sm-love-my-body-lr',
      name: 'Love My Body (LR)',
      desc: {
        en: 'Orange, Mango, Pineapple, Nonfat Vanilla Yogurt',
        es: 'Naranja, mango, piña, yogur de vainilla sin grasa',
      },
      price: 11.49,
      badge: null,
      img: null,
    },
    {
      id: 'sm-tropical-blend-md',
      name: 'Tropical Blend (MD)',
      desc: {
        en: 'Papaya, Pineapple, Banana, Orange juice base',
        es: 'Papaya, piña, banana, base de jugo de naranja',
      },
      price: 8.99,
      badge: null,
      img: null,
    },
    {
      id: 'sm-tropical-blend-lr',
      name: 'Tropical Blend (LR)',
      desc: {
        en: 'Papaya, Pineapple, Banana, Orange juice base',
        es: 'Papaya, piña, banana, base de jugo de naranja',
      },
      price: 11.49,
      badge: null,
      img: null,
    },
  ],

  shakes: [
    {
      id: 'sh-peanut-butter-banana',
      name: 'Peanut Butter Banana',
      desc: {
        en: 'Peanut Butter, Banana, Almond Milk',
        es: 'Mantequilla de maní, banana, leche de almendras',
      },
      price: 10.49,
      badge: null,
      img: null,
    },
    {
      id: 'sh-coffee-shake',
      name: 'Coffee Shake',
      desc: {
        en: 'Coffee, Banana, Nutella, Almond Milk',
        es: 'Café, banana, Nutella, leche de almendras',
      },
      price: 10.49,
      badge: null,
      img: null,
    },
    {
      id: 'sh-snicker-shake',
      name: 'Snicker Shake',
      desc: {
        en: 'Banana, Chocolate Chips, Peanut Butter, Almond Milk',
        es: 'Banana, chispas de chocolate, mantequilla de maní, leche de almendras',
      },
      price: 10.49,
      badge: null,
      img: null,
    },
  ],
};

// Platos estrella para la landing (6): [categoryId, itemId]
export const FEATURED = [
  ['signature',      'sg-prosciutto-sandwich'],
  ['ny-signature',   'ny-the-ruben-sandwich'],
  ['breakfast',      'bk-downtown-platter'],
  ['dominican-spot', 'dm-fritura-mixta-2ps'],
  ['burgers',        'bg-candela-burger'],
  ['salads-wraps',   'sw-chicken-caesar-salad'],
];

export const site = {
  name: 'Candela & Café',
  tagline: 'Authentic Flavors',
  phone: '(786) 254-7577',
  phoneHref: 'tel:+17862547577',
  url: 'www.candelaycafe.com',
  urlHref: 'https://www.candelaycafe.com',
  social: {
    instagram: 'https://instagram.com/candelaycafe',
  },
} as const;

export type LandingConcept = {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  image: string;
  accent: 'fuego' | 'lima';
};

export const concepts: LandingConcept[] = [
  {
    id: 'burgers',
    kicker: 'Best Burgers',
    title: 'Juicy & Flame-Grilled',
    copy: 'Burgers preparadas con ingredientes frescos y nuestro toque a la parrilla.',
    image: '/img/burgers.jpg',
    accent: 'fuego',
  },
  {
    id: 'sandwiches',
    kicker: 'Signature Sandwiches',
    title: 'Premium Cold Cuts',
    copy: 'Sandwiches de autor con cortes premium y pan recién horneado.',
    image: '/img/sandwiches.jpg',
    accent: 'fuego',
  },
  {
    id: 'salads',
    kicker: 'Salads & Wraps',
    title: 'Freshness In Every Bite',
    copy: 'Ensaladas y wraps frescos, ligeros y llenos de sabor.',
    image: '/img/salads.jpg',
    accent: 'lima',
  },
  {
    id: 'drinks',
    kicker: 'Wines & Beers',
    title: 'The Perfect Pairing',
    copy: 'Variedad de vinos y cervezas para acompañar tu cena ideal.',
    image: '/img/drinks.jpg',
    accent: 'fuego',
  },
];

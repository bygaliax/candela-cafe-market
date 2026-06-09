# Candela & Café — Rebrand "fuego" + Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestructurar el sitio de Candela & Café de dos HTML monolíticos a un proyecto Next.js (App Router) + TypeScript + Tailwind, y rebrandearlo al nuevo branding "fuego" (negro + rojo + verde lima, motivo de llama) con concepto de eatery casual (burgers, sandwiches, wraps, salads, parrilla, vinos & cervezas, catering, live music).

**Architecture:** Sitio estático generado con Next.js `output: 'export'` (sin backend), desplegable en Netlify. Tailwind con tokens de marca. Datos de la carta en `data/menu.ts`. Lógica del carrito como módulo puro (`lib/cart.ts`) envuelto por un Context (`lib/cart-context.tsx`) con persistencia en `localStorage`. Componentes presentacionales separados por dominio (layout / landing / menu / ui).

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4, `next/font/google` (Anton, Sora, Architects Daughter), Vitest + @testing-library/react + jsdom para tests.

**Spec:** `docs/superpowers/specs/2026-06-09-candela-cafe-rebrand-nextjs-design.md`

---

## Notas de ejecución

- El repo ya contiene `index.html`, `menu.html`, `assets/`, `design/`, `netlify.toml`. NO los borres hasta la última fase.
- Trabaja en la rama `rebrand/fuego-nextjs` (ya creada).
- Identidad git ya configurada localmente (`deepframemedia`).
- Comandos asumen ejecución desde la raíz del repo. En Windows usa PowerShell o el Bash tool; los comandos `npm`/`git`/`npx` son cross-platform.

---

## Fase 0 — Scaffold y tooling

### Task 1: Inicializar package.json y dependencias

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "candela-cafe",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Añadir entradas Next/Node a `.gitignore`**

Append al `.gitignore` existente:

```
# Next.js
/.next/
/out/
/node_modules
next-env.d.ts
*.tsbuildinfo
.vercel
```

- [ ] **Step 3: Instalar dependencias**

Run: `npm install`
Expected: `node_modules/` creado, sin errores de resolución.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: scaffold next.js project (package.json + deps)"
```

---

### Task 2: Config de TypeScript, Next, Tailwind, PostCSS

**Files:**
- Create: `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`

- [ ] **Step 1: Crear `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Crear `next.config.ts`** (static export)

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 3: Crear `tailwind.config.ts`** con tokens de marca

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fuego: '#e33125',
        'fuego-cta': '#bc1d1a',
        granate: '#54150d',
        carbon: '#0a0a0a',
        'carbon-2': '#161616',
        lima: '#68b51b',
        crema: '#fff7d5',
        'crema-2': '#f1ddc2',
        hueso: '#f5f5f0',
      },
      fontFamily: {
        display: ['var(--font-anton)', 'sans-serif'],
        hand: ['var(--font-architects)', 'cursive'],
        body: ['var(--font-sora)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Crear `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs
git commit -m "chore: add typescript, next, tailwind, postcss config"
```

---

### Task 3: Fuentes, globals.css, layout raíz y página placeholder

**Files:**
- Create: `app/fonts.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Crear `app/fonts.ts`**

```ts
import { Anton, Sora, Architects_Daughter } from 'next/font/google';

export const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const architects = Architects_Daughter({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-architects',
  display: 'swap',
});
```

- [ ] **Step 2: Crear `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-carbon text-hueso font-body antialiased;
}

/* Textura de fuego reutilizable como overlay sutil */
.flame-overlay {
  background-image: radial-gradient(
    120% 80% at 50% 100%,
    rgba(227, 49, 37, 0.35) 0%,
    rgba(84, 21, 13, 0.15) 40%,
    transparent 70%
  );
}

/* Oculta scrollbar en tabs horizontales */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 3: Crear `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { anton, sora, architects } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Candela & Café — Authentic Flavors',
  description:
    'Burgers, sandwiches, wraps, parrilla, vinos & cervezas y live music en Miami. (786) 254-7577.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${sora.variable} ${architects.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Crear `app/page.tsx` placeholder**

```tsx
export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center">
      <h1 className="font-display text-5xl uppercase text-fuego">Candela &amp; Café</h1>
    </main>
  );
}
```

- [ ] **Step 5: Verificar que el dev server arranca**

Run: `npm run dev` (luego Ctrl+C)
Expected: compila sin errores; `http://localhost:3000` muestra el título en rojo. Si no puedes correr interactivo, usa `npm run build`.

Run: `npm run build`
Expected: build OK, genera `out/` con `index.html`.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: root layout, fonts, globals, placeholder home"
```

---

### Task 4: Configurar Vitest + Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
});
```

- [ ] **Step 2: Crear `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Sanity test temporal**

Create `lib/__smoke__.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Correr tests**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 5: Borrar el smoke test y commit**

```bash
rm lib/__smoke__.test.ts
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: configure vitest + testing-library"
```

---

## Fase 1 — Datos

### Task 5: `data/site.ts`

**Files:**
- Create: `data/site.ts`

- [ ] **Step 1: Crear `data/site.ts`**

```ts
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
  kicker: string;       // acento manuscrito (Architects Daughter)
  title: string;        // titular Anton
  copy: string;
  image: string;        // ruta en /img
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
```

- [ ] **Step 2: Commit**

```bash
git add data/site.ts
git commit -m "feat(data): site config + landing concepts"
```

---

### Task 6: `data/menu.ts` (carta borrador) + tests de integridad

**Files:**
- Create: `data/menu.ts`
- Test: `data/menu.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`data/menu.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { menu } from './menu';

describe('menu data integrity', () => {
  const allItems = menu.flatMap((c) => c.items);

  it('has at least one category', () => {
    expect(menu.length).toBeGreaterThan(0);
  });

  it('every category has id and label', () => {
    for (const c of menu) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.items.length).toBeGreaterThan(0);
    }
  });

  it('item ids are globally unique', () => {
    const ids = allItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every item has a positive price', () => {
    for (const i of allItems) {
      expect(i.price).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- data/menu.test.ts`
Expected: FAIL — `Cannot find module './menu'`.

- [ ] **Step 3: Crear `data/menu.ts`**

```ts
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
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- data/menu.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add data/menu.ts data/menu.test.ts
git commit -m "feat(data): draft menu (eatery concept) + integrity tests"
```

---

## Fase 2 — Lógica del carrito (TDD)

### Task 7: `lib/cart.ts` — reducer y selectores puros

**Files:**
- Create: `lib/cart.ts`
- Test: `lib/cart.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/cart.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  cartReducer,
  initialCartState,
  lineCount,
  cartTotal,
  type CartState,
} from './cart';

describe('cartReducer', () => {
  it('ADD agrega una línea nueva con qty 1', () => {
    const s = cartReducer(initialCartState, { type: 'ADD', itemId: 'burger-classic' });
    expect(s.lines).toEqual([{ itemId: 'burger-classic', qty: 1 }]);
  });

  it('ADD repetido incrementa la qty', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'burger-classic' });
    s = cartReducer(s, { type: 'ADD', itemId: 'burger-classic' });
    expect(s.lines).toEqual([{ itemId: 'burger-classic', qty: 2 }]);
  });

  it('DECREMENT baja la qty y elimina la línea al llegar a 0', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'DECREMENT', itemId: 'side-fries' });
    expect(s.lines).toEqual([]);
  });

  it('REMOVE elimina la línea', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'REMOVE', itemId: 'side-fries' });
    expect(s.lines).toEqual([]);
  });

  it('SET_QTY a 0 elimina la línea', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'SET_QTY', itemId: 'side-fries', qty: 0 });
    expect(s.lines).toEqual([]);
  });

  it('CLEAR vacía las líneas pero conserva orderType', () => {
    let s: CartState = { lines: [{ itemId: 'side-fries', qty: 2 }], orderType: 'to-go' };
    s = cartReducer(s, { type: 'CLEAR' });
    expect(s.lines).toEqual([]);
    expect(s.orderType).toBe('to-go');
  });

  it('SET_ORDER_TYPE cambia el tipo de pedido', () => {
    const s = cartReducer(initialCartState, { type: 'SET_ORDER_TYPE', orderType: 'to-go' });
    expect(s.orderType).toBe('to-go');
  });
});

describe('selectores', () => {
  it('lineCount suma todas las cantidades', () => {
    const s: CartState = {
      lines: [
        { itemId: 'burger-classic', qty: 2 },
        { itemId: 'side-fries', qty: 1 },
      ],
      orderType: 'dine-in',
    };
    expect(lineCount(s)).toBe(3);
  });

  it('cartTotal suma precio * qty usando la carta', () => {
    const s: CartState = {
      lines: [
        { itemId: 'burger-classic', qty: 2 }, // 12 * 2 = 24
        { itemId: 'side-fries', qty: 1 }, //  4 * 1 = 4
      ],
      orderType: 'dine-in',
    };
    expect(cartTotal(s)).toBe(28);
  });

  it('cartTotal ignora ids inexistentes', () => {
    const s: CartState = { lines: [{ itemId: 'no-existe', qty: 5 }], orderType: 'dine-in' };
    expect(cartTotal(s)).toBe(0);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm test -- lib/cart.test.ts`
Expected: FAIL — `Cannot find module './cart'`.

- [ ] **Step 3: Crear `lib/cart.ts`**

```ts
import { findItem } from '@/data/menu';

export type OrderType = 'dine-in' | 'to-go';
export type CartLine = { itemId: string; qty: number };
export type CartState = { lines: CartLine[]; orderType: OrderType };

export type CartAction =
  | { type: 'ADD'; itemId: string }
  | { type: 'DECREMENT'; itemId: string }
  | { type: 'REMOVE'; itemId: string }
  | { type: 'SET_QTY'; itemId: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'SET_ORDER_TYPE'; orderType: OrderType }
  | { type: 'HYDRATE'; state: CartState };

export const initialCartState: CartState = { lines: [], orderType: 'dine-in' };

function setQty(lines: CartLine[], itemId: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.itemId !== itemId);
  const exists = lines.some((l) => l.itemId === itemId);
  if (exists) return lines.map((l) => (l.itemId === itemId ? { ...l, qty } : l));
  return [...lines, { itemId, qty }];
}

function qtyOf(lines: CartLine[], itemId: string): number {
  return lines.find((l) => l.itemId === itemId)?.qty ?? 0;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD':
      return { ...state, lines: setQty(state.lines, action.itemId, qtyOf(state.lines, action.itemId) + 1) };
    case 'DECREMENT':
      return { ...state, lines: setQty(state.lines, action.itemId, qtyOf(state.lines, action.itemId) - 1) };
    case 'REMOVE':
      return { ...state, lines: state.lines.filter((l) => l.itemId !== action.itemId) };
    case 'SET_QTY':
      return { ...state, lines: setQty(state.lines, action.itemId, action.qty) };
    case 'CLEAR':
      return { ...state, lines: [] };
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.orderType };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

export function lineCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartTotal(state: CartState): number {
  return state.lines.reduce((sum, l) => {
    const item = findItem(l.itemId);
    return item ? sum + item.price * l.qty : sum;
  }, 0);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm test -- lib/cart.test.ts`
Expected: todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add lib/cart.ts lib/cart.test.ts
git commit -m "feat(cart): pure cart reducer + selectors (TDD)"
```

---

### Task 8: `lib/cart-context.tsx` — provider con persistencia

**Files:**
- Create: `lib/cart-context.tsx`

- [ ] **Step 1: Crear `lib/cart-context.tsx`**

```tsx
'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  cartReducer,
  initialCartState,
  type CartAction,
  type CartState,
} from './cart';

const STORAGE_KEY = 'candela-cart-v1';

type CartContextValue = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Hidratar desde localStorage al montar (solo cliente).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', state: JSON.parse(raw) as CartState });
    } catch {
      /* ignore */
    }
  }, []);

  // Persistir en cada cambio.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
```

- [ ] **Step 2: Verificar typecheck/build**

Run: `npm run build`
Expected: compila sin errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add lib/cart-context.tsx
git commit -m "feat(cart): CartProvider + useCart with localStorage persistence"
```

---

## Fase 3 — Assets del Figma

### Task 9: Extraer logo y fotos del Figma a `public/`

**Files:**
- Create: `public/logo/candela-flame.png` (o `.svg`)
- Create: `public/img/{mixed-grill,burgers,sandwiches,salads,drinks,catering,live-music}.jpg`

> El executor tiene acceso al MCP de Figma. Las URLs de assets expiran (~7 días) y se obtienen en tiempo de ejecución, por eso NO están hardcodeadas aquí. fileKey: `i8khdC1vnhbDPeGXe10oNG`.

- [ ] **Step 1: Obtener el logo**

Llama a `get_screenshot` (o `get_design_context` para el asset del logo) sobre el nodo de la insignia de llama. Si no hay un nodo aislado del logo, usa `get_screenshot` del nodo `376:185` con `maxDimension` alto y recorta la insignia, o pide al usuario el SVG. Guarda en `public/logo/candela-flame.png`.

- [ ] **Step 2: Descargar las fotos de cada post**

Para cada nodo, llama a `get_design_context` (devuelve URLs de assets de las fotos) o `get_screenshot` y descarga la imagen principal con `curl`:

| Destino | nodeId |
|---|---|
| `public/img/mixed-grill.jpg` | `376:185` |
| `public/img/sandwiches.jpg` | `376:259` |
| `public/img/catering.jpg` | `376:333` |
| `public/img/drinks.jpg` | `376:403` |
| `public/img/salads.jpg` | `376:438` |
| `public/img/burgers.jpg` | `376:471` |
| `public/img/live-music.jpg` | `377:596` |

Ejemplo de descarga (la URL real se obtiene del MCP en runtime):
`curl -o public/img/burgers.jpg "<asset-url-del-mcp>"`

- [ ] **Step 3: Verificar que existen y pesan razonable**

Run: `ls -la public/img public/logo`
Expected: 7 imágenes en `img/` + 1 logo. Si alguna sale en baja resolución, re-solicita con `maxDimension` mayor.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "assets: extract logo + food photos from Figma"
```

---

## Fase 4 — Primitivas de UI

### Task 10: `components/ui/Button.tsx` y `components/ui/MemphisDots.tsx`

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/MemphisDots.tsx`

- [ ] **Step 1: Crear `components/ui/Button.tsx`**

```tsx
import Link from 'next/link';

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: 'fuego' | 'outline';
  className?: string;
};

export function Button({ href, children, variant = 'fuego', className = '' }: Props) {
  const base =
    'inline-flex items-center justify-center px-6 py-3 font-display uppercase tracking-tight text-lg transition-colors';
  const styles =
    variant === 'fuego'
      ? 'bg-fuego-cta text-crema hover:bg-fuego'
      : 'border-2 border-crema text-crema hover:bg-crema hover:text-carbon';
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Crear `components/ui/MemphisDots.tsx`**

```tsx
type Props = { className?: string; color?: string };

/** Rejilla 5x5 de puntos estilo Memphis. */
export function MemphisDots({ className = '', color = 'currentColor' }: Props) {
  return (
    <div className={`grid grid-cols-5 gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: 25 }).map((_, i) => (
        <span key={i} className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Build y commit**

Run: `npm run build`
Expected: OK.

```bash
git add components/ui/Button.tsx components/ui/MemphisDots.tsx
git commit -m "feat(ui): Button + MemphisDots primitives"
```

---

### Task 11: `components/ui/FlameBadge.tsx` (logo) + render test

**Files:**
- Create: `components/ui/FlameBadge.tsx`
- Test: `components/ui/FlameBadge.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

`components/ui/FlameBadge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlameBadge } from './FlameBadge';

describe('FlameBadge', () => {
  it('renderiza el logo con alt accesible', () => {
    render(<FlameBadge />);
    expect(screen.getByRole('img', { name: /candela/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- components/ui/FlameBadge.test.tsx`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Crear `components/ui/FlameBadge.tsx`**

```tsx
import Image from 'next/image';

type Props = { size?: number; className?: string };

export function FlameBadge({ size = 56, className = '' }: Props) {
  return (
    <Image
      src="/logo/candela-flame.png"
      alt="Candela & Café"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm test -- components/ui/FlameBadge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/FlameBadge.tsx components/ui/FlameBadge.test.tsx
git commit -m "feat(ui): FlameBadge logo component"
```

---

## Fase 5 — Layout

### Task 12: `ContactPill`, `Header`, `Footer`

**Files:**
- Create: `components/layout/ContactPill.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`

- [ ] **Step 1: Crear `components/layout/ContactPill.tsx`**

```tsx
import { site } from '@/data/site';
import { Button } from '@/components/ui/Button';

export function ContactPill() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-full bg-granate px-6 py-3 text-hueso sm:gap-6">
      <a href={site.phoneHref} className="font-body text-sm hover:text-crema sm:text-base">
        {site.phone}
      </a>
      <span className="hidden h-5 w-px bg-hueso/40 sm:block" />
      <a href={site.urlHref} className="font-body text-sm hover:text-crema sm:text-base">
        {site.url}
      </a>
      <Button href="/menu" className="px-4 py-2 text-base">
        Order Now
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Crear `components/layout/Header.tsx`**

```tsx
import Link from 'next/link';
import { FlameBadge } from '@/components/ui/FlameBadge';
import { Button } from '@/components/ui/Button';

const links = [
  { href: '/#burgers', label: 'Burgers' },
  { href: '/#sandwiches', label: 'Sandwiches' },
  { href: '/#salads', label: 'Salads' },
  { href: '/menu', label: 'Menú' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-carbon/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <FlameBadge size={44} />
          <span className="font-display text-xl uppercase tracking-tight text-crema">
            Candela &amp; Café
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-body text-sm text-hueso hover:text-fuego">
              {l.label}
            </Link>
          ))}
        </nav>
        <Button href="/menu" className="px-4 py-2 text-base">
          Order Now
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Crear `components/layout/Footer.tsx`**

```tsx
import { site } from '@/data/site';
import { ContactPill } from './ContactPill';

export function Footer() {
  return (
    <footer className="flame-overlay border-t border-white/10 bg-carbon px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <ContactPill />
        <div className="flex gap-4">
          <a href={site.social.instagram} className="font-body text-sm text-hueso/70 hover:text-fuego">
            Instagram
          </a>
        </div>
        <p className="font-body text-xs text-hueso/50">
          © {new Date().getFullYear()} {site.name}. Miami, FL.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Build y commit**

Run: `npm run build`
Expected: OK.

```bash
git add components/layout/
git commit -m "feat(layout): Header, Footer, ContactPill"
```

---

## Fase 6 — Landing

### Task 13: `Hero` y `ConceptSection`

**Files:**
- Create: `components/landing/Hero.tsx`, `components/landing/ConceptSection.tsx`

- [ ] **Step 1: Crear `components/landing/Hero.tsx`**

```tsx
import Image from 'next/image';
import { site } from '@/data/site';
import { Button } from '@/components/ui/Button';
import { MemphisDots } from '@/components/ui/MemphisDots';

export function Hero() {
  return (
    <section className="flame-overlay relative overflow-hidden bg-carbon px-4 pt-16 pb-20">
      <MemphisDots className="absolute left-6 top-6 text-lima opacity-60" color="#68b51b" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="text-center md:text-left">
          <p className="font-hand text-3xl text-crema-2">{site.tagline}!</p>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none text-crema sm:text-7xl">
            Flame-Grilled<br />Goodness
          </h1>
          <p className="mt-4 font-body text-lg text-hueso/80">
            Enjoy our special mixed grill today. Burgers, sandwiches, parrilla y más.
          </p>
          <div className="mt-6 flex justify-center gap-3 md:justify-start">
            <Button href="/menu">Order Now</Button>
            <Button href="/#burgers" variant="outline">Ver Menú</Button>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-0 rounded-full bg-fuego" />
          <Image
            src="/img/mixed-grill.jpg"
            alt="Mixed grill"
            fill
            className="rounded-full object-cover p-3"
            priority
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Crear `components/landing/ConceptSection.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { LandingConcept } from '@/data/site';

export function ConceptSection({ concept, reverse = false }: { concept: LandingConcept; reverse?: boolean }) {
  const accentText = concept.accent === 'fuego' ? 'text-fuego' : 'text-lima';
  return (
    <section id={concept.id} className="bg-carbon px-4 py-14">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 ${
          reverse ? 'md:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div className={`absolute inset-0 rounded-full ${concept.accent === 'fuego' ? 'bg-fuego/20' : 'bg-lima/20'}`} />
          <Image src={concept.image} alt={concept.kicker} fill className="rounded-full object-cover p-2" />
        </div>
        <div className="text-center md:text-left">
          <p className={`font-hand text-2xl ${accentText}`}>{concept.kicker}</p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-none text-crema sm:text-5xl">
            {concept.title}
          </h2>
          <p className="mt-3 font-body text-base text-hueso/80">{concept.copy}</p>
          <Link href="/menu" className="mt-4 inline-block font-display uppercase text-fuego hover:text-crema">
            Ver en el menú →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build y commit**

Run: `npm run build`
Expected: OK.

```bash
git add components/landing/Hero.tsx components/landing/ConceptSection.tsx
git commit -m "feat(landing): Hero + ConceptSection"
```

---

### Task 14: `Catering`, `LiveMusic` y ensamblar `app/page.tsx`

**Files:**
- Create: `components/landing/Catering.tsx`, `components/landing/LiveMusic.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Crear `components/landing/Catering.tsx`**

```tsx
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export function Catering() {
  return (
    <section id="catering" className="relative overflow-hidden bg-fuego px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="text-carbon">
          <p className="font-hand text-2xl">Corporate Catering</p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-none sm:text-5xl">
            Elevate Your Events
          </h2>
          <p className="mt-3 font-body text-base text-carbon/80">
            Eleva tus eventos con nuestro servicio de catering exclusivo.
          </p>
          <Button href="/menu" variant="outline" className="mt-5 border-carbon text-carbon hover:bg-carbon hover:text-crema">
            Solicitar
          </Button>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-md">
          <Image src="/img/catering.jpg" alt="Catering" fill className="rounded-3xl object-cover" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Crear `components/landing/LiveMusic.tsx`**

```tsx
import Image from 'next/image';

export function LiveMusic() {
  return (
    <section id="live-music" className="relative overflow-hidden bg-carbon px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          <Image src="/img/live-music.jpg" alt="Live music" fill className="rounded-3xl object-cover" />
        </div>
        <div className="text-center md:text-left">
          <p className="font-hand text-2xl text-lima">Every Weekend</p>
          <h2 className="mt-1 font-display text-5xl uppercase leading-none text-crema">
            Live Music<br />Nights
          </h2>
          <p className="mt-3 font-body text-base text-hueso/80">
            Música en vivo, buena comida y mejores momentos. Acompáñanos cada fin de semana.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Reescribir `app/page.tsx`**

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { ConceptSection } from '@/components/landing/ConceptSection';
import { Catering } from '@/components/landing/Catering';
import { LiveMusic } from '@/components/landing/LiveMusic';
import { concepts } from '@/data/site';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {concepts.map((c, i) => (
          <ConceptSection key={c.id} concept={c} reverse={i % 2 === 1} />
        ))}
        <Catering />
        <LiveMusic />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Build y verificación visual**

Run: `npm run build` → Expected: OK.
Run: `npm run dev` y abre `http://localhost:3000`. Compara contra los posts del Figma (paleta, fuentes, logo, secciones). Ajusta espaciados si hace falta.

- [ ] **Step 5: Commit**

```bash
git add components/landing/Catering.tsx components/landing/LiveMusic.tsx app/page.tsx
git commit -m "feat(landing): Catering, LiveMusic, assemble landing page"
```

---

## Fase 7 — Menú

### Task 15: `lib/search.ts` — filtro de menú (TDD)

**Files:**
- Create: `lib/search.ts`
- Test: `lib/search.test.ts`

- [ ] **Step 1: Escribir el test que falla**

`lib/search.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { filterMenu } from './search';
import { menu } from '@/data/menu';

describe('filterMenu', () => {
  it('query vacío devuelve todas las categorías', () => {
    expect(filterMenu(menu, '')).toHaveLength(menu.length);
  });

  it('filtra por nombre de ítem (case-insensitive)', () => {
    const res = filterMenu(menu, 'burger');
    const names = res.flatMap((c) => c.items.map((i) => i.name.toLowerCase()));
    expect(names.every((n) => n.includes('burger'))).toBe(true);
    expect(res.flatMap((c) => c.items).length).toBeGreaterThan(0);
  });

  it('omite categorías sin coincidencias', () => {
    const res = filterMenu(menu, 'churrasco');
    expect(res.every((c) => c.items.length > 0)).toBe(true);
  });

  it('coincide también por descripción', () => {
    const res = filterMenu(menu, 'chimichurri');
    expect(res.flatMap((c) => c.items).some((i) => i.id === 'grill-churrasco')).toBe(true);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- lib/search.test.ts`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Crear `lib/search.ts`**

```ts
import type { MenuCategory } from '@/data/menu';

export function filterMenu(menu: MenuCategory[], query: string): MenuCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false),
      ),
    }))
    .filter((c) => c.items.length > 0);
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm test -- lib/search.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/search.ts lib/search.test.ts
git commit -m "feat(menu): filterMenu search helper (TDD)"
```

---

### Task 16: `MenuCard`, `OrderTypeToggle`, `CategoryTabs`, `SearchBar`

**Files:**
- Create: `components/menu/MenuCard.tsx`, `components/menu/OrderTypeToggle.tsx`, `components/menu/CategoryTabs.tsx`, `components/menu/SearchBar.tsx`

- [ ] **Step 1: Crear `components/menu/MenuCard.tsx`**

```tsx
'use client';

import { useCart } from '@/lib/cart-context';
import type { MenuItem } from '@/data/menu';

const tagStyles: Record<string, string> = {
  spicy: 'bg-fuego/20 text-fuego',
  veggie: 'bg-lima/20 text-lima',
  popular: 'bg-crema/15 text-crema',
  new: 'bg-lima/20 text-lima',
};

export function MenuCard({ item }: { item: MenuItem }) {
  const { dispatch } = useCart();
  return (
    <article className="flex items-start justify-between gap-4 rounded-2xl bg-carbon-2 p-4">
      <div>
        <h3 className="font-body text-base font-semibold text-crema">{item.name}</h3>
        {item.description && <p className="mt-1 font-body text-sm text-hueso/60">{item.description}</p>}
        {item.tags && (
          <div className="mt-2 flex gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${tagStyles[t]}`}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-display text-xl text-crema-2">${item.price}</span>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD', itemId: item.id })}
          aria-label={`Agregar ${item.name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-fuego-cta text-crema transition-colors hover:bg-fuego"
        >
          +
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Crear `components/menu/OrderTypeToggle.tsx`**

```tsx
'use client';

import { useCart } from '@/lib/cart-context';
import type { OrderType } from '@/lib/cart';

const options: { value: OrderType; label: string }[] = [
  { value: 'dine-in', label: 'Para comer aquí' },
  { value: 'to-go', label: 'Para llevar' },
];

export function OrderTypeToggle() {
  const { state, dispatch } = useCart();
  return (
    <div className="inline-flex rounded-full bg-carbon-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => dispatch({ type: 'SET_ORDER_TYPE', orderType: o.value })}
          className={`rounded-full px-4 py-1.5 font-body text-sm transition-colors ${
            state.orderType === o.value ? 'bg-fuego text-crema' : 'text-hueso/70'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Crear `components/menu/CategoryTabs.tsx`**

```tsx
'use client';

import { menu } from '@/data/menu';

export function CategoryTabs() {
  return (
    <nav className="no-scrollbar sticky top-[64px] z-40 flex gap-2 overflow-x-auto bg-carbon/95 px-4 py-3 backdrop-blur">
      {menu.map((c) => (
        <a
          key={c.id}
          href={`#cat-${c.id}`}
          className="whitespace-nowrap rounded-full border border-white/15 px-4 py-1.5 font-body text-sm text-hueso hover:border-fuego hover:text-fuego"
        >
          {c.label}
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Crear `components/menu/SearchBar.tsx`**

```tsx
'use client';

type Props = { value: string; onChange: (v: string) => void };

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="px-4 py-3">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar en el menú…"
        className="w-full rounded-full bg-carbon-2 px-5 py-3 font-body text-sm text-crema placeholder:text-hueso/40 focus:outline-none focus:ring-2 focus:ring-fuego"
      />
    </div>
  );
}
```

- [ ] **Step 5: Build y commit**

Run: `npm run build` → Expected: OK.

```bash
git add components/menu/MenuCard.tsx components/menu/OrderTypeToggle.tsx components/menu/CategoryTabs.tsx components/menu/SearchBar.tsx
git commit -m "feat(menu): MenuCard, OrderTypeToggle, CategoryTabs, SearchBar"
```

---

### Task 17: `Cart.tsx` (FAB + panel) + render test

**Files:**
- Create: `components/menu/Cart.tsx`
- Test: `components/menu/Cart.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

`components/menu/Cart.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '@/lib/cart-context';
import { Cart } from './Cart';
import { MenuCard } from './MenuCard';
import { findItem } from '@/data/menu';

function setup() {
  const item = findItem('burger-classic')!;
  return render(
    <CartProvider>
      <MenuCard item={item} />
      <Cart />
    </CartProvider>,
  );
}

describe('Cart', () => {
  it('arranca con el FAB en 0 y abre el panel al click', () => {
    setup();
    const fab = screen.getByRole('button', { name: /carrito/i });
    expect(fab).toHaveTextContent('0');
  });

  it('al agregar un ítem, el contador del FAB sube', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /agregar candela classic/i }));
    expect(screen.getByRole('button', { name: /carrito/i })).toHaveTextContent('1');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm test -- components/menu/Cart.test.tsx`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Crear `components/menu/Cart.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { cartTotal, lineCount } from '@/lib/cart';
import { findItem } from '@/data/menu';
import { OrderTypeToggle } from './OrderTypeToggle';

export function Cart() {
  const { state, dispatch } = useCart();
  const [open, setOpen] = useState(false);
  const count = lineCount(state);
  const total = cartTotal(state);

  return (
    <>
      <button
        type="button"
        aria-label="Carrito"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-fuego-cta px-5 py-3 font-display text-lg uppercase text-crema shadow-lg hover:bg-fuego"
      >
        <span>Carrito</span>
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-crema px-1 text-sm text-carbon">
          {count}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setOpen(false)}>
          <aside
            className="flex h-full w-full max-w-md flex-col bg-carbon p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase text-crema">Tu pedido</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-hueso/70 hover:text-crema">
                ✕
              </button>
            </div>

            <div className="my-4">
              <OrderTypeToggle />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {state.lines.length === 0 && <p className="font-body text-sm text-hueso/60">Tu carrito está vacío.</p>}
              {state.lines.map((line) => {
                const item = findItem(line.itemId);
                if (!item) return null;
                return (
                  <div key={line.itemId} className="flex items-center justify-between gap-3 rounded-xl bg-carbon-2 p-3">
                    <div>
                      <p className="font-body text-sm text-crema">{item.name}</p>
                      <p className="font-body text-xs text-hueso/60">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Quitar uno de ${item.name}`}
                        onClick={() => dispatch({ type: 'DECREMENT', itemId: line.itemId })}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-crema"
                      >
                        −
                      </button>
                      <span className="min-w-5 text-center font-body text-sm text-crema">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={`Agregar uno de ${item.name}`}
                        onClick={() => dispatch({ type: 'ADD', itemId: line.itemId })}
                        className="grid h-7 w-7 place-items-center rounded-full bg-fuego-cta text-crema"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-hueso/80">Total</span>
                <span className="font-display text-2xl text-crema-2">${total}</span>
              </div>
              <button
                type="button"
                disabled={state.lines.length === 0}
                className="mt-3 w-full rounded-full bg-fuego-cta py-3 font-display uppercase text-crema hover:bg-fuego disabled:opacity-40"
              >
                Order Now
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm test -- components/menu/Cart.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/menu/Cart.tsx components/menu/Cart.test.tsx
git commit -m "feat(menu): Cart FAB + panel with order type (TDD render)"
```

---

### Task 18: Ensamblar `app/menu/page.tsx`

**Files:**
- Create: `components/menu/MenuView.tsx` (client), `app/menu/page.tsx` (server)

> El filtrado por búsqueda necesita estado de cliente; el `page.tsx` (server) renderiza un componente cliente `MenuView`.

- [ ] **Step 1: Crear `components/menu/MenuView.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { menu } from '@/data/menu';
import { filterMenu } from '@/lib/search';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { MenuCard } from './MenuCard';
import { Cart } from './Cart';

export function MenuView() {
  const [query, setQuery] = useState('');
  const filtered = filterMenu(menu, query);

  return (
    <>
      <SearchBar value={query} onChange={setQuery} />
      <CategoryTabs />
      <div className="mx-auto max-w-3xl px-4 pb-28">
        {filtered.length === 0 && (
          <p className="py-12 text-center font-body text-hueso/60">Sin resultados para “{query}”.</p>
        )}
        {filtered.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-32 py-6">
            <h2 className={`mb-4 font-display text-3xl uppercase ${cat.accent === 'fuego' ? 'text-fuego' : 'text-lima'}`}>
              {cat.label}
            </h2>
            <div className="space-y-3">
              {cat.items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <Cart />
    </>
  );
}
```

- [ ] **Step 2: Crear `app/menu/page.tsx`**

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart-context';
import { MenuView } from '@/components/menu/MenuView';

export default function MenuPage() {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen bg-carbon">
        <div className="flame-overlay px-4 py-8 text-center">
          <p className="font-hand text-2xl text-crema-2">Nuestro Menú</p>
          <h1 className="font-display text-5xl uppercase text-crema">Candela &amp; Café</h1>
        </div>
        <MenuView />
      </main>
      <Footer />
    </CartProvider>
  );
}
```

- [ ] **Step 3: Build + verificación**

Run: `npm run build` → Expected: OK, `out/menu/index.html` generado.
Run: `npm run dev`, abre `http://localhost:3000/menu`. Verifica: tabs, búsqueda, agregar al carrito, +/−, total, toggle aquí/llevar, persistencia (recargar la página mantiene el carrito).

- [ ] **Step 4: Commit**

```bash
git add components/menu/MenuView.tsx app/menu/page.tsx
git commit -m "feat(menu): assemble menu page with search, tabs, cart"
```

---

## Fase 8 — Deploy y limpieza

### Task 19: Actualizar `netlify.toml` para Next static export

**Files:**
- Modify: `netlify.toml`

- [ ] **Step 1: Revisar el `netlify.toml` actual**

Run: `cat netlify.toml`

- [ ] **Step 2: Reemplazar contenido por config de Next export**

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 3: Commit**

```bash
git add netlify.toml
git commit -m "chore(deploy): netlify build for next static export"
```

---

### Task 20: Eliminar HTML legacy y assets sin uso

**Files:**
- Delete: `index.html`, `menu.html`
- Revisar: `assets/` (mover lo que se siga usando a `public/`; el resto se borra)

- [ ] **Step 1: Confirmar que nada del nuevo código referencia los viejos**

Run: `grep -rn "index.html\|menu.html" app components lib data` → Expected: sin resultados.

- [ ] **Step 2: Borrar los HTML monolíticos**

```bash
git rm index.html menu.html
```

- [ ] **Step 3: Revisar `assets/`**

Run: `ls assets`
Si hay imágenes aún necesarias, muévelas a `public/img/` y actualiza referencias. Si no se usan, bórralas: `git rm -r assets` (los docs de `design/` se conservan).

- [ ] **Step 4: Build final**

Run: `npm run build`
Expected: OK, `out/` contiene `index.html` (landing) y `menu/index.html`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy monolithic HTML"
```

---

### Task 21: Verificación final (full suite + visual)

- [ ] **Step 1: Correr toda la suite de tests**

Run: `npm test`
Expected: todos los tests pasan (menu, cart, search, FlameBadge, Cart).

- [ ] **Step 2: Build de producción**

Run: `npm run build`
Expected: sin errores ni warnings de tipos; `out/` generado.

- [ ] **Step 3: Servir el export y revisar**

Run: `npx serve out` (o abre los HTML de `out/`).
Verifica contra el spec §13:
- Landing on-brand vs Figma (paleta fuego, fuentes, logo, secciones).
- `/menu`: tabs, búsqueda, carrito (add/remove/total/persistencia), toggle.
- Responsive mobile-first (DevTools, ancho ~390px).
- No quedan referencias a identidad dominicana ni paleta vieja.

- [ ] **Step 4: Commit final (si hubo ajustes)**

```bash
git add -A
git commit -m "chore: final polish + verification pass"
```

---

## Self-review (cobertura del spec)

- §3 Sistema de diseño → Task 2 (tokens Tailwind) + Task 3 (fuentes/globals). ✔
- §4 Arquitectura/estructura → Tasks 1–4 (scaffold) + estructura de carpetas a lo largo del plan. ✔
- §5 Componentes → Tasks 10–18. ✔
- §6 Modelo de datos → Tasks 5–7 (site, menu, cart types). ✔
- §7 Carta borrador → Task 6. ✔
- §8 Landing secciones → Tasks 13–14. ✔
- §9 Menú comportamiento → Tasks 15–18. ✔
- §10 Assets Figma → Task 9. ✔
- §11 Migración → Tasks 14/18 (reescritura) + Task 20 (borrado HTML). ✔
- §12 Fuera de alcance → respetado (sin backend/pagos/auth/i18n). ✔
- §13 Verificación → Task 21. ✔

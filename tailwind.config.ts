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

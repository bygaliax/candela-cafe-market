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

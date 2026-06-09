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

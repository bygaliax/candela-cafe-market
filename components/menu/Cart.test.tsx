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

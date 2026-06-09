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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', state: JSON.parse(raw) as CartState });
    } catch {
      /* ignore */
    }
  }, []);

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

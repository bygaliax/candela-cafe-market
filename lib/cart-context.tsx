'use client';

import { createContext, useContext, useEffect, useRef, useReducer } from 'react';
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

/** Valida la forma del estado leído de localStorage antes de confiar en él. */
function isCartState(value: unknown): value is CartState {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return Array.isArray(s.lines) && (s.orderType === 'dine-in' || s.orderType === 'to-go');
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const skipNextPersist = useRef(true);

  // Hidratar desde localStorage al montar (solo cliente).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isCartState(parsed)) dispatch({ type: 'HYDRATE', state: parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persistir en cada cambio. Se omite la primera ejecución (montaje) para no
  // pisar lo guardado con el estado inicial vacío antes de hidratar.
  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
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

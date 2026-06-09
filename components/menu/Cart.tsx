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

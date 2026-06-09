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
          aria-pressed={state.orderType === o.value}
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

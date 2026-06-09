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

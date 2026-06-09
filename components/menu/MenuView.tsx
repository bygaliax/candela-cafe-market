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
          <p className="py-12 text-center font-body text-hueso/60">Sin resultados para "{query}".</p>
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

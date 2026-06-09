'use client';

import { menu } from '@/data/menu';

export function CategoryTabs() {
  return (
    <nav className="no-scrollbar sticky top-[64px] z-40 flex gap-2 overflow-x-auto bg-carbon/95 px-4 py-3 backdrop-blur">
      {menu.map((c) => (
        <a
          key={c.id}
          href={`#cat-${c.id}`}
          className="whitespace-nowrap rounded-full border border-white/15 px-4 py-1.5 font-body text-sm text-hueso hover:border-fuego hover:text-fuego"
        >
          {c.label}
        </a>
      ))}
    </nav>
  );
}

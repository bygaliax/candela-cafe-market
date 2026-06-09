import type { MenuCategory } from '@/data/menu';

export function filterMenu(menu: MenuCategory[], query: string): MenuCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return menu;
  return menu
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false),
      ),
    }))
    .filter((c) => c.items.length > 0);
}

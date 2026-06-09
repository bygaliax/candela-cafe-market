import { describe, it, expect } from 'vitest';
import { filterMenu } from './search';
import { menu } from '@/data/menu';

describe('filterMenu', () => {
  it('query vacío devuelve todas las categorías', () => {
    expect(filterMenu(menu, '')).toHaveLength(menu.length);
  });

  it('filtra por nombre de ítem (case-insensitive)', () => {
    const res = filterMenu(menu, 'burger');
    const names = res.flatMap((c) => c.items.map((i) => i.name.toLowerCase()));
    expect(names.every((n) => n.includes('burger'))).toBe(true);
    expect(res.flatMap((c) => c.items).length).toBeGreaterThan(0);
  });

  it('omite categorías sin coincidencias', () => {
    const res = filterMenu(menu, 'churrasco');
    expect(res.every((c) => c.items.length > 0)).toBe(true);
  });

  it('coincide también por descripción', () => {
    const res = filterMenu(menu, 'chimichurri');
    expect(res.flatMap((c) => c.items).some((i) => i.id === 'grill-churrasco')).toBe(true);
  });
});

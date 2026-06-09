import { describe, it, expect } from 'vitest';
import { menu } from './menu';

describe('menu data integrity', () => {
  const allItems = menu.flatMap((c) => c.items);

  it('has at least one category', () => {
    expect(menu.length).toBeGreaterThan(0);
  });

  it('every category has id and label', () => {
    for (const c of menu) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.items.length).toBeGreaterThan(0);
    }
  });

  it('item ids are globally unique', () => {
    const ids = allItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every item has a positive price', () => {
    for (const i of allItems) {
      expect(i.price).toBeGreaterThan(0);
    }
  });
});

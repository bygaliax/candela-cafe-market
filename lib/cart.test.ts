import { describe, it, expect } from 'vitest';
import {
  cartReducer,
  initialCartState,
  lineCount,
  cartTotal,
  type CartState,
} from './cart';

describe('cartReducer', () => {
  it('ADD agrega una línea nueva con qty 1', () => {
    const s = cartReducer(initialCartState, { type: 'ADD', itemId: 'burger-classic' });
    expect(s.lines).toEqual([{ itemId: 'burger-classic', qty: 1 }]);
  });

  it('ADD repetido incrementa la qty', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'burger-classic' });
    s = cartReducer(s, { type: 'ADD', itemId: 'burger-classic' });
    expect(s.lines).toEqual([{ itemId: 'burger-classic', qty: 2 }]);
  });

  it('DECREMENT baja la qty y elimina la línea al llegar a 0', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'DECREMENT', itemId: 'side-fries' });
    expect(s.lines).toEqual([]);
  });

  it('REMOVE elimina la línea', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'REMOVE', itemId: 'side-fries' });
    expect(s.lines).toEqual([]);
  });

  it('SET_QTY a 0 elimina la línea', () => {
    let s = cartReducer(initialCartState, { type: 'ADD', itemId: 'side-fries' });
    s = cartReducer(s, { type: 'SET_QTY', itemId: 'side-fries', qty: 0 });
    expect(s.lines).toEqual([]);
  });

  it('CLEAR vacía las líneas pero conserva orderType', () => {
    let s: CartState = { lines: [{ itemId: 'side-fries', qty: 2 }], orderType: 'to-go' };
    s = cartReducer(s, { type: 'CLEAR' });
    expect(s.lines).toEqual([]);
    expect(s.orderType).toBe('to-go');
  });

  it('SET_ORDER_TYPE cambia el tipo de pedido', () => {
    const s = cartReducer(initialCartState, { type: 'SET_ORDER_TYPE', orderType: 'to-go' });
    expect(s.orderType).toBe('to-go');
  });
});

describe('selectores', () => {
  it('lineCount suma todas las cantidades', () => {
    const s: CartState = {
      lines: [
        { itemId: 'burger-classic', qty: 2 },
        { itemId: 'side-fries', qty: 1 },
      ],
      orderType: 'dine-in',
    };
    expect(lineCount(s)).toBe(3);
  });

  it('cartTotal suma precio * qty usando la carta', () => {
    const s: CartState = {
      lines: [
        { itemId: 'burger-classic', qty: 2 },
        { itemId: 'side-fries', qty: 1 },
      ],
      orderType: 'dine-in',
    };
    expect(cartTotal(s)).toBe(28);
  });

  it('cartTotal ignora ids inexistentes', () => {
    const s: CartState = { lines: [{ itemId: 'no-existe', qty: 5 }], orderType: 'dine-in' };
    expect(cartTotal(s)).toBe(0);
  });
});

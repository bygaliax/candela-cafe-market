import { findItem } from '@/data/menu';

export type OrderType = 'dine-in' | 'to-go';
export type CartLine = { itemId: string; qty: number };
export type CartState = { lines: CartLine[]; orderType: OrderType };

export type CartAction =
  | { type: 'ADD'; itemId: string }
  | { type: 'DECREMENT'; itemId: string }
  | { type: 'REMOVE'; itemId: string }
  | { type: 'SET_QTY'; itemId: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'SET_ORDER_TYPE'; orderType: OrderType }
  /** Interno: usado solo por la capa de persistencia (CartProvider). Reemplaza el estado completo. */
  | { type: 'HYDRATE'; state: CartState };

export const initialCartState: CartState = { lines: [], orderType: 'dine-in' };

function setQty(lines: CartLine[], itemId: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.itemId !== itemId);
  const exists = lines.some((l) => l.itemId === itemId);
  if (exists) return lines.map((l) => (l.itemId === itemId ? { ...l, qty } : l));
  return [...lines, { itemId, qty }];
}

function qtyOf(lines: CartLine[], itemId: string): number {
  return lines.find((l) => l.itemId === itemId)?.qty ?? 0;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD':
      return { ...state, lines: setQty(state.lines, action.itemId, qtyOf(state.lines, action.itemId) + 1) };
    case 'DECREMENT':
      return { ...state, lines: setQty(state.lines, action.itemId, qtyOf(state.lines, action.itemId) - 1) };
    case 'REMOVE':
      return { ...state, lines: state.lines.filter((l) => l.itemId !== action.itemId) };
    case 'SET_QTY':
      return { ...state, lines: setQty(state.lines, action.itemId, action.qty) };
    case 'CLEAR':
      return { ...state, lines: [] };
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.orderType };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

export function lineCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartTotal(state: CartState): number {
  return state.lines.reduce((sum, l) => {
    const item = findItem(l.itemId);
    return item ? sum + item.price * l.qty : sum;
  }, 0);
}

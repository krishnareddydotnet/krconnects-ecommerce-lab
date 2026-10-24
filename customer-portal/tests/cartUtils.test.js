import { describe, it, expect } from 'vitest';
import { getCartLines, getCartSummary } from '../src/utils/cartUtils.js';

const products = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 1599 },
  { id: 2, name: 'Clean Code', category: 'Books', price: 499 }
];

describe('cartUtils', () => {
  it('builds cart lines with line totals', () => {
    const lines = getCartLines(products, { 1: 2 });
    expect(lines[0].lineTotal).toBe(3198);
  });

  it('skips products that are no longer in the catalog', () => {
    const lines = getCartLines(products, { 999: 1 });
    expect(lines).toEqual([]);
  });

  it('free delivery above ₹999', () => {
    const summary = getCartSummary(getCartLines(products, { 1: 1 }));
    expect(summary).toEqual({ itemCount: 1, subtotal: 1599, delivery: 0, total: 1599 });
  });

  it('₹49 delivery for orders of ₹999 or less', () => {
    const summary = getCartSummary(getCartLines(products, { 2: 1 }));
    expect(summary).toEqual({ itemCount: 1, subtotal: 499, delivery: 49, total: 548 });
  });
});

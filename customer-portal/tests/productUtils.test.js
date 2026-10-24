import { describe, it, expect } from 'vitest';
import { formatPrice, getCategories, getVisibleProducts, getSimilarProducts } from '../src/utils/productUtils.js';

const products = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 1599 },
  { id: 2, name: 'Standing Desk', category: 'Furniture', price: 5199 },
  { id: 3, name: 'Clean Code', category: 'Books', price: 1099 }
];

describe('formatPrice', () => {
  it('formats a number as Indian rupees', () => {
    expect(formatPrice(1599)).toBe('₹1,599.00');
  });
});

describe('getCategories', () => {
  it('returns All first, then unique categories A to Z', () => {
    expect(getCategories(products)).toEqual(['All', 'Books', 'Electronics', 'Furniture']);
  });
});

describe('getVisibleProducts', () => {
  it('filters by category', () => {
    const result = getVisibleProducts(products, 'Books', '', 'featured');
    expect(result.map((p) => p.id)).toEqual([3]);
  });

  it('filters by search text (name or category, any case)', () => {
    const result = getVisibleProducts(products, 'All', 'DESK', 'featured');
    expect(result.map((p) => p.id)).toEqual([2]);
  });

  it('sorts by price low to high', () => {
    const result = getVisibleProducts(products, 'All', '', 'price-asc');
    expect(result.map((p) => p.id)).toEqual([3, 1, 2]);
  });

  it('sorts by name A to Z', () => {
    const result = getVisibleProducts(products, 'All', '', 'name-asc');
    expect(result.map((p) => p.name)).toEqual(['Clean Code', 'Standing Desk', 'Wireless Mouse']);
  });
});

describe('getSimilarProducts', () => {
  it('returns other products in the same category only', () => {
    const list = [...products, { id: 4, name: 'Bookshelf', category: 'Furniture', price: 5599 }];
    const result = getSimilarProducts(list, list[1]); // Standing Desk
    expect(result.map((p) => p.id)).toEqual([4]);
  });
});

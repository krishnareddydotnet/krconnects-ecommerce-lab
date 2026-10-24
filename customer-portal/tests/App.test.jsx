import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';

// Same shape as the real Catalog API /products response
const sampleResponse = {
  message: 'KRConnects Catalog API',
  service: 'krconnects-catalog-api',
  timestamp: '2026-10-24T03:00:00.000Z',
  products: [
    { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 1599 },
    { id: 2, name: 'Standing Desk', category: 'Furniture', price: 5199 },
    { id: 3, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 1799 }
  ]
};

describe('App (storefront)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loading message first', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<App />);
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('shows products and prices from the Catalog API', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    render(<App />);

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('₹1,599.00')).toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 3 products')).toBeInTheDocument();
  });

  it('filters products when the user types in the search box', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    render(<App />);
    await screen.findByText('Wireless Mouse');

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'desk' }
    });

    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('filters products when a category chip is clicked', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    render(<App />);
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getByRole('button', { name: 'Furniture' }));

    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('shows "No products found" when nothing matches', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    render(<App />);
    await screen.findByText('Wireless Mouse');

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'laptop' }
    });

    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('updates the cart count when Add to cart is clicked', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    render(<App />);
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getAllByRole('button', { name: 'Add to cart' })[0]);

    expect(screen.getByRole('button', { name: 'Cart, 1 items' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Added ✓' })).toBeInTheDocument();
  });

  it('shows an error message when the Catalog API call fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    render(<App />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

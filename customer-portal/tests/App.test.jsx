import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';

// App uses routes, so tests wrap it in MemoryRouter (a router without a real browser URL).
// "url" is the page to start on, e.g. '/' or '/product/2'.
function renderApp(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  );
}

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
    renderApp();
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('shows products and prices from the Catalog API', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('₹1,599.00')).toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 3 products')).toBeInTheDocument();
  });

  it('filters products when the user types in the search box', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();
    await screen.findByText('Wireless Mouse');

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'desk' }
    });

    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('filters products when a category chip is clicked', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getByRole('button', { name: 'Furniture' }));

    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('shows "No products found" when nothing matches', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();
    await screen.findByText('Wireless Mouse');

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'laptop' }
    });

    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('updates the cart count when Add to cart is clicked', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getAllByRole('button', { name: 'Add to cart' })[0]);

    expect(screen.getByRole('button', { name: 'Cart, 1 items' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Added ✓' })).toBeInTheDocument();
  });

  it('shows an error message when the Catalog API call fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });
    renderApp();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('opens the product details page when a product name is clicked', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });
    renderApp();
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getByRole('link', { name: 'Standing Desk' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Standing Desk' })).toBeInTheDocument();
    expect(screen.getByText('₹5,199.00')).toBeInTheDocument();
  });
});

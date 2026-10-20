import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProductCatalog from '../src/components/ProductCatalog.jsx';

// Sample response, same shape as the real Catalog API /products
const sampleResponse = {
  message: 'KRConnects Catalog API — sample product catalog data.',
  service: 'krconnects-catalog-api',
  timestamp: '2026-10-20T03:38:51.000Z',
  products: [
    { id: 1, name: 'Wireless Mouse', category: 'Electronics' },
    { id: 2, name: 'Standing Desk', category: 'Furniture' },
    { id: 3, name: 'Noise Cancelling Headphones', category: 'Electronics' }
  ]
};

describe('ProductCatalog', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays the loading state initially', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // never resolves

    render(<ProductCatalog />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('displays all products after a successful call', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.getByText('Noise Cancelling Headphones')).toBeInTheDocument();
  });

  it('filters products when the user types in the search box', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'desk' }
    });

    expect(screen.getByText('Standing Desk')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('shows "No products found." when nothing matches', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => sampleResponse });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by name or category'), {
      target: { value: 'laptop' }
    });

    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('displays an error message when the Catalog API call fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 503 });

    render(<ProductCatalog />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

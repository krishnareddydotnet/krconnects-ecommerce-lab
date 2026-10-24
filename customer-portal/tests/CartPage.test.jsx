import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';

const products = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 1599 },
  { id: 2, name: 'Clean Code', category: 'Books', price: 499 }
];

// Products API + a logged-in user ("test-token" saved below)
function fakeFetch(url) {
  const reply = (status, body) => Promise.resolve({ ok: status < 400, status, json: async () => body });
  if (url.endsWith('/catalog-api/products')) return reply(200, { products });
  if (url.endsWith('/api/auth/me')) return reply(200, { id: 1, username: 'krishna' });
  return reply(404, {});
}

// Open the site at a URL, with a cart already saved in the browser
function renderWithCart(url, cart) {
  localStorage.setItem('krconnects_cart', JSON.stringify(cart));
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn(fakeFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clicking the cart icon opens the cart page', async () => {
    renderWithCart('/', { 1: 2 });
    await screen.findAllByText('Wireless Mouse');

    fireEvent.click(screen.getByRole('link', { name: 'Cart, 2 items' }));

    expect(screen.getByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
  });

  it('shows the empty cart message', async () => {
    renderWithCart('/cart', {});
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
  });

  it('shows items, line totals and free delivery above ₹999', async () => {
    renderWithCart('/cart', { 1: 2 });   // 2 x 1599 = 3198

    expect(await screen.findByRole('heading', { name: 'Your cart' })).toBeInTheDocument();
    expect(screen.getAllByText('₹3,198.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('charges ₹49 delivery for small orders', async () => {
    renderWithCart('/cart', { 2: 1 });   // 499 -> + 49 = 548

    expect(await screen.findByText('₹49.00')).toBeInTheDocument();
    expect(screen.getByText('₹548.00')).toBeInTheDocument();
  });

  it('+ and − change the quantity and the cart count', async () => {
    renderWithCart('/cart', { 1: 1 });
    await screen.findByRole('heading', { name: 'Your cart' });

    fireEvent.click(screen.getByRole('button', { name: 'Increase Wireless Mouse' }));
    expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Decrease Wireless Mouse' }));
    expect(screen.getByRole('link', { name: 'Cart, 1 items' })).toBeInTheDocument();
  });

  it('Remove takes the product out of the cart', async () => {
    renderWithCart('/cart', { 1: 1 });
    await screen.findByRole('heading', { name: 'Your cart' });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Wireless Mouse' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('keeps the cart after a refresh (saved in the browser)', async () => {
    renderWithCart('/', {});
    await screen.findByText('Wireless Mouse');

    fireEvent.click(screen.getAllByRole('button', { name: 'Add to cart' })[0]);

    expect(JSON.parse(localStorage.getItem('krconnects_cart'))).toEqual({ 1: 1 });
  });

  it('asks to log in before placing an order', async () => {
    renderWithCart('/cart', { 1: 1 });

    expect(await screen.findByRole('button', { name: 'Log in to place your order' })).toBeInTheDocument();
  });

  it('logged-in user places a (demo) order and the cart is emptied', async () => {
    localStorage.setItem('krconnects_token', 'test-token');
    renderWithCart('/cart', { 1: 1 });

    fireEvent.click(await screen.findByRole('button', { name: 'Place order' }));

    expect(screen.getByRole('heading', { name: 'Thank you, krishna!' })).toBeInTheDocument();
    expect(screen.getByText(/Order number/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart, 0 items' })).toBeInTheDocument();
  });
});

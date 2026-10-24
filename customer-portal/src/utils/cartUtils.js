// -----------------------------------------------------------------------
// Cart helpers: work out cart lines and totals, and save the cart in the
// browser so a page refresh doesn't empty it.
//
// The cart itself is a simple object:  { productId: quantity }
//   e.g. { 3: 2, 7: 1 }  = 2 x product 3, 1 x product 7
// -----------------------------------------------------------------------

export const MAX_QUANTITY = 10;              // max of one product per order
export const FREE_DELIVERY_THRESHOLD = 999;  // free delivery above ₹999
export const DELIVERY_FEE = 49;              // otherwise ₹49
// Prices already INCLUDE GST (normal in India), so no tax is added on top.

const CART_KEY = 'krconnects_cart';

// Read the saved cart from the browser (empty cart if nothing saved or data is broken)
export function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export function saveCart(cartItems) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

// Turn { 3: 2 } into [{ product, quantity: 2, lineTotal }]
// Products that no longer exist in the catalog are skipped.
export function getCartLines(products, cartItems) {
  const lines = [];
  for (const [id, quantity] of Object.entries(cartItems)) {
    const product = products.find((p) => p.id === Number(id));
    if (product && quantity > 0) {
      lines.push({ product, quantity, lineTotal: product.price * quantity });
    }
  }
  return lines;
}

// Totals for the order summary box
export function getCartSummary(lines) {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = subtotal === 0 || subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return { itemCount, subtotal, delivery, total: subtotal + delivery };
}

// -----------------------------------------------------------------------
// Small helper functions for products.
// Kept outside the components so they are easy to read and easy to test.
// -----------------------------------------------------------------------

// 1599 -> "₹1,599.00"
export function formatPrice(value) {
  const number = Number(value) || 0;
  return '₹' + number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Build the category list from the products we got from the API.
// Result: ['All', 'Books', 'Clothing', ...]  (sorted A to Z after 'All')
export function getCategories(products) {
  const unique = new Set(products.map((p) => p.category));
  return ['All', ...[...unique].sort()];
}

// Apply category filter + search + sort, and return the products to show.
export function getVisibleProducts(products, selectedCategory, searchText, sortBy) {
  const text = searchText.trim().toLowerCase();

  // 1. Filter by category and search text
  let list = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      text === '' ||
      p.name.toLowerCase().includes(text) ||
      p.category.toLowerCase().includes(text);
    return matchesCategory && matchesSearch;
  });

  // 2. Sort (slice() makes a copy, so we never change the original list)
  if (sortBy === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
  if (sortBy === 'name-asc') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

// Products in the same category as the given product (not the product itself).
// Used for "Similar products" on the product details page.
export function getSimilarProducts(products, product, count = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, count);
}

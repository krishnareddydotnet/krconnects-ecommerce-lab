import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/catalogApiService.js';

/**
 * Loads products from the Catalog API once (on page load),
 * then lets the user search them by name or category.
 *
 * Search happens in the browser: we filter the list we already have,
 * so typing in the search box does NOT call the API again.
 */
function ProductCatalog() {
  const [products, setProducts] = useState([]);   // all products from the API
  const [searchText, setSearchText] = useState(''); // what the user typed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step 1: fetch products once when the component first appears
  useEffect(() => {
    fetchProducts()
      .then((list) => setProducts(list))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return (
      <div role="alert">
        Could not reach Catalog API: {error}
      </div>
    );
  }

  // Step 2: filter the products using the search text (case-insensitive)
  const search = searchText.toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
  );

  // Step 3: show the search box and the matching products
  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or category"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductCatalog;

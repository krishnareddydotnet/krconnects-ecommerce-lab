// -----------------------------------------------------------------------
// KRConnects Customer Portal - Catalog API service
//
// This code runs in the user's BROWSER, not inside the Kubernetes cluster.
// So the browser cannot use the Service name (http://catalog-api:8081).
//
// Instead, the browser calls "/catalog-api" on the same site it loaded from.
// nginx (running inside the cluster) receives "/catalog-api/..." and
// forwards it to the Catalog API Service using its Service name
// (see nginx.conf).
// -----------------------------------------------------------------------

const CATALOG_API_BASE_URL = import.meta.env.VITE_CATALOG_API_BASE_URL || '/catalog-api';

/**
 * Calls the Catalog API's /products endpoint.
 * Browser calls: /catalog-api/products  ->  nginx forwards to: http://catalog-api:8081/products
 * Returns the list of products (an array).
 */
export async function fetchProducts() {
  const response = await fetch(`${CATALOG_API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(`Catalog API returned status ${response.status}`);
  }

  const data = await response.json();

  // The API returns { message, service, timestamp, products: [...] }
  // We only need the products list here.
  return data.products || [];
}

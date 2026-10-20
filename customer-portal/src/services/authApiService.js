// -----------------------------------------------------------------------
// KRConnects Customer Portal - Auth API service
//
// This code runs in the user's BROWSER, not inside the Kubernetes cluster.
// So the browser cannot use the Service name (http://authapi:8080).
//
// Instead, the browser calls "/api" on the same site it loaded from.
// nginx (running inside the cluster) receives "/api/..." and forwards
// it to the Auth API Service using its Service name (see nginx.conf).
// -----------------------------------------------------------------------

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || '/api';

/**
 * Calls the Auth API's /hello endpoint.
 * Browser calls: /api/hello  ->  nginx forwards to: http://authapi:8080/hello
 */
export async function fetchAuthApiHello() {
  const response = await fetch(`${AUTH_API_BASE_URL}/hello`);

  if (!response.ok) {
    throw new Error(`Auth API returned status ${response.status}`);
  }

  return response.json();
}
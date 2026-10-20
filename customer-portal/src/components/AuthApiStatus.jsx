import { useEffect, useState } from 'react';
import { fetchAuthApiHello } from '../services/authApiService.js';

/**
 * Fetches the Auth API's /hello response on mount and displays it,
 * including the server-generated timestamp — proving this is a live
 * frontend-to-API call, not static/cached content.
 */
function AuthApiStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthApiHello()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div role="alert">
        Could not reach Auth API: {error}
      </div>
    );
  }

  if (!data) {
    return <div>Loading Auth API status...</div>;
  }

  return (
    <div>
      <p>{data.message}</p>
      <p>Service: {data.service}</p>
      <p>Last fetched from Auth API at: {data.timestamp}</p>
    </div>
  );
}

export default AuthApiStatus;

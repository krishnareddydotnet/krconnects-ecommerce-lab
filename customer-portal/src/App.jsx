import AuthApiStatus from './components/AuthApiStatus.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';

function App() {
  return (
    <div>
      <h1>Welcome to KRConnects Customer Portal</h1>
      <p>Your account and order management hub.</p>
      <hr />
      <h2>Auth API Connection Status</h2>
      <AuthApiStatus />
      <hr />
      <h2>Product Catalog</h2>
      <ProductCatalog />
    </div>
  );
}

export default App;

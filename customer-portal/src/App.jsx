import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { fetchProducts } from './services/catalogApiService.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LoginDialog from './components/LoginDialog.jsx';
import SignupDialog from './components/SignupDialog.jsx';
import Toast from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// -----------------------------------------------------------------------
// App = the whole site.
// - Header, Footer, dialogs and Toast are shown on every page.
// - <Routes> picks the page from the URL:
//     /             -> HomePage (product grid)
//     /product/:id  -> ProductDetailsPage (one product)
//     anything else -> NotFoundPage
// - Shared state (products, cart, user) lives here, so it is kept
//   when the user moves between pages.
// -----------------------------------------------------------------------
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ----- Product data from the Catalog API -----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----- What the user has chosen on the home page -----
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // ----- Cart: { productId: quantity }, e.g. { 3: 2, 7: 1 } -----
  const [cartItems, setCartItems] = useState({});

  // ----- Login / sign up (DEMO ONLY: kept in memory, lost on refresh) -----
  // Later: Sign up -> POST /api/signup, Log in -> POST /api/login (auth-api)
  const [demoUsers, setDemoUsers] = useState({}); // { username: userKey }
  const [currentUser, setCurrentUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(null); // null | 'login' | 'signup'

  // ----- Toast message -----
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  // Load products ONCE when the site opens.
  // Browser calls /catalog-api/products -> nginx -> catalog-api -> data-api -> Azure SQL
  useEffect(() => {
    fetchProducts()
      .then((list) => setProducts(list))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Show a toast for 2 seconds
  function showToast(text) {
    setToastMessage(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2000);
  }

  // Typing in the header search always shows results on the home page
  function handleSearchChange(text) {
    setSearchText(text);
    if (location.pathname !== '/') navigate('/');
  }

  // Add a quantity of a product to the cart (adds to what is already there)
  function handleAddToCart(product, quantity) {
    const current = cartItems[product.id] || 0;
    setCartItems({ ...cartItems, [product.id]: current + quantity });
    showToast(quantity > 1
      ? `${quantity} × ${product.name} added to cart`
      : `${product.name} added to cart`);
  }

  // Returns { userKey } on success or { error } on failure
  function handleSignup(username) {
    if (demoUsers[username]) {
      return { error: 'That username is already taken.' };
    }
    const userKey = crypto.randomUUID(); // in the real app data-api generates this
    setDemoUsers({ ...demoUsers, [username]: userKey });
    return { userKey };
  }

  // Returns an error message, or null when login worked
  function handleLogin(username, userKey) {
    if (demoUsers[username] !== userKey) {
      return 'Invalid username or user key.';
    }
    setCurrentUser({ username });
    setOpenDialog(null);
    showToast('Welcome back, ' + username);
    return null;
  }

  function handleLogout() {
    setCurrentUser(null);
    showToast('You are logged out');
  }

  function handleCopyKey(key) {
    navigator.clipboard.writeText(key).then(
      () => showToast('User key copied'),
      () => showToast('Copy failed — select the key and copy it')
    );
  }

  // Total items in the cart = sum of all quantities
  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  // Main content: loading -> error -> the page for the current URL
  let content;
  if (loading) {
    content = <p className="status">Loading products...</p>;
  } else if (error) {
    content = (
      <p className="status error" role="alert">
        Sorry, we couldn't load products right now. ({error})
      </p>
    );
  } else {
    content = (
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchText={searchText}
              sortBy={sortBy}
              onSortChange={setSortBy}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetailsPage
              products={products}
              onAddToCart={handleAddToCart}
              onCategoryChange={setSelectedCategory}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Header
        searchText={searchText}
        onSearchChange={handleSearchChange}
        currentUser={currentUser}
        cartCount={cartCount}
        onLoginClick={() => setOpenDialog('login')}
        onSignupClick={() => setOpenDialog('signup')}
        onLogout={handleLogout}
      />

      <main className="container">{content}</main>

      <Footer />

      {openDialog === 'login' && (
        <LoginDialog onLogin={handleLogin} onClose={() => setOpenDialog(null)} />
      )}
      {openDialog === 'signup' && (
        <SignupDialog onSignup={handleSignup} onCopyKey={handleCopyKey} onClose={() => setOpenDialog(null)} />
      )}

      <Toast message={toastMessage} />
    </>
  );
}

export default App;

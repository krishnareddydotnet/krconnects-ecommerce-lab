import { useEffect, useRef, useState } from 'react';
import { fetchProducts } from './services/catalogApiService.js';
import { getCategories, getVisibleProducts } from './utils/productUtils.js';
import Header from './components/Header.jsx';
import Intro from './components/Intro.jsx';
import CategoryBar from './components/CategoryBar.jsx';
import ProductToolbar from './components/ProductToolbar.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import EmptyState from './components/EmptyState.jsx';
import Footer from './components/Footer.jsx';
import LoginDialog from './components/LoginDialog.jsx';
import SignupDialog from './components/SignupDialog.jsx';
import Toast from './components/Toast.jsx';

// -----------------------------------------------------------------------
// App = the whole storefront page.
// All the "state" (data that changes) lives here, and is passed down
// to the small components as props.
// -----------------------------------------------------------------------
function App() {
  // ----- Product data from the Catalog API -----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----- What the user has chosen on the page -----
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // ----- Cart: list of product ids the user added -----
  const [cartIds, setCartIds] = useState([]);

  // ----- Login / sign up (DEMO ONLY: kept in memory, lost on refresh) -----
  // Later: Sign up -> POST /api/signup, Log in -> POST /api/login (auth-api)
  const [demoUsers, setDemoUsers] = useState({}); // { username: userKey }
  const [currentUser, setCurrentUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(null); // null | 'login' | 'signup'

  // ----- Toast message -----
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  // Load products ONCE when the page opens.
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

  function handleAddToCart(product) {
    if (cartIds.includes(product.id)) return;
    setCartIds([...cartIds, product.id]);
    showToast(product.name + ' added to cart');
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

  // Work out what to show (recalculated on every render — cheap for 100 products)
  const categories = getCategories(products);
  const visibleProducts = getVisibleProducts(products, selectedCategory, searchText, sortBy);
  const title = selectedCategory === 'All' ? 'All products' : selectedCategory;

  // Main content: loading -> error -> products (or empty state)
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
      <>
        <CategoryBar categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        <ProductToolbar
          title={title}
          visibleCount={visibleProducts.length}
          totalCount={products.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} cartIds={cartIds} onAddToCart={handleAddToCart} />
        ) : (
          <EmptyState />
        )}
      </>
    );
  }

  return (
    <>
      <Header
        searchText={searchText}
        onSearchChange={setSearchText}
        currentUser={currentUser}
        cartCount={cartIds.length}
        onLoginClick={() => setOpenDialog('login')}
        onSignupClick={() => setOpenDialog('signup')}
        onLogout={handleLogout}
      />

      <main className="container">
        <Intro />
        {content}
      </main>

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

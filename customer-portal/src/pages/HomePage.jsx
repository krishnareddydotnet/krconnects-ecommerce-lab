import { getCategories, getVisibleProducts } from '../utils/productUtils.js';
import Intro from '../components/Intro.jsx';
import CategoryBar from '../components/CategoryBar.jsx';
import ProductToolbar from '../components/ProductToolbar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';

// HomePage ( URL: / ) — intro, category chips, toolbar and the product grid.
function HomePage({ products, selectedCategory, onCategoryChange, searchText, sortBy, onSortChange, cartItems, onAddToCart }) {
  const categories = getCategories(products);
  const visibleProducts = getVisibleProducts(products, selectedCategory, searchText, sortBy);
  const title = selectedCategory === 'All' ? 'All products' : selectedCategory;

  return (
    <>
      <Intro />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} onSelect={onCategoryChange} />
      <ProductToolbar
        title={title}
        visibleCount={visibleProducts.length}
        totalCount={products.length}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
      {visibleProducts.length > 0 ? (
        <ProductGrid products={visibleProducts} cartItems={cartItems} onAddToCart={onAddToCart} />
      ) : (
        <EmptyState />
      )}
    </>
  );
}

export default HomePage;

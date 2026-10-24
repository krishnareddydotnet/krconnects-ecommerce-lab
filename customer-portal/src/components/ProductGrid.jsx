import ProductCard from './ProductCard.jsx';

// ProductGrid: renders one ProductCard per product.
// cartItems looks like { 3: 2, 7: 1 }  (product id -> quantity)
function ProductGrid({ products, cartItems, onAddToCart }) {
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isAdded={cartItems[product.id] > 0}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default ProductGrid;

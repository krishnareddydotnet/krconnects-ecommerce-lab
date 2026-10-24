import ProductCard from './ProductCard.jsx';

// ProductGrid: renders one ProductCard per product.
function ProductGrid({ products, cartIds, onAddToCart }) {
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isAdded={cartIds.includes(product.id)}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default ProductGrid;

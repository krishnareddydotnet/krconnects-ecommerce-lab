import { formatPrice } from '../utils/productUtils.js';

// ProductCard: one product. The button changes to "Added ✓" once it is in the cart.
function ProductCard({ product, isAdded, onAddToCart }) {
  return (
    <article className="card">
      {/* Placeholder image: first letter of the name (until we have real images) */}
      <div className="card-image" aria-hidden="true">{product.name.charAt(0)}</div>

      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <button
          type="button"
          className={isAdded ? 'btn btn-primary added' : 'btn btn-primary'}
          onClick={() => onAddToCart(product)}
          disabled={isAdded}
        >
          {isAdded ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;

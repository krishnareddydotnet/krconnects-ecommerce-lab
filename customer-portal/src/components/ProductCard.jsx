import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/productUtils.js';

// ProductCard: one product in the grid.
// Clicking the image or the name opens the product details page (/product/:id).
// The button changes to "Added ✓" once the product is in the cart.
function ProductCard({ product, isAdded, onAddToCart }) {
  const detailsUrl = `/product/${product.id}`;

  return (
    <article className="card">
      {/* Placeholder image: first letter of the name (until we have real images) */}
      <Link to={detailsUrl} className="card-image" aria-hidden="true" tabIndex={-1}>
        {product.name.charAt(0)}
      </Link>

      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3><Link to={detailsUrl} className="card-link">{product.name}</Link></h3>
        <p className="price">{formatPrice(product.price)}</p>
        <button
          type="button"
          className={isAdded ? 'btn btn-primary added' : 'btn btn-primary'}
          onClick={() => onAddToCart(product, 1)}
          disabled={isAdded}
        >
          {isAdded ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;

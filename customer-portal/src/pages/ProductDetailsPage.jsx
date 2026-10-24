import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice, getSimilarProducts } from '../utils/productUtils.js';

// ProductDetailsPage ( URL: /product/:id ) — one product with quantity + Add to cart,
// and "Similar products" from the same category underneath.
function ProductDetailsPage({ products, onAddToCart, onCategoryChange }) {
  const { id } = useParams();               // "3" from /product/3 (always a string)
  const [quantity, setQuantity] = useState(1);

  // Opening another product: go back to the top of the page and reset quantity to 1
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
  }, [id]);

  const product = products.find((p) => p.id === Number(id));

  // Wrong id in the URL (e.g. /product/999)
  if (!product) {
    return (
      <div className="empty">
        <h2>Product not found</h2>
        <p>This product doesn't exist or is no longer available.</p>
        <p><Link to="/">Back to all products</Link></p>
      </div>
    );
  }

  const similarProducts = getSimilarProducts(products, product);

  return (
    <>
      {/* Breadcrumb: Home › Category › Product */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/" onClick={() => onCategoryChange('All')}>Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/" onClick={() => onCategoryChange(product.category)}>{product.category}</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <section className="details">
        {/* Placeholder image until we have real product images */}
        <div className="details-image" aria-hidden="true">{product.name.charAt(0)}</div>

        <div className="details-info">
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="details-price">{formatPrice(product.price)}</p>
          <p className="details-note">Free delivery in 3–5 days · Product ID {product.id}</p>

          <div className="details-actions">
            {/* Quantity: between 1 and 10 */}
            <div className="qty" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" aria-label="Increase quantity"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
            </div>
            <button type="button" className="btn btn-primary details-add"
              onClick={() => onAddToCart(product, quantity)}>
              Add to cart
            </button>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="similar" aria-labelledby="similar-title">
          <h2 id="similar-title">Similar products</h2>
          <div className="similar-grid">
            {similarProducts.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="similar-card">
                <div className="similar-image" aria-hidden="true">{p.name.charAt(0)}</div>
                <span className="similar-name">{p.name}</span>
                <span className="similar-price">{formatPrice(p.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default ProductDetailsPage;

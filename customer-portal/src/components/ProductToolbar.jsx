// ProductToolbar: section title, "Showing X of Y", and the Sort by dropdown.
function ProductToolbar({ title, visibleCount, totalCount, sortBy, onSortChange }) {
  return (
    <div className="toolbar">
      <h2>{title}</h2>
      <div className="toolbar-right">
        <p className="count" aria-live="polite">
          Showing {visibleCount} of {totalCount} products
        </p>
        <div className="sort">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProductToolbar;

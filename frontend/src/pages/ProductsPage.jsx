import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = category ? { category } : {};
        const response = await getProducts(params);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        console.error('Error loading products:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load products';
        const statusCode = err.response?.status;
        if (statusCode === 0 || !err.response) {
          setError(`Cannot connect to server. Please check if the backend is running. (${errorMessage})`);
        } else {
          setError(`Failed to load products: ${errorMessage} (Status: ${statusCode})`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [search, products]);

  if (loading) return <div className="products-loading">Loading...</div>;
  if (error) return <div className="products-error">{error}</div>;

  const categories = ['All Categories', 'Electronics', 'Clothing', 'Food', 'General'];

  return (
    <div className="products-page-container">
      <div className="products-page-header">
        <h1>All Products</h1>
      </div>

      <div className="category-badges">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-badge ${category === (cat === 'All Categories' ? '' : cat) ? 'active' : ''}`}
            onClick={() => setCategory(cat === 'All Categories' ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {search && (
        <p className="search-results-message">
          Showing <strong>{filteredProducts.length}</strong> result(s) for "<strong>{search}</strong>"
        </p>
      )}

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
            const discount = product.discount || 0;
            return (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-card-link">
                  <div className="product-image-wrapper">
                    {product.image && getImageUrl(product.image) ? (
                      <>
                        <img 
                          src={getImageUrl(product.image)} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="product-image-fallback" style={{ display: 'none' }}>
                          No Image
                        </div>
                      </>
                    ) : (
                      <div className="product-image-fallback">
                        No Image
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="product-discount-badge">-{discount}%</div>
                    )}
                  </div>
                  <div className="product-card-content">
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-description">
                      {product.description ? product.description.substring(0, 100) + '...' : ''}
                    </p>
                    <div className="product-price-section">
                      <span className="product-price">Rs {product.price ? product.price.toFixed(0) : '0'}</span>
                      {originalPrice && originalPrice > product.price && (
                        <span className="product-price-original">Rs {originalPrice.toFixed(0)}</span>
                      )}
                    </div>
                    <span className={`product-stock-badge ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                      {product.stock === 0 ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="products-empty-state">
          <h3>{search ? `No products found for "${search}"` : 'No products available'}</h3>
          <p>{search ? 'Try a different search term or browse all categories' : 'Check back soon for new products!'}</p>
          {search && (
            <button 
              onClick={() => setSearchParams({})}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

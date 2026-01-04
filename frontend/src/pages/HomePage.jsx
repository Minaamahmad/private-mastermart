import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';
import './HomePage.css';
import './ProductsPage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
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
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const ProductCard = ({ product }) => {
    const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
    const discount = product.discount || 0;

    return (
      <div className="product-card">
        <Link to={`/products/${product._id}`} className="product-card">
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
            <h3 className="product-card">{product.name}</h3>
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
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Master Mart</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

     

      {/* All Products */}
      {products.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>Our Products</h2>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {products.length === 0 && (
        <div className="empty-state">
          <h3>No products available</h3>
          <p>Check back soon for new products!</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;

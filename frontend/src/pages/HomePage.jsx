import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [allProductsResponse, featuredResponse] = await Promise.all([
          getProducts(),
          getProducts({ featured: 'true' })
        ]);
        setProducts(allProductsResponse.data);
        setFeaturedProducts(featuredResponse.data.slice(0, 6));
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

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/>
              </svg>
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div className="feature-card">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="feature-card">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <h3>Top Quality</h3>
              <p>Premium products guaranteed</p>
            </div>
            <div className="feature-card">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>Featured Products</h2>
            <div className="products-grid">
              {featuredProducts.map((product) => {
                const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
                const discount = product.discount || 0;
                return (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="product-card"
                  >
                    <div className="product-image">
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
                            style={{ zIndex: 2 }}
                          />
                          <div style={{ 
                            display: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', 
                            height: '100%', 
                            background: '#f0f0f0', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#999',
                            zIndex: 1
                          }}>
                            No Image
                          </div>
                        </>
                      ) : (
                        <div style={{ 
                          display: 'flex',
                          width: '100%', 
                          height: '100%', 
                          background: '#f0f0f0', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#999'
                        }}>
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category || 'General'}</p>
                      <div className="product-footer">
                        <span className="product-price">Rs {product.price ? product.price.toFixed(0) : '0'}</span>
                        {product.stock > 0 ? (
                          <span className="product-rating">⭐ In Stock</span>
                        ) : (
                          <span style={{ color: '#c62828' }}>Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="view-all-wrapper">
              <Link to="/products" className="view-all-button">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>All Products</h2>
            <div className="products-grid">
              {products.map((product) => {
                const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
                const discount = product.discount || 0;
                return (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="product-card"
                  >
                    <div className="product-image">
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
                            style={{ zIndex: 2 }}
                          />
                          <div style={{ 
                            display: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', 
                            height: '100%', 
                            background: '#f0f0f0', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#999',
                            zIndex: 1
                          }}>
                            No Image
                          </div>
                        </>
                      ) : (
                        <div style={{ 
                          display: 'flex',
                          width: '100%', 
                          height: '100%', 
                          background: '#f0f0f0', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#999'
                        }}>
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category || 'General'}</p>
                      <div className="product-footer">
                        <span className="product-price">Rs {product.price ? product.price.toFixed(0) : '0'}</span>
                        {product.stock > 0 ? (
                          <span className="product-rating">⭐ In Stock</span>
                        ) : (
                          <span style={{ color: '#c62828' }}>Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
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


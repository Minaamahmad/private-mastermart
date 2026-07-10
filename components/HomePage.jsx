'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import '@/styles/HomePage.css';
import '@/styles/ProductsPage.css';

function ProductCard({ product }) {
  const originalPrice =
    product.originalPrice ||
    (product.price && product.discount > 0
      ? product.price / (1 - product.discount / 100)
      : null);
  const discount = product.discount || 0;

  return (
    <div className="product-card">
      <Link href={`/products/${product._id}`} className="product-card">
        <div className="product-image-wrapper">
          {product.image && getImageUrl(product.image) ? (
            <>
              <img src={getImageUrl(product.image)} alt={product.name} />
              <div className="product-image-fallback" style={{ display: 'none' }}>
                No Image
              </div>
            </>
          ) : (
            <div className="product-image-fallback">No Image</div>
          )}
          {discount > 0 && <div className="product-discount-badge">-{discount}%</div>}
        </div>
        <div className="product-card-content">
          <h3 className="product-card">{product.name}</h3>
          <p className="product-card-description">
            {product.description ? `${product.description.substring(0, 100)}...` : ''}
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
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Master Mart</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <Link href="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

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
}

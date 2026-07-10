'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

export default function ProductDetailPage({ id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !product) return <div className="error">{error || 'Product not found'}</div>;

  const originalPrice =
    product.originalPrice ||
    (product.price && product.discount > 0 ? product.price / (1 - product.discount / 100) : null);
  const discount = product.discount || 0;

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <div>
          {product.image && getImageUrl(product.image) ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
              {discount > 0 && (
                <div className="discount-badge" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  -{discount}%
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: '#999' }}>
              No Image
            </div>
          )}
        </div>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: 700 }}>{product.name}</h1>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
              <span className="price" style={{ fontSize: '36px', fontWeight: 700 }}>Rs {product.price.toFixed(0)}</span>
              {originalPrice && originalPrice > product.price && (
                <span className="price-original" style={{ fontSize: '20px' }}>Rs {originalPrice.toFixed(0)}</span>
              )}
            </div>
            <span className="stock-badge in-stock" style={{ marginTop: '8px', display: 'inline-block' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </span>
          </div>
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ marginBottom: '8px', fontWeight: 600, color: '#666' }}>Category:</p>
            <span className="category-badge" style={{ display: 'inline-block' }}>{product.category || 'General'}</span>
          </div>
          <p style={{ lineHeight: 1.8, color: '#555', fontSize: '16px', marginBottom: '24px' }}>{product.description}</p>
          {product.stock > 0 && (
            <>
              <div className="form-group" style={{ maxWidth: '200px', marginBottom: '24px' }}>
                <label style={{ marginBottom: '8px', fontWeight: 600 }}>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value, 10) || 1)))}
                  style={{ width: '80px', textAlign: 'center', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleAddToCart} style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 700 }}>
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

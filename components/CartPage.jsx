'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/imageUtils';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart!</p>
          <button type="button" className="btn-primary" onClick={() => router.push('/products')} style={{ marginTop: '24px' }}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1>Shopping Cart</h1>
        <span style={{ color: '#666', fontSize: '16px' }}>{cart.length} item(s)</span>
      </div>

      <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
        {cart.map((item) => (
          <div key={item.productId} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px' }}>
            {item.image && getImageUrl(item.image) && (
              <img src={getImageUrl(item.image)} alt={item.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
            )}
            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
              <p>Rs <strong>{item.price.toFixed(0)}</strong> each</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                <button type="button" className="btn-danger" onClick={() => removeItem(item.productId)}>Remove</button>
              </div>
            </div>
            <p className="price">Rs {(item.price * item.quantity).toFixed(0)}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '30px', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2>Total Amount</h2>
          <h2>Rs {totalAmount.toFixed(0)}</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => router.push('/checkout')} style={{ width: '100%', padding: '16px' }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

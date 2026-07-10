'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStripeCheckoutSession } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(savedCart);
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await createStripeCheckoutSession({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || null,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment session. Please try again.');
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h1>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        <div>
          <h2>Order Summary</h2>
          {cart.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <div>
                <p><strong>{item.name}</strong></p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p>Rs {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <h2>Total: Rs {totalAmount.toFixed(2)}</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>Payment Method: Stripe</p>
        </div>

        <div>
          <h2>Delivery Information</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea name="customerAddress" value={formData.customerAddress} onChange={handleChange} required rows="4" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

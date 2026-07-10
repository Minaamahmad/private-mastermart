'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPayment, getOrder } from '@/lib/api';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found');
      setLoading(false);
      return;
    }

    verifyPayment(orderId)
      .then(() => getOrder(orderId))
      .then(setOrder)
      .catch((err) => setError(err.message || 'Failed to verify payment'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>Verifying Payment...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>Payment Verification Failed</h1>
        <p>{error}</p>
        <button type="button" className="btn-primary" onClick={() => router.push('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#27ae60' }}>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
      </div>

      {order && (
        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> #{order._id.slice(-6)}</p>
          <p><strong>Total Amount:</strong> Rs {order.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong>Order Status:</strong> {order.status}</p>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link href={`/order-confirmation/${orderId}`} className="btn-primary" style={{ marginRight: '15px' }}>
          View Order Details
        </Link>
        <Link href="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

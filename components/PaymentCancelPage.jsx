'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#f39c12' }}>Payment Cancelled</h1>
      <p>Your payment was cancelled. No charges were made.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px' }}>
        <button type="button" className="btn-primary" onClick={() => router.push('/checkout')}>Try Again</button>
        <button type="button" className="btn-secondary" onClick={() => router.push('/cart')}>Back to Cart</button>
        <button type="button" className="btn-secondary" onClick={() => router.push('/')}>Return to Home</button>
      </div>
      {orderId && <p style={{ marginTop: '40px', color: '#666' }}>Order ID: #{orderId.slice(-6)}</p>}
    </div>
  );
}

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
      <h1 style={{ color: '#f39c12', marginBottom: '20px' }}>Payment Cancelled</h1>
      <p style={{ color: '#666', fontSize: '1.1em', marginBottom: '30px' }}>
        Your payment was cancelled. No charges were made to your account.
      </p>
      <p style={{ color: '#999', marginBottom: '40px' }}>
        If you experienced any issues during checkout, please try again or contact our support team.
      </p>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/checkout')}
        >
          Try Again
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>

      {orderId && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.9em',
          color: '#666'
        }}>
          <strong>Order ID:</strong> #{orderId.slice(-6)}
          <br />
          <small>You can retry payment for this order from your account.</small>
        </div>
      )}
    </div>
  );
};

export default PaymentCancelPage;


import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment, getOrder } from '../utils/api';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyOrderPayment = async () => {
      if (!orderId) {
        setError('No order ID found');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with backend
        await verifyPayment(orderId);
        
        // Fetch order details
        const response = await getOrder(orderId);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
        setLoading(false);
      }
    };

    verifyOrderPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h1>Verifying Payment...</h1>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px', color: '#e74c3c' }}>❌</div>
        <h1>Payment Verification Failed</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#27ae60', marginBottom: '10px' }}>Payment Successful!</h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {order && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '30px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Order Details</h2>
          <div style={{ marginBottom: '15px' }}>
            <strong>Order ID:</strong> #{order._id.slice(-6)}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Total Amount:</strong> Rs {order.totalAmount.toFixed(2)}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Payment Status:</strong> 
            <span style={{ 
              color: order.paymentStatus === 'paid' ? '#27ae60' : '#f39c12',
              marginLeft: '10px',
              fontWeight: 'bold'
            }}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Order Status:</strong> {order.status}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button 
          className="btn-primary" 
          onClick={() => navigate(`/order-confirmation/${orderId}`)}
          style={{ marginRight: '15px' }}
        >
          View Order Details
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;


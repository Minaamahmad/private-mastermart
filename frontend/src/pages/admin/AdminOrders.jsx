import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await getOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorData = err.response?.data || {};
      let errorMessage = errorData.message || err.message || 'Failed to load orders';

      if (err.response?.status === 403) {
        // Permission error
        errorMessage = `🔒 Permission Error: ${errorMessage}`;
        if (errorData.required) errorMessage += `\n\n📋 Required permissions: ${errorData.required.join(', ')}`;
        if (errorData.userPermissions) errorMessage += `\n\n✅ Your permissions: ${errorData.userPermissions.length > 0 ? errorData.userPermissions.join(', ') : 'None'}`;
        if (errorData.hint) errorMessage += `\n\n💡 ${errorData.hint}`;
        errorMessage += `\n\n📖 See AUTH0_PERMISSIONS_FIX.md for setup instructions.`;
        console.error('Permission details:', errorData);
      }

      setError(errorMessage);

      if (err.response?.status === 401) {
        // Auth error - redirect to login/home
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setError(null);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to update order status';

      if (err.response?.status === 403) {
        // Permission error
        const errorData = err.response?.data || {};
        errorMessage = `🔒 Permission Error: ${errorMessage}`;
        if (errorData.required) errorMessage += `\n\n📋 Required permissions: ${errorData.required.join(', ')}`;
        if (errorData.userPermissions) errorMessage += `\n\n✅ Your permissions: ${errorData.userPermissions.length > 0 ? errorData.userPermissions.join(', ') : 'None'}`;
        if (errorData.hint) errorMessage += `\n\n💡 ${errorData.hint}`;
        errorMessage += `\n\n📖 See AUTH0_PERMISSIONS_FIX.md for setup instructions.`;
      }

      setError(errorMessage);

      if (err.response?.status === 401) {
        window.location.href = '/';
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      Pending: 'badge-pending',
      Confirmed: 'badge-confirmed',
      'Out for Delivery': 'badge-delivery',
      Delivered: 'badge-delivered',
      Cancelled: 'badge-cancelled'
    };
    return map[status] || '';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Orders</h1>
        <button onClick={fetchOrders} className="btn-secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
          {error}
          <div style={{ marginTop: '15px' }}>
            <button onClick={() => setError(null)} style={{ marginRight: '10px', padding: '8px 16px', fontSize: '14px' }}>
              Dismiss
            </button>
            <a
              href="https://github.com/your-repo/blob/main/AUTH0_PERMISSIONS_FIX.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block',
                marginLeft: '10px'
              }}
            >
              📖 View Setup Guide
            </a>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></p>
                </div>
                <div>
                  <h2 className="price">Rs {order.totalAmount.toFixed(2)}</h2>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Address:</strong> {order.customerAddress}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4>Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '20px' }}>
                    <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                    <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label>Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  style={{ marginTop: '10px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

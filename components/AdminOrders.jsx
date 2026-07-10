'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { Package, Filter } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, filterStatus) => {
    const statusMap = {
      pending: 'Pending',
      processing: 'Confirmed',
      shipped: 'Out for Delivery',
      delivered: 'Delivered',
    };
    try {
      await updateOrderStatus(orderId, statusMap[filterStatus]);
      fetchOrders();
    } catch {
      setError('Failed to update status');
    }
  };

  const getStatusOptionValue = (status) => {
    const reverseMap = {
      Pending: 'pending',
      Confirmed: 'processing',
      'Out for Delivery': 'shipped',
      Delivered: 'delivered',
    };
    return reverseMap[status] || 'pending';
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    const statusMap = {
      pending: 'Pending',
      processing: 'Confirmed',
      shipped: 'Out for Delivery',
      delivered: 'Delivered',
    };
    return order.status === statusMap[filter];
  });

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h1>Order Management</h1>
          <p>Total orders: {orders.length}</p>
        </div>
        <Package size={28} />
      </div>

      <div className="category-badges" style={{ marginBottom: '20px' }}>
        <Filter size={18} />
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map((f) => (
          <button
            key={f}
            type="button"
            className={`category-badge ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'processing' ? 'confirmed' : f}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={4}>No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div>{order.customerName}</div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>{order.customerEmail}</div>
                  </td>
                  <td>Rs {order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <select
                      value={getStatusOptionValue(order.status)}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Confirmed</option>
                      <option value="shipped">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../utils/api';
import { Package, Eye } from 'lucide-react';
import './AdminDashboard.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

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
        errorMessage = `🔒 Permission Error: ${errorMessage}`;
        if (errorData.required) errorMessage += `\n\n📋 Required permissions: ${errorData.required.join(', ')}`;
        if (errorData.userPermissions) errorMessage += `\n\n✅ Your permissions: ${errorData.userPermissions.length > 0 ? errorData.userPermissions.join(', ') : 'None'}`;
        if (errorData.hint) errorMessage += `\n\n💡 ${errorData.hint}`;
        errorMessage += `\n\n📖 See AUTH0_PERMISSIONS_FIX.md for setup instructions.`;
        console.error('Permission details:', errorData);
      }

      setError(errorMessage);

      if (err.response?.status === 401) {
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

  // Map backend statuses to filter format
  const mapStatusToFilter = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'Confirmed': 'processing',
      'Out for Delivery': 'shipped',
      'Delivered': 'delivered',
      'Cancelled': 'pending' // Treat cancelled as pending for filter
    };
    return statusMap[status] || 'pending';
  };

  // Map filter to backend statuses
  const mapFilterToStatuses = (filter) => {
    if (filter === 'all') return null;
    const filterMap = {
      'pending': ['Pending'],
      'processing': ['Confirmed'],
      'shipped': ['Out for Delivery'],
      'delivered': ['Delivered']
    };
    return filterMap[filter] || null;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => {
        const statuses = mapFilterToStatuses(filter);
        return statuses && statuses.includes(order.status);
      });

  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Confirmed': 'status-processing',
      'Out for Delivery': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-pending'
    };
    return statusMap[status] || 'status-pending';
  };

  // Convert backend status to filter format for display
  const getDisplayStatus = (status) => {
    const statusMap = {
      'Pending': 'pending',
      'Confirmed': 'processing',
      'Out for Delivery': 'shipped',
      'Delivered': 'delivered',
      'Cancelled': 'pending'
    };
    return statusMap[status] || 'pending';
  };

  // Convert filter format back to backend status
  const getBackendStatus = (filterStatus) => {
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Confirmed',
      'shipped': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return statusMap[filterStatus] || 'Pending';
  };

  const handleStatusChange = async (orderId, filterStatus) => {
    const backendStatus = getBackendStatus(filterStatus);
    await handleStatusUpdate(orderId, backendStatus);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>Orders</Link>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Manage Orders</h1>
          <div className="order-stats">
            <div className="stat-card">
              <Package size={24} />
              <div>
                <p>Total Orders</p>
                <h3>{orders.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
            {error}
            <div style={{ marginTop: '15px' }}>
              <button onClick={() => setError(null)} style={{ marginRight: '10px', padding: '8px 16px', fontSize: '14px' }}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="order-filters">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'filter-active' : ''}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'filter-active' : ''}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={filter === 'processing' ? 'filter-active' : ''}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={filter === 'shipped' ? 'filter-active' : ''}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={filter === 'delivered' ? 'filter-active' : ''}
          >
            Delivered
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-products">
            <p>No orders found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const displayStatus = getDisplayStatus(order.status);
                  const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                  
                  // Format order ID to show last 6 digits like #100123
                  const orderIdDisplay = order._id ? `#${order._id.slice(-6)}` : '#000000';
                  
                  return (
                    <tr key={order._id}>
                      <td>{orderIdDisplay}</td>
                      <td>{order.customerName}</td>
                      <td>{order.customerEmail || 'N/A'}</td>
                      <td>{itemCount}</td>
                      <td>Rs {order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={displayStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`status-select ${getStatusClass(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <button className="view-btn" title="View Order">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

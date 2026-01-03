import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../utils/api';
import { Package, Eye, TrendingUp, Filter } from 'lucide-react';


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const location = useLocation();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await getOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, filterStatus) => {
    const statusMap = { 'pending': 'Pending', 'processing': 'Confirmed', 'shipped': 'Out for Delivery', 'delivered': 'Delivered' };
    try {
      await updateOrderStatus(orderId, statusMap[filterStatus]);
      fetchOrders();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const getStatusStyles = (status) => {
    const map = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-300',
      'Confirmed': 'bg-blue-100 text-blue-700 border-blue-300',
      'Out for Delivery': 'bg-purple-100 text-purple-700 border-purple-300',
      'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    };
    return map[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    const statusMap = {
      'pending': 'Pending',
      'processing': 'Confirmed',
      'shipped': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return order.status === statusMap[filter];
  });

  // Convert order status to select option value
  const getStatusOptionValue = (status) => {
    const reverseMap = {
      'Pending': 'pending',
      'Confirmed': 'processing',
      'Out for Delivery': 'shipped',
      'Delivered': 'delivered'
    };
    return reverseMap[status] || 'pending';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
   
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-slate-900 mb-2">Order Management</h1>
              <p className="text-slate-600">Track and manage all customer orders</p>
            </div>
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/20 px-6 py-5 text-white min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Orders</p>
                  <p className="text-3xl">{orders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter size={18} />
              <span className="text-sm">Filter:</span>
            </div>
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    filter === f 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f === 'processing' ? 'confirmed' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="text-red-600">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-slate-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-blue-600">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-900">{order.customerName}</p>
                          <p className="text-sm text-slate-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-full text-slate-700 text-sm">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-900">
                          Rs {order.totalAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={getStatusOptionValue(order.status)}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs px-3 py-2 rounded-lg border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            getStatusStyles(order.status)
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Confirmed</option>
                          <option value="shipped">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          onClick={() => alert(`View order details for ${order._id}`)}
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: 'amber' },
            { label: 'Confirmed', count: orders.filter(o => o.status === 'Confirmed').length, color: 'blue' },
            { label: 'Shipped', count: orders.filter(o => o.status === 'Out for Delivery').length, color: 'purple' },
            { label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className={`text-2xl text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminOrders;

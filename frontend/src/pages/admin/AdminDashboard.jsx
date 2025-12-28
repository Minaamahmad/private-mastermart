import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your store operations</p>
      </div>
      <div className="admin-dashboard-grid">
        <Link to="/admin/products" className="admin-dashboard-card admin-card-products">
          <div className="admin-card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4V5C4 3.89 4.89 3 6 3H18C19.11 3 20 3.89 20 5V7ZM4 19H20C21.11 19 22 18.11 22 17V9C22 7.89 21.11 7 20 7H4C2.89 7 2 7.89 2 9V17C2 18.11 2.89 19 4 19Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="admin-card-content">
            <h2>Manage Products</h2>
            <p>Add, edit, or delete products from your store</p>
          </div>
          <div className="admin-card-arrow">→</div>
        </Link>
        <Link to="/admin/orders" className="admin-dashboard-card admin-card-orders">
          <div className="admin-card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H15V15H12V17H15V20H17V17H20V15H17V12Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="admin-card-content">
            <h2>Manage Orders</h2>
            <p>View and update order status for customer orders</p>
          </div>
          <div className="admin-card-arrow">→</div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;


import Link from 'next/link';
import '@/styles/AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your store operations</p>
      </div>
      <div className="admin-dashboard-grid">
        <Link href="/admin/products" className="admin-dashboard-card admin-card-products">
          <div className="admin-card-icon">
            <img src="/Assets/clipboard-svgrepo-com.svg" alt="Manage Products" />
          </div>
          <div className="admin-card-content">
            <h2>Manage Products</h2>
            <p>Add, edit, or delete products from your store</p>
          </div>
          <div className="admin-card-arrow">
            <img src="/Assets/right-arrow-svgrepo-com.svg" alt="arrow right" />
          </div>
        </Link>
        <Link href="/admin/orders" className="admin-dashboard-card admin-card-orders">
          <div className="admin-card-icon">
            <img src="/Assets/shopping-bag-4-svgrepo-com.svg" alt="Manage Orders" />
          </div>
          <div className="admin-card-content">
            <h2>Manage Orders</h2>
            <p>View and update order status for customer orders</p>
          </div>
          <div className="admin-card-arrow">
            <img src="/Assets/right-arrow-svgrepo-com.svg" alt="arrow right" />
          </div>
        </Link>
      </div>
    </div>
  );
}

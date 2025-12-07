import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Navbar.css';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently, isLoading } = useAuth0();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Check for old admin token (legacy support)
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        setIsAdmin(true);
        return;
      }

      // Check for Auth0 admin permissions
      if (isAuthenticated) {
        try {
          // Try to get token to check permissions
          const token = await getAccessTokenSilently({
            detailedResponse: false,
            timeoutInSeconds: 5
          }).catch(() => null);
          
          if (token) {
            // Decode token to check permissions (simple base64 decode)
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const permissions = payload.permissions || [];
              const scope = payload.scope || '';
              const scopePermissions = scope ? scope.split(' ') : [];
              const allPermissions = [...permissions, ...scopePermissions];
              
              // Check if user has any admin permission
              const hasAdminPermission = allPermissions.some(perm => 
                perm.startsWith('create:') || 
                perm.startsWith('update:') || 
                perm.startsWith('delete:') ||
                perm.includes('products') ||
                perm.includes('orders')
              );
              
              setIsAdmin(hasAdminPermission);
            } catch (e) {
              // If token decode fails, user is not admin
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
    
    // Listen for storage changes (when token is set/removed in other tabs)
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, [location, isAuthenticated, getAccessTokenSilently]); // Re-check when route or auth changes

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>E-Store</h2>
        </Link>
        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          {isAuthenticated && (
            <li>
              <span className="user-info">
                {user?.name || user?.email}
              </span>
            </li>
          )}
          {isAuthenticated ? (
            <li>
              <button 
                onClick={() => logout({ returnTo: window.location.origin })} 
                className="btn-logout"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <button 
                onClick={() => {
                  if (isLoggingIn || isLoading) return;
                  
                  console.log('🔄 Attempting login redirect...');
                  
                  // loginWithRedirect redirects immediately - don't await it
                  // It will navigate away from the page
                  loginWithRedirect().catch((error) => {
                    console.error('❌ Login redirect error:', error);
                    alert('Login failed: ' + (error.message || 'Please check your Auth0 configuration. Check console for details.'));
                  });
                }} 
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                Login
              </button>
            </li>
          )}
          {isAdmin && (
            <>
              <li><Link to="/admin/dashboard">Dashboard</Link></li>
              <li><Link to="/admin/products">Products</Link></li>
              <li><Link to="/admin/orders">Orders</Link></li>
              <li><button onClick={handleLogout} className="btn-logout">Admin Logout</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


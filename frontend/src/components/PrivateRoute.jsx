import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { verifyToken } from '../utils/api';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated: auth0Authenticated, isLoading: auth0Loading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const checkAuth = async () => {
      // Check for old admin token (legacy support)
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          await verifyToken();
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } catch (error) {
          // Old token invalid, remove it
          localStorage.removeItem('adminToken');
        }
      }

      // Wait for Auth0 to finish loading
      if (auth0Loading) {
        return;
      }

      // Check Auth0 authentication and permissions
      if (!auth0Authenticated) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if user has admin permissions
      try {
        const token = await getAccessTokenSilently({
          detailedResponse: false,
          timeoutInSeconds: 5
        }).catch(() => null);

        if (token) {
          try {
            // Decode token to check permissions
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

            setIsAuthenticated(hasAdminPermission);
          } catch (e) {
            console.error('Error decoding token:', e);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [auth0Authenticated, auth0Loading, getAccessTokenSilently]);

  if (loading || auth0Loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="loading">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login - but use Auth0 login if available
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;


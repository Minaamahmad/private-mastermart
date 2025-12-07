import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { syncUser } from '../utils/api';

const CallbackPage = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, error: authError } = useAuth0();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Don't process if already processing
      if (isProcessing) return;

      if (authError) {
        console.error('Auth0 error:', authError);
        setError(authError.message || 'Authentication failed');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Wait for Auth0 to finish loading
      if (isLoading) {
        return;
      }

      // If not authenticated after loading, redirect
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to home');
        navigate('/');
        return;
      }

      // If authenticated but no user yet, wait
      if (!user) {
        return;
      }

      // Process authentication
      setIsProcessing(true);
      try {
        // Get access token with error handling
        let token;
        try {
          token = await getAccessTokenSilently({
            detailedResponse: false,
            timeoutInSeconds: 10
          });
        } catch (tokenError) {
          console.error('Error getting token:', tokenError);
          // If token error but user is authenticated, continue anyway
          // Token might be retrieved later when needed
          token = null;
        }
        
        // Sync user with backend (optional, don't block on error)
        if (token) {
          try {
            await syncUser(token);
          } catch (syncError) {
            console.error('Error syncing user:', syncError);
            // Continue even if sync fails - user is still authenticated
          }
        }
        
        // Redirect to home
        navigate('/');
      } catch (error) {
        console.error('Error handling callback:', error);
        setError('Failed to complete login. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, navigate, authError, isProcessing]);

  if (error || authError) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="error">
          <h2>Login Error</h2>
          <p>{error || authError?.message || 'An error occurred during login'}</p>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Loading...</h2>
      <p>Please wait while we sign you in.</p>
    </div>
  );
};

export default CallbackPage;


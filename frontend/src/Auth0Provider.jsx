import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setAuth0TokenGetter } from './utils/api';

// Inner component to set up token getter
const Auth0TokenSetup = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Set up token getter with error handling
      setAuth0TokenGetter(async () => {
        try {
          return await getAccessTokenSilently({
            detailedResponse: false,
            timeoutInSeconds: 10
          });
        } catch (error) {
          console.error('Error getting Auth0 token:', error);
          // Return null if token can't be retrieved
          return null;
        }
      });
    } else {
      // Clear token getter when not authenticated
      setAuth0TokenGetter(null);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return children;
};

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  // Audience is optional for SPAs - only include if you have an API
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  // Use explicit redirect URI from env or fallback to exact localhost:3000/callback
// Automatically detects http://localhost:3002, 5173, or your production URL
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;
  if (!domain || !clientId) {
    console.error('❌ Auth0 configuration is missing!');
    console.error('Required environment variables:');
    console.error('  - VITE_AUTH0_DOMAIN:', domain || 'MISSING');
    console.error('  - VITE_AUTH0_CLIENT_ID:', clientId || 'MISSING');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Auth0 Configuration Error</h2>
        <p>Please check your .env file and ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are set.</p>
        <p>Domain: {domain || 'MISSING'}</p>
        <p>Client ID: {clientId || 'MISSING'}</p>
      </div>
    );
  }

  // Log configuration for debugging
  console.log('✅ Auth0 Provider initialized:', {
    domain,
    clientId: clientId.substring(0, 10) + '...',
    audience: audience || 'Not set',
    redirectUri
  });

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  // Build authorization params - include audience and scope for API permissions
  const authParams = {
    redirect_uri: redirectUri,
  };
  
  // Include audience and scope if API is configured (for admin permissions)
  // IMPORTANT: Audience should be your API identifier (e.g., https://mastermart), NOT your client ID
  // If audience equals clientId, Auth0 will reject the login request
  if (audience && audience !== clientId && (audience.startsWith('http') || audience.startsWith('https'))) {
    authParams.audience = audience;
    // Request all admin permissions (matching your Auth0 API permissions)
    authParams.scope = 'openid profile email create:products update:products delete:products read:products update:users read:orders update:orders';
    console.log('🔐 Requesting API permissions with audience:', audience);
  } else if (audience === clientId) {
    console.error('❌ ERROR: VITE_AUTH0_AUDIENCE equals CLIENT_ID - this will prevent login!');
    console.error('❌ Fix: Set VITE_AUTH0_AUDIENCE to your API identifier (e.g., https://mastermart) in .env file');
    console.error('❌ Or remove VITE_AUTH0_AUDIENCE from .env to use basic login without API permissions');
    // Don't set audience if it's the same as clientId - this causes login to fail
  } else if (!audience) {
    console.log('ℹ️ No API audience set - basic login will work, but admin permissions won\'t be available');
  } else {
    console.warn('⚠️ Audience format may be incorrect. Should be a URL like https://your-api-identifier');
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authParams}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={false}
    >
      <Auth0TokenSetup>
        {children}
      </Auth0TokenSetup>
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;


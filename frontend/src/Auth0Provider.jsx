import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setAuth0TokenGetter } from './utils/api';

// Define required scopes once to keep it clean
const REQUIRED_SCOPES = 'openid profile email create:products update:products delete:products read:products update:users read:orders update:orders';

// Inner component to set up Auth0 token getter for api.js
const Auth0TokenSetup = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setAuth0TokenGetter(async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: REQUIRED_SCOPES,
            },
            detailedResponse: false,
            timeoutInSeconds: 10
          });
          return token || null;
        } catch (error) {
          console.error('Error getting Auth0 token:', error);
          return null;
        }
      });
    } else {
      setAuth0TokenGetter(null);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return children;
};

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

  if (!domain || !clientId) {
    console.error('❌ Auth0 configuration is missing!');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Auth0 Configuration Error</h2>
        <p>Please check your .env file and ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are set.</p>
      </div>
    );
  }

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  // Initial Auth Params for the Login Widget
  const authParams = {
    redirect_uri: redirectUri,
    scope: REQUIRED_SCOPES // Request all permissions immediately at login
  };

  if (audience) {
    if (audience === clientId) {
      console.error('❌ ERROR: VITE_AUTH0_AUDIENCE equals CLIENT_ID - this prevents RBAC permissions!');
    } else {
      authParams.audience = audience;
    }
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authParams}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Auth0TokenSetup>{children}</Auth0TokenSetup>
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
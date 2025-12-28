const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize JWKS client for Auth0 (lazy initialization)
let client = null;

const getJWKSClient = () => {
  if (!process.env.AUTH0_DOMAIN) {
    return null;
  }
  
  if (!client) {
    client = jwksClient({
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 86400000 // 24 hours
    });
  }
  
  return client;
};

// Function to get signing key
function getKey(header, callback) {
  const jwks = getJWKSClient();
  
  if (!jwks) {
    return callback(new Error('AUTH0_DOMAIN is not configured'));
  }
  
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to verify Auth0 JWT token
const verifyAuth0Token = (req, res, next) => {
  if (!process.env.AUTH0_DOMAIN) {
    return res.status(500).json({ message: 'Auth0 is not configured' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
      }
      req.user = decoded; // Attach decoded token to request
      next();
    }
  );
};

// Middleware to optionally authenticate (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  if (!process.env.AUTH0_DOMAIN) {
    req.user = null;
    return next();
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = decoded;
      }
      next();
    }
  );
};

// Middleware to check if user has required permissions/scopes
const checkPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get permissions from token (Auth0 stores them in permissions array or scope string)
    const permissions = req.user.permissions || [];
    const scope = req.user.scope || '';
    
    // Parse scope string if it's a string (space-separated)
    const scopePermissions = scope ? scope.split(' ') : [];
    
    // Combine both sources
    const userPermissions = [...permissions, ...scopePermissions];

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      console.error('Permission check failed:', {
        required: requiredPermissions,
        userPermissions: userPermissions,
        tokenPermissions: req.user.permissions,
        tokenScope: req.user.scope,
        userId: req.user.sub,
        audience: req.user.aud
      });
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: requiredPermissions,
        userPermissions: userPermissions,
        tokenHasPermissions: req.user.permissions || [],
        tokenScope: req.user.scope || '',
        hint: 'Make sure: 1) An API is created in Auth0, 2) RBAC is enabled on the API, 3) "Add Permissions in the Access Token" is enabled, 4) Permissions are assigned to your Admin role, 5) Your application is authorized to use the API, 6) AUTH0_AUDIENCE is set to your API identifier (not client ID). See AUTH0_PERMISSIONS_FIX.md for detailed instructions.'
      });
    }

    next();
  };
};

// Middleware to check if user is admin (has any admin permission)
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const permissions = req.user.permissions || [];
  const scope = req.user.scope || '';
  const scopePermissions = scope ? scope.split(' ') : [];
  const userPermissions = [...permissions, ...scopePermissions];

  // Check if user has any admin permission (starts with create:, update:, delete:, or read:)
  const isAdmin = userPermissions.some(permission => 
    permission.startsWith('create:') || 
    permission.startsWith('update:') || 
    permission.startsWith('delete:') ||
    permission.startsWith('read:admin')
  );

  if (!isAdmin) {
    return res.status(403).json({ 
      message: 'Admin access required',
      userPermissions: userPermissions
    });
  }

  next();
};

module.exports = {
  verifyAuth0Token,
  optionalAuth,
  checkPermissions,
  checkAdmin
};


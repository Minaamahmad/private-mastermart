const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = helmet({
  // Allows images to be loaded by your Vercel frontend from your Railway backend
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, 
  
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      // Allow images from self, data URIs, Railway, and Cloudinary
      imgSrc: [
        "'self'", 
        "data:", 
        "https://*.railway.app", 
        "https://res.cloudinary.com"
      ],
      // Allow API connections to self, Railway, and your Auth0 domain
      connectSrc: [
        "'self'", 
        "https://*.railway.app", 
        `https://${process.env.AUTH0_DOMAIN}`
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
});

// General rate limiter for all API routes
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for login endpoints
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Slightly increased for demo purposes
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for admin operations
const adminRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased for your presentation so you don't get locked out while testing
  message: 'Too many admin operations from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  securityHeaders,
  generalRateLimiter,
  loginRateLimiter,
  adminRateLimiter
};
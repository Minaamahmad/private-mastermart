const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { securityHeaders, generalRateLimiter } = require('./middleware/security');

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware (apply before other middleware)
app.use(securityHeaders);

// General rate limiting
app.use('/api', generalRateLimiter);

// Middleware

app.use(cors({
  origin: '*', // Allows Vercel to access Railway
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// SERVE STATIC IMAGES - This allows frontend to see uploaded files
// Using process.cwd() ensures it finds the folder on Railway's environment
const uploadsDir = path.join(process.cwd(), 'uploads');
// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Set CORS headers for images
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    // Cache images for better performance
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    message: 'MasterMart E-commerce API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      stripe: '/api/stripe',
      uploads: '/uploads'
    },
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (must be fast for Railway health checks)
app.get('/health', (req, res) => {
  // Quick response - don't block on MongoDB check
  const mongoStatus = mongoose.connection.readyState;
  const status = mongoStatus === 1 ? 'ok' : 'degraded';
  
  res.status(mongoStatus === 1 ? 200 : 503).json({ 
    status,
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Stripe routes
try {
  const stripeRoutes = require('./routes/stripe');
  app.use('/api/stripe', stripeRoutes);
  console.log('✅ Stripe routes registered');
} catch (error) {
  console.error('❌ Failed to load Stripe routes:', error.message);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/ecommerce') {
  console.warn('⚠️  WARNING: Using default MongoDB URI. Set MONGODB_URI environment variable for production.');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('💡 Make sure MONGODB_URI is set correctly in Railway environment variables');
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Railway requires 0.0.0.0

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔌 API endpoint: http://${HOST}:${PORT}/api`);
  console.log(`✅ Server is ready to accept connections`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false).then(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('❌ Error closing MongoDB connection:', err);
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false).then(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('❌ Error closing MongoDB connection:', err);
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Gracefully shutdown
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      process.exit(1);
    }).catch((closeErr) => {
      console.error('❌ Error closing MongoDB connection:', closeErr);
      process.exit(1);
    });
  });
});
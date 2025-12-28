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

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
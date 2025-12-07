const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { verifyAuth0Token, checkPermissions } = require('../middleware/auth0');
const multer = require('multer');
const { isValidObjectId } = require('../utils/validators');
const { handleError, handleNotFound } = require('../utils/errorHandler');
const { processPriceAndDiscount } = require('../utils/productHelpers');
const { normalizeBoolean } = require('../utils/inputHelpers');
const validateId = require('../middleware/validateId');

// Wrapper to handle multer errors
const handleMulterUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
          }
          return res.status(400).json({ message: err.message });
        }
        // Handle file filter errors
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      next();
    });
  };
};

// Configure multer for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
  }
});

// GET all products (public - but can optionally check read:products for admin features)
router.get('/', async (req, res) => {
  try {
    const { featured, category } = req.query;
    let query = {};
    if (featured === 'true') query.featured = true;
    if (category) query.category = category;
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch products');
  }
});

// GET single product (public)
router.get('/:id', validateId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return handleNotFound(res, 'Product');
    }
    res.json(product);
  } catch (error) {
    handleError(error, res, 500, 'Failed to fetch product');
  }
});

// POST create product (admin only - requires create:products permission)
router.post('/', verifyAuth0Token, checkPermissions('create:products'), handleMulterUpload(upload.single('image')), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, featured } = req.body;
    
    // Parse and process price/discount
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    const discountNum = discount ? parseFloat(discount) : 0;
    
    const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
      processPriceAndDiscount(priceNum, originalPriceNum, discountNum);

    // Create product - Mongoose will handle validation
    const product = new Product({
      name: name?.trim(),
      description: description?.trim(),
      price: priceNum,
      originalPrice: finalOriginalPrice,
      discount: finalDiscount,
      category: category || 'General',
      stock: stock !== undefined ? parseInt(stock) : 0,
      featured: normalizeBoolean(featured),
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    handleError(error, res, 400, 'Failed to create product');
  }
});

// PUT update product (admin only - requires update:products permission)
router.put('/:id', verifyAuth0Token, checkPermissions('update:products'), validateId('id'), handleMulterUpload(upload.single('image')), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, stock, featured } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return handleNotFound(res, 'Product');
    }

    // Update fields
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (category !== undefined) product.category = category || 'General';
    if (stock !== undefined) product.stock = parseInt(stock);
    if (featured !== undefined) product.featured = normalizeBoolean(featured);
    
    // Handle price and discount
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      const originalPriceNum = originalPrice !== undefined 
        ? (originalPrice ? parseFloat(originalPrice) : null) 
        : product.originalPrice;
      const discountNum = discount !== undefined ? parseFloat(discount) : product.discount;
      
      const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
        processPriceAndDiscount(priceNum, originalPriceNum, discountNum);
      
      product.price = priceNum;
      product.originalPrice = finalOriginalPrice;
      product.discount = finalDiscount;
    } else if (originalPrice !== undefined || discount !== undefined) {
      // Only discount or originalPrice changed, recalculate
      const originalPriceNum = originalPrice !== undefined 
        ? (originalPrice ? parseFloat(originalPrice) : null) 
        : product.originalPrice;
      const discountNum = discount !== undefined ? parseFloat(discount) : product.discount;
      
      const { originalPrice: finalOriginalPrice, discount: finalDiscount } = 
        processPriceAndDiscount(product.price, originalPriceNum, discountNum);
      
      product.originalPrice = finalOriginalPrice;
      product.discount = finalDiscount;
    }
    
    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (product.image && !product.image.includes('cloudinary.com')) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    handleError(error, res, 400, 'Failed to update product');
  }
});

// DELETE product (admin only - requires delete:products permission)
router.delete('/:id', verifyAuth0Token, checkPermissions('delete:products'), validateId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return handleNotFound(res, 'Product');
    }

    // Delete image from local storage if it exists
    if (product.image && !product.image.includes('cloudinary.com')) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    handleError(error, res, 500, 'Failed to delete product');
  }
});

module.exports = router;


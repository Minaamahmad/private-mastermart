import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: null,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  customerAddress: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (value) => value && value.length > 0,
      message: 'Order must have at least one item',
    },
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    default: 'Stripe',
  },
  stripeSessionId: {
    type: String,
    default: null,
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

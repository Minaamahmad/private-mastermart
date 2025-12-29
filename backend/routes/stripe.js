const express = require('express');
const router = express.Router();

// Initialize Stripe with error handling
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyAuth0Token } = require('../middleware/auth0');
const { isValidObjectId } = require('../utils/validators');
const { handleError, handleNotFound } = require('../utils/errorHandler');
const { findUserByAuth0Id } = require('../utils/userHelpers');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Stripe route is working!', stripeConfigured: !!stripe });
});

// Create Stripe Checkout Session
router.post('/create-checkout-session', verifyAuth0Token, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
  }
  
  try {
    const { customerName, customerPhone, customerAddress, customerEmail, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Validate items and calculate total
    // PKR to USD conversion rate (configurable via env, default: 280 PKR = 1 USD)
    const pkrToUsdRate = parseFloat(process.env.PKR_TO_USD_RATE) || 280;
    
    let totalAmount = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of items) {
      if (!isValidObjectId(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) return handleNotFound(res, `Product ${item.productId}`);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Convert PKR to USD for Stripe (Stripe requires minimum $0.50 USD)
      const priceInUsd = product.price / pkrToUsdRate;
      
      // Stripe requires minimum $0.50 USD per transaction
      // Convert to cents (multiply by 100) and round to nearest cent
      const unitAmountInCents = Math.round(priceInUsd * 100);
      
      // Ensure minimum amount (50 cents = $0.50)
      if (unitAmountInCents < 50) {
        return res.status(400).json({ 
          message: `Product "${product.name}" price (Rs ${product.price}) is too low. Minimum order value must be at least Rs ${Math.ceil(50 * pkrToUsdRate / 100)} (approximately $0.50 USD).` 
        });
      }
      
      lineItems.push({
        price_data: {
          currency: 'usd', // Use USD for Stripe
          product_data: {
            name: product.name,
            images: product.image ? [product.image.startsWith('http') ? product.image : `${req.protocol}://${req.get('host')}${product.image}`] : [],
          },
          unit_amount: unitAmountInCents, // Amount in cents
        },
        quantity: item.quantity,
      });

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Check if total order amount meets Stripe minimum ($0.50 USD)
    const totalInUsd = totalAmount / pkrToUsdRate;
    const totalInCents = Math.round(totalInUsd * 100);
    
    if (totalInCents < 50) {
      return res.status(400).json({ 
        message: `Order total (Rs ${totalAmount.toFixed(2)}) is too low. Minimum order value must be at least Rs ${Math.ceil(50 * pkrToUsdRate / 100)} (approximately $0.50 USD).` 
      });
    }

    // Get user ID if authenticated
    let userId = null;
    if (req.user) {
      const user = await findUserByAuth0Id(req.user.sub);
      if (user) userId = user._id;
    }

    // Create order in database with 'pending' payment status
    const order = new Order({
      user: userId,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      paymentMethod: 'Stripe',
      paymentStatus: 'pending',
      status: 'Pending'
    });

    await order.save();

    // Link order to user if authenticated
    if (userId) {
      await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });
    }

    // Determine success and cancel URLs
    const baseUrl = process.env.FRONTEND_URL || (req.protocol + '://' + req.get('host').replace(':5000', ':3000'));
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`;
    const cancelUrl = `${baseUrl}/payment-cancel?order_id=${order._id}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata: {
        orderId: order._id.toString(),
        userId: userId ? userId.toString() : '',
      },
    });

    // Save Stripe session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      sessionId: session.id,
      url: session.url,
      orderId: order._id
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    handleError(error, res, 400, 'Failed to create checkout session');
  }
});

// Stripe Webhook Handler (for payment confirmation)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: 'Stripe is not configured.' });
  }
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!webhookSecret) {
      console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set. Webhook verification skipped.');
      // In development, you might want to parse the event without verification
      event = JSON.parse(req.body);
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Find order by Stripe session ID
      const order = await Order.findOne({ stripeSessionId: session.id });
      
      if (order) {
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        order.status = 'Confirmed'; // Auto-confirm paid orders
        await order.save();
        
        // Update product stock
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }
        
        console.log(`✅ Order ${order._id} payment confirmed via Stripe`);
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      const failedOrder = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      
      if (failedOrder) {
        failedOrder.paymentStatus = 'failed';
        await failedOrder.save();
        console.log(`❌ Order ${failedOrder._id} payment failed`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Verify payment status
router.get('/verify-payment/:orderId', verifyAuth0Token, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) return handleNotFound(res, 'Order');

    // If order has Stripe session, check with Stripe
    if (order.stripeSessionId && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        
        if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
          // Payment was successful, update order
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = session.payment_intent;
          order.status = 'Confirmed';
          await order.save();
        }
        
        res.json({
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          stripePaymentStatus: session.payment_status
        });
      } catch (stripeError) {
        console.error('Stripe verification error:', stripeError);
        res.json({
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          stripePaymentStatus: 'unknown'
        });
      }
    } else {
      res.json({
        orderId: order._id,
        paymentStatus: order.paymentStatus
      });
    }
  } catch (error) {
    handleError(error, res, 400, 'Failed to verify payment');
  }
});

module.exports = router;


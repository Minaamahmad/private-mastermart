import Stripe from 'stripe';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { handleRouteError, jsonError, notFound } from '@/lib/apiError';
import { isValidObjectId } from '@/lib/validators';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request) {
  if (!stripe) {
    return jsonError('Stripe is not configured. Set STRIPE_SECRET_KEY.', 500);
  }

  try {
    await connectDB();
    const { customerName, customerPhone, customerAddress, customerEmail, items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonError('Order must have at least one item', 400);
    }

    const pkrToUsdRate = parseFloat(process.env.PKR_TO_USD_RATE) || 280;
    let totalAmount = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of items) {
      if (!isValidObjectId(item.productId)) {
        return jsonError(`Invalid product ID: ${item.productId}`, 400);
      }

      const product = await Product.findById(item.productId);
      if (!product) return notFound(`Product ${item.productId}`);
      if (product.stock < item.quantity) {
        return jsonError(`Insufficient stock for ${product.name}`, 400);
      }

      totalAmount += product.price * item.quantity;

      const unitAmountInCents = Math.round((product.price / pkrToUsdRate) * 100);
      if (unitAmountInCents < 50) {
        return jsonError(
          `Product "${product.name}" price is too low for Stripe checkout.`,
          400
        );
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.image?.startsWith('http') ? [product.image] : [],
          },
          unit_amount: unitAmountInCents,
        },
        quantity: item.quantity,
      });

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const totalInCents = Math.round((totalAmount / pkrToUsdRate) * 100);
    if (totalInCents < 50) {
      return jsonError('Order total is too low for Stripe checkout.', 400);
    }

    const order = new Order({
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      customerAddress,
      items: orderItems,
      totalAmount,
      paymentMethod: 'Stripe',
      paymentStatus: 'pending',
      status: 'Pending',
    });

    await order.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`;
    const cancelUrl = `${baseUrl}/payment-cancel?order_id=${order._id}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata: { orderId: order._id.toString() },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return Response.json({
      sessionId: session.id,
      url: session.url,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return handleRouteError(error, 'Failed to create checkout session');
  }
}

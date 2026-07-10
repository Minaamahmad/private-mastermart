import Stripe from 'stripe';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { handleRouteError, notFound } from '@/lib/apiError';
import { parseObjectId } from '@/lib/validators';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function GET(_request, { params }) {
  try {
    const { orderId } = await params;
    if (!parseObjectId(orderId)) return notFound('Order');

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) return notFound('Order');

    if (order.stripeSessionId && stripe) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

      if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        order.status = 'Confirmed';
        await order.save();
      }

      return Response.json({
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        stripePaymentStatus: session.payment_status,
      });
    }

    return Response.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to verify payment');
  }
}

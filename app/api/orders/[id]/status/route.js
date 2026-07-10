import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { handleRouteError, notFound } from '@/lib/apiError';
import { parseObjectId } from '@/lib/validators';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!parseObjectId(id)) return notFound('Order');

    await connectDB();
    const order = await Order.findById(id);
    if (!order) return notFound('Order');

    const { status } = await request.json();
    order.status = status;
    await order.save();
    await order.populate('items.product', 'name image');

    return Response.json(order);
  } catch (error) {
    return handleRouteError(error, 'Failed to update order status');
  }
}

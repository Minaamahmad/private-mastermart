import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { handleRouteError, notFound } from '@/lib/apiError';
import { parseObjectId } from '@/lib/validators';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!parseObjectId(id)) return notFound('Order');

    await connectDB();
    const order = await Order.findById(id).populate('items.product', 'name image description');
    if (!order) return notFound('Order');

    return Response.json(order);
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch order');
  }
}

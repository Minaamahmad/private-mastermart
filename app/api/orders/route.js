import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { handleRouteError } from '@/lib/apiError';

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find()
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    return Response.json(orders);
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch orders');
  }
}

import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { handleRouteError, notFound } from '@/lib/apiError';
import { normalizeBoolean } from '@/lib/inputHelpers';
import { processPriceAndDiscount } from '@/lib/productHelpers';
import { parseObjectId } from '@/lib/validators';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!parseObjectId(id)) return notFound('Product');

    await connectDB();
    const product = await Product.findById(id);
    if (!product) return notFound('Product');

    return Response.json(product);
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch product');
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!parseObjectId(id)) return notFound('Product');

    await connectDB();
    const product = await Product.findById(id);
    if (!product) return notFound('Product');

    const body = await request.json();
    const { name, description, price, originalPrice, discount, category, stock, featured, image } = body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (category !== undefined) product.category = category || 'General';
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (featured !== undefined) product.featured = normalizeBoolean(featured);
    if (image !== undefined) product.image = image?.trim() || '';

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
      const originalPriceNum = originalPrice !== undefined
        ? (originalPrice ? parseFloat(originalPrice) : null)
        : product.originalPrice;
      const discountNum = discount !== undefined ? parseFloat(discount) : product.discount;

      const { originalPrice: finalOriginalPrice, discount: finalDiscount } =
        processPriceAndDiscount(product.price, originalPriceNum, discountNum);

      product.originalPrice = finalOriginalPrice;
      product.discount = finalDiscount;
    }

    await product.save();
    return Response.json(product);
  } catch (error) {
    return handleRouteError(error, 'Failed to update product');
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    if (!parseObjectId(id)) return notFound('Product');

    await connectDB();
    const product = await Product.findById(id);
    if (!product) return notFound('Product');

    await product.deleteOne();
    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return handleRouteError(error, 'Failed to delete product');
  }
}

import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { handleRouteError } from '@/lib/apiError';
import { normalizeBoolean } from '@/lib/inputHelpers';
import { processPriceAndDiscount } from '@/lib/productHelpers';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = {};

    if (searchParams.get('featured') === 'true') query.featured = true;
    if (searchParams.get('category')) query.category = searchParams.get('category');

    const products = await Product.find(query).sort({ createdAt: -1 });
    return Response.json(products);
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch products');
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, price, originalPrice, discount, category, stock, featured, image } = body;

    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    const discountNum = discount ? parseFloat(discount) : 0;

    const { originalPrice: finalOriginalPrice, discount: finalDiscount } =
      processPriceAndDiscount(priceNum, originalPriceNum, discountNum);

    const product = new Product({
      name: name?.trim(),
      description: description?.trim(),
      price: priceNum,
      originalPrice: finalOriginalPrice,
      discount: finalDiscount,
      category: category || 'General',
      stock: stock !== undefined ? parseInt(stock, 10) : 0,
      featured: normalizeBoolean(featured),
      image: image?.trim() || '',
    });

    await product.save();
    return Response.json(product, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to create product');
  }
}

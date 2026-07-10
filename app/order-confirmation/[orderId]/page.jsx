import OrderConfirmationPage from '@/components/OrderConfirmationPage';

export default async function Page({ params }) {
  const { orderId } = await params;
  return <OrderConfirmationPage orderId={orderId} />;
}

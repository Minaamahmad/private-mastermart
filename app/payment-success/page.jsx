import { Suspense } from 'react';
import PaymentSuccessPage from '@/components/PaymentSuccessPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}

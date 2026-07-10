import { Suspense } from 'react';
import PaymentCancelPage from '@/components/PaymentCancelPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <PaymentCancelPage />
    </Suspense>
  );
}

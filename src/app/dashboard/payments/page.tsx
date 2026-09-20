import type { Metadata } from 'next';
import PaymentsView from 'components/payments/PaymentsView';

export const metadata: Metadata = {
  title: 'Manage Payments | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function PaymentsPage() {
  return <PaymentsView />;
}

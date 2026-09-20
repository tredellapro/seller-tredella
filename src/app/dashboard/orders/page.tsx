import type { Metadata } from 'next';
import OrdersListView from 'components/orders/OrdersListView';

export const metadata: Metadata = {
  title: 'Manage Orders | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function OrdersPage() {
  return <OrdersListView />;
}

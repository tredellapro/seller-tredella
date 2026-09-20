import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderView from 'components/orders/OrderView';
import { orderById } from 'data/orders-sample';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = orderById(id);

  return {
    title: order ? `Order ${order.id} | Tredella Seller` : 'Order | Tredella Seller'
  };
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = orderById(id);
  if (!order) notFound();

  return <OrderView order={order} />;
}

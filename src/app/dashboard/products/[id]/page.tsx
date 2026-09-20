import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from 'components/products/ProductView';
import { productById } from 'data/products-sample';

/* `new` is a static segment, so /dashboard/products/new keeps going to the
   form — Next prefers it over this dynamic one. */

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = productById(id);

  return {
    title: product
      ? `${product.name} | Tredella Seller`
      : 'Product | Tredella Seller'
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!productById(id)) notFound();

  return <ProductView productId={id} />;
}

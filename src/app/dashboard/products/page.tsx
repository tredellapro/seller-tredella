import type { Metadata } from 'next';
import ProductListView from 'components/products/ProductListView';

export const metadata: Metadata = {
  title: 'Product List | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function ProductsPage() {
  return <ProductListView />;
}

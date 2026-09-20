import type { Metadata } from 'next';
import ProductForm from 'components/products/ProductForm';

export const metadata: Metadata = {
  title: 'Add Product | Tredella Seller'
};

export default function AddProductPage() {
  return <ProductForm />;
}

import type { Metadata } from 'next';
import QuestionsView from 'components/products/QuestionsView';

export const metadata: Metadata = {
  title: 'Product Questions | Tredella Seller'
};

/* A static segment, so it wins over /dashboard/products/[id] — same as `new`. */
export default function ProductQuestionsPage() {
  return <QuestionsView />;
}

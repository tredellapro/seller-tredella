import type { Metadata } from 'next';
import PlansView from 'components/plans/PlansView';

export const metadata: Metadata = {
  title: 'Plans & Membership | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function PlansPage() {
  return <PlansView />;
}

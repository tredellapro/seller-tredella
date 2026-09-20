import type { Metadata } from 'next';
import ComplaintsView from 'components/complaints/ComplaintsView';

export const metadata: Metadata = {
  title: 'Manage Complaints | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function ComplaintsPage() {
  return <ComplaintsView />;
}

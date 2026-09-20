import type { Metadata } from 'next';
import UserRolesView from 'components/team/UserRolesView';

export const metadata: Metadata = {
  title: 'Manage User Roles | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function UserRolesPage() {
  return <UserRolesView />;
}

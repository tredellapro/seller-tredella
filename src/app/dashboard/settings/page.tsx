import type { Metadata } from 'next';
import SettingsView from 'components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section]. */
export default function SettingsPage() {
  return <SettingsView />;
}

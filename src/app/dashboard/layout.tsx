import type { ReactNode } from 'react';
import DashboardShell from 'components/dashboard/DashboardShell';

/** Every page under /dashboard gets the sidebar and header from here. */
export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

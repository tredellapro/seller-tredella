import AnalyticsOverview from 'components/dashboard/AnalyticsOverview';

/* Sidebar and header come from the dashboard layout. The blocks below are all
   reusable components taking their data as props — see data/dashboard-sample.ts
   for the figures they are currently fed. */
export default function DashboardPage() {
  return <AnalyticsOverview />;
}

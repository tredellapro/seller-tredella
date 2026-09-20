import DashboardUtilityBar from 'components/dashboard/DashboardUtilityBar';
import DashboardTopBar from 'components/dashboard/DashboardTopBar';
import NotificationList from './NotificationList';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardUtilityBar />
      <DashboardTopBar />
      <main className="px-4 pb-16 sm:px-8">
        <NotificationList />
      </main>
    </div>
  );
}

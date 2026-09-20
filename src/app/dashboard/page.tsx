import DashboardUtilityBar from 'components/dashboard/DashboardUtilityBar';
import DashboardTopBar from 'components/dashboard/DashboardTopBar';

/* The top bar is real; everything below it is still a placeholder. The sidebar,
   stat cards, charts and orders table come with the dashboard proper. */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardUtilityBar />
      <DashboardTopBar />

      <main className="px-4 pb-16 sm:px-8">
        <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_4px_30px_rgba(43,52,69,0.08)]">
          <h2 className="text-18 font-semibold text-secondary">
            Dashboard screens come next
          </h2>
          <p className="mx-auto mt-2 max-w-[520px] text-14 text-gray">
            The stat cards, revenue and order charts and the incoming orders
            table are still to build. The notification bell above is live —
            open it to see your notifications.
          </p>
        </div>
      </main>
    </div>
  );
}

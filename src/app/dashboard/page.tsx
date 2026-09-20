/* The sidebar and header come from the dashboard layout; everything here is
   still a placeholder until the stat cards, charts and orders table land. */
export default function DashboardPage() {
  return (
    <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-[0_4px_30px_rgba(43,52,69,0.08)]">
      <h1 className="text-20 font-semibold text-secondary">Analytics</h1>
      <p className="mx-auto mt-2 max-w-[520px] text-14 text-gray">
        The stat cards, revenue and order charts and the incoming orders table
        are still to build. The sidebar, header and notification bell around
        them are live.
      </p>
    </div>
  );
}

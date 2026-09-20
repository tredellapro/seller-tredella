import { notFound } from 'next/navigation';
import { SECTION_SLUGS, sectionLabel } from 'data/dashboard-nav';

/* Stands in for sidebar sections that have no page yet, so the nav is walkable
   instead of dropping into a 404. Building the real page shadows this one —
   Next prefers a static segment over a dynamic one. */
export default async function DashboardSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SECTION_SLUGS.includes(section)) notFound();

  const label = sectionLabel(section);

  return (
    <div className="flex_center min-h-[60vh]">
      <div className="w-full max-w-[520px] rounded-2xl bg-white px-6 py-12 text-center shadow-[0_4px_30px_rgba(43,52,69,0.08)]">
        <h1 className="text-20 font-semibold text-secondary">{label}</h1>
        <p className="mt-2 text-14 text-gray">
          This screen is still to build. The sidebar and header around it are
          done, so it will slot straight in.
        </p>
      </div>
    </div>
  );
}

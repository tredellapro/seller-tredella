import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComplaintDetailView from 'components/complaints/ComplaintDetailView';
import { complaintById } from 'data/complaints-sample';

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const complaint = complaintById(id);

  return {
    title: complaint
      ? `${complaint.title} | Tredella Seller`
      : 'Complaint | Tredella Seller'
  };
}

export default async function ComplaintDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = complaintById(id);
  if (!complaint) notFound();

  return <ComplaintDetailView complaint={complaint} />;
}

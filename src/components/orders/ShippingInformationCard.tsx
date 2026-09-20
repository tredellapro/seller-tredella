'use client';

import { useEffect, useState } from 'react';
import { HiOutlinePencil } from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import { longDate } from 'data/products-sample';
import type { CourierDetails } from 'data/orders-sample';
import CourierFields, {
  courierDraftFrom,
  courierProblem,
  toCourierDetails,
  type CourierDraft
} from './CourierFields';

interface ShippingInformationCardProps {
  courier: CourierDetails | null;
  onSave: (_courier: CourierDetails) => void;
  /** A cancelled order is not going anywhere. */
  readOnly?: boolean;
}

/**
 * Who is carrying the parcel. Starts in edit mode when nothing has been filled
 * in yet; the fields themselves are shared with the Change Status dialog.
 */
export default function ShippingInformationCard({
  courier,
  onSave,
  readOnly = false
}: ShippingInformationCardProps) {
  const [editing, setEditing] = useState(courier === null);
  const [draft, setDraft] = useState<CourierDraft>(() => courierDraftFrom(courier));
  const [error, setError] = useState<string | null>(null);

  /* The courier can also arrive from the Change Status dialog, which sets it
     without touching this card. Without this the card would sit in edit mode
     over details that have already been saved. */
  useEffect(() => {
    if (!courier) return;
    setDraft(courierDraftFrom(courier));
    setEditing(false);
    setError(null);
  }, [courier]);

  const save = () => {
    const problem = courierProblem(draft);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    onSave(toCourierDetails(draft));
    setEditing(false);
  };

  const rows = courier
    ? [
        { label: 'Company Name', value: courier.companyName },
        { label: 'Tracking Link', value: courier.trackingLink || '—' },
        { label: 'Tracking Number', value: courier.trackingNumber || '—' },
        { label: 'Date', value: longDate(courier.date) }
      ]
    : [];

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-14 font-semibold text-primary">
          Shipping Information
        </h2>

        {!readOnly &&
          (editing ? (
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-primary px-4 py-1.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Save Changes
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(courierDraftFrom(courier));
                setEditing(true);
              }}
              aria-label="Edit shipping information"
              className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
            >
              <HiOutlinePencil />
            </button>
          ))}
      </div>

      <div className="mt-4 flex flex-col gap-5">
        {editing ? (
          <CourierFields
            idPrefix="card"
            draft={draft}
            onChange={(patch) => {
              setDraft((current) => ({ ...current, ...patch }));
              setError(null);
            }}
            disabled={readOnly}
          />
        ) : (
          <div>
            <p className="mb-2 text-13 font-medium text-secondary">
              Shipping Details
            </p>
            <dl className="overflow-hidden rounded-lg border border-secondary/10">
              {rows.map((row, index) => (
                <div
                  key={row.label}
                  className={`flex items-start justify-between gap-4 px-3 py-2 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-white'
                  }`}
                >
                  <dt className="min-w-0 text-12 text-gray">{row.label}</dt>
                  <dd className="min-w-0 break-all text-right text-12 font-medium text-secondary">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {error && <p className="text-12 text-primary">{error}</p>}
      </div>
    </Panel>
  );
}

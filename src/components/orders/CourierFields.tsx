'use client';

import { HiExclamationCircle } from 'react-icons/hi';
import FileUpload, { type UploadedFileInfo } from 'components/ui/FileUpload';
import type { CourierDetails } from 'data/orders-sample';

export type CourierService = CourierDetails['service'];

/** What the form holds while it is being filled in. */
export interface CourierDraft {
  service: CourierService;
  companyName: string;
  trackingNumber: string;
  trackingLink: string;
  invoice: UploadedFileInfo | null;
}

const MAX_INVOICE_BYTES = 10 * 1024 * 1024;

export const courierDraftFrom = (
  courier: CourierDetails | null | undefined
): CourierDraft => ({
  service: courier?.service ?? 'TREDELLA',
  companyName:
    courier && courier.service === 'OTHER' ? courier.companyName : '',
  trackingNumber: courier?.trackingNumber ?? '',
  trackingLink: courier?.trackingLink ?? '',
  invoice: null
});

/** The one reason this draft cannot be saved yet, or null. */
export const courierProblem = (draft: CourierDraft): string | null => {
  if (draft.service === 'OTHER' && !draft.companyName.trim())
    return 'Name the courier carrying this parcel.';
  if (draft.service === 'TREDELLA' && !draft.invoice)
    return 'Upload the purchase invoice so VAT can be calculated.';
  return null;
};

export const toCourierDetails = (draft: CourierDraft): CourierDetails => ({
  service: draft.service,
  companyName:
    draft.service === 'TREDELLA' ? 'Tredella Shipping' : draft.companyName.trim(),
  trackingNumber: draft.trackingNumber.trim(),
  trackingLink: draft.trackingLink.trim(),
  date: new Date().toISOString().slice(0, 10)
});

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  optional = false
}: {
  id: string;
  label: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-13 text-secondary">
        {label}
        {optional && <span className="text-12 text-gray">Optional</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
      />
    </div>
  );
}

interface CourierFieldsProps {
  draft: CourierDraft;
  onChange: (_patch: Partial<CourierDraft>) => void;
  /** Namespaces the inputs when two copies of this form exist on one page. */
  idPrefix: string;
  disabled?: boolean;
}

/**
 * Who is carrying the parcel, and how the buyer tracks it.
 *
 * Shared by the shipping card on the order page and the Change Status dialog,
 * because a seller marking something shipped from either place is answering
 * the same question — and the answer is what the tracking email is built from.
 */
export default function CourierFields({
  draft,
  onChange,
  idPrefix,
  disabled = false
}: CourierFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-3 text-13 font-medium text-secondary">
          Select Courier Service
        </legend>
        <div className="flex flex-wrap gap-6">
          {(
            [
              ['TREDELLA', 'Tredella'],
              ['OTHER', 'Other Service']
            ] as [CourierService, string][]
          ).map(([option, label]) => (
            <label
              key={option}
              className={`flex items-center gap-2 text-13 text-secondary ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                <input
                  type="radio"
                  name={`${idPrefix}-courier-service`}
                  value={option}
                  checked={draft.service === option}
                  disabled={disabled}
                  onChange={() => onChange({ service: option })}
                  className="peer h-full w-full cursor-pointer appearance-none rounded-full border border-secondary/30 bg-white transition-colors checked:border-primary checked:border-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
                />
              </span>
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {draft.service === 'TREDELLA' ? (
        <>
          <p className="flex items-start gap-2 text-13 text-secondary">
            <HiExclamationCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Need seller purchasing invoice (to calculate UAE tax 5%)
          </p>

          <FileUpload
            label="Purchase Invoice"
            hint="PDF, JPG or PNG — max file size 10 MB"
            required
            accept="application/pdf,image/jpeg,image/png"
            maxBytes={MAX_INVOICE_BYTES}
            value={draft.invoice}
            disabled={disabled}
            onSelect={(file) =>
              onChange({
                invoice: {
                  fileName: file.name,
                  sizeBytes: file.size,
                  mimeType: file.type
                }
              })
            }
            onRemove={() => onChange({ invoice: null })}
          />

          <Field
            id={`${idPrefix}-tracking-number`}
            label="Tracking Number"
            optional
            value={draft.trackingNumber}
            onChange={(trackingNumber) => onChange({ trackingNumber })}
            placeholder="Tredella assigns one if left blank"
          />
        </>
      ) : (
        <>
          <Field
            id={`${idPrefix}-company`}
            label="Company Name"
            value={draft.companyName}
            onChange={(companyName) => onChange({ companyName })}
            placeholder="Leopard Courier"
          />
          <Field
            id={`${idPrefix}-tracking-number`}
            label="Tracking Number"
            value={draft.trackingNumber}
            onChange={(trackingNumber) => onChange({ trackingNumber })}
            placeholder="1234567890"
          />
          <Field
            id={`${idPrefix}-tracking-link`}
            label="Tracking Link"
            optional
            value={draft.trackingLink}
            onChange={(trackingLink) => onChange({ trackingLink })}
            placeholder="www.track-parcel.com"
            type="url"
          />
        </>
      )}
    </div>
  );
}

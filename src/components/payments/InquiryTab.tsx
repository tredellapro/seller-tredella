'use client';

import { useMemo, useState } from 'react';
import { HiChevronDown, HiOutlineCheckCircle } from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import { longDate } from 'data/products-sample';
import {
  EARNINGS,
  INQUIRIES,
  INQUIRY_SUBJECTS,
  TODAY,
  WITHDRAWALS,
  type Inquiry,
  type InquiryStatus
} from 'data/payments-sample';
import { balancesFor } from 'lib/payouts';

const STATUS_TONE: Record<InquiryStatus, string> = {
  Open: 'text-amber-600',
  'In review': 'text-blue-600',
  Resolved: 'text-green-600'
};

const MIN_NOTES = 20;

export default function InquiryTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(INQUIRIES);
  const [subject, setSubject] = useState(INQUIRY_SUBJECTS[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  /* Offer the things a seller is most likely to be asking about, rather than
     making them copy an id from another tab. */
  const references = useMemo(() => {
    const frozen = balancesFor(EARNINGS, TODAY).frozenOrders.map(
      (order) => `Order ${order.orderId} (frozen)`
    );
    const recent = WITHDRAWALS.slice(0, 4).map(
      (withdrawal) => `Withdrawal ${withdrawal.id}`
    );
    return ['', ...frozen, ...recent];
  }, []);

  const submit = () => {
    if (notes.trim().length < MIN_NOTES) {
      setError(
        `Describe the issue in a little more detail — at least ${MIN_NOTES} characters.`
      );
      return;
    }

    const inquiry: Inquiry = {
      id: `INQ-${String(4300 + inquiries.length).padStart(4, '0')}`,
      subject,
      notes: notes.trim(),
      reference: reference || null,
      status: 'Open',
      createdAt: TODAY,
      response: null
    };

    setInquiries((all) => [inquiry, ...all]);
    setNotes('');
    setReference('');
    setError(null);
    setSent(`${inquiry.id} raised. We usually reply within two working days.`);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
      <Panel>
        <h2 className="text-14 font-semibold text-secondary">Raise an Inquiry</h2>
        <p className="mt-1 text-12 text-gray">
          Frozen amount, a withdrawal that has not landed, a refund you disagree
          with — tell us what happened.
        </p>

        {sent && (
          <p
            role="status"
            className="mt-4 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-12 text-secondary"
          >
            <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {sent}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="inquiry-subject" className="text-13 text-secondary">
              Subject
            </label>
            <div className="relative">
              <select
                id="inquiry-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
              >
                {INQUIRY_SUBJECTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="inquiry-reference" className="flex items-baseline gap-2 text-13 text-secondary">
              Related to
              <span className="text-12 text-gray">Optional</span>
            </label>
            <div className="relative">
              <select
                id="inquiry-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className={`w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 outline-none transition-colors focus:border-primary ${
                  reference ? 'text-secondary' : 'text-gray/60'
                }`}
              >
                {references.map((option) => (
                  <option key={option || 'none'} value={option}>
                    {option || 'Nothing specific'}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="inquiry-notes" className="text-13 text-secondary">
              Notes — what is the issue?
              <span className="ml-0.5 text-primary">*</span>
            </label>
            <textarea
              id="inquiry-notes"
              rows={6}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setError(null);
              }}
              placeholder="Order 1007 shows as not dispatched, but the courier collected it on 27 Feb and I have the pickup receipt."
              aria-invalid={error ? true : undefined}
              className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
                error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
              }`}
            />
            <div className="flex items-baseline justify-between gap-3">
              {error ? (
                <p className="text-12 text-primary">{error}</p>
              ) : (
                <p className="text-11 text-gray">
                  Dates, order numbers and receipts get this resolved fastest.
                </p>
              )}
              <span className="shrink-0 text-11 text-gray">
                {notes.trim().length}/{MIN_NOTES}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            className="w-full rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Submit Inquiry
          </button>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-14 font-semibold text-secondary">Your Inquiries</h2>

        {inquiries.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-secondary/20 px-4 py-8 text-center text-13 text-gray">
            Nothing raised yet.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {inquiries.map((inquiry) => (
              <li
                key={inquiry.id}
                className="rounded-xl border border-secondary/10 px-4 py-3.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-13 font-medium text-secondary">
                    {inquiry.subject}
                    {inquiry.reference && (
                      <span className="ml-2 text-12 font-normal text-gray">
                        {inquiry.reference}
                      </span>
                    )}
                  </p>
                  <span className={`text-12 ${STATUS_TONE[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                </div>

                <p className="mt-1.5 text-12 leading-relaxed text-gray">
                  {inquiry.notes}
                </p>

                {inquiry.response && (
                  <p className="mt-2.5 rounded-lg bg-background px-3 py-2 text-12 text-secondary">
                    <span className="font-medium">Tredella:</span>{' '}
                    {inquiry.response}
                  </p>
                )}

                <p className="mt-2 text-11 text-gray">
                  {inquiry.id} · raised {longDate(inquiry.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

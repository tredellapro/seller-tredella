'use client';

import { useEffect, useState } from 'react';
import { HiChevronDown, HiOutlineMail } from 'react-icons/hi';
import Modal from 'components/ui/Modal';
import {
  CUSTOMER_EMAIL_LINE,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  customerEmailSubject,
  customerEmailTracking,
  type OrderStatusValue,
  type PaymentStatusValue
} from 'lib/orderStatus';
import type { CourierDetails, OrderRow } from 'data/orders-sample';
import CourierFields, {
  courierDraftFrom,
  courierProblem,
  toCourierDetails,
  type CourierDraft
} from './CourierFields';

export interface StatusChange {
  orderStatus: OrderStatusValue;
  paymentStatus: PaymentStatusValue;
  /** Set when the order was just marked shipped. */
  courier?: CourierDetails;
}

interface ChangeStatusModalProps {
  /** Null closes the dialog. */
  order: OrderRow | null;
  onClose: () => void;
  onSave: (_orderId: string, _change: StatusChange) => void;
}

function StatusSelect<T extends string>({
  id,
  label,
  value,
  options,
  labels,
  onChange
}: {
  id: string;
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (_value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {labels[option]}
            </option>
          ))}
        </select>
        <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
      </div>
    </div>
  );
}

/**
 * Change an order's status.
 *
 * Marking something shipped asks for the courier in the same breath, because
 * the buyer's "on its way" email carries the tracking — collecting it a screen
 * later would mean sending them a shipping notice with nothing to track.
 *
 * Saving emails the buyer, so the exact message is shown before it goes.
 */
export default function ChangeStatusModal({
  order,
  onClose,
  onSave
}: ChangeStatusModalProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatusValue>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>('PAID');
  const [draft, setDraft] = useState<CourierDraft>(() => courierDraftFrom(null));
  const [error, setError] = useState<string | null>(null);

  // reopening on a different order must not show the last one's selection
  useEffect(() => {
    if (!order) return;
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setDraft(courierDraftFrom(order.courier));
    setError(null);
  }, [order]);

  if (!order) return null;

  const statusChanged = orderStatus !== order.orderStatus;
  const needsCourier = orderStatus === 'SHIPPED';

  /* Preview the tracking exactly as the email will carry it. */
  const previewCourier = needsCourier
    ? {
        companyName:
          draft.service === 'TREDELLA'
            ? 'Tredella Shipping'
            : draft.companyName.trim(),
        trackingNumber: draft.trackingNumber.trim(),
        trackingLink: draft.trackingLink.trim()
      }
    : null;

  const trackingLines = customerEmailTracking(
    orderStatus,
    previewCourier && previewCourier.companyName ? previewCourier : null
  );

  const save = () => {
    if (needsCourier) {
      const problem = courierProblem(draft);
      if (problem) {
        setError(problem);
        return;
      }
    }

    setError(null);
    onSave(order.id, {
      orderStatus,
      paymentStatus,
      ...(needsCourier ? { courier: toCourierDetails(draft) } : {})
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Change Status"
      width={needsCourier ? 'md' : 'sm'}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <StatusSelect
          id="change-order-status"
          label="Order Status"
          value={orderStatus}
          options={ORDER_STATUSES}
          labels={ORDER_STATUS_LABEL}
          onChange={(value) => {
            setOrderStatus(value);
            setError(null);
          }}
        />

        <StatusSelect
          id="change-payment-status"
          label="Payment Status"
          value={paymentStatus}
          options={PAYMENT_STATUSES}
          labels={PAYMENT_STATUS_LABEL}
          onChange={setPaymentStatus}
        />

        {needsCourier && (
          <div className="rounded-xl border border-secondary/10 bg-background/60 px-4 py-4">
            <p className="mb-4 text-13 font-medium text-primary">
              Shipping Information
            </p>
            <CourierFields
              idPrefix="modal"
              draft={draft}
              onChange={(patch) => {
                setDraft((current) => ({ ...current, ...patch }));
                setError(null);
              }}
            />
          </div>
        )}

        {error && <p className="text-12 text-primary">{error}</p>}

        {statusChanged && (
          <div className="flex gap-2.5 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3">
            <HiOutlineMail
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 text-12 text-secondary">
              <p>
                {order.customer.name} will be emailed at{' '}
                <span className="break-all font-medium">
                  {order.customer.email}
                </span>
                :
              </p>
              <p className="mt-1 text-gray">
                <span className="font-medium text-secondary">
                  {customerEmailSubject(order.id, orderStatus)}
                </span>{' '}
                — {CUSTOMER_EMAIL_LINE[orderStatus]}
              </p>

              {trackingLines.length > 0 && (
                <ul className="mt-2 flex flex-col gap-0.5 border-t border-primary/15 pt-2">
                  {trackingLines.map((line) => (
                    <li key={line} className="break-all text-gray">
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              {needsCourier && trackingLines.length === 0 && (
                <p className="mt-2 border-t border-primary/15 pt-2 text-gray">
                  Fill the courier in above and the tracking details join this
                  email.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

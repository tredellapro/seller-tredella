'use client';

import { useState } from 'react';
import { HiExclamationCircle, HiOutlineCheckCircle, HiOutlineSwitchHorizontal, HiX } from 'react-icons/hi';
import ImageGallery from 'components/common/ImageGallery';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import { aedExact } from 'data/dashboard-sample';
import { longDate } from 'data/products-sample';
import type { CourierDetails, OrderRow } from 'data/orders-sample';
import {
  CUSTOMER_EMAIL_LINE,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  canChangeStatus,
  customerEmailSubject,
  customerEmailTracking
} from 'lib/orderStatus';
import ChangeStatusModal, { type StatusChange } from './ChangeStatusModal';
import CancelOrderModal from './CancelOrderModal';
import ShippingInformationCard from './ShippingInformationCard';

/** The 10% the seller forfeits when they cancel a confirmed order. */
const CANCELLATION_FEE_PERCENT = 10;

function DetailRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-secondary/10">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-start justify-between gap-4 px-3 py-2 ${
            index % 2 === 0 ? 'bg-background' : 'bg-white'
          }`}
        >
          <dt className="min-w-0 text-12 text-gray">{row.label}</dt>
          <dd className="min-w-0 break-words text-right text-12 font-medium text-secondary">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function OrderView({ order: initial }: { order: OrderRow }) {
  const [order, setOrder] = useState<OrderRow>(initial);
  const [changing, setChanging] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const cancelled = order.orderStatus === 'CANCELLED';

  /* The mutation is not built yet; when it is, these are the call sites and
     the email is dispatched server-side so it cannot be missed. */
  const applyStatus = (_id: string, change: StatusChange) => {
    const moved = order.orderStatus !== change.orderStatus;

    setOrder((current) => ({
      ...current,
      orderStatus: change.orderStatus,
      paymentStatus: change.paymentStatus,
      ...(change.courier
        ? { courier: change.courier, shipping: change.courier.companyName }
        : {})
    }));
    setChanging(false);

    if (!moved) {
      setNotice(`Order ${order.id} updated.`);
      return;
    }

    const tracking = customerEmailTracking(
      change.orderStatus,
      change.courier ?? null
    );

    setNotice(
      `${order.customer.email} emailed — "${customerEmailSubject(order.id, change.orderStatus)}": ${CUSTOMER_EMAIL_LINE[change.orderStatus]}${
        tracking.length > 0 ? ` ${tracking.join(' · ')}` : ''
      }`
    );
  };

  const confirmCancellation = () => {
    setOrder((current) => ({
      ...current,
      orderStatus: 'CANCELLED',
      paymentStatus: current.paymentStatus === 'PAID' ? 'REFUNDED' : current.paymentStatus,
      cancellationReason: reason.trim()
    }));
    setCancelling(false);
    setNotice(
      `Order cancelled. ${order.customer.email} emailed — "${customerEmailSubject(order.id, 'CANCELLED')}": ${CUSTOMER_EMAIL_LINE.CANCELLED}`
    );
  };

  const startCancellation = () => {
    if (!reason.trim()) {
      setReasonError('Tell the customer why the order is being cancelled.');
      return;
    }
    setReasonError(null);
    setCancelling(true);
  };

  const saveCourier = (courier: CourierDetails) => {
    setOrder((current) => ({
      ...current,
      courier,
      shipping:
        courier.service === 'TREDELLA' ? 'Tredella Shipping' : courier.companyName
    }));
    setNotice('Shipping details saved.');
  };

  const detailRows = [
    { label: 'Total', value: aedExact(order.total) },
    { label: 'Items', value: String(order.items) },
    {
      label: 'Discount',
      value: order.discountPercent > 0 ? `${order.discountPercent}% OFF` : 'None'
    },
    { label: 'Coupon', value: order.coupon ?? 'No' },
    { label: 'Order Status', value: ORDER_STATUS_LABEL[order.orderStatus] },
    { label: 'Payment Status', value: PAYMENT_STATUS_LABEL[order.paymentStatus] },
    { label: 'Payment Method', value: order.paymentMethod },
    { label: 'Create at', value: longDate(order.date) },
    { label: 'Shipping', value: order.shipping }
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Order Information"
        backHref="/dashboard/orders"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: `Order ${order.id}` }
        ]}
        actions={
          canChangeStatus(order.orderStatus) ? (
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              <HiOutlineSwitchHorizontal className="h-4 w-4" />
              Change Status
            </button>
          ) : undefined
        }
      />

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0 rounded p-0.5 text-gray transition-colors hover:text-primary"
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      <Panel>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <ImageGallery images={order.product.gallery} alt={order.product.name} />

          <div className="min-w-0">
            <h2 className="text-16 font-semibold text-secondary">
              {order.product.name}
            </h2>
            <p className="mt-2 text-13 leading-relaxed text-gray">
              {order.product.description}
            </p>

            <p className="mt-5 text-13 text-secondary">Order Details</p>
            <div className="mt-2">
              <DetailRows rows={detailRows} />
            </div>

            <p className="mt-4 text-12 text-gray">
              Ordered by {order.customer.name} —{' '}
              <span className="break-all">{order.customer.email}</span>
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShippingInformationCard
          courier={order.courier}
          onSave={saveCourier}
          readOnly={cancelled}
        />

        <Panel>
          <h2 className="text-14 font-semibold text-primary">Order Cancellation</h2>

          {cancelled ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="flex items-start gap-2 text-13 text-secondary">
                <HiExclamationCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                This order was cancelled. The customer has been notified.
              </p>
              {order.cancellationReason && (
                <div>
                  <p className="text-13 text-secondary">Reason of cancellation</p>
                  <p className="mt-1 rounded-lg bg-background px-3 py-2.5 text-12 text-gray">
                    {order.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <p className="flex items-start gap-2 text-12 text-secondary">
                <HiExclamationCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {CANCELLATION_FEE_PERCENT}% of the order amount will be deducted
                if you cancel the order — {aedExact(
                  (order.total * CANCELLATION_FEE_PERCENT) / 100
                )}{' '}
                on this one.
              </p>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cancellation-reason"
                  className="text-13 text-secondary"
                >
                  Reason of cancellation
                </label>
                <textarea
                  id="cancellation-reason"
                  rows={4}
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setReasonError(null);
                  }}
                  placeholder="The product is not available this time, that's why I am cancelling the order."
                  aria-invalid={reasonError ? true : undefined}
                  className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
                    reasonError
                      ? 'border-primary'
                      : 'border-secondary/15 focus:border-primary'
                  }`}
                />
                {reasonError && (
                  <p className="text-12 text-primary">{reasonError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={startCancellation}
                className="w-full rounded-lg bg-red-600 py-2.5 text-14 font-medium text-white transition-colors hover:bg-red-700"
              >
                Cancel Order
              </button>
            </div>
          )}
        </Panel>
      </div>

      <ChangeStatusModal
        order={changing ? order : null}
        onClose={() => setChanging(false)}
        onSave={applyStatus}
      />

      <CancelOrderModal
        open={cancelling}
        onClose={() => setCancelling(false)}
        email={order.customer.email}
        onConfirm={confirmCancellation}
      />
    </div>
  );
}

/* Order and payment states.
 *
 * The values match the backend's documented Order.status set
 * (PENDING | CONFIRMED | SHIPPED | DELIVERED | COMPLETED | CANCELLED) so the
 * UI and the API speak the same vocabulary; the labels are what the design
 * prints, which is not always the same word.
 */

export type OrderStatusValue =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatusValue = 'PAID' | 'UNPAID' | 'REFUNDED' | 'FAILED';

export const ORDER_STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Order Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusValue, string> = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  REFUNDED: 'Refunded',
  FAILED: 'Failed'
};

export const ORDER_STATUSES = Object.keys(
  ORDER_STATUS_LABEL
) as OrderStatusValue[];

/**
 * Tredella takes payment at checkout — there is no cash on delivery — so an
 * order only exists once it has been paid for. That leaves two states a seller
 * can actually set: paid, and refunded after a cancellation.
 *
 * UNPAID and FAILED stay in the label map so historical rows still render, but
 * they are not offered as a choice.
 */
export const PAYMENT_STATUSES: PaymentStatusValue[] = ['PAID', 'REFUNDED'];

/**
 * A cancelled order is finished — reopening it would strand the refund and
 * re-notify the buyer about an order they were already told was off. Every
 * other state can still move.
 */
export const canChangeStatus = (current: OrderStatusValue): boolean =>
  current !== 'CANCELLED';

/**
 * What the customer is told when the order reaches this state.
 *
 * Every status change emails the buyer, so the seller sees the exact sentence
 * before they save it rather than discovering it afterwards.
 */
export const CUSTOMER_EMAIL_LINE: Record<OrderStatusValue, string> = {
  PENDING: 'We have received your order and are getting it ready.',
  CONFIRMED: 'Your order is confirmed and is being prepared for dispatch.',
  SHIPPED: 'Your order is on its way.',
  DELIVERED: 'Your order has been delivered.',
  COMPLETED: 'Your order is complete. Thank you for shopping with Tredella.',
  CANCELLED:
    'Your order has been cancelled. Any payment already taken will be refunded.'
};

/**
 * The word the BUYER sees, which is not always the seller's label — a seller
 * reads "Order Processing" in their table, the buyer reads "confirmed".
 * Mirrors ORDER_STATUS_LABEL in the backend's mailer, and must stay in step
 * with it or the preview shown to the seller is a lie.
 */
const CUSTOMER_STATUS_WORD: Record<OrderStatusValue, string> = {
  PENDING: 'received',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'complete',
  CANCELLED: 'cancelled'
};

/** Subject line the customer sees, mirroring the backend template. */
export const customerEmailSubject = (
  orderId: string,
  status: OrderStatusValue
): string => `Order ${orderId} — ${CUSTOMER_STATUS_WORD[status]}`;

/**
 * The tracking block the buyer's email carries.
 *
 * Mirrors `orderStatusEmail` in the backend mailer, which only includes this
 * for SHIPPED and only when there is something to track — a "shipped" mail
 * with an empty courier box is worse than one without the box.
 */
export const customerEmailTracking = (
  status: OrderStatusValue,
  courier: {
    companyName: string;
    trackingNumber?: string;
    trackingLink?: string;
  } | null
): string[] => {
  if (status !== 'SHIPPED' || !courier) return [];

  return [
    `Carrier: ${courier.companyName}`,
    courier.trackingNumber ? `Tracking number: ${courier.trackingNumber}` : null,
    courier.trackingLink ? `Track it: ${courier.trackingLink}` : null
  ].filter((line): line is string => line !== null);
};

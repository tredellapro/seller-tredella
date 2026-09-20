/* Order and payment states. Colour is a hint; the word is the information, so a
   state is never conveyed by colour alone. */

const ORDER_TONE: Record<string, string> = {
  'Order Processing': 'text-blue-600',
  Shipped: 'text-green-600',
  Delivered: 'text-green-600',
  Cancelled: 'text-primary',
  Pending: 'text-amber-600'
};

const PAYMENT_TONE: Record<string, string> = {
  Paid: 'text-green-600',
  Unpaid: 'text-amber-600',
  Refunded: 'text-blue-600',
  Failed: 'text-primary'
};

export function OrderStatus({ status }: { status: string }) {
  return (
    <span className={`text-13 ${ORDER_TONE[status] ?? 'text-secondary'}`}>
      {status}
    </span>
  );
}

export function PaymentStatus({ status }: { status: string }) {
  return (
    <span className={`text-13 ${PAYMENT_TONE[status] ?? 'text-secondary'}`}>
      {status}
    </span>
  );
}

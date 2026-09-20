import type { Earning, WithdrawalStatus } from 'lib/payouts';

/* Stand-in payment data until the payouts API exists.
 *
 * TODAY is fixed rather than read from the clock: the hold and freeze rules
 * are date arithmetic, and a server render and a client render must not
 * disagree about what day it is. Change this one constant to move the whole
 * demo forward. */
export const TODAY = '2025-03-20';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX';

export interface SavedCard {
  id: string;
  brand: CardBrand;
  /** Only ever the last four — the full number belongs to the gateway. */
  last4: string;
  expMonth: string;
  expYear: string;
  country: string;
  postalCode: string;
  addedAt: string;
}

/* One card, by design. Replacing it goes through an emailed code — see
   PaymentMethodTab. */
export const SAVED_CARD: SavedCard = {
  id: 'card-1',
  brand: 'VISA',
  last4: '7830',
  expMonth: '07',
  expYear: '25',
  country: 'AE',
  postalCode: '00000',
  addedAt: '2025-01-12'
};

/** The ledger the balances are derived from. */
export const EARNINGS: Earning[] = [
  // cleared — delivered well over 14 days ago
  { orderId: '1006', amount: 34000, placedAt: '2025-02-18', deliveredAt: '2025-02-26', dispatched: true },
  { orderId: 'R-4825', amount: 52, placedAt: '2025-02-20', deliveredAt: '2025-03-03', dispatched: true },
  { orderId: '1004', amount: 13600, placedAt: '2025-02-24', deliveredAt: '2025-03-05', dispatched: true },
  // on hold — delivered inside the window
  { orderId: 'R-4823', amount: 117, placedAt: '2025-03-02', deliveredAt: '2025-03-14', dispatched: true },
  { orderId: '1002', amount: 96250, placedAt: '2025-03-09', deliveredAt: '2025-03-18', dispatched: true },
  // on hold — dispatched but still moving
  { orderId: 'R-4822', amount: 104, placedAt: '2025-03-16', deliveredAt: null, dispatched: true },
  { orderId: 'R-4827', amount: 465, placedAt: '2025-03-18', deliveredAt: null, dispatched: true },
  // frozen — never handed to a courier
  { orderId: '1007', amount: 7200, placedAt: '2025-02-25', deliveredAt: null, dispatched: false },
  { orderId: 'R-4826', amount: 78, placedAt: '2025-03-04', deliveredAt: null, dispatched: false }
];

export interface Drawdown {
  orderId: string;
  amount: number;
  /** Days the buyer has to settle. */
  paymentTermsDays: number;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
  createdAt: string;
}

export const DRAWDOWNS: Drawdown[] = [
  { orderId: '1001', amount: 96250, paymentTermsDays: 14, dueDate: '2025-03-23', status: 'Pending', createdAt: '2025-03-09' },
  { orderId: '1002', amount: 96250, paymentTermsDays: 14, dueDate: '2025-03-23', status: 'Approved', createdAt: '2025-03-09' },
  { orderId: '1003', amount: 12000, paymentTermsDays: 14, dueDate: '2025-03-22', status: 'Cancelled', createdAt: '2025-03-08' },
  { orderId: '1004', amount: 13600, paymentTermsDays: 30, dueDate: '2025-04-06', status: 'Approved', createdAt: '2025-03-07' },
  { orderId: '1005', amount: 46200, paymentTermsDays: 14, dueDate: '2025-03-20', status: 'Pending', createdAt: '2025-03-06' },
  { orderId: '1006', amount: 34000, paymentTermsDays: 30, dueDate: '2025-03-30', status: 'Approved', createdAt: '2025-02-28' },
  { orderId: '1007', amount: 7200, paymentTermsDays: 14, dueDate: '2025-03-11', status: 'Cancelled', createdAt: '2025-02-25' },
  { orderId: 'R-4821', amount: 440, paymentTermsDays: 7, dueDate: '2025-03-16', status: 'Approved', createdAt: '2025-03-09' }
];

export interface WithdrawMethod {
  id: string;
  paymentMethod: string;
  bankName: string;
  /** Masked — the full IBAN is never held here. */
  accountNumber: string;
}

export const WITHDRAW_METHOD: WithdrawMethod = {
  id: 'wm-1',
  paymentMethod: 'Bank Transfer',
  bankName: 'Emirates NBD',
  accountNumber: '**** 0017'
};

export interface WithdrawalRequest {
  id: string;
  amount: number;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  status: WithdrawalStatus;
  date: string;
}

export const WITHDRAWALS: WithdrawalRequest[] = [
  { id: '#WRD006', amount: 12000, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'IN_PROCESS', date: '2025-03-18' },
  { id: '#WRD005', amount: 8400, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'COMPLETED', date: '2025-03-04' },
  { id: '#WRD004', amount: 5200, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'COMPLETED', date: '2025-02-19' },
  { id: '#WRD003', amount: 3100, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'REJECTED', date: '2025-02-11' },
  { id: '#WRD002', amount: 7600, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'COMPLETED', date: '2025-01-28' },
  { id: '#WRD001', amount: 2400, paymentMethod: 'Bank Transfer', bankName: 'Emirates NBD', accountNumber: '**** 0017', status: 'COMPLETED', date: '2025-01-14' }
];

export interface RefundRow {
  orderId: string;
  product: { name: string; description: string; image: string };
  items: number;
  refundAmount: number;
  /** True when the money is held back pending verification. */
  freezeAmount: boolean;
  status: 'Pending' | 'Approved' | 'Cancelled';
  date: string;
  /** Why it was frozen — shown on the details dialog. */
  note: string | null;
}

const IMAGE = '/assets/images/home/hero-img.png';

const BUDS = {
  name: 'Samsung Galaxy Buds Pro',
  description:
    'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series.',
  image: IMAGE
};

const TSHIRT = {
  name: 'Cotton Crew Neck T-Shirt',
  description: '180gsm combed cotton, pre-shrunk, unisex fit.',
  image: IMAGE
};

export const REFUNDS: RefundRow[] = [
  { orderId: '1003', product: TSHIRT, items: 500, refundAmount: 12000, freezeAmount: true, status: 'Pending', date: '2025-03-09', note: 'Amount frozen due to a technical issue on the payout rail. We will update you soon.' },
  { orderId: '1001', product: BUDS, items: 250, refundAmount: 96250, freezeAmount: false, status: 'Approved', date: '2025-03-08', note: null },
  { orderId: 'R-4824', product: BUDS, items: 1, refundAmount: 440, freezeAmount: false, status: 'Approved', date: '2025-03-07', note: null },
  { orderId: '1007', product: TSHIRT, items: 300, refundAmount: 7200, freezeAmount: true, status: 'Pending', date: '2025-03-06', note: 'The order was never dispatched, so the refund is held until dispatch is verified.' },
  { orderId: 'R-4826', product: TSHIRT, items: 2, refundAmount: 78, freezeAmount: true, status: 'Cancelled', date: '2025-03-05', note: 'Buyer withdrew the refund request.' },
  { orderId: '1005', product: BUDS, items: 120, refundAmount: 46200, freezeAmount: false, status: 'Pending', date: '2025-03-02', note: null }
];

export type InquiryStatus = 'Open' | 'In review' | 'Resolved';

export interface Inquiry {
  id: string;
  subject: string;
  /** What the seller reported, in their own words. */
  notes: string;
  /** The order or withdrawal it concerns, when there is one. */
  reference: string | null;
  status: InquiryStatus;
  createdAt: string;
  /** Tredella's reply, once there is one. */
  response: string | null;
}

export const INQUIRY_SUBJECTS = [
  'Frozen amount',
  'Withdrawal not received',
  'Refund dispute',
  'Payment method',
  'Something else'
];

export const INQUIRIES: Inquiry[] = [
  {
    id: 'INQ-0042',
    subject: 'Frozen amount',
    notes:
      'Order 1007 shows as not dispatched but the courier collected it on 27 Feb. I have the pickup receipt.',
    reference: '1007',
    status: 'In review',
    createdAt: '2025-03-12',
    response: null
  },
  {
    id: 'INQ-0038',
    subject: 'Withdrawal not received',
    notes: 'WRD003 was rejected without a reason. The account details have not changed.',
    reference: '#WRD003',
    status: 'Resolved',
    createdAt: '2025-02-14',
    response:
      'The IBAN was missing two digits. It has been corrected and the amount returned to your available balance.'
  }
];

/** Months present across the payment tables — feeds the date filters. */
export const PAYMENT_MONTHS: string[] = Array.from(
  new Set([
    ...DRAWDOWNS.map((d) => d.createdAt.slice(0, 7)),
    ...WITHDRAWALS.map((w) => w.date.slice(0, 7)),
    ...REFUNDS.map((r) => r.date.slice(0, 7))
  ])
).sort((a, b) => b.localeCompare(a));

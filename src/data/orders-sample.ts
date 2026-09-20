import type { StorefrontMode } from 'lib/storefront';
import type { OrderStatusValue, PaymentStatusValue } from 'lib/orderStatus';

/* Stand-in orders until the seller-side query exists. The backend already has
   Order / SellerOrder / OrderItem with a `mode`, but only buyer-scoped
   resolvers — see the note in OrdersListView.

   Spread across both storefronts and every status, because the stat cards and
   the status tabs are only meaningful on a mixed set. */

export interface CourierDetails {
  service: 'TREDELLA' | 'OTHER';
  companyName: string;
  trackingNumber: string;
  trackingLink: string;
  /** ISO date the parcel was handed over. */
  date: string;
}

export interface OrderRow {
  id: string;
  mode: StorefrontMode;
  product: {
    name: string;
    description: string;
    image: string;
    gallery: string[];
  };
  items: number;
  total: number;
  /** Whole percent off, 0 when the order carried no discount. */
  discountPercent: number;
  coupon: string | null;
  paymentMethod: string;
  paymentStatus: PaymentStatusValue;
  /** What the buyer chose at checkout. */
  shipping: string;
  orderStatus: OrderStatusValue;
  /** ISO date. */
  date: string;
  customer: { name: string; email: string };
  /** Null until the seller fills the shipping card in. */
  courier: CourierDetails | null;
  /** Set once a cancellation goes through. */
  cancellationReason: string | null;
}

const IMAGE = '/assets/images/home/hero-img.png';
const GALLERY = [IMAGE, IMAGE, IMAGE];

const BUDS = {
  name: 'Samsung Galaxy Buds Pro',
  description:
    'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series. These are true wireless earbuds with pro-grade technology for immersive sound like never before. With Intelligent ANC you can seamlessly switch between noise cancelling and fully adjustable ambient sound.',
  image: IMAGE,
  gallery: GALLERY
};

const TSHIRT = {
  name: 'Cotton Crew Neck T-Shirt',
  description: '180gsm combed cotton, pre-shrunk, unisex fit.',
  image: IMAGE,
  gallery: GALLERY
};

const RICE = {
  name: 'Basmati Rice — Aged 2 Years',
  description: 'Extra long grain, halal certified, ambient storage.',
  image: IMAGE,
  gallery: GALLERY
};

const SERUM = {
  name: 'Niacinamide 10% Serum',
  description: 'Blemish-prone skin, fragrance free, 30ml.',
  image: IMAGE,
  gallery: GALLERY
};

export const ORDERS: OrderRow[] = [
  {
    id: '1001',
    mode: 'WHOLESALE',
    product: BUDS,
    items: 250,
    total: 96250,
    discountPercent: 20,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Tredella Shipping',
    orderStatus: 'CONFIRMED',
    date: '2025-03-09',
    customer: { name: 'Hamza Tariq', email: 'hamzatariq@gmail.com' },
    courier: null,
    cancellationReason: null
  },
  {
    id: '1002',
    mode: 'WHOLESALE',
    product: BUDS,
    items: 250,
    total: 96250,
    discountPercent: 20,
    coupon: 'EID20',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'SHIPPED',
    date: '2025-03-09',
    customer: { name: 'Layla Haddad', email: 'layla.haddad@example.ae' },
    courier: {
      service: 'OTHER',
      companyName: 'Leopard Courier',
      trackingNumber: '1234567890',
      trackingLink: 'https://www.track-parcel.com',
      date: '2025-03-09'
    },
    cancellationReason: null
  },
  {
    id: '1003',
    mode: 'WHOLESALE',
    product: TSHIRT,
    items: 500,
    total: 12000,
    discountPercent: 15,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'REFUNDED',
    shipping: 'Standard',
    orderStatus: 'CANCELLED',
    date: '2025-03-08',
    customer: { name: 'Omar Farouk', email: 'omar.farouk@example.ae' },
    courier: null,
    cancellationReason:
      'The product is not available this time, that is why I am cancelling the order.'
  },
  {
    id: '1004',
    mode: 'WHOLESALE',
    product: RICE,
    items: 400,
    total: 13600,
    discountPercent: 10,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Tredella Shipping',
    orderStatus: 'DELIVERED',
    date: '2025-03-07',
    customer: { name: 'Fatima Noor', email: 'fatima.noor@example.ae' },
    courier: {
      service: 'TREDELLA',
      companyName: 'Tredella Shipping',
      trackingNumber: 'TRD-88213',
      trackingLink: 'https://tredella.com/track/TRD-88213',
      date: '2025-03-05'
    },
    cancellationReason: null
  },
  {
    id: '1005',
    mode: 'WHOLESALE',
    product: BUDS,
    items: 120,
    total: 46200,
    discountPercent: 0,
    coupon: null,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'PENDING',
    date: '2025-03-06',
    customer: { name: 'Yusuf Rahman', email: 'yusuf.rahman@example.ae' },
    courier: null,
    cancellationReason: null
  },
  {
    id: '1006',
    mode: 'WHOLESALE',
    product: RICE,
    items: 1000,
    total: 34000,
    discountPercent: 12,
    coupon: 'BULK12',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Tredella Shipping',
    orderStatus: 'COMPLETED',
    date: '2025-02-28',
    customer: { name: 'Aisha Khalid', email: 'aisha.khalid@example.ae' },
    courier: {
      service: 'TREDELLA',
      companyName: 'Tredella Shipping',
      trackingNumber: 'TRD-77104',
      trackingLink: 'https://tredella.com/track/TRD-77104',
      date: '2025-02-26'
    },
    cancellationReason: null
  },
  {
    id: '1007',
    mode: 'WHOLESALE',
    product: TSHIRT,
    items: 300,
    total: 7200,
    discountPercent: 15,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'PENDING',
    date: '2025-02-25',
    customer: { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.ae' },
    courier: null,
    cancellationReason: null
  },
  {
    id: 'R-4821',
    mode: 'RETAIL',
    product: BUDS,
    items: 1,
    total: 440,
    discountPercent: 15,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Tredella Shipping',
    orderStatus: 'CONFIRMED',
    date: '2025-03-09',
    customer: { name: 'Sara Mansoor', email: 'sara.mansoor@example.ae' },
    courier: null,
    cancellationReason: null
  },
  {
    id: 'R-4822',
    mode: 'RETAIL',
    product: SERUM,
    items: 2,
    total: 104,
    discountPercent: 24,
    coupon: 'GLOW10',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'SHIPPED',
    date: '2025-03-09',
    customer: { name: 'Nadia Iqbal', email: 'nadia.iqbal@example.ae' },
    courier: {
      service: 'OTHER',
      companyName: 'Aramex',
      trackingNumber: '4471902238',
      trackingLink: 'https://www.aramex.com/track/4471902238',
      date: '2025-03-08'
    },
    cancellationReason: null
  },
  {
    id: 'R-4823',
    mode: 'RETAIL',
    product: TSHIRT,
    items: 3,
    total: 117,
    discountPercent: 29,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'DELIVERED',
    date: '2025-03-08',
    customer: { name: 'Zaid Anwar', email: 'zaid.anwar@example.ae' },
    courier: {
      service: 'TREDELLA',
      companyName: 'Tredella Shipping',
      trackingNumber: 'TRD-91002',
      trackingLink: 'https://tredella.com/track/TRD-91002',
      date: '2025-03-06'
    },
    cancellationReason: null
  },
  {
    id: 'R-4824',
    mode: 'RETAIL',
    product: BUDS,
    items: 1,
    total: 440,
    discountPercent: 15,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'REFUNDED',
    shipping: 'Standard',
    orderStatus: 'CANCELLED',
    date: '2025-03-07',
    customer: { name: 'Huda Salem', email: 'huda.salem@example.ae' },
    courier: null,
    cancellationReason: 'Customer changed their mind before dispatch.'
  },
  {
    id: 'R-4825',
    mode: 'RETAIL',
    product: SERUM,
    items: 1,
    total: 52,
    discountPercent: 24,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'COMPLETED',
    date: '2025-03-05',
    customer: { name: 'Imran Qureshi', email: 'imran.qureshi@example.ae' },
    courier: {
      service: 'OTHER',
      companyName: 'Aramex',
      trackingNumber: '4471900011',
      trackingLink: 'https://www.aramex.com/track/4471900011',
      date: '2025-03-03'
    },
    cancellationReason: null
  },
  {
    id: 'R-4826',
    mode: 'RETAIL',
    product: TSHIRT,
    items: 2,
    total: 78,
    discountPercent: 29,
    coupon: 'WELCOME5',
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Standard',
    orderStatus: 'PENDING',
    date: '2025-03-04',
    customer: { name: 'Mariam Adel', email: 'mariam.adel@example.ae' },
    courier: null,
    cancellationReason: null
  },
  {
    id: 'R-4827',
    mode: 'RETAIL',
    product: BUDS,
    items: 1,
    total: 465,
    discountPercent: 0,
    coupon: null,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    shipping: 'Tredella Shipping',
    orderStatus: 'SHIPPED',
    date: '2025-03-03',
    customer: { name: 'Khalid Otaiba', email: 'khalid.otaiba@example.ae' },
    courier: null,
    cancellationReason: null
  }
];

export const orderById = (id: string): OrderRow | undefined =>
  ORDERS.find((order) => order.id === id);

/** Payment methods present in the data — feeds the list filter. */
export const PAYMENT_METHODS: string[] = Array.from(
  new Set(ORDERS.map((order) => order.paymentMethod))
).sort((a, b) => a.localeCompare(b));

/** Months present, newest first. */
export const ORDER_MONTHS: string[] = Array.from(
  new Set(ORDERS.map((order) => order.date.slice(0, 7)))
).sort((a, b) => b.localeCompare(a));

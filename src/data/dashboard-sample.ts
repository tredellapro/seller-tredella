import type { BarPoint } from 'components/dashboard/charts/BarChart';
import type { DonutSlice } from 'components/dashboard/charts/DonutChart';

/* Stand-in figures so the dashboard reads like the design until the analytics
   queries exist. Every component here takes its data as props, so swapping this
   module for an API result is the whole job. */

export const REVENUE_TICKS = [10000, 20000, 30000, 40000, 50000];
export const REVENUE_CEILING = 55000;

export const REVENUE_BY_MONTH: BarPoint[] = [
  { label: 'Jan', value: 24000, secondary: { label: 'Deals', value: 12800 } },
  { label: 'Feb', value: 33000, secondary: { label: 'Deals', value: 17200 } },
  { label: 'Mar', value: 41000, secondary: { label: 'Deals', value: 21500 } },
  { label: 'Apr', value: 17500, secondary: { label: 'Deals', value: 9100 } },
  { label: 'May', value: 44500, secondary: { label: 'Deals', value: 23300 } },
  { label: 'Jun', value: 30500, secondary: { label: 'Deals', value: 15900 } },
  { label: 'Jul', value: 48500, secondary: { label: 'Deals', value: 25400 } },
  { label: 'Aug', value: 37000, secondary: { label: 'Deals', value: 19400 } },
  { label: 'Sep', value: 43000, secondary: { label: 'Deals', value: 22500 } },
  { label: 'Oct', value: 22000, secondary: { label: 'Deals', value: 11500 } },
  { label: 'Nov', value: 37000, secondary: { label: 'Deals', value: 19400 } },
  { label: 'Dec', value: 30500, secondary: { label: 'Deals', value: 16000 } }
];

/* Hues from the skill's validated categorical set, brand pink leading. This
   trio passes every check on all pairs against a white surface — greys and
   pink tints did not: they read as grey or sit outside the lightness band.
   Amber falls below 3:1 on white, so the legend carries a visible value beside
   every slice rather than leaving colour to do the work. */
export const ORDER_BREAKDOWN: DonutSlice[] = [
  { label: 'Delivered', value: 500, color: '#e94560' },
  { label: 'Pending', value: 15, color: '#eda100' },
  { label: 'Cancelled', value: 30, color: '#2a78d6' }
];

export interface IncomingOrder {
  id: string;
  product: { name: string; description: string; image: string };
  items: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
}

const PRODUCT = {
  name: 'Samsung Galaxy Buds Pro',
  description:
    'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series.',
  image: '/assets/images/home/hero-img.png'
};

export const INCOMING_ORDERS: IncomingOrder[] = [
  { id: '1001', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Order Processing', date: '09 Mar 2025' },
  { id: '1002', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Unpaid', orderStatus: 'Shipped', date: '09 Mar 2025' },
  { id: '1003', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Cancelled', date: '09 Mar 2025' },
  { id: '1004', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Order Processing', date: '09 Mar 2025' },
  { id: '1005', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Shipped', date: '09 Mar 2025' },
  { id: '1006', product: PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Cancelled', date: '09 Mar 2025' }
];

/** AED, as everything else in the product is priced. */
export const aed = (value: number): string =>
  `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;

export const aedExact = (value: number): string =>
  `AED ${value.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const compactAed = (value: number): string =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);

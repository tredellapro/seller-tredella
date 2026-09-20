import type { IconType } from 'react-icons';
import {
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineReceiptRefund,
  HiOutlineShoppingCart,
  HiOutlineTag
} from 'react-icons/hi';
import type { BarPoint } from 'components/dashboard/charts/BarChart';
import type { DonutSlice } from 'components/dashboard/charts/DonutChart';
import type { StorefrontMode } from 'lib/storefront';

/* Stand-in figures so the dashboard reads like the design until the analytics
   queries exist. Every component takes its data as props, so swapping this
   module for an API result is the whole job.

   Retail and wholesale are kept apart rather than scaled from one set: they do
   not differ only in size. Retail is many small baskets with returns to watch;
   wholesale is a handful of large orders where the open deal pipeline is the
   number that matters. The headline cards differ accordingly. */

/** AED, as everything else in the product is priced. */
export const aed = (value: number): string =>
  `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;

export const aedExact = (value: number): string =>
  `AED ${value.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const compactAed = (value: number): string =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);

export interface IncomingOrder {
  id: string;
  product: { name: string; description: string; image: string };
  items: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
}

export interface StatDefinition {
  icon: IconType;
  label: string;
  value: string;
  period?: string;
  delta?: { value: string; direction: 'up' | 'down'; comparison: string };
}

export interface DashboardData {
  /** Grouped exactly as the cards are laid out — inner array shares a card. */
  stats: StatDefinition[][];
  revenue: BarPoint[];
  revenueTicks: number[];
  revenueCeiling: number;
  /** Names the plotted series in the bar chart's tooltip. */
  revenueSeriesLabel: string;
  breakdown: DonutSlice[];
  orders: IncomingOrder[];
  /** Heading over the orders table — retail and wholesale call them different things. */
  ordersTitle: string;
  /** Periods the two selects offer. */
  months: string[];
  quarters: string[];
}

const IMAGE = '/assets/images/home/hero-img.png';

const WHOLESALE_PRODUCT = {
  name: 'Samsung Galaxy Buds Pro',
  description:
    'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series.',
  image: IMAGE
};

const RETAIL_PRODUCTS = [
  {
    name: 'Samsung Galaxy Buds Pro',
    description: 'Black — single unit',
    image: IMAGE
  },
  {
    name: 'Niacinamide 10% Serum',
    description: '30ml — blemish-prone skin',
    image: IMAGE
  },
  {
    name: 'Cotton Crew Neck T-Shirt',
    description: 'Navy / M',
    image: IMAGE
  }
];

/* Hues from the skill's validated categorical set, brand pink leading. This
   trio passes every check on all pairs against a white surface — greys and
   pink tints did not: they read as grey or sit outside the lightness band.
   Amber falls below 3:1 on white, so the legend carries a visible value beside
   every slice rather than leaving colour to do the work. */
const slices = (
  delivered: number,
  pending: number,
  cancelled: number
): DonutSlice[] => [
  { label: 'Delivered', value: delivered, color: '#e94560' },
  { label: 'Pending', value: pending, color: '#eda100' },
  { label: 'Cancelled', value: cancelled, color: '#2a78d6' }
];

const WHOLESALE: DashboardData = {
  stats: [
    [
      {
        icon: HiOutlineShoppingCart,
        label: 'Orders',
        value: '54',
        period: 'Today',
        delta: { value: '12', direction: 'up', comparison: 'vs same day last week' }
      },
      { icon: HiOutlineClock, label: 'Pending Orders', value: '07' }
    ],
    [
      {
        icon: HiOutlineCurrencyDollar,
        label: 'Total Sales',
        value: aed(2370),
        period: 'Today',
        delta: { value: aed(350), direction: 'up', comparison: 'vs same day last week' }
      }
    ],
    [
      {
        icon: HiOutlineTag,
        label: 'Total Deals',
        value: aed(1280),
        period: 'Today',
        delta: { value: aed(147), direction: 'up', comparison: 'vs same day last week' }
      }
    ]
  ],
  revenueTicks: [10000, 20000, 30000, 40000, 50000],
  revenueCeiling: 55000,
  revenueSeriesLabel: 'Sales',
  revenue: [
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
  ],
  breakdown: slices(500, 15, 30),
  ordersTitle: 'Incoming Orders',
  months: ['Jan 2025', 'Feb 2025', 'Mar 2025'],
  quarters: ['July 2024', 'Aug 2024', 'Sep 2024'],
  orders: [
    { id: '1001', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Order Processing', date: '09 Mar 2025' },
    { id: '1002', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Unpaid', orderStatus: 'Shipped', date: '09 Mar 2025' },
    { id: '1003', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Cancelled', date: '09 Mar 2025' },
    { id: '1004', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Order Processing', date: '09 Mar 2025' },
    { id: '1005', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Shipped', date: '09 Mar 2025' },
    { id: '1006', product: WHOLESALE_PRODUCT, items: 250, total: 500, paymentStatus: 'Paid', orderStatus: 'Cancelled', date: '09 Mar 2025' }
  ]
};

const RETAIL: DashboardData = {
  stats: [
    [
      {
        icon: HiOutlineShoppingCart,
        label: 'Orders',
        value: '186',
        period: 'Today',
        delta: { value: '31', direction: 'up', comparison: 'vs same day last week' }
      },
      { icon: HiOutlineClock, label: 'Awaiting Dispatch', value: '23' }
    ],
    [
      {
        icon: HiOutlineCurrencyDollar,
        label: 'Total Sales',
        value: aed(7940),
        period: 'Today',
        delta: { value: aed(610), direction: 'up', comparison: 'vs same day last week' }
      }
    ],
    [
      {
        /* Returns, not deals — a retail seller watches the rate coming back,
           where a wholesaler watches the pipeline going out. */
        icon: HiOutlineReceiptRefund,
        label: 'Returns',
        value: '14',
        period: 'Today',
        delta: { value: '3', direction: 'down', comparison: 'vs same day last week' }
      }
    ]
  ],
  revenueTicks: [5000, 10000, 15000, 20000, 25000],
  revenueCeiling: 27500,
  revenueSeriesLabel: 'Sales',
  revenue: [
    { label: 'Jan', value: 12400, secondary: { label: 'Orders', value: 2840 } },
    { label: 'Feb', value: 15800, secondary: { label: 'Orders', value: 3610 } },
    { label: 'Mar', value: 19200, secondary: { label: 'Orders', value: 4480 } },
    { label: 'Apr', value: 9600, secondary: { label: 'Orders', value: 2210 } },
    { label: 'May', value: 22400, secondary: { label: 'Orders', value: 5150 } },
    { label: 'Jun', value: 16900, secondary: { label: 'Orders', value: 3880 } },
    { label: 'Jul', value: 24800, secondary: { label: 'Orders', value: 5720 } },
    { label: 'Aug', value: 20100, secondary: { label: 'Orders', value: 4640 } },
    { label: 'Sep', value: 23300, secondary: { label: 'Orders', value: 5380 } },
    { label: 'Oct', value: 11700, secondary: { label: 'Orders', value: 2690 } },
    { label: 'Nov', value: 21500, secondary: { label: 'Orders', value: 4950 } },
    { label: 'Dec', value: 26200, secondary: { label: 'Orders', value: 6040 } }
  ],
  breakdown: slices(2240, 118, 260),
  ordersTitle: 'Recent Orders',
  months: ['Jan 2025', 'Feb 2025', 'Mar 2025'],
  quarters: ['July 2024', 'Aug 2024', 'Sep 2024'],
  orders: [
    { id: 'R-4821', product: RETAIL_PRODUCTS[0], items: 1, total: 129, paymentStatus: 'Paid', orderStatus: 'Order Processing', date: '09 Mar 2025' },
    { id: 'R-4822', product: RETAIL_PRODUCTS[1], items: 2, total: 84, paymentStatus: 'Paid', orderStatus: 'Shipped', date: '09 Mar 2025' },
    { id: 'R-4823', product: RETAIL_PRODUCTS[2], items: 3, total: 96, paymentStatus: 'Unpaid', orderStatus: 'Pending', date: '09 Mar 2025' },
    { id: 'R-4824', product: RETAIL_PRODUCTS[0], items: 1, total: 129, paymentStatus: 'Refunded', orderStatus: 'Cancelled', date: '08 Mar 2025' },
    { id: 'R-4825', product: RETAIL_PRODUCTS[1], items: 1, total: 42, paymentStatus: 'Paid', orderStatus: 'Delivered', date: '08 Mar 2025' },
    { id: 'R-4826', product: RETAIL_PRODUCTS[2], items: 2, total: 64, paymentStatus: 'Paid', orderStatus: 'Shipped', date: '08 Mar 2025' }
  ]
};

export const DASHBOARD_BY_MODE: Record<StorefrontMode, DashboardData> = {
  RETAIL,
  WHOLESALE
};

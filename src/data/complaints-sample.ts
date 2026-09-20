/* Stand-in complaints until the API exists — there is no Complaint model on
   the backend yet.

   A complaint is raised by a buyer against one of the seller's orders or
   products. The seller answers it and marks it solved. */

export type ComplaintPriority = 'URGENT' | 'NORMAL';
export type ComplaintStatus = 'OPEN' | 'SOLVED';

export const COMPLAINT_CATEGORIES = [
  'Payment Problem',
  'Product Problem',
  'Shipping Problem',
  'Order Problem',
  'Other'
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export interface ComplaintReply {
  id: string;
  /** Who wrote it — the seller's own replies sit on the right. */
  author: 'BUYER' | 'SELLER';
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  /** ISO date it was raised. */
  createdAt: string;
  raisedBy: { name: string; email: string };
  /** What it concerns — either may be absent. */
  orderId: string | null;
  product: { name: string; image: string } | null;
  body: string;
  replies: ComplaintReply[];
  solvedAt: string | null;
  /** What closed it, written by the seller. */
  resolution: string | null;
}

const IMAGE = '/assets/images/home/hero-img.png';

const BUDS = { name: 'Samsung Galaxy Buds Pro', image: IMAGE };
const TSHIRT = { name: 'Cotton Crew Neck T-Shirt', image: IMAGE };
const RICE = { name: 'Basmati Rice — Aged 2 Years', image: IMAGE };

export const COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-1042',
    title: 'Payment method is not working',
    category: 'Payment Problem',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2025-01-25',
    raisedBy: { name: 'Hamza Tariq', email: 'hamzatariq@gmail.com' },
    orderId: '1001',
    product: BUDS,
    body: 'My card was declined three times at checkout but the amount still shows as pending on my statement. I need to know whether the order went through before I try again.',
    replies: [],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1041',
    title: 'Product Broken. I need refund',
    category: 'Product Problem',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2024-11-15',
    raisedBy: { name: 'Layla Haddad', email: 'layla.haddad@example.ae' },
    orderId: '1002',
    product: BUDS,
    body: 'One of the earbuds does not charge in the case. It worked for two days and then stopped. The box and accessories are all intact.',
    replies: [
      {
        id: 'r-1',
        author: 'SELLER',
        authorName: 'Electronics Store',
        text: 'Sorry about that. Could you send a short video of the case with the lid open so I can see the charging light?',
        createdAt: '2024-11-16'
      },
      {
        id: 'r-2',
        author: 'BUYER',
        authorName: 'Layla Haddad',
        text: 'Sent it to your messages just now. The right bud shows no light at all.',
        createdAt: '2024-11-16'
      }
    ],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1040',
    title: 'Where is my order?',
    category: 'Shipping Problem',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2025-02-25',
    raisedBy: { name: 'Omar Farouk', email: 'omar.farouk@example.ae' },
    orderId: '1005',
    product: null,
    body: 'Tracking has not moved in six days. It still says "collected". I needed this before the weekend.',
    replies: [],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1039',
    title: 'Wrong size delivered',
    category: 'Product Problem',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2025-02-18',
    raisedBy: { name: 'Fatima Noor', email: 'fatima.noor@example.ae' },
    orderId: '1003',
    product: TSHIRT,
    body: 'I ordered size L and received M. The packing slip says L, so it looks like a picking mistake.',
    replies: [],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1038',
    title: 'Charged twice for one order',
    category: 'Payment Problem',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2025-02-11',
    raisedBy: { name: 'Yusuf Rahman', email: 'yusuf.rahman@example.ae' },
    orderId: '1004',
    product: RICE,
    body: 'Two identical charges of AED 13,600 on the same day, one order confirmation. Please refund the duplicate.',
    replies: [],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1037',
    title: 'Parcel arrived opened',
    category: 'Shipping Problem',
    priority: 'NORMAL',
    status: 'OPEN',
    createdAt: '2025-02-03',
    raisedBy: { name: 'Aisha Khalid', email: 'aisha.khalid@example.ae' },
    orderId: '1006',
    product: RICE,
    body: 'The outer box was resealed with plain tape and one bag was missing. The courier said to raise it with the seller.',
    replies: [],
    solvedAt: null,
    resolution: null
  },
  {
    id: 'CMP-1036',
    title: 'Refund not received',
    category: 'Payment Problem',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '2025-01-30',
    raisedBy: { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.ae' },
    orderId: '1007',
    product: TSHIRT,
    body: 'The cancellation was confirmed two weeks ago but nothing has reached my account yet.',
    replies: [],
    solvedAt: null,
    resolution: null
  },

  /* ---- solved ---- */
  {
    id: 'CMP-1035',
    title: 'Payment method is not working',
    category: 'Payment Problem',
    priority: 'URGENT',
    status: 'SOLVED',
    createdAt: '2025-01-25',
    raisedBy: { name: 'Sara Mansoor', email: 'sara.mansoor@example.ae' },
    orderId: 'R-4821',
    product: BUDS,
    body: 'Card kept failing at the last step of checkout.',
    replies: [
      {
        id: 'r-3',
        author: 'SELLER',
        authorName: 'Electronics Store',
        text: 'Your bank was blocking the 3-D Secure step. Retrying after approving the prompt should work.',
        createdAt: '2025-01-26'
      },
      {
        id: 'r-4',
        author: 'BUYER',
        authorName: 'Sara Mansoor',
        text: 'That was it. Order placed, thank you.',
        createdAt: '2025-01-26'
      }
    ],
    solvedAt: '2025-01-26',
    resolution: 'Bank was blocking 3-D Secure. Buyer completed the order after approving the prompt.'
  },
  {
    id: 'CMP-1034',
    title: 'Item not as described',
    category: 'Product Problem',
    priority: 'NORMAL',
    status: 'SOLVED',
    createdAt: '2025-01-18',
    raisedBy: { name: 'Nadia Iqbal', email: 'nadia.iqbal@example.ae' },
    orderId: 'R-4822',
    product: TSHIRT,
    body: 'Listing said 100% cotton, the label says 60/40 blend.',
    replies: [],
    solvedAt: '2025-01-21',
    resolution: 'Listing corrected to Blend and a partial refund of AED 12 issued.'
  },
  {
    id: 'CMP-1033',
    title: 'Delivered to the wrong address',
    category: 'Shipping Problem',
    priority: 'URGENT',
    status: 'SOLVED',
    createdAt: '2025-01-12',
    raisedBy: { name: 'Zaid Anwar', email: 'zaid.anwar@example.ae' },
    orderId: 'R-4823',
    product: null,
    body: 'The courier left it at a neighbour two buildings down without telling me.',
    replies: [],
    solvedAt: '2025-01-14',
    resolution: 'Parcel recovered and redelivered the next day. Courier notified.'
  },
  {
    id: 'CMP-1032',
    title: 'Discount code did not apply',
    category: 'Payment Problem',
    priority: 'NORMAL',
    status: 'SOLVED',
    createdAt: '2024-12-29',
    raisedBy: { name: 'Huda Salem', email: 'huda.salem@example.ae' },
    orderId: 'R-4824',
    product: BUDS,
    body: 'EID20 was accepted at the cart but the total did not change.',
    replies: [],
    solvedAt: '2024-12-30',
    resolution: 'Code had already been used on an earlier order. A one-off credit was applied instead.'
  },
  {
    id: 'CMP-1031',
    title: 'Missing item from the box',
    category: 'Order Problem',
    priority: 'URGENT',
    status: 'SOLVED',
    createdAt: '2024-12-14',
    raisedBy: { name: 'Imran Qureshi', email: 'imran.qureshi@example.ae' },
    orderId: 'R-4825',
    product: RICE,
    body: 'Ordered two bags, one arrived.',
    replies: [],
    solvedAt: '2024-12-16',
    resolution: 'Second bag shipped free of charge and confirmed delivered.'
  },
  {
    id: 'CMP-1030',
    title: 'Cannot change delivery address',
    category: 'Shipping Problem',
    priority: 'NORMAL',
    status: 'SOLVED',
    createdAt: '2024-12-02',
    raisedBy: { name: 'Mariam Adel', email: 'mariam.adel@example.ae' },
    orderId: 'R-4826',
    product: null,
    body: 'I moved last week and the order still shows the old address.',
    replies: [],
    solvedAt: '2024-12-03',
    resolution: 'Address updated before dispatch.'
  },
  {
    id: 'CMP-1029',
    title: 'Late delivery on a bulk order',
    category: 'Shipping Problem',
    priority: 'URGENT',
    status: 'SOLVED',
    createdAt: '2024-11-20',
    raisedBy: { name: 'Khalid Otaiba', email: 'khalid.otaiba@example.ae' },
    orderId: '1006',
    product: RICE,
    body: 'Pallet was four days late and the restaurant ran out of stock.',
    replies: [],
    solvedAt: '2024-11-25',
    resolution: 'Shipping refunded in full and the next order prioritised.'
  }
];

export const complaintById = (id: string): Complaint | undefined =>
  COMPLAINTS.find((complaint) => complaint.id === id);

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/** "2025-01-25" → "Jan 25, 2025", as the designs print it. */
export const complaintDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${MONTHS[Number(month) - 1] ?? month} ${Number(day)}, ${year}`;
};

import type { StorefrontMode } from 'lib/storefront';

/* Stand-in catalogue until the products query exists. Deliberately spread
   across departments and both storefronts, because the list page's filters
   only mean anything on a catalogue that is actually mixed — which is the
   point of an all-in-one marketplace.

   A product is listed per storefront. Most sit in both, but a bulk-only pallet
   line has no retail price and a single cosmetic sample has no MOQ, so the
   two are separate shapes rather than one price with a flag. */

export type ProductStatus = 'Approved' | 'Pending' | 'Cancelled';

/* Both storefronts price the same way: a regular price, and an optional
   discount price the buyer actually pays. The regular one is struck through
   and the badge computed from the gap. */
export interface Discountable {
  price: number;
  /** What the buyer pays when set. Null when the line is not discounted. */
  discountPrice: number | null;
}

export type RetailPricing = Discountable;

export interface WholesalePricing extends Discountable {
  /** Minimum order quantity: the first tier's min. */
  moq: number;
}

export interface ProductVariationRow {
  id: string;
  label: string;
  images: string[];
  /** Attribute pairs, already resolved for display. */
  details: { label: string; value: string }[];
  retail: RetailPricing | null;
  wholesale: WholesalePricing | null;
  stock: number;
  createdAt: string;
}

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  /** Top-level department — what the Category filter matches on. */
  department: string;
  /** Deepest category the seller picked. */
  category: string;
  brand: string;
  /** Which storefronts this product is listed in. */
  channels: StorefrontMode[];
  retail: RetailPricing | null;
  wholesale: WholesalePricing | null;
  stock: number;
  status: ProductStatus;
  /** ISO date — the month filter reads this. */
  createdAt: string;
  /** Category attributes, for the detail page's Product Details block. */
  attributes: { label: string; value: string }[];
  variations: ProductVariationRow[];
}

const IMAGE = '/assets/images/home/hero-img.png';
const GALLERY = [IMAGE, IMAGE, IMAGE, IMAGE];

/** Percentage off, rounded — what the detail page prints as "15% OFF". */
export const discountPercent = (
  pricing: Discountable | null | undefined
): number | null => {
  if (!pricing?.discountPrice || pricing.discountPrice >= pricing.price) return null;
  return Math.round(
    ((pricing.price - pricing.discountPrice) / pricing.price) * 100
  );
};

/** What the buyer actually pays — the discount price when there is one. */
export const effectivePrice = (
  pricing: Discountable | null | undefined
): number | null => (pricing ? (pricing.discountPrice ?? pricing.price) : null);

/** The pricing to use for a storefront, or null when not listed there. */
export const pricingFor = (
  product: Pick<ProductRow, 'retail' | 'wholesale'>,
  mode: StorefrontMode
): Discountable | null =>
  mode === 'RETAIL' ? product.retail : product.wholesale;

const BOTH: StorefrontMode[] = ['RETAIL', 'WHOLESALE'];

export const PRODUCTS: ProductRow[] = [
  {
    id: '1001',
    name: 'Samsung Galaxy Buds Pro',
    description:
      'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series. These are true wireless earbuds with pro-grade technology for immersive sound like never before. With Intelligent ANC you can seamlessly switch between noise cancelling and fully adjustable ambient sound.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Electronics',
    category: 'Wireless Earbuds',
    brand: 'Samsung',
    channels: BOTH,
    retail: { price: 520, discountPrice: 440 },
    wholesale: { price: 385, discountPrice: 346, moq: 50 },
    stock: 500,
    status: 'Approved',
    createdAt: '2025-03-09',
    attributes: [
      { label: 'Condition', value: 'New' },
      { label: 'Warranty', value: '12 months' },
      { label: 'Colour', value: 'Black' },
      { label: 'Connectivity', value: 'Bluetooth' },
      { label: 'Active noise cancelling', value: 'Yes' },
      { label: 'Battery life', value: '28 hrs' }
    ],
    variations: [
      {
        id: '1001-1',
        label: 'Variation 1',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Black' },
          { label: 'SKU', value: 'GALAXY-BUDS-BLK' }
        ],
        retail: { price: 520, discountPrice: 440 },
        wholesale: { price: 385, discountPrice: 346, moq: 50 },
        stock: 250,
        createdAt: '2025-03-09'
      },
      {
        id: '1001-2',
        label: 'Variation 2',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'White' },
          { label: 'SKU', value: 'GALAXY-BUDS-WHT' }
        ],
        retail: { price: 465, discountPrice: null },
        wholesale: { price: 410, discountPrice: 369, moq: 50 },
        stock: 150,
        createdAt: '2025-03-09'
      }
    ]
  },
  {
    id: '1002',
    name: 'Apple iPhone 15 Pro',
    description: 'Titanium body, A17 Pro chip, 48MP main camera.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Electronics',
    category: 'Smartphones',
    brand: 'Apple',
    channels: BOTH,
    retail: { price: 4699, discountPrice: 4299 },
    wholesale: { price: 3899, discountPrice: null, moq: 10 },
    stock: 120,
    status: 'Approved',
    createdAt: '2025-01-14',
    attributes: [
      { label: 'Condition', value: 'New' },
      { label: 'Storage', value: '256 GB' },
      { label: 'RAM', value: '8 GB' },
      { label: 'Network', value: '5G' },
      { label: 'SIM', value: 'Dual SIM + eSIM' }
    ],
    variations: [
      {
        id: '1002-1',
        label: 'Variation 1',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Black' },
          { label: 'Storage', value: '256 GB' }
        ],
        retail: { price: 4699, discountPrice: 4299 },
        wholesale: { price: 3899, discountPrice: null, moq: 10 },
        stock: 60,
        createdAt: '2025-01-14'
      },
      {
        id: '1002-2',
        label: 'Variation 2',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Silver' },
          { label: 'Storage', value: '512 GB' }
        ],
        retail: { price: 4899, discountPrice: null },
        wholesale: { price: 4450, discountPrice: null, moq: 10 },
        stock: 60,
        createdAt: '2025-01-14'
      }
    ]
  },
  {
    id: '1003',
    name: 'Anker PowerCore 20000',
    description: 'Fast-charging power bank with USB-C Power Delivery.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Electronics',
    category: 'Mobile Accessories',
    brand: 'Anker',
    channels: ['RETAIL'],
    retail: { price: 219, discountPrice: 179 },
    wholesale: null,
    stock: 860,
    status: 'Pending',
    createdAt: '2025-02-02',
    attributes: [
      { label: 'Condition', value: 'New' },
      { label: 'Warranty', value: '18 months' },
      { label: 'Colour', value: 'Black' }
    ],
    variations: []
  },
  {
    id: '1004',
    name: 'LG 55" OLED evo C4',
    description: '4K UHD smart TV with webOS and Dolby Vision.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Electronics',
    category: 'TV & Home Cinema',
    brand: 'LG',
    channels: BOTH,
    retail: { price: 5200, discountPrice: 4650 },
    wholesale: { price: 4250, discountPrice: null, moq: 5 },
    stock: 45,
    status: 'Approved',
    createdAt: '2025-02-19',
    attributes: [
      { label: 'Screen size', value: '55"' },
      { label: 'Resolution', value: '4K UHD' },
      { label: 'Panel', value: 'OLED' },
      { label: 'Condition', value: 'New' }
    ],
    variations: []
  },
  {
    id: '1005',
    name: 'Cotton Crew Neck T-Shirt',
    description: '180gsm combed cotton, pre-shrunk, unisex fit.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Fashion',
    category: 'T-Shirts',
    brand: 'Max',
    channels: BOTH,
    retail: { price: 55, discountPrice: 39 },
    wholesale: { price: 28, discountPrice: 24, moq: 100 },
    stock: 2400,
    status: 'Approved',
    createdAt: '2025-01-22',
    attributes: [
      { label: 'Material', value: 'Cotton' },
      { label: 'Department', value: 'Unisex' },
      { label: 'Care instructions', value: 'Machine wash cold' }
    ],
    variations: [
      {
        id: '1005-1',
        label: 'Variation 1',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Navy' },
          { label: 'Size', value: 'M' }
        ],
        retail: { price: 55, discountPrice: 39 },
        wholesale: { price: 28, discountPrice: 24, moq: 100 },
        stock: 800,
        createdAt: '2025-01-22'
      },
      {
        id: '1005-2',
        label: 'Variation 2',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Black' },
          { label: 'Size', value: 'L' }
        ],
        retail: { price: 55, discountPrice: 39 },
        wholesale: { price: 28, discountPrice: 24, moq: 100 },
        stock: 800,
        createdAt: '2025-01-22'
      }
    ]
  },
  {
    id: '1006',
    name: 'Embroidered Open Abaya',
    description: 'Nida fabric with hand-finished sleeve detail.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Fashion',
    category: 'Abayas & Jalabiyas',
    brand: 'Splash',
    channels: ['RETAIL'],
    retail: { price: 320, discountPrice: 245 },
    wholesale: null,
    stock: 310,
    status: 'Pending',
    createdAt: '2025-03-04',
    attributes: [
      { label: 'Material', value: 'Blend' },
      { label: 'Department', value: 'Women' }
    ],
    variations: []
  },
  {
    id: '1007',
    name: 'Nike Air Zoom Pegasus 41',
    description: 'Neutral road running shoe with ReactX foam.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Fashion',
    category: "Men's Shoes",
    brand: 'Nike',
    channels: BOTH,
    retail: { price: 479, discountPrice: null },
    wholesale: { price: 410, discountPrice: 369, moq: 24 },
    stock: 190,
    status: 'Approved',
    createdAt: '2025-02-11',
    attributes: [
      { label: 'Material', value: 'Blend' },
      { label: 'Department', value: 'Men' },
      { label: 'Width', value: 'Regular' },
      { label: 'Closure', value: 'Lace-up' }
    ],
    variations: [
      {
        id: '1007-1',
        label: 'Variation 1',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'Black' },
          { label: 'Size (EU)', value: '42' }
        ],
        retail: { price: 479, discountPrice: null },
        wholesale: { price: 410, discountPrice: 369, moq: 24 },
        stock: 95,
        createdAt: '2025-02-11'
      },
      {
        id: '1007-2',
        label: 'Variation 2',
        images: GALLERY,
        details: [
          { label: 'Colour', value: 'White' },
          { label: 'Size (EU)', value: '43' }
        ],
        retail: { price: 479, discountPrice: null },
        wholesale: { price: 410, discountPrice: 369, moq: 24 },
        stock: 95,
        createdAt: '2025-02-11'
      }
    ]
  },
  {
    id: '1008',
    name: 'Leather Strap Analogue Watch',
    description: '42mm stainless case, 5 ATM water resistance.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Fashion',
    category: 'Watches & Accessories',
    brand: 'Defacto',
    channels: ['RETAIL'],
    retail: { price: 340, discountPrice: 265 },
    wholesale: null,
    stock: 75,
    status: 'Cancelled',
    createdAt: '2025-01-30',
    attributes: [
      { label: 'Case size', value: '42 mm' },
      { label: 'Strap material', value: 'Leather' },
      { label: 'Water resistance', value: '5 ATM' }
    ],
    variations: []
  },
  {
    id: '1009',
    name: 'Oud Royale Eau de Parfum',
    description: 'Oriental oud with amber and sandalwood base notes.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Beauty & Health',
    category: 'Fragrances',
    brand: 'L’Oréal',
    channels: BOTH,
    retail: { price: 430, discountPrice: 375 },
    wholesale: { price: 320, discountPrice: null, moq: 20 },
    stock: 260,
    status: 'Approved',
    createdAt: '2025-02-25',
    attributes: [
      { label: 'Volume', value: '100 ml' },
      { label: 'Fragrance family', value: 'Oud' },
      { label: 'Concentration', value: 'Eau de Parfum' }
    ],
    variations: []
  },
  {
    id: '1010',
    name: 'Niacinamide 10% Serum',
    description: 'Blemish-prone skin, fragrance free, 30ml.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Beauty & Health',
    category: 'Skincare',
    brand: 'The Ordinary',
    channels: ['RETAIL'],
    retail: { price: 68, discountPrice: 52 },
    wholesale: null,
    stock: 1500,
    status: 'Approved',
    createdAt: '2025-03-12',
    attributes: [
      { label: 'Volume', value: '30 ml' },
      { label: 'Skin type', value: 'Oily, Combination' }
    ],
    variations: []
  },
  {
    id: '1011',
    name: 'Matte Liquid Foundation',
    description: 'Full coverage, transfer resistant, 24hr wear.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Beauty & Health',
    category: 'Makeup',
    brand: 'Maybelline',
    channels: BOTH,
    retail: { price: 89, discountPrice: 72 },
    wholesale: { price: 58, discountPrice: null, moq: 36 },
    stock: 940,
    status: 'Pending',
    createdAt: '2025-03-18',
    attributes: [
      { label: 'Finish', value: 'Matte' },
      { label: 'Volume', value: '30 ml' }
    ],
    variations: [
      {
        id: '1011-1',
        label: 'Variation 1',
        images: GALLERY,
        details: [{ label: 'Shade', value: 'Ivory' }],
        retail: { price: 89, discountPrice: 72 },
        wholesale: { price: 58, discountPrice: null, moq: 36 },
        stock: 470,
        createdAt: '2025-03-18'
      },
      {
        id: '1011-2',
        label: 'Variation 2',
        images: GALLERY,
        details: [{ label: 'Shade', value: 'Honey' }],
        retail: { price: 89, discountPrice: 72 },
        wholesale: { price: 58, discountPrice: null, moq: 36 },
        stock: 470,
        createdAt: '2025-03-18'
      }
    ]
  },
  {
    id: '1012',
    name: 'Non-Stick Casserole 5L',
    description: 'Induction-safe aluminium with tempered glass lid.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Home & Kitchen',
    category: 'Cookware',
    brand: 'Tefal',
    channels: BOTH,
    retail: { price: 265, discountPrice: 215 },
    wholesale: { price: 175, discountPrice: null, moq: 12 },
    stock: 420,
    status: 'Approved',
    createdAt: '2025-01-17',
    attributes: [
      { label: 'Material', value: 'Metal' },
      { label: 'Capacity', value: '5 L' },
      { label: 'Induction safe', value: 'Yes' }
    ],
    variations: []
  },
  {
    id: '1013',
    name: 'Oak Veneer Study Desk',
    description: '120 × 60 × 75 cm, cable management channel, flat packed.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Home & Kitchen',
    category: 'Furniture',
    brand: 'IKEA',
    channels: BOTH,
    retail: { price: 749, discountPrice: null },
    wholesale: { price: 640, discountPrice: null, moq: 6 },
    stock: 85,
    status: 'Approved',
    createdAt: '2025-02-07',
    attributes: [
      { label: 'Material', value: 'Wood' },
      { label: 'Room', value: 'Office' },
      { label: 'Assembly required', value: 'Yes' },
      { label: 'Dimensions (L × W × H)', value: '120 × 60 × 75 cm' }
    ],
    variations: []
  },
  {
    id: '1014',
    name: 'Egyptian Cotton Sheet Set',
    description: '400 thread count, fits mattresses up to 40cm deep.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Home & Kitchen',
    category: 'Bedding',
    brand: 'Home Centre',
    channels: ['RETAIL'],
    retail: { price: 420, discountPrice: 345 },
    wholesale: null,
    stock: 230,
    status: 'Cancelled',
    createdAt: '2025-03-01',
    attributes: [
      { label: 'Bed size', value: 'King' },
      { label: 'Thread count', value: '400' },
      { label: 'Material', value: 'Fabric' }
    ],
    variations: []
  },
  {
    id: '1015',
    name: 'Basmati Rice — Aged 2 Years',
    description: 'Extra long grain, halal certified, ambient storage.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Grocery',
    category: 'Pantry Staples',
    brand: 'Tilda',
    channels: BOTH,
    retail: { price: 48, discountPrice: null },
    wholesale: { price: 38, discountPrice: 34, moq: 200 },
    stock: 5200,
    status: 'Approved',
    createdAt: '2025-02-14',
    attributes: [
      { label: 'Net weight', value: '5 kg' },
      { label: 'Storage', value: 'Ambient' },
      { label: 'Halal certified', value: 'Yes' },
      { label: 'Expiry date', value: '2027-02-01' }
    ],
    variations: []
  },
  {
    id: '1016',
    name: 'Full Cream Long Life Milk',
    description: 'UHT treated, 12-month shelf life, case of 12.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Grocery',
    category: 'Dairy & Eggs',
    brand: 'Almarai',
    channels: ['WHOLESALE'],
    retail: null,
    wholesale: { price: 54, discountPrice: null, moq: 240 },
    stock: 3100,
    status: 'Pending',
    createdAt: '2025-03-21',
    attributes: [
      { label: 'Pack size', value: 'Case of 24' },
      { label: 'Storage', value: 'Ambient' },
      { label: 'Halal certified', value: 'Yes' }
    ],
    variations: []
  },
  {
    id: '1017',
    name: 'Baby Dry Pants — Jumbo Pack',
    description: 'Up to 12 hours dryness, sizes 3 to 6.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Baby & Toys',
    category: 'Diapering',
    brand: 'Pampers',
    channels: BOTH,
    retail: { price: 139, discountPrice: 115 },
    wholesale: { price: 92, discountPrice: 79, moq: 48 },
    stock: 1800,
    status: 'Approved',
    createdAt: '2025-01-26',
    attributes: [
      { label: 'Age range', value: '6-12 months' },
      { label: 'Diaper size', value: 'Size 4' },
      { label: 'Count per pack', value: '66' }
    ],
    variations: []
  },
  {
    id: '1018',
    name: 'Rubber Hex Dumbbell Set',
    description: 'Cast iron core, knurled chrome handle, 2kg to 25kg.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Sports & Outdoors',
    category: 'Fitness Equipment',
    brand: 'Decathlon',
    channels: BOTH,
    retail: { price: 159, discountPrice: null },
    wholesale: { price: 130, discountPrice: null, moq: 20 },
    stock: 340,
    status: 'Approved',
    createdAt: '2025-02-28',
    attributes: [
      { label: 'Weight', value: '10 kg' },
      { label: 'Material', value: 'Rubber coated' }
    ],
    variations: []
  },
  {
    id: '1019',
    name: 'All-Season Tyre 225/45 R17',
    description: 'Wet grip B, fuel efficiency C, 70dB noise.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Automotive',
    category: 'Tyres',
    brand: 'Michelin',
    channels: ['WHOLESALE'],
    retail: null,
    wholesale: { price: 480, discountPrice: 432, moq: 16 },
    stock: 160,
    status: 'Pending',
    createdAt: '2025-03-09',
    attributes: [
      { label: 'Tyre size', value: '225/45 R17' },
      { label: 'Fits vehicles', value: 'Toyota Corolla 2019-2024' }
    ],
    variations: []
  },
  {
    id: '1020',
    name: 'Synthetic Engine Oil 5W-30',
    description: 'API SP rated, 4 litre and 5 litre packs.',
    image: IMAGE,
    gallery: GALLERY,
    department: 'Automotive',
    category: 'Car Care',
    brand: 'Castrol',
    channels: BOTH,
    retail: { price: 169, discountPrice: 145 },
    wholesale: { price: 118, discountPrice: 99, moq: 24 },
    stock: 720,
    status: 'Approved',
    createdAt: '2025-01-11',
    attributes: [
      { label: 'Volume', value: '4 L' },
      { label: 'Manufacturer part number', value: 'CAS-5W30-4L' }
    ],
    variations: []
  }
];

export const productById = (id: string): ProductRow | undefined =>
  PRODUCTS.find((product) => product.id === id);

/** Months present in the catalogue, newest first — feeds the date filter. */
export const PRODUCT_MONTHS: string[] = Array.from(
  new Set(PRODUCTS.map((product) => product.createdAt.slice(0, 7)))
).sort((a, b) => b.localeCompare(a));

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/** "2025-03" → "Mar 2025", without Intl (its data differs Node vs browser). */
export const monthLabel = (value: string): string => {
  const [year, month] = value.split('-');
  return `${MONTH_NAMES[Number(month) - 1] ?? month} ${year}`;
};

/** "2025-03-09" → "09 Mar 2025", as the detail page prints dates. */
export const longDate = (value: string): string => {
  const [year, month, day] = value.split('-');
  return `${day} ${MONTH_NAMES[Number(month) - 1] ?? month} ${year}`;
};

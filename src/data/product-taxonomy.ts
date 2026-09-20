/* The catalogue's shape.
 *
 * Tredella is all-in-one — one seller may list smartphones, the next abayas,
 * the next 5kg bags of rice. A single fixed product form cannot serve that, so
 * the form is driven by this file instead of being hard-coded:
 *
 *   - every category declares the ATTRIBUTES its products carry, and
 *   - which of those attributes may act as VARIATION AXES.
 *
 * Attributes inherit down the tree, so "Condition" written once on Electronics
 * reaches Smartphones without being repeated. A child redeclaring a parent's
 * key replaces it — that is how Shoes swaps the clothing S/M/L size axis for
 * EU shoe sizes.
 *
 * This mirrors what the backend will eventually serve from the database; the
 * shape is deliberately serialisable so swapping this module for a query is
 * the whole job.
 */

export type AttributeType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'color';

export interface AttributeSpec {
  /** Stable key — what gets stored against the product. */
  key: string;
  label: string;
  type: AttributeType;
  /** Required for `select`, `multiselect` and any variation axis. */
  options?: string[];
  /** Shown after the input: GB, kg, ml, inch. */
  unit?: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  /**
   * May be chosen as a variation axis for this category. Only discrete
   * attributes qualify — you cannot vary a product by a free-text field.
   */
  variantAxis?: boolean;
}

export interface CategoryNode {
  slug: string;
  label: string;
  /** Applies to this node and everything beneath it. */
  attributes?: AttributeSpec[];
  /** Nearest non-empty list wins, so Fashion brands never leak into Grocery. */
  brands?: string[];
  children?: CategoryNode[];
}

/* Named colours, because a swatch on its own is not a label — the name travels
   with the hex everywhere this list is rendered. */
export const COLOR_OPTIONS: { name: string; hex: string }[] = [
  { name: 'Crimson', hex: '#e94560' },
  { name: 'Navy', hex: '#2b3445' },
  { name: 'Slate', hex: '#697282' },
  { name: 'Black', hex: '#000000' },
  { name: 'Amber', hex: '#f5b301' },
  { name: 'Emerald', hex: '#2fbf71' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Silver', hex: '#c9ced6' }
];

export const COLOR_NAMES = COLOR_OPTIONS.map((c) => c.name);

export const hexForColor = (name: string): string =>
  COLOR_OPTIONS.find((c) => c.name === name)?.hex ?? '#c9ced6';

/* ---------------------------------------------------------------- shared --
   Attributes that recur across departments. Spread into a node's list rather
   than referenced, so a category can still override one key without the
   others moving. */

const COLOUR: AttributeSpec = {
  key: 'color',
  label: 'Colour',
  type: 'color',
  options: COLOR_NAMES,
  variantAxis: true
};

const CLOTHING_SIZE: AttributeSpec = {
  key: 'size',
  label: 'Size',
  type: 'select',
  options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  variantAxis: true
};

const CONDITION: AttributeSpec = {
  key: 'condition',
  label: 'Condition',
  type: 'select',
  options: ['New', 'Open box', 'Refurbished'],
  required: true
};

const WARRANTY: AttributeSpec = {
  key: 'warrantyMonths',
  label: 'Warranty',
  type: 'number',
  unit: 'months',
  placeholder: '12'
};

const MATERIAL = (options: string[]): AttributeSpec => ({
  key: 'material',
  label: 'Material',
  type: 'select',
  options
});

/** UAE conformity mark — regulated goods cannot be sold without it. */
const ECAS: AttributeSpec = {
  key: 'ecasCertificate',
  label: 'ECAS / MoIAT certificate number',
  type: 'text',
  placeholder: 'ECAS-1234567',
  help: 'Required by MoIAT for regulated goods sold in the UAE'
};

const HALAL: AttributeSpec = {
  key: 'halalCertified',
  label: 'Halal certified',
  type: 'boolean'
};

const EXPIRY: AttributeSpec = {
  key: 'expiryDate',
  label: 'Expiry date',
  type: 'date',
  required: true
};

/* ------------------------------------------------------------ the tree --- */

export const DEPARTMENTS: CategoryNode[] = [
  {
    slug: 'electronics',
    label: 'Electronics',
    brands: ['Samsung', 'Apple', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'Anker', 'JBL'],
    attributes: [CONDITION, WARRANTY, COLOUR, ECAS],
    children: [
      {
        slug: 'mobiles-tablets',
        label: 'Mobiles & Tablets',
        attributes: [
          {
            key: 'storage',
            label: 'Storage',
            type: 'select',
            options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
            variantAxis: true
          },
          {
            key: 'ram',
            label: 'RAM',
            type: 'select',
            options: ['3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB']
          },
          {
            key: 'network',
            label: 'Network',
            type: 'select',
            options: ['4G', '5G', 'Wi-Fi only']
          },
          {
            key: 'simSlots',
            label: 'SIM',
            type: 'select',
            options: ['Single SIM', 'Dual SIM', 'eSIM', 'Dual SIM + eSIM']
          }
        ],
        children: [
          {
            slug: 'smartphones',
            label: 'Smartphones',
            attributes: [
              { key: 'screenSize', label: 'Screen size', type: 'number', unit: 'in', placeholder: '6.7' },
              { key: 'batteryMah', label: 'Battery', type: 'number', unit: 'mAh', placeholder: '5000' }
            ]
          },
          { slug: 'tablets', label: 'Tablets' },
          { slug: 'phone-accessories', label: 'Mobile Accessories' }
        ]
      },
      {
        slug: 'audio',
        label: 'Audio & Accessories',
        attributes: [
          {
            key: 'connectivity',
            label: 'Connectivity',
            type: 'select',
            options: ['Wired', 'Bluetooth', 'Wired + Bluetooth']
          },
          { key: 'noiseCancelling', label: 'Active noise cancelling', type: 'boolean' },
          { key: 'batteryLifeHours', label: 'Battery life', type: 'number', unit: 'hrs', placeholder: '28' }
        ],
        children: [
          { slug: 'wireless-earbuds', label: 'Wireless Earbuds' },
          { slug: 'headphones', label: 'Headphones' },
          { slug: 'speakers', label: 'Speakers' }
        ]
      },
      {
        slug: 'computers',
        label: 'Computers',
        attributes: [
          { key: 'processor', label: 'Processor', type: 'text', placeholder: 'Intel Core i7-1360P' },
          {
            key: 'ram',
            label: 'RAM',
            type: 'select',
            options: ['8 GB', '16 GB', '32 GB', '64 GB'],
            variantAxis: true
          },
          {
            key: 'storage',
            label: 'Storage',
            type: 'select',
            options: ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD'],
            variantAxis: true
          },
          { key: 'screenSize', label: 'Screen size', type: 'number', unit: 'in', placeholder: '14' }
        ],
        children: [
          { slug: 'laptops', label: 'Laptops' },
          { slug: 'desktops', label: 'Desktops' },
          { slug: 'components', label: 'Components' }
        ]
      },
      {
        slug: 'tv-home-cinema',
        label: 'TV & Home Cinema',
        attributes: [
          {
            key: 'screenSizeClass',
            label: 'Screen size',
            type: 'select',
            options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'],
            variantAxis: true
          },
          {
            key: 'resolution',
            label: 'Resolution',
            type: 'select',
            options: ['HD', 'Full HD', '4K UHD', '8K UHD']
          },
          {
            key: 'panel',
            label: 'Panel',
            type: 'select',
            options: ['LED', 'QLED', 'OLED', 'Mini-LED']
          }
        ]
      }
    ]
  },

  {
    slug: 'fashion',
    label: 'Fashion',
    brands: ['Zara', 'H&M', 'Nike', 'Adidas', 'Max', 'Splash', 'Defacto', 'Namshi'],
    attributes: [
      COLOUR,
      CLOTHING_SIZE,
      MATERIAL(['Cotton', 'Linen', 'Polyester', 'Denim', 'Silk', 'Wool', 'Blend']),
      {
        key: 'gender',
        label: 'Department',
        type: 'select',
        options: ['Men', 'Women', 'Unisex', 'Boys', 'Girls'],
        required: true
      },
      { key: 'careInstructions', label: 'Care instructions', type: 'text', placeholder: 'Machine wash cold, do not tumble dry' }
    ],
    children: [
      {
        slug: 'mens-clothing',
        label: "Men's Clothing",
        children: [
          { slug: 'tshirts', label: 'T-Shirts' },
          { slug: 'shirts', label: 'Shirts' },
          { slug: 'trousers', label: 'Trousers' }
        ]
      },
      {
        slug: 'womens-clothing',
        label: "Women's Clothing",
        children: [
          { slug: 'dresses', label: 'Dresses' },
          { slug: 'abayas', label: 'Abayas & Jalabiyas' },
          { slug: 'tops', label: 'Tops' }
        ]
      },
      {
        slug: 'shoes',
        label: 'Shoes',
        /* Redeclaring `size` replaces the inherited S/M/L axis outright — a
           shoe is not a medium. This is the mechanism the whole file rests on. */
        attributes: [
          {
            key: 'size',
            label: 'Size (EU)',
            type: 'select',
            options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
            variantAxis: true
          },
          { key: 'width', label: 'Width', type: 'select', options: ['Narrow', 'Regular', 'Wide'] },
          { key: 'closure', label: 'Closure', type: 'select', options: ['Lace-up', 'Slip-on', 'Velcro', 'Buckle'] }
        ],
        children: [
          { slug: 'mens-shoes', label: "Men's Shoes" },
          { slug: 'womens-shoes', label: "Women's Shoes" }
        ]
      },
      {
        slug: 'watches-accessories',
        label: 'Watches & Accessories',
        attributes: [
          { key: 'size', label: 'Case size', type: 'select', options: ['38 mm', '40 mm', '42 mm', '44 mm', '46 mm'], variantAxis: true },
          { key: 'strapMaterial', label: 'Strap material', type: 'select', options: ['Leather', 'Silicone', 'Stainless steel', 'Nylon'] },
          { key: 'waterResistance', label: 'Water resistance', type: 'select', options: ['Not resistant', '3 ATM', '5 ATM', '10 ATM'] }
        ]
      }
    ]
  },

  {
    slug: 'beauty-health',
    label: 'Beauty & Health',
    brands: ['Nivea', 'L’Oréal', 'Maybelline', 'Dove', 'Garnier', 'The Ordinary'],
    attributes: [
      {
        key: 'volume',
        label: 'Volume',
        type: 'select',
        options: ['30 ml', '50 ml', '100 ml', '200 ml', '400 ml'],
        variantAxis: true
      },
      EXPIRY,
      { key: 'ingredients', label: 'Ingredients', type: 'text', placeholder: 'Aqua, Glycerin, …' },
      {
        key: 'mohRegistration',
        label: 'MoHAP registration number',
        type: 'text',
        placeholder: 'MOH-C-1234',
        help: 'Cosmetics and supplements must be registered with the UAE Ministry of Health'
      }
    ],
    children: [
      {
        slug: 'fragrances',
        label: 'Fragrances',
        attributes: [
          { key: 'fragranceFamily', label: 'Fragrance family', type: 'select', options: ['Oriental', 'Floral', 'Woody', 'Fresh', 'Oud'] },
          { key: 'concentration', label: 'Concentration', type: 'select', options: ['Eau de Cologne', 'Eau de Toilette', 'Eau de Parfum', 'Parfum'] }
        ]
      },
      {
        slug: 'skincare',
        label: 'Skincare',
        attributes: [
          { key: 'skinType', label: 'Skin type', type: 'multiselect', options: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'] },
          { key: 'spf', label: 'SPF', type: 'number', placeholder: '50' }
        ]
      },
      {
        slug: 'makeup',
        label: 'Makeup',
        attributes: [
          {
            key: 'shade',
            label: 'Shade',
            type: 'select',
            options: ['Porcelain', 'Ivory', 'Beige', 'Sand', 'Honey', 'Caramel', 'Espresso'],
            variantAxis: true
          },
          { key: 'finish', label: 'Finish', type: 'select', options: ['Matte', 'Dewy', 'Satin', 'Shimmer'] }
        ]
      },
      { slug: 'personal-care', label: 'Personal Care' }
    ]
  },

  {
    slug: 'home-kitchen',
    label: 'Home & Kitchen',
    brands: ['IKEA', 'Home Centre', 'Tefal', 'Prestige', 'Philips', 'Pan Emirates'],
    attributes: [
      COLOUR,
      MATERIAL(['Wood', 'Metal', 'Glass', 'Plastic', 'Ceramic', 'Fabric', 'Marble']),
      { key: 'dimensionsCm', label: 'Dimensions (L × W × H)', type: 'text', placeholder: '120 × 60 × 75 cm' }
    ],
    children: [
      {
        slug: 'furniture',
        label: 'Furniture',
        attributes: [
          { key: 'roomType', label: 'Room', type: 'select', options: ['Living room', 'Bedroom', 'Dining', 'Office', 'Outdoor'] },
          { key: 'assemblyRequired', label: 'Assembly required', type: 'boolean' }
        ]
      },
      {
        slug: 'cookware',
        label: 'Cookware',
        attributes: [
          { key: 'capacity', label: 'Capacity', type: 'select', options: ['1 L', '2 L', '3 L', '5 L', '8 L'], variantAxis: true },
          { key: 'inductionSafe', label: 'Induction safe', type: 'boolean' }
        ]
      },
      {
        slug: 'bedding',
        label: 'Bedding',
        attributes: [
          { key: 'bedSize', label: 'Bed size', type: 'select', options: ['Single', 'Double', 'Queen', 'King', 'Super King'], variantAxis: true },
          { key: 'threadCount', label: 'Thread count', type: 'number', placeholder: '300' }
        ]
      },
      {
        slug: 'home-appliances',
        label: 'Home Appliances',
        attributes: [CONDITION, WARRANTY, ECAS, { key: 'powerWatts', label: 'Power', type: 'number', unit: 'W', placeholder: '1800' }]
      }
    ]
  },

  {
    slug: 'grocery',
    label: 'Grocery',
    brands: ['Al Ain', 'Almarai', 'Nestlé', 'Lurpak', 'Tilda', 'Nadec'],
    attributes: [
      {
        key: 'netWeight',
        label: 'Net weight',
        type: 'select',
        options: ['250 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg'],
        variantAxis: true
      },
      { key: 'packSize', label: 'Pack size', type: 'select', options: ['Single', 'Pack of 4', 'Pack of 6', 'Pack of 12', 'Case of 24'], variantAxis: true },
      EXPIRY,
      HALAL,
      { key: 'storageCondition', label: 'Storage', type: 'select', options: ['Ambient', 'Chilled', 'Frozen'], required: true },
      { key: 'ingredients', label: 'Ingredients', type: 'text' },
      { key: 'nutritionPer100g', label: 'Nutrition per 100g', type: 'text', placeholder: 'Energy 380 kcal, Protein 7g …' }
    ],
    children: [
      { slug: 'beverages', label: 'Beverages' },
      { slug: 'snacks', label: 'Snacks' },
      { slug: 'pantry', label: 'Pantry Staples' },
      { slug: 'dairy-eggs', label: 'Dairy & Eggs' }
    ]
  },

  {
    slug: 'baby-toys',
    label: 'Baby & Toys',
    brands: ['Pampers', 'Chicco', 'Fisher-Price', 'LEGO', 'Huggies', 'Mothercare'],
    attributes: [
      {
        key: 'ageRange',
        label: 'Age range',
        type: 'select',
        options: ['0-6 months', '6-12 months', '1-3 years', '3-6 years', '6-9 years', '9+ years'],
        required: true
      },
      ECAS
    ],
    children: [
      {
        slug: 'diapering',
        label: 'Diapering',
        attributes: [
          { key: 'diaperSize', label: 'Diaper size', type: 'select', options: ['Newborn', 'Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6'], variantAxis: true },
          { key: 'count', label: 'Count per pack', type: 'select', options: ['22', '44', '66', '88'], variantAxis: true }
        ]
      },
      { slug: 'feeding', label: 'Feeding', attributes: [EXPIRY, HALAL] },
      {
        slug: 'toys',
        label: 'Toys',
        attributes: [
          COLOUR,
          { key: 'batteryRequired', label: 'Batteries required', type: 'boolean' },
          { key: 'chokingHazard', label: 'Small parts warning', type: 'boolean', help: 'Required labelling for under-3s' }
        ]
      }
    ]
  },

  {
    slug: 'sports-outdoors',
    label: 'Sports & Outdoors',
    brands: ['Nike', 'Adidas', 'Decathlon', 'Puma', 'Under Armour', 'Reebok'],
    attributes: [COLOUR],
    children: [
      {
        slug: 'fitness-equipment',
        label: 'Fitness Equipment',
        attributes: [
          { key: 'weight', label: 'Weight', type: 'select', options: ['2 kg', '5 kg', '10 kg', '15 kg', '20 kg', '25 kg'], variantAxis: true },
          { key: 'equipmentMaterial', label: 'Material', type: 'select', options: ['Cast iron', 'Rubber coated', 'Neoprene', 'Steel'] }
        ]
      },
      { slug: 'sportswear', label: 'Sportswear', attributes: [CLOTHING_SIZE] },
      { slug: 'camping', label: 'Camping & Hiking', attributes: [{ key: 'capacityPersons', label: 'Capacity', type: 'select', options: ['1 person', '2 person', '4 person', '6 person'], variantAxis: true }] }
    ]
  },

  {
    slug: 'automotive',
    label: 'Automotive',
    brands: ['Bosch', 'Castrol', 'Michelin', 'Bridgestone', 'Shell', '3M'],
    attributes: [
      { key: 'vehicleCompatibility', label: 'Fits vehicles', type: 'text', placeholder: 'Toyota Land Cruiser 2016-2022' },
      { key: 'partNumber', label: 'Manufacturer part number', type: 'text' }
    ],
    children: [
      { slug: 'car-care', label: 'Car Care', attributes: [{ key: 'volume', label: 'Volume', type: 'select', options: ['500 ml', '1 L', '4 L', '5 L'], variantAxis: true }] },
      { slug: 'parts-spares', label: 'Parts & Spares', attributes: [CONDITION, WARRANTY] },
      { slug: 'tyres', label: 'Tyres', attributes: [{ key: 'tyreSize', label: 'Tyre size', type: 'select', options: ['195/65 R15', '205/55 R16', '225/45 R17', '265/60 R18', '285/50 R20'], variantAxis: true }] }
    ]
  }
];

/* ----------------------------------------------------------- traversal --- */

/** Walks `path` (slugs, outermost first) and returns the nodes it passes through. */
export const nodesAlong = (path: string[]): CategoryNode[] => {
  const trail: CategoryNode[] = [];
  let level = DEPARTMENTS;

  for (const slug of path) {
    const match = level.find((node) => node.slug === slug);
    if (!match) break;
    trail.push(match);
    level = match.children ?? [];
  }

  return trail;
};

/** The options to offer at depth `path.length`. */
export const childrenOf = (path: string[]): CategoryNode[] => {
  if (path.length === 0) return DEPARTMENTS;
  const trail = nodesAlong(path);
  if (trail.length < path.length) return [];
  return trail[trail.length - 1].children ?? [];
};

/**
 * Every attribute in force for a category, parents first. A child redeclaring
 * a key replaces the inherited one, keeping the parent's position in the list
 * so the form does not reshuffle as you drill down.
 */
export const attributesFor = (path: string[]): AttributeSpec[] => {
  const merged: AttributeSpec[] = [];

  for (const node of nodesAlong(path)) {
    for (const spec of node.attributes ?? []) {
      const existing = merged.findIndex((a) => a.key === spec.key);
      if (existing === -1) merged.push(spec);
      else merged[existing] = spec;
    }
  }

  return merged;
};

/** The attributes this category allows a seller to vary a product by. */
export const variantAxesFor = (path: string[]): AttributeSpec[] =>
  attributesFor(path).filter((a) => a.variantAxis && (a.options?.length ?? 0) > 0);

/** Attributes that describe the product as a whole, once axes are taken out. */
export const specAttributesFor = (
  path: string[],
  axisKeys: string[] = []
): AttributeSpec[] =>
  attributesFor(path).filter((a) => !axisKeys.includes(a.key));

/** Nearest ancestor with a brand list — departments do not share brands. */
export const brandsFor = (path: string[]): string[] => {
  const trail = nodesAlong(path);
  for (let i = trail.length - 1; i >= 0; i -= 1) {
    if (trail[i].brands?.length) return trail[i].brands as string[];
  }
  return [];
};

/** "Electronics › Audio & Accessories › Wireless Earbuds" */
export const categoryTrail = (path: string[]): string[] =>
  nodesAlong(path).map((node) => node.label);

/**
 * Cartesian product of the chosen axes' selected values.
 * Two axes with 3 and 4 values give 12 combinations, in a stable order.
 */
export const combinationsOf = (
  axes: { key: string; values: string[] }[]
): Record<string, string>[] => {
  const usable = axes.filter((axis) => axis.values.length > 0);
  if (usable.length === 0) return [];

  return usable.reduce<Record<string, string>[]>(
    (rows, axis) =>
      rows.flatMap((row) => axis.values.map((value) => ({ ...row, [axis.key]: value }))),
    [{}]
  );
};

/** Flat list for the list page's Category filter. */
export const ALL_CATEGORY_LABELS: string[] = DEPARTMENTS.map((d) => d.label);

export const ALL_BRANDS: string[] = Array.from(
  new Set(DEPARTMENTS.flatMap((d) => d.brands ?? []))
).sort((a, b) => a.localeCompare(b));

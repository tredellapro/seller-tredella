// Static site data (menus, faqs, etc.) lives here — same pattern as easyfloors-frontend.
export const staticMenuItems: { label: string; href: string }[] = [];

export interface GrowFeature {
  icon: string;
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Quick Link',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
      { label: 'Purchase plan', href: '/purchase-plan' },
      { label: 'Payments', href: '/payments' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Company', href: '/our-company' },
      { label: 'Affiliate', href: '/affiliate' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partnership', href: '/partnership' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help-center' },
      { label: 'Terms of Service', href: '/terms-and-conditions' },
      { label: 'Privacy Policy', href: '/privacy-policy' }
    ]
  }
];

export const contactDetails: { label: string; href: string }[] = [
  { label: '+92 300 1234567', href: 'tel:+923001234567' },
  { label: 'www.tredella.com', href: 'https://www.tredella.com' },
  { label: 'support@tredella.com', href: 'mailto:support@tredella.com' }
];

export const companyAddress = '123 Health Avenue, Suite Medicity Tower, Karachi, Pakistan.';

export const socialLinks: { label: string; href: string }[] = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'TikTok', href: 'https://tiktok.com' }
];

export interface PlanBenefit {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  benefitsIntro: string;
  benefits: PlanBenefit[];
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic Plan',
    monthlyPrice: 150,
    benefitsIntro: 'Everything in our basic plan plus...',
    benefits: [
      { text: 'Unlimited product listings', included: true },
      { text: '10 product showcases', included: true },
      { text: '20 RFQ responses a month', included: true },
      { text: 'Business verification support', included: true },
      { text: 'Full-service onboarding help for 60 days', included: false },
      { text: 'Dedicated Account Manager', included: false }
    ]
  },
  {
    name: 'Standard Plan',
    monthlyPrice: 200,
    benefitsIntro: 'Everything in our standard plan plus...',
    benefits: [
      { text: 'Unlimited product listings', included: true },
      { text: '20 product showcases', included: true },
      { text: '40 RFQ responses a month', included: true },
      { text: 'Business verification support', included: true },
      { text: 'Full-service onboarding help for 60 days', included: true },
      { text: 'Dedicated Account Manager', included: true }
    ]
  }
];

export interface PricingNote {
  label: string;
  text: string;
}

export const pricingNotes: PricingNote[] = [
  {
    label: 'No Additional Fees:',
    text: "There aren't any additional charges or percentages on products that are used for wholesale operations."
  },
  {
    label: 'Retail Option:',
    text: 'The subscription is able to be used for retail and wholesale operations. which allows for flexibility when selling products.'
  },
  {
    label: 'Retail Tab:',
    text: 'Wholesale sellers have access to our retail tab for free; however, a category-based fee will apply.'
  }
];

export interface Testimonial {
  title: string;
  quote: string;
  rating: number;
  name: string;
  role: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    title: 'Tredella transformed my small business!',
    quote:
      '"I struggled to expand my online sales until I joined Tredella. The insights and tools helped me double my revenue in just six months."',
    rating: 5,
    name: 'Ali Rehman',
    role: 'Owner of Rehman Enterprises'
  },
  {
    title: 'My wholesale business finally found a home.',
    quote:
      "\"Tredella's zero-transaction-fee model on wholesale orders helped me expand to new markets without cutting profits. Awesome experience so far\"",
    rating: 5,
    name: 'Sarah Khan',
    role: 'CEO of Khan Supplies'
  },
  {
    title: 'From Startup to Success with Tredella',
    quote:
      '"Starting out was tough, but Tredella gave me the tools to succeed. Their marketing insights and support helped me build a loyal customer base."',
    rating: 5,
    name: 'Ahsan Malik',
    role: 'Founder of Malik Creations'
  }
];

export const whyFeatures: GrowFeature[] = [
  {
    icon: '/assets/icons/mynaui_cart.png',
    title: 'Selling Experience',
    description:
      'Our intuitive dashboard helps you track orders, manage inventory, and access insights in real-time.'
  },
  {
    icon: '/assets/icons/fluent_payment-16-regular.png',
    title: 'Payment Options',
    description:
      'From card payments to secure withdrawals, Tredella ensures smooth and secure transactions every time.'
  },
  {
    icon: '/assets/icons/fluent_shield-checkmark.png',
    title: 'Trusted by Sellers',
    description:
      'Our platform is built to support businesses of all sizes, from small startups to enterprise-level wholesalers.'
  },
  {
    icon: '/assets/icons/nimbus_marketing.png',
    title: 'Marketing Tools',
    description:
      'Boost your sales with built-in marketing tools designed to help your products reach the right audience.'
  },
  {
    icon: '/assets/icons/streamline_customer-support-1.png',
    title: 'Support Team',
    description:
      'Our expert support team is available 24/7 to guide you through any challenges and ensure your success.'
  },
  {
    icon: '/assets/icons/fluent_arrow-growth-20-filled.png',
    title: 'Solutions for Growth',
    description:
      "Whether you're just starting or expanding to new markets, Tredella's flexible features adapt to your business needs."
  }
];

export const growFeatures: GrowFeature[] = [
  {
    icon: '/assets/icons/material-symbols_inventory.png',
    title: 'Inventory Management Tools',
    description:
      'Easily track stock levels, set reorder alerts, and manage products from one dashboard.'
  },
  {
    icon: '/assets/icons/ion_analytic.png',
    title: 'Performance Insights',
    description:
      'Track your sales trends, and top-performing products with detailed reports.'
  },
  {
    icon: '/assets/icons/tdesign_money.png',
    title: 'Fast & Secure Payments',
    description:
      'Receive payments directly to your bank account with our secure and fast payout system.'
  },
  {
    icon: '/assets/icons/ic_outline-contact-support.png',
    title: 'Refund & Complaint Management',
    description:
      'Manage customer complaints with a clear and simple resolution process.'
  }
];

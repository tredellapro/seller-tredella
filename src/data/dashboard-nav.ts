import type { IconType } from 'react-icons';
import {
  HiOutlineBell,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineCreditCard,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineSupport,
  HiOutlineTruck,
  HiOutlineUserAdd
} from 'react-icons/hi';

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export interface NavGroup {
  /** Small caps heading above the group. */
  title: string;
  items: NavItem[];
}

/* The sidebar, as drawn in Figma. Sections without a page of their own yet fall
   through to the placeholder at /dashboard/[section] — adding the real page
   later takes precedence automatically, because a static segment beats a
   dynamic one in Next's router. */
export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: 'Main Menu',
    items: [
      { label: 'Analytics', href: '/dashboard', icon: HiOutlineChartBar },
      {
        label: 'Products',
        href: '/dashboard/products',
        icon: HiOutlineShoppingBag
      },
      { label: 'Orders', href: '/dashboard/orders', icon: HiOutlineShoppingCart },
      {
        label: 'Payments',
        href: '/dashboard/payments',
        icon: HiOutlineCreditCard
      },
      {
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: HiOutlineBell
      },
      {
        label: 'Messages',
        href: '/dashboard/messages',
        icon: HiOutlineChatAlt2
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      { label: 'Shipping', href: '/dashboard/shipping', icon: HiOutlineTruck },
      {
        label: 'User Roles',
        href: '/dashboard/user-roles',
        icon: HiOutlineUserAdd
      },
      { label: 'Plans', href: '/dashboard/plans', icon: HiOutlineClipboardList },
      { label: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog },
      {
        label: 'Complaints',
        href: '/dashboard/complaints',
        icon: HiOutlineSupport
      },
      { label: 'History', href: '/dashboard/history', icon: HiOutlineClock }
    ]
  }
];

export const NAV_ITEMS: NavItem[] = DASHBOARD_NAV.flatMap((g) => g.items);

/** `/dashboard/products` → "Products", for the placeholder page's heading. */
export const sectionLabel = (slug: string): string | null =>
  NAV_ITEMS.find((item) => item.href === `/dashboard/${slug}`)?.label ?? null;

export const SECTION_SLUGS = NAV_ITEMS.filter(
  (item) => item.href !== '/dashboard'
).map((item) => item.href.replace('/dashboard/', ''));

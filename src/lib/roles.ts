/* Who on a seller's team can see and do what.
 *
 * The designs show four roles, but a seller wants to hand an employee exactly
 * the parts of the dashboard they need — so a role here is a PRESET over a
 * per-section permission map, and CUSTOM is the escape hatch when no preset
 * fits. Everything downstream reads the map, never the role name, so a custom
 * member behaves like any other.
 */

export type Role = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CUSTOM';

/** What a member may do in one section. */
export type Access = 'NONE' | 'VIEW' | 'MANAGE';

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'View-only',
  CUSTOM: 'Custom'
};

export const ACCESS_LABEL: Record<Access, string> = {
  NONE: 'No access',
  VIEW: 'View only',
  MANAGE: 'View & manage'
};

/** Roles a seller can actually assign — ownership is not one of them. */
export const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'EDITOR', 'VIEWER', 'CUSTOM'];

export interface Section {
  key: string;
  label: string;
  /** Matches NavItem.href so the sidebar can be filtered from this. */
  href: string;
  /** Warned about when granted — money, or the ability to grant more access. */
  sensitive?: boolean;
}

export const SECTIONS: Section[] = [
  { key: 'analytics', label: 'Analytics', href: '/dashboard' },
  { key: 'products', label: 'Products', href: '/dashboard/products' },
  { key: 'orders', label: 'Orders', href: '/dashboard/orders' },
  { key: 'payments', label: 'Payments', href: '/dashboard/payments', sensitive: true },
  { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications' },
  { key: 'messages', label: 'Messages', href: '/dashboard/messages' },
  { key: 'shipping', label: 'Shipping', href: '/dashboard/shipping' },
  { key: 'user-roles', label: 'User Roles', href: '/dashboard/user-roles', sensitive: true },
  { key: 'plans', label: 'Plans', href: '/dashboard/plans', sensitive: true },
  { key: 'settings', label: 'Settings', href: '/dashboard/settings', sensitive: true },
  { key: 'complaints', label: 'Complaints', href: '/dashboard/complaints' }
];

export const SECTION_KEYS = SECTIONS.map((section) => section.key);

export type Permissions = Record<string, Access>;

const fill = (value: Access): Permissions =>
  Object.fromEntries(SECTION_KEYS.map((key) => [key, value]));

const withOverrides = (base: Access, overrides: Permissions): Permissions => ({
  ...fill(base),
  ...overrides
});

/**
 * What each preset grants.
 *
 * The money and the ability to grant more access stay with the owner: an admin
 * runs the shop day to day but cannot change the subscription or hand someone
 * else the keys.
 */
export const ROLE_PRESETS: Record<Exclude<Role, 'CUSTOM'>, Permissions> = {
  OWNER: fill('MANAGE'),

  /* Runs the shop day to day, but cannot move money out of it, change the
     subscription, or hand someone else access. */
  ADMIN: withOverrides('MANAGE', {
    payments: 'VIEW',
    plans: 'VIEW',
    'user-roles': 'VIEW'
  }),

  EDITOR: withOverrides('VIEW', {
    products: 'MANAGE',
    orders: 'MANAGE',
    shipping: 'MANAGE',
    messages: 'MANAGE',
    complaints: 'MANAGE',
    payments: 'NONE',
    plans: 'NONE',
    'user-roles': 'NONE',
    settings: 'NONE'
  }),

  VIEWER: withOverrides('VIEW', {
    payments: 'NONE',
    plans: 'NONE',
    'user-roles': 'NONE',
    settings: 'NONE'
  })
};

/** The permission map a member actually runs on. */
export const permissionsFor = (
  role: Role,
  custom?: Permissions | null
): Permissions => {
  if (role === 'CUSTOM') return { ...fill('NONE'), ...(custom ?? {}) };
  return ROLE_PRESETS[role];
};

export const canView = (permissions: Permissions, sectionKey: string): boolean =>
  permissions[sectionKey] === 'VIEW' || permissions[sectionKey] === 'MANAGE';

export const canManage = (permissions: Permissions, sectionKey: string): boolean =>
  permissions[sectionKey] === 'MANAGE';

/** Sections this member sees in the sidebar, in nav order. */
export const visibleSections = (permissions: Permissions): Section[] =>
  SECTIONS.filter((section) => canView(permissions, section.key));

/** "Products, Orders and 3 more" — a one-line summary for the members table. */
export const summarise = (permissions: Permissions): string => {
  const visible = visibleSections(permissions);
  if (visible.length === 0) return 'No access yet';
  if (visible.length === SECTIONS.length) return 'Everything';

  const names = visible.map((section) => section.label);
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Only set when role is CUSTOM. */
  custom?: Permissions | null;
  /** ISO date, or null while an invite is outstanding. */
  joinedAt: string | null;
  status: 'Active' | 'Invited';
}

/**
 * Why this change cannot be made, or null.
 *
 * A shop with nobody who can grant access is a shop locked out of itself, so
 * the owner is immovable and cannot be removed.
 */
export const roleChangeProblem = (
  member: TeamMember,
  next: Role
): string | null => {
  if (member.role === 'OWNER')
    return 'The owner’s access cannot be changed. Transfer ownership first.';
  if (next === 'OWNER')
    return 'Ownership is transferred separately, not set from this list.';
  return null;
};

export const removalProblem = (member: TeamMember): string | null =>
  member.role === 'OWNER' ? 'The owner cannot be removed.' : null;

/** Rejects malformed and duplicate invites. */
export const inviteProblem = (
  email: string,
  members: TeamMember[]
): string | null => {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Enter an email address to invite.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed))
    return 'That does not look like an email address.';
  if (members.some((member) => member.email.toLowerCase() === trimmed))
    return 'That person is already on your team.';
  return null;
};

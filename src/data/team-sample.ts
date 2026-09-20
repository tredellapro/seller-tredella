import type { TeamMember } from 'lib/roles';

/* Stand-in team until the members API exists. The seller account itself is the
   owner; everyone else was invited by them. */

export const TEAM: TeamMember[] = [
  {
    id: 'u-1',
    name: 'Hamza Tariq',
    email: 'hamzatariq@gmail.com',
    role: 'OWNER',
    joinedAt: '2025-01-12',
    status: 'Active'
  },
  {
    id: 'u-2',
    name: 'Faisal Khan',
    email: 'faisalkhan@gmail.com',
    role: 'ADMIN',
    joinedAt: '2025-01-20',
    status: 'Active'
  },
  {
    id: 'u-3',
    name: 'Sara Ahmad',
    email: 'sarahmad@gmail.com',
    role: 'EDITOR',
    joinedAt: '2025-02-03',
    status: 'Active'
  },
  {
    id: 'u-4',
    name: 'Saba Faisal',
    email: 'sabafaisal@gmail.com',
    role: 'VIEWER',
    joinedAt: '2025-02-14',
    status: 'Active'
  },
  {
    id: 'u-5',
    name: 'Ayesha Malik',
    email: 'ayeshamalika@gmail.com',
    role: 'ADMIN',
    joinedAt: '2025-02-28',
    status: 'Active'
  },
  {
    /* A warehouse hand who only ever touches orders and shipping — the case
       presets do not cover. */
    id: 'u-6',
    name: 'Bilal Rauf',
    email: 'bilal.rauf@example.ae',
    role: 'CUSTOM',
    custom: {
      orders: 'MANAGE',
      shipping: 'MANAGE',
      products: 'VIEW'
    },
    joinedAt: '2025-03-06',
    status: 'Active'
  },
  {
    id: 'u-7',
    name: 'Nida Kamal',
    email: 'nida.kamal@example.ae',
    role: 'VIEWER',
    joinedAt: null,
    status: 'Invited'
  }
];

/** Colour for the initials avatar, stable per member. */
const AVATAR_TONES = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-amber-500/15 text-amber-700',
  'bg-blue-500/15 text-blue-700',
  'bg-green-500/15 text-green-700'
];

export const avatarTone = (id: string): string => {
  const sum = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
};

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

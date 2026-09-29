import type { AccountState } from 'lib/accountState';

/* Stand-in profile and store details until the settings mutations exist.
   NOW is fixed so the deletion grace window and the withdrawal cooling-off
   period are deterministic — they are date arithmetic, and a server render
   must not disagree with a client render about the time. */
export const NOW = '2025-03-20T12:00:00.000Z';

export interface SellerProfile {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  country: string;
  phone: string;
  phoneVerified: boolean;
  avatarUrl: string | null;
}

export const PROFILE: SellerProfile = {
  firstName: 'Hamza',
  lastName: 'Tariq',
  email: 'hamzatariq@gmail.com',
  emailVerified: true,
  country: 'AE',
  phone: '50 123 4567',
  phoneVerified: true,
  avatarUrl: null
};

export interface StoreProfile {
  name: string;
  address: string;
  emirate: string;
  supportEmail: string;
  supportPhone: string;
  logoUrl: string | null;
}

export const STORE: StoreProfile = {
  name: 'Electronics Store',
  address: 'Shop #12, Ground Floor, Tech Plaza, Al Barsha 1',
  emirate: 'DUBAI',
  supportEmail: 'support@electronicsstore.ae',
  supportPhone: '50 987 6543',
  logoUrl: null
};

/** Live listings — what holiday mode would take offline. */
export const LIVE_PRODUCT_COUNT = 18;

export const ACCOUNT: AccountState = {
  status: 'ACTIVE',
  reactivatedAt: null,
  deletionRequestedAt: null,
  inactiveProducts: 0
};

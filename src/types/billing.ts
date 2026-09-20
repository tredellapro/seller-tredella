export type BillingInterval = 'MONTHLY' | 'QUARTERLY';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PlanFeature {
  id: string;
  kind: 'FEATURE' | 'NOTE';
  title: string | null;
  label: string;
  included: boolean;
  position: number;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  currency: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  sortOrder: number;
  features: PlanFeature[];
}

export interface SellerSubscription {
  id: string;
  interval: BillingInterval;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  provider: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  plan: Plan;
}

export interface CheckoutSession {
  activated: boolean;
  /** Set once a payment gateway is connected; redirect there to pay. */
  checkoutUrl: string | null;
  subscription: SellerSubscription;
}

export interface GetPlansResult {
  getPlans: Plan[];
}

export interface MySubscriptionResult {
  mySubscription: SellerSubscription | null;
}

export interface SubscribeToPlanResult {
  subscribeToPlan: CheckoutSession;
}

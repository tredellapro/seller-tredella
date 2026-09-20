/* When a seller can actually take their money out.
 *
 * Three rules, and they exist to protect the buyer:
 *
 *  1. HOLD — earnings become withdrawable 14 days after delivery, so there is
 *     a window for the buyer to raise a problem before the money leaves.
 *  2. FREEZE — an order the seller never dispatched does not earn. Its amount
 *     is held back until someone has verified what happened.
 *  3. STRIKES — repeat non-dispatch is not an accident. Two frozen orders puts
 *     the account at risk; three sends it for deactivation review.
 *
 * Every function takes `today` rather than reading the clock, so the result is
 * deterministic — and so a server render and a client render cannot disagree
 * about what day it is.
 */

export const HOLD_DAYS = 14;

/** How long a seller has to hand the parcel over before the money is frozen. */
export const DISPATCH_GRACE_DAYS = 3;

/** Frozen orders that put an account at risk, and that send it for review. */
export const AT_RISK_STRIKES = 2;
export const DEACTIVATION_STRIKES = 3;

export type FundState = 'AVAILABLE' | 'ON_HOLD' | 'FROZEN';

export interface Earning {
  orderId: string;
  /** The seller's share of the order, in AED. */
  amount: number;
  /** ISO date the buyer placed it. */
  placedAt: string;
  /** ISO date it reached the buyer, or null. */
  deliveredAt: string | null;
  /** Whether the seller actually handed the parcel to a courier. */
  dispatched: boolean;
}

export interface EarningVerdict {
  state: FundState;
  /** Set for ON_HOLD — the date the money frees up. */
  releaseOn?: string;
  /** Set for ON_HOLD — whole days still to wait, never below zero. */
  daysLeft?: number;
  /** Plain-English why, shown next to the figure. */
  reason: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const atMidnight = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);

export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((atMidnight(toIso) - atMidnight(fromIso)) / DAY_MS);

export const addDays = (iso: string, days: number): string =>
  new Date(atMidnight(iso) + days * DAY_MS).toISOString().slice(0, 10);

/**
 * Where one order's money stands today.
 *
 * Non-dispatch is checked first: a seller cannot earn out of an order they
 * never sent, however long ago it was placed.
 */
export const classifyEarning = (
  earning: Earning,
  today: string
): EarningVerdict => {
  if (!earning.dispatched) {
    const waiting = daysBetween(earning.placedAt, today);

    if (waiting > DISPATCH_GRACE_DAYS)
      return {
        state: 'FROZEN',
        reason: `Not dispatched ${waiting} days after the order was placed.`
      };

    return {
      state: 'ON_HOLD',
      releaseOn: addDays(earning.placedAt, DISPATCH_GRACE_DAYS),
      daysLeft: Math.max(0, DISPATCH_GRACE_DAYS - waiting),
      reason: 'Waiting for you to dispatch this order.'
    };
  }

  if (!earning.deliveredAt)
    return {
      state: 'ON_HOLD',
      reason: 'In transit — the hold starts when the buyer receives it.'
    };

  const held = daysBetween(earning.deliveredAt, today);

  if (held >= HOLD_DAYS)
    return { state: 'AVAILABLE', reason: 'Cleared — ready to withdraw.' };

  return {
    state: 'ON_HOLD',
    releaseOn: addDays(earning.deliveredAt, HOLD_DAYS),
    daysLeft: Math.max(0, HOLD_DAYS - held),
    reason: `Clears ${HOLD_DAYS} days after delivery.`
  };
};

export interface Balances {
  available: number;
  onHold: number;
  frozen: number;
  /** Orders frozen for never being dispatched. */
  frozenOrders: { orderId: string; amount: number; reason: string }[];
}

export const balancesFor = (earnings: Earning[], today: string): Balances => {
  const balances: Balances = {
    available: 0,
    onHold: 0,
    frozen: 0,
    frozenOrders: []
  };

  for (const earning of earnings) {
    const verdict = classifyEarning(earning, today);

    if (verdict.state === 'AVAILABLE') balances.available += earning.amount;
    else if (verdict.state === 'ON_HOLD') balances.onHold += earning.amount;
    else {
      balances.frozen += earning.amount;
      balances.frozenOrders.push({
        orderId: earning.orderId,
        amount: earning.amount,
        reason: verdict.reason
      });
    }
  }

  return balances;
};

export type Standing = 'GOOD' | 'AT_RISK' | 'DEACTIVATION_REVIEW';

export interface AccountStanding {
  standing: Standing;
  /** Orders frozen for non-dispatch. */
  strikes: number;
  /** How many more before the next consequence, null at the end of the road. */
  strikesUntilNext: number | null;
  message: string;
}

/**
 * How the account is doing, counted only from orders the seller never sent —
 * a delayed delivery is the courier's problem, not a strike.
 */
export const accountStanding = (
  earnings: Earning[],
  today: string
): AccountStanding => {
  const strikes = earnings.filter(
    (earning) => classifyEarning(earning, today).state === 'FROZEN'
  ).length;

  if (strikes >= DEACTIVATION_STRIKES)
    return {
      standing: 'DEACTIVATION_REVIEW',
      strikes,
      strikesUntilNext: null,
      message: `${strikes} orders were never dispatched. Your account is under review for deactivation and withdrawals are paused.`
    };

  if (strikes >= AT_RISK_STRIKES)
    return {
      standing: 'AT_RISK',
      strikes,
      strikesUntilNext: DEACTIVATION_STRIKES - strikes,
      message: `${strikes} orders were never dispatched. One more and your account goes for deactivation review.`
    };

  return {
    standing: 'GOOD',
    strikes,
    strikesUntilNext: AT_RISK_STRIKES - strikes,
    message:
      strikes === 0
        ? 'All orders dispatched on time.'
        : 'One order was never dispatched. Its amount is frozen until this is resolved.'
  };
};

/** Withdrawals are verified before they are paid, so nothing is ever instantly "successful". */
export type WithdrawalStatus = 'IN_PROCESS' | 'COMPLETED' | 'REJECTED';

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  IN_PROCESS: 'In process',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected'
};

/** A withdrawal can only be requested against money that has actually cleared. */
export const withdrawalProblem = (
  amount: number,
  balances: Balances,
  standing: Standing
): string | null => {
  if (standing === 'DEACTIVATION_REVIEW')
    return 'Withdrawals are paused while your account is under review.';
  if (!Number.isFinite(amount) || amount <= 0)
    return 'Enter the amount you want to withdraw.';
  if (amount > balances.available)
    return `Only ${balances.available.toLocaleString('en-AE')} AED has cleared. The rest is on hold or frozen.`;
  return null;
};

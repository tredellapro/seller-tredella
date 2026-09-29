/* What a seller's account is allowed to do, and why.
 *
 * Three states, and they are not independent of the money:
 *
 *  ACTIVE       — trading normally.
 *  HOLIDAY      — the seller stepped away. Listings come off the buyer side
 *                 and every product is marked inactive. Coming back does NOT
 *                 put them live again: the seller reactivates what they still
 *                 want to sell, so a stale price or a sold-out line cannot
 *                 quietly reappear.
 *  DEACTIVATED  — the seller asked to delete the account. Nothing is erased
 *                 yet; support can still restore it. That is the whole point
 *                 of not really deleting it.
 *
 * Withdrawals stop in the last two, and stay stopped for a few hours after
 * coming back — long enough for a hijacked account to be noticed before money
 * can be moved out of it.
 *
 * Every function takes `now`, so the result is deterministic and a server
 * render cannot disagree with a client render about the time.
 */

export type AccountStatus = 'ACTIVE' | 'HOLIDAY' | 'DEACTIVATED';

/** Cooling-off window after an account comes back before money can leave. */
export const WITHDRAW_COOLDOWN_HOURS = 4;

/** How long the seller can undo a deletion themselves. */
export const DELETION_GRACE_DAYS = 30;

/** After this, the data is gone and not even support can bring it back. */
export const DATA_RETENTION_MONTHS = 6;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface AccountState {
  status: AccountStatus;
  /** When the account last came back to ACTIVE. Null if it never left. */
  reactivatedAt: string | null;
  /** When the seller asked to delete. Null unless DEACTIVATED. */
  deletionRequestedAt: string | null;
  /** Products taken offline that are waiting for the seller to bring back. */
  inactiveProducts: number;
}

export interface WithdrawGate {
  allowed: boolean;
  /** Plain-English why not. Null when withdrawals are open. */
  reason: string | null;
  /** ISO timestamp withdrawals reopen, when it is just a wait. */
  unlocksAt: string | null;
}

const hoursBetween = (fromIso: string, nowIso: string): number =>
  (Date.parse(nowIso) - Date.parse(fromIso)) / HOUR_MS;

/**
 * Whether money may leave the account right now.
 *
 * A deactivated or paused account cannot withdraw at all; a freshly
 * reactivated one waits out the cooling-off window first.
 */
export const withdrawGate = (
  account: AccountState,
  now: string
): WithdrawGate => {
  if (account.status === 'DEACTIVATED')
    return {
      allowed: false,
      reason:
        'Your account is deactivated. Restore it to withdraw — contact support if the window has passed.',
      unlocksAt: null
    };

  if (account.status === 'HOLIDAY')
    return {
      allowed: false,
      reason:
        'Withdrawals are paused while your account is on holiday. Turn holiday mode off to reopen them.',
      unlocksAt: null
    };

  if (account.reactivatedAt) {
    const elapsed = hoursBetween(account.reactivatedAt, now);

    if (elapsed < WITHDRAW_COOLDOWN_HOURS) {
      const remaining = WITHDRAW_COOLDOWN_HOURS - elapsed;
      const unlocksAt = new Date(
        Date.parse(account.reactivatedAt) + WITHDRAW_COOLDOWN_HOURS * HOUR_MS
      ).toISOString();

      return {
        allowed: false,
        reason: `Your account came back online recently. Withdrawals reopen in ${formatWait(remaining)}.`,
        unlocksAt
      };
    }
  }

  return { allowed: true, reason: null, unlocksAt: null };
};

/** "3 hours 20 minutes", "45 minutes", "1 minute". */
export const formatWait = (hours: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(hours * 60));
  const whole = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (whole === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (minutes === 0) return `${whole} hour${whole === 1 ? '' : 's'}`;
  return `${whole} hour${whole === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export interface DeletionSchedule {
  /** Last day the seller can undo it themselves. */
  restoreBy: string;
  /** When the data is actually destroyed. */
  purgeAt: string;
}

export const deletionSchedule = (requestedAt: string): DeletionSchedule => {
  const requested = Date.parse(requestedAt);
  const purge = new Date(requested);
  purge.setMonth(purge.getMonth() + DATA_RETENTION_MONTHS);

  return {
    restoreBy: new Date(requested + DELETION_GRACE_DAYS * DAY_MS)
      .toISOString()
      .slice(0, 10),
    purgeAt: purge.toISOString().slice(0, 10)
  };
};

/** Whether the seller can still undo the deletion without support. */
export const canSelfRestore = (
  account: AccountState,
  now: string
): boolean => {
  if (account.status !== 'DEACTIVATED' || !account.deletionRequestedAt)
    return false;
  return (
    now.slice(0, 10) <= deletionSchedule(account.deletionRequestedAt).restoreBy
  );
};

/** What turning holiday mode on will do, spelled out before it is switched. */
export const HOLIDAY_EFFECTS = [
  'Your products are hidden from buyers straight away.',
  'Every product is marked inactive — coming back does not relist them.',
  'Withdrawals and order notifications stop until you return.'
];

/**
 * Applies a holiday switch.
 *
 * Turning it ON deactivates the listings. Turning it OFF deliberately leaves
 * them inactive: the seller decides what is still worth selling.
 */
export const applyHoliday = (
  account: AccountState,
  on: boolean,
  liveProducts: number,
  now: string
): AccountState =>
  on
    ? {
        ...account,
        status: 'HOLIDAY',
        inactiveProducts: account.inactiveProducts + liveProducts
      }
    : {
        ...account,
        status: 'ACTIVE',
        reactivatedAt: now
        // inactiveProducts deliberately untouched
      };

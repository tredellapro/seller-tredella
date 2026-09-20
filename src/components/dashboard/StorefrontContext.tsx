'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useQuery } from '@apollo/client';
import { MY_SUBSCRIPTION } from 'graphql/billing';
import {
  modesForPlan,
  readStoredMode,
  storeMode,
  type StorefrontMode
} from 'lib/storefront';
import type { MySubscriptionResult } from 'types/billing';

interface StorefrontValue {
  mode: StorefrontMode;
  setMode: (_mode: StorefrontMode) => void;
  /** The storefronts this seller's plan unlocks. */
  allowed: StorefrontMode[];
  /** False on the retail plan, where there is nothing to switch to. */
  canSwitch: boolean;
  planName: string | null;
  /** True until the subscription has been read. */
  loading: boolean;
}

const StorefrontContext = createContext<StorefrontValue | null>(null);

export function useStorefront(): StorefrontValue {
  const value = useContext(StorefrontContext);
  if (!value)
    throw new Error('useStorefront must be used inside StorefrontProvider');
  return value;
}

/**
 * Holds the chosen storefront for the whole dashboard.
 *
 * Starts on retail — every plan has it — and only then reconciles against the
 * remembered choice and the plan. Reading localStorage during render would
 * make the server and client disagree, which this app has been bitten by
 * before.
 */
export default function StorefrontProvider({
  children
}: {
  children: ReactNode;
}) {
  const [mode, setModeState] = useState<StorefrontMode>('RETAIL');
  const [restored, setRestored] = useState(false);

  const { data, loading } = useQuery<MySubscriptionResult>(MY_SUBSCRIPTION, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const subscription = data?.mySubscription;
  const planCode =
    subscription?.status === 'ACTIVE' ? subscription.plan.code : null;

  const allowed = useMemo(() => modesForPlan(planCode), [planCode]);

  /* Restore the remembered storefront once, on mount. */
  useEffect(() => {
    const stored = readStoredMode();
    if (stored) setModeState(stored);
    setRestored(true);
  }, []);

  /* A plan can shrink — a downgrade, a lapsed subscription — and the mode has
     to follow it down rather than leaving someone on a storefront they no
     longer pay for. Waits for the restore so it judges the real choice. */
  useEffect(() => {
    if (!restored || loading) return;
    if (!allowed.includes(mode)) setModeState(allowed[0]);
  }, [restored, loading, allowed, mode]);

  const setMode = useCallback(
    (next: StorefrontMode) => {
      if (!allowed.includes(next)) return;
      setModeState(next);
      storeMode(next);
    },
    [allowed]
  );

  const value = useMemo<StorefrontValue>(
    () => ({
      mode,
      setMode,
      allowed,
      canSwitch: allowed.length > 1,
      planName: subscription?.plan.name ?? null,
      loading
    }),
    [mode, setMode, allowed, subscription, loading]
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

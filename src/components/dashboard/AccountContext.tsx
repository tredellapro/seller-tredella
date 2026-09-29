'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { ACCOUNT, LIVE_PRODUCT_COUNT, NOW } from 'data/account-sample';
import {
  applyHoliday,
  canSelfRestore,
  withdrawGate,
  type AccountState,
  type WithdrawGate
} from 'lib/accountState';

interface AccountValue {
  account: AccountState;
  /** Evaluated against the demo's fixed clock. */
  now: string;
  gate: WithdrawGate;
  canRestore: boolean;
  liveProducts: number;
  setHoliday: (_on: boolean) => void;
  requestDeletion: () => void;
  restore: () => void;
}

const AccountContext = createContext<AccountValue | null>(null);

export function useAccount(): AccountValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error('useAccount must be used inside AccountProvider');
  return value;
}

/**
 * Holiday mode and deletion are set in Settings but felt in Payments — a
 * paused account cannot withdraw. Holding the state here is what lets one
 * screen's switch change the other's behaviour.
 *
 * Nothing persists: there are no settings mutations on the API yet.
 */
export default function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountState>(ACCOUNT);

  const setHoliday = useCallback(
    (on: boolean) =>
      setAccount((current) =>
        applyHoliday(current, on, on ? LIVE_PRODUCT_COUNT : 0, NOW)
      ),
    []
  );

  const requestDeletion = useCallback(
    () =>
      setAccount((current) => ({
        ...current,
        status: 'DEACTIVATED',
        deletionRequestedAt: NOW
      })),
    []
  );

  const restore = useCallback(
    () =>
      setAccount((current) => ({
        ...current,
        status: 'ACTIVE',
        deletionRequestedAt: null,
        reactivatedAt: NOW
      })),
    []
  );

  const value = useMemo<AccountValue>(
    () => ({
      account,
      now: NOW,
      gate: withdrawGate(account, NOW),
      canRestore: canSelfRestore(account, NOW),
      liveProducts: LIVE_PRODUCT_COUNT,
      setHoliday,
      requestDeletion,
      restore
    }),
    [account, setHoliday, requestDeletion, restore]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

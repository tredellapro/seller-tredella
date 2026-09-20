'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient, useQuery } from '@apollo/client';
import { HiOutlineLogout, HiOutlineRefresh, HiOutlineOfficeBuilding } from 'react-icons/hi';
import NotificationBell from './NotificationBell';
import { MY_SELLER_ACCOUNT } from 'graphql/seller';
import { clearToken } from 'lib/token';
import type { MySellerAccountResult } from 'types/seller';

type StoreMode = 'WHOLESALE' | 'RETAIL';

/** Matches how order numbers are shortened elsewhere. */
const storeId = (id: string): string => `SID-${id.slice(-6).toUpperCase()}`;

export default function DashboardTopBar() {
  const router = useRouter();
  const client = useApolloClient();
  const [mode, setMode] = useState<StoreMode>('WHOLESALE');

  const { data } = useQuery<MySellerAccountResult>(MY_SELLER_ACCOUNT, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });
  const store = data?.mySellerAccount;

  const signOut = async () => {
    clearToken();
    await client.clearStore();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-24 text-gray">
          <HiOutlineOfficeBuilding aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-20 font-semibold text-secondary">
            {store?.name ?? 'Your store'}
          </h1>
          <p className="truncate text-13 text-gray">
            {store ? `Store ID: ${storeId(store.id)}` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* ml-auto keeps the actions on the right once the bar wraps */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Retail and wholesale are separate dashboards in the design; this
            switches between them once those screens exist. */}
        <button
          type="button"
          onClick={() =>
            setMode((m) => (m === 'WHOLESALE' ? 'RETAIL' : 'WHOLESALE'))
          }
          aria-label={`Storefront: ${mode.toLowerCase()}. Switch.`}
          className="flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-2 text-13 text-secondary transition-colors hover:border-primary/40"
        >
          {mode === 'WHOLESALE' ? 'Wholesale' : 'Retail'}
          <HiOutlineRefresh className="text-16 text-gray" aria-hidden="true" />
        </button>

        <NotificationBell />

        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-full text-24 text-secondary transition-colors hover:text-primary"
        >
          <HiOutlineLogout />
        </button>

        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-14 font-semibold text-white"
        >
          {(store?.name ?? '?').trim().charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

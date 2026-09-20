'use client';

import { useRouter } from 'next/navigation';
import { useApolloClient, useQuery } from '@apollo/client';
import {
  HiOutlineLockClosed,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineOfficeBuilding,
  HiOutlineRefresh
} from 'react-icons/hi';
import NotificationBell from './NotificationBell';
import { useStorefront } from './StorefrontContext';
import { MY_SELLER_ACCOUNT } from 'graphql/seller';
import { clearToken } from 'lib/token';
import { MODE_LABEL } from 'lib/storefront';
import type { MySellerAccountResult } from 'types/seller';

/** Matches how order numbers are shortened elsewhere. */
const storeId = (id: string): string => `SID-${id.slice(-6).toUpperCase()}`;

export default function DashboardTopBar({
  onMenuClick
}: {
  /** Opens the sidebar drawer; only rendered below lg, where it is hidden. */
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const client = useApolloClient();
  const { mode, setMode, canSwitch, planName } = useStorefront();

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
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-24 text-secondary transition-colors hover:text-primary lg:hidden"
          >
            <HiOutlineMenu />
          </button>
        )}

        <span className="hidden h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-24 text-gray sm:flex">
          <HiOutlineOfficeBuilding aria-hidden="true" />
        </span>
        <div className="min-w-0">
          {/* Persistent chrome, not the page heading — each page owns its h1 */}
          <p className="truncate text-20 font-semibold text-secondary">
            {store?.name ?? 'Your store'}
          </p>
          <p className="truncate text-13 text-gray">
            {store ? `Store ID: ${storeId(store.id)}` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* ml-auto keeps the actions on the right once the bar wraps */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Retail and wholesale are separate storefronts. Everything below the
            bar — figures, orders, products, the product form — follows this. */}
        {canSwitch ? (
          <button
            type="button"
            onClick={() => setMode(mode === 'WHOLESALE' ? 'RETAIL' : 'WHOLESALE')}
            aria-label={`Storefront: ${MODE_LABEL[mode]}. Switch to ${
              mode === 'WHOLESALE' ? 'retail' : 'wholesale'
            }.`}
            className="flex items-center gap-2 rounded-full border border-secondary/15 bg-white px-4 py-2 text-13 text-secondary transition-colors hover:border-primary/40"
          >
            {MODE_LABEL[mode]}
            <HiOutlineRefresh className="text-16 text-gray" aria-hidden="true" />
          </button>
        ) : (
          /* The retail plan has no second storefront, so there is nothing to
             press — a dead button would only invite the question. */
          <span
            title={`${planName ?? 'Your plan'} covers retail selling. Upgrade to add wholesale.`}
            className="flex items-center gap-2 rounded-full border border-secondary/15 bg-background px-4 py-2 text-13 text-gray"
          >
            {MODE_LABEL[mode]}
            <HiOutlineLockClosed className="text-14" aria-hidden="true" />
            <span className="sr-only">
              — your plan covers retail only. Upgrade to add wholesale.
            </span>
          </span>
        )}

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

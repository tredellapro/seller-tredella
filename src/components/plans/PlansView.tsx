'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { HiOutlineCheckCircle, HiOutlineShoppingBag } from 'react-icons/hi';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import PlanCard from 'components/billing/PlanCard';
import Modal from 'components/ui/Modal';
import {
  CANCEL_SUBSCRIPTION,
  GET_PLANS,
  MY_SUBSCRIPTION,
  SUBSCRIBE_TO_PLAN
} from 'graphql/billing';
import { MODE_LABEL, modesForPlan } from 'lib/storefront';
import { errorMessage } from 'utils/graphqlError';
import type {
  BillingInterval,
  GetPlansResult,
  MySubscriptionResult,
  SubscribeToPlanResult
} from 'types/billing';

const TABS = ['Purchase Plan', 'Membership Information'] as const;
type Tab = (typeof TABS)[number];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/** ISO timestamp → "09 Mar 2025", without Intl (its data differs Node vs browser). */
const onDate = (value: string): string => {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');
  return `${day} ${MONTHS[Number(month) - 1] ?? month} ${year}`;
};

export default function PlansView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Purchase Plan');
  const [choosing, setChoosing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: plansData, loading: plansLoading } =
    useQuery<GetPlansResult>(GET_PLANS);

  const { data: subData, loading: subLoading } = useQuery<MySubscriptionResult>(
    MY_SUBSCRIPTION,
    { fetchPolicy: 'cache-and-network' }
  );

  const [subscribe] = useMutation<SubscribeToPlanResult>(SUBSCRIBE_TO_PLAN, {
    refetchQueries: [{ query: MY_SUBSCRIPTION }]
  });
  const [cancel, { loading: cancelling }] = useMutation(CANCEL_SUBSCRIPTION, {
    refetchQueries: [{ query: MY_SUBSCRIPTION }]
  });

  const subscription = subData?.mySubscription ?? null;
  const active = subscription?.status === 'ACTIVE';
  const currentPlanCode = active ? subscription.plan.code : null;

  /* What this plan actually unlocks — the storefronts, which is the whole
     difference between the two tiers. */
  const modes = modesForPlan(currentPlanCode);

  const choose = async (planCode: string) => {
    setError(null);
    setNotice(null);
    setChoosing(planCode);

    try {
      /* Plans are monthly. The API still takes an interval, so it is pinned
         here rather than asked for. */
      const { data } = await subscribe({
        variables: { planCode, interval: 'MONTHLY' satisfies BillingInterval }
      });

      const checkoutUrl = data?.subscribeToPlan?.checkoutUrl;
      if (checkoutUrl) {
        // a gateway is connected: hand the seller to its hosted page
        window.location.href = checkoutUrl;
        return;
      }

      const name = data?.subscribeToPlan?.subscription?.plan?.name ?? 'your plan';
      setNotice(`You are now on ${name}.`);
      setChoosing(null);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, 'Could not change that plan.'));
      setChoosing(null);
    }
  };

  const cancelPlan = async () => {
    setError(null);
    try {
      await cancel();
      setConfirmCancel(false);
      setNotice(
        'Your plan is cancelled. You keep access until the end of the current period.'
      );
    } catch (err) {
      setConfirmCancel(false);
      setError(errorMessage(err, 'Could not cancel that plan.'));
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Plans & Membership"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Plans', href: '/dashboard/plans' },
          { label: 'Plans & Membership' }
        ]}
      />

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Plan sections"
          className="flex min-w-max gap-6 border-b border-secondary/10"
        >
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`relative whitespace-nowrap pb-3 text-14 transition-colors ${
                tab === name
                  ? 'font-medium text-primary'
                  : 'text-gray hover:text-secondary'
              }`}
            >
              {name}
              {tab === name && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          {error}
        </p>
      )}

      {tab === 'Purchase Plan' && (
        <div className="flex flex-col gap-6">
          {plansLoading ? (
            <p className="py-10 text-center text-14 text-gray">Loading plans…</p>
          ) : (
            /* Exactly two, side by side — there is no third tier, and no
               billing period to pick: everything is monthly. */
            <div className="mx-auto grid w-full max-w-[900px] gap-6 md:grid-cols-2">
              {plansData?.getPlans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  current={plan.code === currentPlanCode}
                  loading={choosing === plan.code}
                  disabled={choosing !== null}
                  ctaLabel={currentPlanCode ? 'Switch to this plan' : 'Buy Now'}
                  onChoose={choose}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Membership Information' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,460px)_1fr]">
          <Panel>
            <h2 className="text-14 font-semibold text-secondary">
              Current Membership
            </h2>

            {subLoading && !subscription ? (
              <p className="mt-4 text-13 text-gray">Loading…</p>
            ) : subscription ? (
              <div className="mt-4 flex flex-col gap-4">
                <DetailRows
                  rows={[
                    { label: 'Plan', value: subscription.plan.name, emphasis: true },
                    {
                      label: 'Price',
                      value: `${subscription.currency} ${subscription.amount} per month`
                    },
                    { label: 'Status', value: subscription.status },
                    {
                      label: 'Started',
                      value: onDate(subscription.currentPeriodStart)
                    },
                    {
                      label:
                        subscription.cancelledAt || !subscription.autoRenew
                          ? 'Access until'
                          : 'Renews on',
                      value: onDate(subscription.currentPeriodEnd)
                    },
                    {
                      label: 'Auto renew',
                      value: subscription.autoRenew ? 'On' : 'Off'
                    }
                  ]}
                />

                {active && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="w-full rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    Cancel membership
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-secondary/20 px-4 py-8 text-center text-13 text-gray">
                No active plan. Pick one from Purchase Plan to start selling.
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="text-14 font-semibold text-secondary">
              What your plan unlocks
            </h2>
            <p className="mt-1 text-12 text-gray">
              Your plan decides which storefronts you can sell through.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {(['RETAIL', 'WHOLESALE'] as const).map((mode) => {
                const included = modes.includes(mode);
                return (
                  <li
                    key={mode}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 ${
                      included
                        ? 'border-primary/25 bg-primary/5'
                        : 'border-secondary/10'
                    }`}
                  >
                    <HiOutlineShoppingBag
                      aria-hidden="true"
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        included ? 'text-primary' : 'text-gray'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-13 font-medium text-secondary">
                        {MODE_LABEL[mode]} storefront
                        {!included && (
                          <span className="ml-2 text-12 font-normal text-gray">
                            Not on your plan
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-12 text-gray">
                        {mode === 'RETAIL'
                          ? 'Sell single units to shoppers, with a discount price and per-order limits.'
                          : 'Sell in bulk with quantity price tiers, minimum order quantities and purchase invoices.'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {modes.length === 1 && (
              <p className="mt-4 text-12 text-gray">
                Moving to Wholesale + Retail adds the wholesale storefront —
                your existing listings come with you.
              </p>
            )}
          </Panel>
        </div>
      )}

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel membership"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Keep plan
            </button>
            <button
              type="button"
              onClick={() => void cancelPlan()}
              disabled={cancelling}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {cancelling ? 'Cancelling…' : 'Cancel membership'}
            </button>
          </>
        }
      >
        <p className="text-13 text-gray">
          Your listings stay up until{' '}
          <span className="font-medium text-secondary">
            {subscription ? onDate(subscription.currentPeriodEnd) : 'the end of the period'}
          </span>
          . After that they are hidden from buyers until you pick a plan again.
        </p>
      </Modal>
    </div>
  );
}

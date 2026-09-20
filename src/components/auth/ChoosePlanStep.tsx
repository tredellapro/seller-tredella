'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import FormError from './FormError';
import StepIndicator from './StepIndicator';
import IntervalToggle from 'components/billing/IntervalToggle';
import PlanCard from 'components/billing/PlanCard';
import { GET_PLANS, MY_SUBSCRIPTION, SUBSCRIBE_TO_PLAN } from 'graphql/billing';
import { errorMessage } from 'utils/graphqlError';
import type {
  BillingInterval,
  GetPlansResult,
  MySubscriptionResult,
  SubscribeToPlanResult
} from 'types/billing';

/* Plans come from the API rather than being hardcoded, so prices can change
   without a release. Nothing is charged yet — no gateway is connected — but the
   flow already follows checkoutUrl, so wiring a bank in needs no change here. */
export default function ChoosePlanStep({ steps }: { steps: string[] }) {
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>('MONTHLY');
  const [choosing, setChoosing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery<GetPlansResult>(GET_PLANS);
  const { data: current } = useQuery<MySubscriptionResult>(MY_SUBSCRIPTION, {
    fetchPolicy: 'network-only'
  });
  const [subscribe] = useMutation<SubscribeToPlanResult>(SUBSCRIBE_TO_PLAN, {
    refetchQueries: [{ query: MY_SUBSCRIPTION }]
  });

  const currentPlanCode =
    current?.mySubscription?.status === 'ACTIVE'
      ? current.mySubscription.plan.code
      : null;

  const choose = async (planCode: string) => {
    setError(null);
    setChoosing(planCode);
    try {
      const { data: result } = await subscribe({
        variables: { planCode, interval }
      });

      const checkoutUrl = result?.subscribeToPlan?.checkoutUrl;
      if (checkoutUrl) {
        // a gateway is connected: hand the seller over to its hosted page
        window.location.href = checkoutUrl;
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, 'Could not set up that plan.'));
      setChoosing(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="text-center">
        <h1 className="text-24 font-semibold text-secondary sm:text-30">
          Flexible Plans That Grow With Your Business
        </h1>
        <p className="mt-2 text-13 text-gray">Enjoy 0% Commission Fees</p>
      </div>

      <StepIndicator steps={steps} current={3} />

      <div className="mt-6">
        <IntervalToggle value={interval} onChange={setInterval} />
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-[520px]">
          <FormError message={error} />
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-center text-14 text-gray">Loading plans…</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {data?.getPlans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              interval={interval}
              current={plan.code === currentPlanCode}
              loading={choosing === plan.code}
              disabled={choosing !== null}
              onChoose={choose}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-12 text-gray">
        You can change or cancel your plan at any time from your dashboard.
      </p>
    </div>
  );
}

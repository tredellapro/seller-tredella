'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import AuthCard from './AuthCard';
import AuthHeader from './AuthHeader';
import StepIndicator from './StepIndicator';
import SignUpForm from './SignUpForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import ChoosePlanStep from './ChoosePlanStep';
import { MY_SELLER_ACCOUNT } from 'graphql/seller';
import { getToken } from 'lib/token';
import type { MySellerAccountResult } from 'types/seller';

const STEPS = ['Account', 'Business details', 'Plan'];

/* Three steps behind one URL. Splitting them means the account exists before
   any document is uploaded, so files go up authenticated and nothing is left
   orphaned by someone who abandons halfway. */
export default function SignUpFlow() {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');

  const hasSession = typeof window !== 'undefined' && Boolean(getToken());

  /* Resuming has to read the server, not just the cookie: a reload on the plan
     step would otherwise land back on a registration form that has already been
     submitted, which the API rightly refuses. */
  const { data, loading } = useQuery<MySellerAccountResult>(MY_SELLER_ACCOUNT, {
    skip: !hasSession,
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (!hasSession) {
      setStep(1);
      return;
    }
    if (loading) return;

    const status = data?.mySellerAccount?.verificationStatus;
    setStep(status && status !== 'UNSUBMITTED' ? 3 : 2);
  }, [hasSession, loading, data]);

  if (step === null) return null;

  // the plan step is wider than the form card and carries its own Skip action
  if (step === 3) {
    return (
      <>
        <AuthHeader cta="skip" onSkip={() => router.push('/dashboard')} />
        <main className="relative z-10 flex flex-1 justify-center px-4 pb-16 pt-4">
          <ChoosePlanStep steps={STEPS} />
        </main>
      </>
    );
  }

  return (
    <>
      <AuthHeader cta="signin" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        {step === 1 ? (
          <AuthCard
            title="Create Your Account"
            subtitle="Please fill all forms to continue"
            header={<StepIndicator steps={STEPS} current={1} />}
          >
            <SignUpForm
              onRegistered={(name) => {
                setFullName(name);
                setStep(2);
              }}
            />
          </AuthCard>
        ) : (
          <AuthCard
            size="wide"
            title="Business Details"
            subtitle="UAE sellers trade under a licence — add yours to start selling"
            header={<StepIndicator steps={STEPS} current={2} />}
          >
            <BusinessDetailsForm
              defaultStoreName={fullName}
              onSubmitted={() => setStep(3)}
            />
          </AuthCard>
        )}
      </main>
    </>
  );
}

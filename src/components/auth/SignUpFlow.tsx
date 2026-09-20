'use client';

import { useEffect, useState } from 'react';
import AuthCard from './AuthCard';
import StepIndicator from './StepIndicator';
import SignUpForm from './SignUpForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import { getToken } from 'lib/token';

const STEPS = ['Account', 'Business details'];

/* Two steps behind one URL. Splitting them means the account exists before any
   document is uploaded, so files go up authenticated and nothing is left
   orphaned by someone who abandons halfway. */
export default function SignUpFlow() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [checkedSession, setCheckedSession] = useState(false);

  /* A reload mid-registration would otherwise drop them back on step one, where
     their own email now reads as taken. */
  useEffect(() => {
    if (getToken()) setStep(2);
    setCheckedSession(true);
  }, []);

  if (!checkedSession) return null;

  if (step === 1) {
    return (
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
    );
  }

  return (
    <AuthCard
      size="wide"
      title="Business Details"
      subtitle="UAE sellers trade under a licence — add yours to start selling"
      header={<StepIndicator steps={STEPS} current={2} />}
    >
      <BusinessDetailsForm defaultStoreName={fullName} />
    </AuthCard>
  );
}

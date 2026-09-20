'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { HiOutlineClock, HiOutlineLockClosed } from 'react-icons/hi';
import AuthCard from './AuthCard';
import FormError from './FormError';
import OtpInput from 'components/ui/OtpInput';
import PasswordField from 'components/ui/PasswordField';
import Button from 'components/ui/Button';
import {
  REQUEST_PASSWORD_RESET_CODE,
  RESET_PASSWORD,
  VERIFY_PASSWORD_RESET_CODE
} from 'graphql/auth';
import { setToken } from 'lib/token';
import { errorMessage } from 'utils/graphqlError';
import type {
  RequestPasswordResetCodeResult,
  ResetPasswordResult,
  VerifyPasswordResetCodeResult
} from 'types/auth';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 90;
const MIN_PASSWORD = 6;

const passwordSchema = Yup.object({
  password: Yup.string()
    .min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`)
    .required('Enter a new password.'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match.')
    .required('Confirm your new password.')
});

const mmss = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

const lockIcon = (
  <span className="flex_center h-12 w-12 rounded-xl text-30 text-primary">
    <HiOutlineLockClosed />
  </span>
);

export default function ResetPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  /* Set once the code is accepted; it is what actually authorises the change,
     so reaching step two without it is impossible. */
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [verifyCode, { loading: verifying }] =
    useMutation<VerifyPasswordResetCodeResult>(VERIFY_PASSWORD_RESET_CODE);
  const [resetPassword, { loading: resetting }] =
    useMutation<ResetPasswordResult>(RESET_PASSWORD);
  const [requestCode, { loading: resending }] =
    useMutation<RequestPasswordResetCodeResult>(REQUEST_PASSWORD_RESET_CODE);

  // nothing to verify against without an address — send them back to ask for one
  useEffect(() => {
    if (!email) router.replace('/forgot-password');
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const submitCode = useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH) {
        setError('Enter all six digits.');
        return;
      }
      setError(null);
      try {
        const { data } = await verifyCode({
          variables: { email, code: value }
        });
        const token = data?.verifyPasswordResetCode?.token;
        if (!token) throw new Error('That code was not accepted.');
        setResetToken(token);
      } catch (err) {
        setError(errorMessage(err, 'That code was not accepted.'));
        setCode('');
      }
    },
    [email, verifyCode]
  );

  const resend = async () => {
    if (secondsLeft > 0 || resending) return;
    setError(null);
    setCode('');
    try {
      await requestCode({ variables: { email } });
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(errorMessage(err, 'Could not send a new code.'));
    }
  };

  const passwordForm = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      if (!resetToken) return;
      setError(null);
      try {
        const { data } = await resetPassword({
          variables: { token: resetToken, newPassword: values.password }
        });
        if (!data?.resetPassword?.token)
          throw new Error('Could not save your new password.');

        // the API signs the seller straight back in
        setToken(data.resetPassword.token);
        router.push('/dashboard');
        router.refresh();
      } catch (err) {
        setError(errorMessage(err, 'Could not save your new password.'));
      }
    }
  });

  /* ---------------- step 2: choose the new password ---------------- */

  if (resetToken) {
    return (
      <AuthCard
        icon={lockIcon}
        title="Reset Password"
        subtitle="Now carefully enter new password"
      >
        <form
          onSubmit={passwordForm.handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <FormError message={error} />

          <PasswordField
            name="password"
            label="New Password"
            autoComplete="new-password"
            value={passwordForm.values.password}
            onChange={passwordForm.handleChange}
            onBlur={passwordForm.handleBlur}
            error={
              passwordForm.touched.password && passwordForm.errors.password
            }
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            value={passwordForm.values.confirmPassword}
            onChange={passwordForm.handleChange}
            onBlur={passwordForm.handleBlur}
            error={
              passwordForm.touched.confirmPassword &&
              passwordForm.errors.confirmPassword
            }
          />

          <div className="mt-1 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-w-[150px]"
              onClick={() => {
                setResetToken(null);
                setCode('');
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="min-w-[150px]"
              loading={resetting}
            >
              {resetting ? 'Saving…' : 'Reset'}
            </Button>
          </div>
        </form>
      </AuthCard>
    );
  }

  /* ---------------- step 1: enter the emailed code ---------------- */

  return (
    <AuthCard
      icon={lockIcon}
      title="Reset Password"
      subtitle={
        <>
          <p>
            Enter the {CODE_LENGTH}-digit code we sent to{' '}
            <span className="text-secondary">{email}</span>
          </p>
          <p className="mt-1">
            Didn&apos;t receive a code?{' '}
            <button
              type="button"
              onClick={resend}
              disabled={secondsLeft > 0 || resending}
              className="font-semibold text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Try again.
            </button>
          </p>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitCode(code);
        }}
        className="flex flex-col gap-6"
      >
        <p className="flex items-center justify-center gap-2 text-13 text-gray">
          <HiOutlineClock className="text-15" />
          {secondsLeft > 0 ? (
            <>
              Resend Code in{' '}
              <span className="text-primary">{mmss(secondsLeft)}</span>
            </>
          ) : (
            <span>You can request a new code now.</span>
          )}
        </p>

        <FormError message={error} />

        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          onComplete={(value) => void submitCode(value)}
          length={CODE_LENGTH}
          disabled={verifying}
        />

        <div className="mt-1 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-w-[150px]"
            onClick={() => router.push('/forgot-password')}
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-w-[150px]"
            loading={verifying}
            disabled={code.length !== CODE_LENGTH}
          >
            {verifying ? 'Checking…' : 'Confirm'}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}

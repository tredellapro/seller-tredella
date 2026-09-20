'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { HiOutlineMail } from 'react-icons/hi';
import AuthCard from './AuthCard';
import FormError from './FormError';
import TextField from 'components/ui/TextField';
import Button from 'components/ui/Button';
import { REQUEST_PASSWORD_RESET_CODE } from 'graphql/auth';
import { errorMessage } from 'utils/graphqlError';
import type { RequestPasswordResetCodeResult } from 'types/auth';

const schema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.')
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [requestCode, { loading }] = useMutation<RequestPasswordResetCodeResult>(
    REQUEST_PASSWORD_RESET_CODE
  );

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitError(null);
      const email = values.email.trim();
      try {
        await requestCode({ variables: { email } });
        /* The API answers the same way for unknown addresses so it cannot be
           used to discover who has an account — so always move on. */
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } catch (error) {
        setSubmitError(errorMessage(error, 'Could not send your code.'));
      }
    }
  });

  return (
    <AuthCard title="Forgot Password?">
      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 text-13 text-gray">
          <p>
            No problem! Just confirm your email address below, and we&apos;ll
            send you a 6-digit code to reset your password.
          </p>
          <p>
            Don&apos;t worry, it&apos;s quick, safe, and easy to get back into
            your account.
          </p>
        </div>

        <FormError message={submitError} />

        <TextField
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          leadingIcon={<HiOutlineMail />}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Sending…' : 'Send Code'}
        </Button>

        <Link
          href="/login"
          className="text-center text-13 text-gray transition-colors hover:text-secondary"
        >
          Back to Login
        </Link>
      </form>
    </AuthCard>
  );
}

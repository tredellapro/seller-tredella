'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthCard from './AuthCard';
import FormError from './FormError';
import TextField from 'components/ui/TextField';
import PasswordField from 'components/ui/PasswordField';
import Button from 'components/ui/Button';
import { LOGIN_SELLER } from 'graphql/auth';
import { setToken } from 'lib/token';
import { errorMessage } from 'utils/graphqlError';
import type { LoginResult } from 'types/auth';

const schema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string().required('Password is required.')
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [login, { loading }] = useMutation<LoginResult>(LOGIN_SELLER);

  // ?next= lets a guarded page send the seller back where they were headed
  const next = searchParams.get('next') || '/dashboard';

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitError(null);
      try {
        const { data } = await login({
          variables: {
            email: values.email.trim(),
            password: values.password
          }
        });
        if (!data?.login?.token) throw new Error('Sign in failed.');

        setToken(data.login.token);
        router.push(next);
        router.refresh();
      } catch (error) {
        setSubmitError(errorMessage(error, 'Could not sign you in.'));
      }
    }
  });

  const fieldError = (name: 'email' | 'password') =>
    formik.touched[name] && formik.errors[name];

  return (
    <AuthCard
      title="Welcome To Tredella"
      subtitle="Login with Email and Password"
    >
      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-5">
        <FormError message={submitError} />

        <TextField
          name="email"
          type="email"
          label="Email"
          placeholder="example@gmail.com"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('email')}
        />

        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('password')}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>

        <Link
          href="/forgot-password"
          className="text-center text-13 text-gray transition-colors hover:text-secondary"
        >
          Forgot password?
        </Link>

        <p className="text-center text-13 text-gray">
          New to Tredella?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

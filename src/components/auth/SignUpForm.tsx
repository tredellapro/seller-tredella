'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormError from './FormError';
import TextField from 'components/ui/TextField';
import PasswordField from 'components/ui/PasswordField';
import CountrySelect from 'components/ui/CountrySelect';
import Checkbox from 'components/ui/Checkbox';
import Button from 'components/ui/Button';
import { REGISTER_SELLER } from 'graphql/auth';
import { setToken } from 'lib/token';
import { countryName } from 'data/countries';
import { errorMessage } from 'utils/graphqlError';
import type { RegisterSellerResult } from 'types/auth';

const MIN_PASSWORD = 6;

const schema = Yup.object({
  firstName: Yup.string().trim().required('First name is required.'),
  lastName: Yup.string().trim().required('Last name is required.'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  country: Yup.string().required('Select your country.'),
  password: Yup.string()
    .min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`)
    .required('Password is required.'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match.')
    .required('Confirm your password.'),
  acceptedTerms: Yup.boolean().oneOf(
    [true],
    'Please accept the Terms & Conditions.'
  )
});

type Values = Yup.InferType<typeof schema>;

/** Step one: create the login. Trade registration follows in step two. */
export default function SignUpForm({
  onRegistered
}: {
  onRegistered: (_fullName: string) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [registerSeller, { loading }] =
    useMutation<RegisterSellerResult>(REGISTER_SELLER);

  const formik = useFormik<Values>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      country: 'AE',
      password: '',
      confirmPassword: '',
      acceptedTerms: false
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitError(null);
      try {
        const { data } = await registerSeller({
          variables: {
            input: {
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email: values.email.trim(),
              password: values.password,
              // the API stores a readable country, not the ISO code
              country: countryName(values.country)
            }
          }
        });
        if (!data?.registerSeller?.token)
          throw new Error('Could not create your account.');

        // signed in from here on, so step two can upload documents
        setToken(data.registerSeller.token);
        onRegistered(data.registerSeller.user.name);
      } catch (error) {
        setSubmitError(errorMessage(error, 'Could not create your account.'));
      }
    }
  });

  const fieldError = (name: keyof Values) =>
    formik.touched[name] && (formik.errors[name] as string | undefined);

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-5">
      <FormError message={submitError} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="firstName"
          label="First name"
          placeholder="Hamza"
          autoComplete="given-name"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('firstName')}
        />
        <TextField
          name="lastName"
          label="Last Name"
          placeholder="Tariq"
          autoComplete="family-name"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('lastName')}
        />
      </div>

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

      <CountrySelect
        name="country"
        label="Country"
        value={formik.values.country}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('country')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('password')}
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm Password"
          autoComplete="new-password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('confirmPassword')}
        />
      </div>

      <Checkbox
        name="acceptedTerms"
        checked={formik.values.acceptedTerms}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('acceptedTerms')}
        label={
          <>
            By signing up, you agree to{' '}
            <Link
              href="/terms-and-conditions"
              className="font-medium text-secondary underline"
            >
              Terms &amp; Condition
            </Link>
          </>
        }
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
}

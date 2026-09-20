'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormError from './FormError';
import TextField from 'components/ui/TextField';
import SelectField from 'components/ui/SelectField';
import FileUpload, { type UploadedFileInfo } from 'components/ui/FileUpload';
import Button from 'components/ui/Button';
import {
  MY_SELLER_ACCOUNT,
  REMOVE_SELLER_DOCUMENT,
  SUBMIT_SELLER_VERIFICATION
} from 'graphql/seller';
import { uploadSellerDocument } from 'lib/api';
import { EMIRATES, LEGAL_FORMS, SELLER_DOCUMENTS } from 'data/uae-business';
import { errorMessage } from 'utils/graphqlError';
import type {
  MySellerAccountResult,
  RemoveSellerDocumentResult,
  SubmitSellerVerificationResult
} from 'types/seller';

/* UAE trade registration. The account already exists at this point, so uploads
   go up authenticated and are attached to the store straight away. */

/* People type these the way they are printed — with spaces and dashes — so
   validate the digits, exactly as the API does, rather than the punctuation. */
const digitsOf = (value: string): string => value.replace(/\D/g, '');

const isUaeMobile = (value: string): boolean => {
  const local = digitsOf(value)
    .replace(/^00971/, '')
    .replace(/^971/, '')
    .replace(/^0/, '');
  return /^5\d{8}$/.test(local);
};

const isEmiratesId = (value: string): boolean => {
  const digits = digitsOf(value);
  return digits.length === 15 && digits.startsWith('784');
};

const schema = Yup.object({
  storeName: Yup.string().trim().required('Enter the name buyers will see.'),
  legalName: Yup.string()
    .trim()
    .required('Enter the name printed on your trade licence.'),
  legalForm: Yup.string().required('Select your legal form.'),
  emirate: Yup.string().required('Select the emirate you are licensed in.'),
  addressLine: Yup.string().trim().required('Enter your business address.'),
  phone: Yup.string()
    .trim()
    .required('Enter a contact number.')
    .test(
      'uae-mobile',
      'Enter a UAE mobile number, for example +971 50 123 4567.',
      (value) => (value ? isUaeMobile(value) : false)
    ),
  tradeLicenseNumber: Yup.string()
    .trim()
    .required('Enter your trade licence number.'),
  tradeLicenseExpiry: Yup.string()
    .required('Enter the licence expiry date.')
    .test('future', 'That licence has already expired.', (value) =>
      value ? new Date(value) >= new Date(new Date().toDateString()) : false
    ),
  emiratesIdNumber: Yup.string()
    .trim()
    .required('Enter your Emirates ID number.')
    .test(
      'emirates-id',
      'Emirates ID looks like 784-1990-1234567-1.',
      (value) => (value ? isEmiratesId(value) : false)
    ),
  trn: Yup.string()
    .trim()
    .test('trn', 'A TRN is 15 digits.', (value) =>
      !value ? true : digitsOf(value).length === 15
    )
});

type Values = Yup.InferType<typeof schema>;
type DocumentState = Record<string, UploadedFileInfo | null>;

export default function BusinessDetailsForm({
  defaultStoreName = ''
}: {
  defaultStoreName?: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentState>({});
  const [progress, setProgress] = useState<Record<string, number | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [docsTouched, setDocsTouched] = useState(false);

  const { data: accountData } = useQuery<MySellerAccountResult>(
    MY_SELLER_ACCOUNT,
    { fetchPolicy: 'network-only' }
  );
  const [submitVerification, { loading: submitting }] =
    useMutation<SubmitSellerVerificationResult>(SUBMIT_SELLER_VERIFICATION);
  const [removeDocument] = useMutation<RemoveSellerDocumentResult>(
    REMOVE_SELLER_DOCUMENT
  );

  // a half-finished registration survives a reload, so show what is on file
  useEffect(() => {
    const account = accountData?.mySellerAccount;
    if (!account) return;
    setDocuments(
      Object.fromEntries(
        account.documents.map((d) => [
          d.type,
          {
            fileName: d.fileName,
            sizeBytes: d.sizeBytes,
            mimeType: d.mimeType,
            url: d.url
          }
        ])
      )
    );
  }, [accountData]);

  const upload = useCallback(async (type: string, file: File) => {
    setUploadErrors((prev) => ({ ...prev, [type]: '' }));
    setProgress((prev) => ({ ...prev, [type]: 0 }));
    try {
      const saved = await uploadSellerDocument(type, file, (percent) =>
        setProgress((prev) => ({ ...prev, [type]: percent }))
      );
      setDocuments((prev) => ({
        ...prev,
        [type]: {
          fileName: saved.fileName,
          sizeBytes: saved.sizeBytes,
          mimeType: saved.mimeType,
          url: saved.url
        }
      }));
    } catch (error) {
      setUploadErrors((prev) => ({
        ...prev,
        [type]: errorMessage(error, 'Could not upload that file.')
      }));
    } finally {
      setProgress((prev) => ({ ...prev, [type]: null }));
    }
  }, []);

  /* Clear the stored file too, not just the tile — otherwise the server would
     still hold a document the seller thinks they removed. */
  const remove = useCallback(
    async (type: string) => {
      setUploadErrors((prev) => ({ ...prev, [type]: '' }));
      try {
        await removeDocument({ variables: { type } });
        setDocuments((prev) => ({ ...prev, [type]: null }));
      } catch (error) {
        setUploadErrors((prev) => ({
          ...prev,
          [type]: errorMessage(error, 'Could not remove that file.')
        }));
      }
    },
    [removeDocument]
  );

  const missingRequired = SELLER_DOCUMENTS.filter(
    (doc) => doc.required && !documents[doc.type]
  );

  const formik = useFormik<Values>({
    enableReinitialize: true,
    initialValues: {
      storeName: accountData?.mySellerAccount?.name ?? defaultStoreName,
      legalName: '',
      legalForm: '',
      emirate: '',
      addressLine: '',
      phone: '',
      tradeLicenseNumber: '',
      tradeLicenseExpiry: '',
      emiratesIdNumber: '',
      trn: ''
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitError(null);
      setDocsTouched(true);
      if (missingRequired.length) return;

      try {
        await submitVerification({
          variables: {
            input: {
              storeName: values.storeName.trim(),
              legalName: values.legalName.trim(),
              legalForm: values.legalForm,
              emirate: values.emirate,
              addressLine: values.addressLine.trim(),
              phone: values.phone.trim(),
              tradeLicenseNumber: values.tradeLicenseNumber.trim(),
              tradeLicenseExpiry: values.tradeLicenseExpiry,
              emiratesIdNumber: values.emiratesIdNumber.trim(),
              trn: values.trn?.trim() || null
            }
          }
        });
        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        setSubmitError(errorMessage(error, 'Could not submit your details.'));
      }
    }
  });

  const fieldError = (name: keyof Values) =>
    formik.touched[name] && (formik.errors[name] as string | undefined);

  // today onwards — a licence cannot expire in the past
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={formik.handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormError message={submitError} />

      <TextField
        name="storeName"
        label="Store name"
        placeholder="Myra House"
        value={formik.values.storeName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('storeName')}
      />

      <TextField
        name="legalName"
        label="Legal name (as on trade licence)"
        placeholder="Myra House Trading LLC"
        value={formik.values.legalName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('legalName')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="legalForm"
          label="Legal form"
          placeholder="Select legal form"
          options={LEGAL_FORMS}
          value={formik.values.legalForm}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('legalForm')}
        />
        <SelectField
          name="emirate"
          label="Emirate"
          placeholder="Select emirate"
          options={EMIRATES}
          value={formik.values.emirate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('emirate')}
        />
      </div>

      <TextField
        name="addressLine"
        label="Business address"
        placeholder="Office 501, Business Bay, Dubai"
        autoComplete="street-address"
        value={formik.values.addressLine}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('addressLine')}
      />

      <TextField
        name="phone"
        type="tel"
        label="Contact number"
        placeholder="+971 50 123 4567"
        autoComplete="tel"
        value={formik.values.phone}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('phone')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="tradeLicenseNumber"
          label="Trade licence number"
          placeholder="CN-1234567"
          value={formik.values.tradeLicenseNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('tradeLicenseNumber')}
        />
        <TextField
          name="tradeLicenseExpiry"
          type="date"
          label="Licence expiry"
          min={todayIso}
          value={formik.values.tradeLicenseExpiry}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('tradeLicenseExpiry')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="emiratesIdNumber"
          label="Emirates ID number"
          placeholder="784-1990-1234567-1"
          value={formik.values.emiratesIdNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('emiratesIdNumber')}
        />
        <TextField
          name="trn"
          label="TRN (VAT number)"
          placeholder="100123456700003"
          value={formik.values.trn ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={fieldError('trn')}
        />
      </div>

      <p className="-mt-2 text-12 text-gray">
        VAT registration is only required above AED 375,000 annual turnover.
        Leave the TRN empty if it does not apply — but if you enter one, upload
        the VAT certificate too.
      </p>

      <div className="mt-2 flex flex-col gap-4 border-t border-secondary/10 pt-6">
        <div>
          <h2 className="text-16 font-semibold text-secondary">Documents</h2>
          <p className="mt-1 text-13 text-gray">
            Clear scans or photos. We check these before your store goes live.
          </p>
        </div>

        {SELLER_DOCUMENTS.map((doc) => (
          <FileUpload
            key={doc.type}
            label={doc.label}
            hint={doc.hint}
            required={doc.required}
            value={documents[doc.type] ?? null}
            progress={progress[doc.type] ?? null}
            error={
              uploadErrors[doc.type] ||
              (docsTouched &&
                doc.required &&
                !documents[doc.type] &&
                `${doc.label} is required.`)
            }
            onSelect={(file) => upload(doc.type, file)}
            onRemove={() => remove(doc.type)}
          />
        ))}
      </div>

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitting ? 'Submitting…' : 'Submit for review'}
      </Button>

      <p className="text-center text-12 text-gray">
        Your store stays hidden from buyers until our team approves your licence.
      </p>
    </form>
  );
}

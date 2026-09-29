'use client';

import { useRef, useState } from 'react';
import { HiCheckCircle, HiOutlinePencil, HiOutlineUser } from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import Dropdown from 'components/ui/Dropdown';
import Modal from 'components/ui/Modal';
import OtpInput from 'components/ui/OtpInput';
import { COUNTRIES, countryName } from 'data/countries';
import { PROFILE, type SellerProfile } from 'data/account-sample';
import { UAE_DIAL_CODE, formatUaeMobile, uaeMobileDigits } from 'lib/formatters';

type Verifying = 'email' | 'phone' | null;

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  action
}: {
  id: string;
  label: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  error?: string | false;
  /** Sits inside the field on the right — the Verify button. */
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
            error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
          } ${action ? 'pr-20' : ''}`}
        />
        {action && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {action}
          </span>
        )}
      </div>
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

export default function ProfileManagementTab() {
  const [profile, setProfile] = useState<SellerProfile>(PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SellerProfile>(PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<Verifying>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(profile);
    setErrors({});
    setEditing(true);
    setNotice(null);
  };

  const save = () => {
    const found: Record<string, string> = {};
    if (!draft.firstName.trim()) found.firstName = 'Enter your first name.';
    if (!draft.lastName.trim()) found.lastName = 'Enter your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email.trim()))
      found.email = 'That does not look like an email address.';
    if (uaeMobileDigits(draft.phone).length < 9)
      found.phone = 'Enter a full mobile number.';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    /* Changing either contact detail un-verifies it — a verified badge has to
       mean the address we currently hold was actually confirmed. */
    setProfile({
      ...draft,
      email: draft.email.trim(),
      emailVerified:
        draft.email.trim() === profile.email ? profile.emailVerified : false,
      phoneVerified:
        draft.phone === profile.phone ? profile.phoneVerified : false
    });
    setEditing(false);
    setNotice('Profile updated.');
  };

  const confirmVerification = (entered: string) => {
    if (entered.length < 6) {
      setCodeError('Enter all six digits.');
      return;
    }
    const field = verifying;
    setProfile((current) =>
      field === 'email'
        ? { ...current, emailVerified: true }
        : { ...current, phoneVerified: true }
    );
    setDraft((current) =>
      field === 'email'
        ? { ...current, emailVerified: true }
        : { ...current, phoneVerified: true }
    );
    setVerifying(null);
    setCode('');
    setNotice(`${field === 'email' ? 'Email address' : 'Phone number'} verified.`);
  };

  const verifyButton = (which: 'email' | 'phone', verified: boolean) =>
    verified ? (
      <span className="flex items-center gap-1 pr-1 text-11 text-green-600">
        <HiCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Verified
      </span>
    ) : (
      <button
        type="button"
        onClick={() => {
          setCode('');
          setCodeError(null);
          setVerifying(which);
        }}
        className="rounded-md px-2 py-1 text-12 font-medium text-primary transition-colors hover:bg-primary/10"
      >
        Verify
      </button>
    );

  return (
    <>
      <Panel className="max-w-[560px]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-14 font-semibold text-secondary">
            Profile Management
          </h2>
          {editing ? (
            <button
              type="button"
              onClick={save}
              className="rounded-md bg-primary px-4 py-1.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Save Changes
            </button>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              aria-label="Edit profile"
              className="rounded-full border border-primary/25 p-1.5 text-15 text-primary transition-colors hover:bg-primary/8"
            >
              <HiOutlinePencil />
            </button>
          )}
        </div>

        {notice && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-12 text-secondary"
          >
            {notice}
          </p>
        )}

        <div
          className={`mt-5 flex items-center gap-4 ${editing ? '' : 'flex-col'}`}
        >
          <span
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-30 text-gray"
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <HiOutlineUser />
            )}
          </span>

          {editing ? (
            <div className="flex items-center gap-3">
              <span className="text-13 text-secondary">Profile Picture</span>
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className="text-13 font-medium text-primary hover:underline"
              >
                Upload picture
              </button>
            </div>
          ) : (
            <span className="text-13 font-medium text-primary">
              Profile Picture
            </span>
          )}

          <input
            ref={avatarInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file)
                setDraft((current) => ({
                  ...current,
                  avatarUrl: URL.createObjectURL(file)
                }));
              event.target.value = '';
            }}
          />
        </div>

        <div className="mt-6">
          {editing ? (
            <div className="flex flex-col gap-4">
              <Field
                id="first-name"
                label="First Name"
                value={draft.firstName}
                onChange={(firstName) => setDraft({ ...draft, firstName })}
                error={errors.firstName}
              />
              <Field
                id="last-name"
                label="Last Name"
                value={draft.lastName}
                onChange={(lastName) => setDraft({ ...draft, lastName })}
                error={errors.lastName}
              />
              <Field
                id="email"
                label="Email"
                value={draft.email}
                onChange={(email) => setDraft({ ...draft, email })}
                error={errors.email}
                action={verifyButton('email', draft.emailVerified)}
              />

              <div className="flex flex-col gap-2">
                <label htmlFor="country" className="text-13 text-secondary">
                  Country
                </label>
                <Dropdown
                  label="Country"
                  value={draft.country}
                  onChange={(country) => setDraft({ ...draft, country })}
                  options={COUNTRIES.map((c) => ({
                    value: c.code,
                    label: c.name
                  }))}
                />
              </div>

              <Field
                id="phone"
                label="Phone Number"
                value={draft.phone}
                onChange={(phone) =>
                  setDraft({ ...draft, phone: formatUaeMobile(phone) })
                }
                placeholder="50 123 4567"
                error={errors.phone}
                action={verifyButton('phone', draft.phoneVerified)}
              />
            </div>
          ) : (
            <DetailRows
              rows={[
                { label: 'First Name', value: profile.firstName },
                { label: 'Last Name', value: profile.lastName },
                {
                  label: 'Email Address',
                  value: `${profile.email}${profile.emailVerified ? '  ✓' : '  — unverified'}`
                },
                { label: 'Country', value: countryName(profile.country) },
                {
                  label: 'Phone Number',
                  value: `${UAE_DIAL_CODE} ${profile.phone}${
                    profile.phoneVerified ? '  ✓' : '  — unverified'
                  }`
                }
              ]}
            />
          )}
        </div>
      </Panel>

      <Modal
        open={verifying !== null}
        onClose={() => setVerifying(null)}
        title="Confirm the code"
        hideTitle
        footer={
          <>
            <button
              type="button"
              onClick={() => setVerifying(null)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmVerification(code)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="text-center">
          <h2 className="text-16 font-semibold text-secondary">
            Confirm the code
          </h2>
          <p className="mt-2 text-13 text-gray">
            Enter the 6-digit code we sent to{' '}
            <span className="break-all font-medium text-secondary">
              {verifying === 'email'
                ? draft.email
                : `${UAE_DIAL_CODE} ${draft.phone}`}
            </span>
            .
          </p>
          <div className="mt-5 flex justify-center">
            <OtpInput
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(null);
              }}
              onComplete={confirmVerification}
              error={codeError ?? false}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

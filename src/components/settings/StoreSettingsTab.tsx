'use client';

import { useRef, useState } from 'react';
import { HiOutlineOfficeBuilding, HiOutlinePencil } from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import Dropdown from 'components/ui/Dropdown';
import { EMIRATES } from 'data/uae-business';
import { STORE, type StoreProfile } from 'data/account-sample';
import { UAE_DIAL_CODE, formatUaeMobile } from 'lib/formatters';

const emirateLabel = (value: string) =>
  EMIRATES.find((emirate) => emirate.value === value)?.label ?? value;

export default function StoreSettingsTab() {
  const [store, setStore] = useState<StoreProfile>(STORE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StoreProfile>(STORE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const save = () => {
    const found: Record<string, string> = {};
    if (!draft.name.trim()) found.name = 'Your store needs a name.';
    if (!draft.address.trim()) found.address = 'Enter the store address.';

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStore({ ...draft, name: draft.name.trim(), address: draft.address.trim() });
    setEditing(false);
    setNotice('Store details updated.');
  };

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (_value: string) => void,
    placeholder?: string,
    error?: string
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-secondary">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
          error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
        }`}
      />
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );

  return (
    <Panel className="max-w-[560px]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-14 font-semibold text-secondary">Store Settings</h2>
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
            onClick={() => {
              setDraft(store);
              setErrors({});
              setEditing(true);
              setNotice(null);
            }}
            aria-label="Edit store settings"
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

      <div className="mt-5 flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-background text-30 text-gray"
        >
          {(editing ? draft.logoUrl : store.logoUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(editing ? draft.logoUrl : store.logoUrl) as string}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <HiOutlineOfficeBuilding />
          )}
        </span>

        {editing ? (
          <button
            type="button"
            onClick={() => logoInput.current?.click()}
            className="text-13 font-medium text-primary hover:underline"
          >
            Upload logo
          </button>
        ) : (
          <span className="text-13 font-medium text-primary">Store Logo</span>
        )}

        <input
          ref={logoInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file)
              setDraft((current) => ({
                ...current,
                logoUrl: URL.createObjectURL(file)
              }));
            event.target.value = '';
          }}
        />
      </div>

      <div className="mt-6">
        {editing ? (
          <div className="flex flex-col gap-4">
            {field(
              'store-name',
              'Store Name',
              draft.name,
              (name) => setDraft({ ...draft, name }),
              'Electronics Store',
              errors.name
            )}
            {field(
              'store-address',
              'Store Address',
              draft.address,
              (address) => setDraft({ ...draft, address }),
              'Shop #12, Ground Floor, Tech Plaza',
              errors.address
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="store-emirate" className="text-13 text-secondary">
                Emirate
              </label>
              <Dropdown
                label="Emirate"
                value={draft.emirate}
                onChange={(emirate) => setDraft({ ...draft, emirate })}
                options={EMIRATES.map((option) => ({
                  value: option.value,
                  label: option.label
                }))}
              />
            </div>

            {field(
              'store-email',
              'Support Email',
              draft.supportEmail,
              (supportEmail) => setDraft({ ...draft, supportEmail }),
              'support@yourstore.ae'
            )}
            {field(
              'store-phone',
              'Support Phone',
              draft.supportPhone,
              (supportPhone) =>
                setDraft({ ...draft, supportPhone: formatUaeMobile(supportPhone) }),
              '50 123 4567'
            )}
          </div>
        ) : (
          <DetailRows
            rows={[
              { label: 'Store Name', value: store.name },
              { label: 'Store Address', value: store.address },
              { label: 'Emirate', value: emirateLabel(store.emirate) },
              { label: 'Support Email', value: store.supportEmail },
              {
                label: 'Support Phone',
                value: `${UAE_DIAL_CODE} ${store.supportPhone}`
              }
            ]}
          />
        )}
      </div>
    </Panel>
  );
}

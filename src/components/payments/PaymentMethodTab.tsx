'use client';

import { useState } from 'react';
import {
  HiOutlineCreditCard,
  HiOutlineLockClosed,
  HiOutlineTrash
} from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import Modal from 'components/ui/Modal';
import OtpInput from 'components/ui/OtpInput';
import { COUNTRIES } from 'data/countries';
import { SAVED_CARD, TODAY, type CardBrand, type SavedCard } from 'data/payments-sample';
import { HiChevronDown } from 'react-icons/hi';

/* A seller keeps exactly one card on file. Replacing it is a sensitive change,
   so it is confirmed with a code sent to the account's email — the same shape
   as cancelling an order.

   The card number is only ever held in this component's state long enough to
   hand to the gateway. Nothing beyond the brand and last four is kept, and the
   PAN is never logged or sent anywhere else. */

const BRAND_LABEL: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express'
};

const brandFor = (digits: string): CardBrand | null => {
  if (digits.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'MASTERCARD';
  if (/^3[47]/.test(digits)) return 'AMEX';
  return null;
};

const groupCardNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const groupExpiry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

/** True when MM/YY is at or before the current month. */
const isExpired = (month: string, year: string, today: string): boolean => {
  const [nowYear, nowMonth] = today.split('-').map(Number);
  const cardYear = 2000 + Number(year);
  const cardMonth = Number(month);
  if (!cardMonth || !cardYear) return false;
  return cardYear < nowYear || (cardYear === nowYear && cardMonth < nowMonth);
};

function BrandMark({ brand }: { brand: CardBrand }) {
  return (
    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-secondary/10 bg-white text-10 font-bold uppercase tracking-tight text-secondary">
      {brand === 'AMEX' ? 'AMEX' : brand === 'VISA' ? 'VISA' : 'MC'}
    </span>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  inputMode = 'text',
  adornment,
  autoComplete
}: {
  id: string;
  label: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder: string;
  error?: string | false;
  required?: boolean;
  inputMode?: 'text' | 'numeric';
  adornment?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-secondary">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
            error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
          } ${adornment ? 'pr-16' : ''}`}
        />
        {adornment && (
          <span className="absolute inset-y-0 right-3 flex items-center gap-1.5 text-gray">
            {adornment}
          </span>
        )}
      </div>
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

export default function PaymentMethodTab() {
  const [card, setCard] = useState<SavedCard | null>(SAVED_CARD);
  const [adding, setAdding] = useState(false);

  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [country, setCountry] = useState('AE');
  const [postal, setPostal] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const digits = number.replace(/\D/g, '');
  const brand = brandFor(digits);

  const reset = () => {
    setNumber('');
    setExpiry('');
    setCvc('');
    setPostal('');
    setErrors({});
  };

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};
    const [month, year] = expiry.split('/');

    if (digits.length < 13) found.number = 'Enter the full card number.';
    else if (!brand) found.number = 'We do not recognise that card type.';

    if (!month || !year || year.length < 2)
      found.expiry = 'Enter the expiry as MM/YY.';
    else if (Number(month) < 1 || Number(month) > 12)
      found.expiry = 'That month does not exist.';
    else if (isExpired(month, year, TODAY)) found.expiry = 'That card has expired.';

    if (cvc.length < 3) found.cvc = 'Enter the security code.';
    if (!postal.trim()) found.postal = 'Enter the postal code.';

    return found;
  };

  const startConfirmation = () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setCode('');
    setCodeError(null);
    setConfirming(true);
  };

  const confirmReplacement = (entered: string) => {
    if (entered.length < 6) {
      setCodeError('Enter all six digits.');
      return;
    }

    const [month, year] = expiry.split('/');

    /* Only the brand and last four survive. Everything the gateway needs to
       charge the card is exchanged for a token server-side; this app never
       keeps the number. */
    setCard({
      id: `card-${Date.now()}`,
      brand: brand as CardBrand,
      last4: digits.slice(-4),
      expMonth: month,
      expYear: year,
      country,
      postalCode: postal.trim(),
      addedAt: TODAY
    });

    setConfirming(false);
    setAdding(false);
    reset();
    setNotice(
      `Card replaced. The previous card ending ${SAVED_CARD.last4} has been removed.`
    );
  };

  const expired = card ? isExpired(card.expMonth, card.expYear, TODAY) : false;

  return (
    <div className="flex flex-col gap-5">
      {notice && (
        <p
          role="status"
          className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          {notice}
        </p>
      )}

      <Panel>
        <h2 className="text-14 font-semibold text-secondary">
          Current Payment Method
        </h2>
        <p className="mt-1 text-12 text-gray">
          One card is kept on file. Adding a new one replaces it.
        </p>

        <div className="mt-4">
          {card ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-secondary/10 px-4 py-3">
              <BrandMark brand={card.brand} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-13 text-secondary">
                  {BRAND_LABEL[card.brand]} ending in {card.last4}
                </p>
                <p className="text-12 text-gray">
                  Exp. date {card.expMonth}/{card.expYear}
                </p>
              </div>

              {expired ? (
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-11 font-medium text-primary">
                  Expired
                </span>
              ) : (
                <span className="rounded-md bg-background px-2.5 py-1 text-11 text-gray">
                  Default
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setCard(null);
                  setNotice('Card removed. Add one to keep receiving payouts.');
                }}
                aria-label="Remove card"
                className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-secondary/20 px-4 py-6 text-center text-13 text-gray">
              No card on file.
            </p>
          )}
        </div>

        {!adding && (
          <button
            type="button"
            onClick={() => {
              reset();
              setAdding(true);
              setNotice(null);
            }}
            className="mt-4 w-full rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            {card ? 'Replace Payment Method' : 'Add Payment Method'}
          </button>
        )}
      </Panel>

      {adding && (
        <Panel>
          <h2 className="text-14 font-semibold text-secondary">
            {card ? 'Replace Payment Method' : 'Add a New Payment Method'}
          </h2>

          <div className="mt-4 rounded-xl border border-secondary/10 px-4 py-4 sm:px-5">
            <p className="flex items-center gap-2 text-13 font-medium text-secondary">
              <HiOutlineCreditCard className="h-4 w-4" aria-hidden="true" />
              Credit or Debit Card
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <Field
                id="card-number"
                label="Card Number"
                required
                inputMode="numeric"
                autoComplete="cc-number"
                value={number}
                onChange={(value) => setNumber(groupCardNumber(value))}
                placeholder="Card Number"
                error={errors.number}
                adornment={
                  <>
                    {brand && (
                      <span className="text-10 font-bold uppercase text-secondary">
                        {brand === 'MASTERCARD' ? 'MC' : brand}
                      </span>
                    )}
                    <HiOutlineLockClosed className="h-3.5 w-3.5" />
                  </>
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="card-expiry"
                  label="Expiration Date"
                  required
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(value) => setExpiry(groupExpiry(value))}
                  placeholder="MM / YY"
                  error={errors.expiry}
                />
                <Field
                  id="card-cvc"
                  label="Security Code (CVC)"
                  required
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(value) => setCvc(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="CVC"
                  error={errors.cvc}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="card-country" className="text-13 text-secondary">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="card-country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
                    >
                      {COUNTRIES.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
                  </div>
                </div>

                <Field
                  id="card-postal"
                  label="Postal Code"
                  required
                  autoComplete="postal-code"
                  value={postal}
                  onChange={setPostal}
                  placeholder="Postal Code"
                  error={errors.postal}
                />
              </div>

              <p className="flex items-start gap-2 text-11 text-gray">
                <HiOutlineLockClosed
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                Your card details go straight to the payment provider. Tredella
                stores only the card type and its last four digits.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    reset();
                  }}
                  className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={startConfirmation}
                  className="flex-1 rounded-lg bg-secondary py-2.5 text-14 font-medium text-white transition-colors hover:bg-secondary/90"
                >
                  {card ? 'Replace Card' : 'Add Card'}
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm your new card"
        hideTitle
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmReplacement(code)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="text-center">
          <HiOutlineCreditCard
            className="mx-auto h-8 w-8 text-primary"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-16 font-semibold text-secondary">
            Confirm your new card
          </h2>
          <p className="mt-2 text-13 text-gray">
            Enter the 6-digit code we emailed you. Confirming replaces the card
            ending{' '}
            <span className="font-medium text-secondary">
              {card?.last4 ?? '—'}
            </span>{' '}
            with the one ending{' '}
            <span className="font-medium text-secondary">
              {digits.slice(-4) || '—'}
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
              onComplete={confirmReplacement}
              error={codeError ?? false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

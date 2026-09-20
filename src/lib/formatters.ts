/* Input masks for the registration form.
   Each takes whatever is in the field and returns what should be shown, so a
   field can never hold a character it is not meant to. */

const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** Digits only, capped — for fields where a letter is never valid. */
export const digitsOnly =
  (max: number) =>
  (value: string): string =>
    onlyDigits(value).slice(0, max);

/* ---------------- UAE mobile ---------------- */

export const UAE_DIAL_CODE = '+971';
const LOCAL_MOBILE_LENGTH = 9; // 5X XXX XXXX

/**
 * The digits after +971. Accepts a pasted `+971 50 …`, `00971…` or local
 * `050 …` and reduces them all to `50…`, so the visible prefix is never doubled.
 */
export const uaeMobileDigits = (value: string): string =>
  onlyDigits(value)
    .replace(/^00971/, '')
    .replace(/^971/, '')
    .replace(/^0/, '')
    .slice(0, LOCAL_MOBILE_LENGTH);

/** `501234567` → `50 123 4567`, matching the example in the error message. */
export const formatUaeMobile = (value: string): string => {
  const digits = uaeMobileDigits(value);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)]
    .filter(Boolean)
    .join(' ');
};

export const isUaeMobile = (value: string): boolean =>
  /^5\d{8}$/.test(uaeMobileDigits(value));

/** What the API stores: `+971501234567`. */
export const toE164 = (value: string): string =>
  `${UAE_DIAL_CODE}${uaeMobileDigits(value)}`;

/* ---------------- Emirates ID ---------------- */

const EMIRATES_ID_LENGTH = 15;

/** `784199012345671` → `784-1990-1234567-1`. */
export const formatEmiratesId = (value: string): string => {
  const digits = onlyDigits(value).slice(0, EMIRATES_ID_LENGTH);
  return [
    digits.slice(0, 3),
    digits.slice(3, 7),
    digits.slice(7, 14),
    digits.slice(14, 15)
  ]
    .filter(Boolean)
    .join('-');
};

export const isEmiratesId = (value: string): boolean => {
  const digits = onlyDigits(value);
  return digits.length === EMIRATES_ID_LENGTH && digits.startsWith('784');
};

/* ---------------- TRN ---------------- */

export const TRN_LENGTH = 15;

export const formatTrn = digitsOnly(TRN_LENGTH);

export const isTrn = (value: string): boolean =>
  onlyDigits(value).length === TRN_LENGTH;

/* ---------------- trade licence ---------------- */

/**
 * Licence numbers are alphanumeric — Dubai DED issues plain digits, free zones
 * use prefixes like `CN-1234567` — so letters stay, but they are upper-cased and
 * anything the API would reject is dropped as it is typed.
 */
export const formatLicenceNumber = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9\-/]/g, '')
    .slice(0, 30);

/* ---------------- caret ---------------- */

/**
 * Number of mask-significant characters before the caret. Re-formatting rebuilds
 * the string, so the caret is restored by counting these rather than by index —
 * otherwise editing the middle of a field throws the cursor to the end.
 */
export const significantBefore = (value: string, caret: number): number =>
  value.slice(0, caret).replace(/[^A-Za-z0-9]/g, '').length;

/**
 * The first `count` words, with an ellipsis when anything was dropped.
 *
 * A product description is as long as the seller made it, and a listing page
 * cannot hand a whole paragraph to one table cell. Cutting by word rather than
 * by character keeps the last word whole.
 */
export const firstWords = (text: string, count: number): string => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= count ? text.trim() : `${words.slice(0, count).join(' ')}…`;
};

/** Index just after the nth mask-significant character. */
export const caretAfter = (value: string, count: number): number => {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/[A-Za-z0-9]/.test(value[i])) {
      seen += 1;
      if (seen === count) return i + 1;
    }
  }
  return value.length;
};

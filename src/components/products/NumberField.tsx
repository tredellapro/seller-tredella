'use client';

import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface NumberFieldProps {
  label?: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  /** Suffix inside the field: AED, kg, months. */
  unit?: string;
  /** Adds the up/down spinner from the designs. */
  stepper?: boolean;
  /** Allows a decimal point. Quantities stay whole. */
  decimal?: boolean;
  min?: number;
  error?: string | false;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/* Digits only — the browser's own number input still accepts "e", "+" and a
   pasted "abc" in several engines, and the brief was that a number field must
   never hold letters. */
const clean = (raw: string, decimal: boolean): string => {
  const stripped = raw.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
  if (!decimal) return stripped;

  // keep only the first decimal point
  const [whole, ...rest] = stripped.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
};

export default function NumberField({
  label,
  value,
  onChange,
  placeholder,
  unit,
  stepper = false,
  decimal = false,
  min = 0,
  error,
  id,
  className = '',
  'aria-label': ariaLabel
}: NumberFieldProps) {
  const nudge = (by: number) => {
    const next = Math.max(min, (Number(value) || 0) + by);
    onChange(String(next));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-13 text-gray">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={value}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={error ? true : undefined}
          placeholder={placeholder}
          onChange={(event) => onChange(clean(event.target.value, decimal))}
          onKeyDown={(event) => {
            if (!stepper) return;
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              nudge(1);
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              nudge(-1);
            }
          }}
          className={`w-full rounded-lg border bg-white py-2.5 pl-3.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
            error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
          } ${stepper || unit ? 'pr-11' : 'pr-3.5'}`}
        />

        {unit && !stepper && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-12 text-gray">
            {unit}
          </span>
        )}

        {stepper && (
          <span className="absolute inset-y-0 right-0 flex w-9 flex-col border-l border-secondary/15">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Increase"
              onClick={() => nudge(1)}
              className="flex flex-1 items-center justify-center text-gray transition-colors hover:text-primary"
            >
              <HiChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Decrease"
              onClick={() => nudge(-1)}
              className="flex flex-1 items-center justify-center border-t border-secondary/15 text-gray transition-colors hover:text-primary"
            >
              <HiChevronDown className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

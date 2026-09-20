'use client';

import { SelectHTMLAttributes } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import flags from 'react-phone-number-input/flags';
import { COUNTRIES } from 'data/countries';

interface CountrySelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label?: string;
  error?: string | false;
  /** ISO 3166-1 alpha-2 code, e.g. "PK". */
  value: string;
  placeholder?: string;
}

/* A native <select> for keyboard and mobile behaviour; the flag and chevron are
   painted over it, since option elements cannot carry an SVG. */
export default function CountrySelect({
  label,
  error,
  value,
  placeholder = 'Select country',
  id,
  name,
  className = '',
  ...props
}: CountrySelectProps) {
  const fieldId = id ?? name;
  const Flag = flags[value as keyof typeof flags];

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className="text-14 text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        {Flag && (
          // the flag component only accepts `title`, so size it from the wrapper
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center [&>svg]:h-4 [&>svg]:w-6 [&>svg]:rounded-sm [&>svg]:object-cover">
            <Flag title={value} />
          </span>
        )}

        <select
          id={fieldId}
          name={name}
          value={value}
          aria-invalid={error ? true : undefined}
          className={`w-full appearance-none rounded-lg border bg-white py-3 pr-11 text-14 outline-none transition-colors ${
            Flag ? 'pl-14' : 'pl-4'
          } ${value ? 'text-secondary' : 'text-gray/60'} ${
            error
              ? 'border-primary focus:border-primary'
              : 'border-secondary/15 focus:border-primary'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        <HiChevronDown className="pointer-events-none absolute inset-y-0 right-4 my-auto h-5 w-5 text-gray" />
      </div>

      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

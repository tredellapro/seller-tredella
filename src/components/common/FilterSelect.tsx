'use client';

import type { ReactNode } from 'react';
import { HiChevronDown } from 'react-icons/hi';

interface FilterSelectProps {
  /** Doubles as the empty-state option, exactly as the designs show it. */
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (_value: string) => void;
  icon?: ReactNode;
  /** Namespaces the id when the same filter appears on two tabs. */
  idPrefix?: string;
}

/** The compact dropdown used in every filter bar. */
export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon,
  idPrefix = 'filter'
}: FilterSelectProps) {
  const id = `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray">
          {icon}
        </span>
      )}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2 pr-8 text-13 outline-none transition-colors focus:border-primary ${
          icon ? 'pl-9' : 'pl-3'
        } ${value ? 'text-secondary' : 'text-gray'}`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <HiChevronDown className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-gray" />
    </div>
  );
}

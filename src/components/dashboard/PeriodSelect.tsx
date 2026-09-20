'use client';

import { HiOutlineCalendar, HiChevronDown } from 'react-icons/hi';

interface PeriodSelectProps {
  value: string;
  options: string[];
  onChange: (_value: string) => void;
  label: string;
}

/** The "Jan 2025 ▾" pill above a chart. A real select, so it works by keyboard. */
export default function PeriodSelect({
  value,
  options,
  onChange,
  label
}: PeriodSelectProps) {
  return (
    <div className="relative">
      <HiOutlineCalendar
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-14 text-gray"
      />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-secondary/15 bg-white py-1.5 pl-8 pr-8 text-12 text-secondary outline-none transition-colors hover:border-primary/40 focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <HiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-14 text-gray"
      />
    </div>
  );
}

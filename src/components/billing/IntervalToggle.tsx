'use client';

import type { BillingInterval } from 'types/billing';

interface IntervalToggleProps {
  value: BillingInterval;
  onChange: (_interval: BillingInterval) => void;
}

const OPTIONS: { value: BillingInterval; label: string }[] = [
  // Figma labels this pill "Wholesale", which reads as a slip — the other
  // option is a billing period, and both plans are priced per month.
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (save 10%)' }
];

export default function IntervalToggle({ value, onChange }: IntervalToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      className="mx-auto flex w-full max-w-[420px] rounded-full border border-secondary/15 bg-white p-1"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-11 font-medium transition-colors xs:px-4 xs:text-13 ${
              active
                ? 'bg-primary text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

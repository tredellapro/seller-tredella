'use client';

interface ToggleTabsProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ToggleTabs({
  options,
  value,
  onChange,
  className = ''
}: ToggleTabsProps) {
  return (
    <div
      className={`inline-flex rounded-lg border border-secondary/10 bg-white p-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-6 py-2 text-13 font-medium transition-colors duration-200 sm:px-8 sm:text-14 ${
            value === option.value
              ? 'bg-primary text-white'
              : 'bg-transparent text-secondary hover:text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

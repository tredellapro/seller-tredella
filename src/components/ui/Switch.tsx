'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (_checked: boolean) => void;
  /** Names the control for screen readers when no visible label is wired up. */
  label: string;
  /** Points at the id of the visible text acting as the label. */
  labelledBy?: string;
  disabled?: boolean;
}

/** The pill toggle from the designs. A real button, so keyboard and AT get it free. */
export default function Switch({
  checked,
  onChange,
  label,
  labelledBy,
  disabled = false
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-secondary/20'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

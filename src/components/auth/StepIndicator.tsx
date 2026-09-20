import { HiCheck } from 'react-icons/hi';

interface StepIndicatorProps {
  steps: string[];
  /** 1-based. */
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="mt-6 flex items-center justify-center gap-2">
      {steps.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;

        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex_center h-7 w-7 shrink-0 rounded-full text-12 font-semibold transition-colors ${
                done || active
                  ? 'bg-primary text-white'
                  : 'bg-secondary/10 text-gray'
              }`}
            >
              {done ? <HiCheck aria-hidden="true" /> : step}
            </span>
            <span
              className={`text-12 ${active ? 'text-secondary' : 'text-gray'}`}
            >
              {label}
              <span className="sr-only">
                {done ? ' (completed)' : active ? ' (current step)' : ''}
              </span>
            </span>
            {step < steps.length && (
              <span
                aria-hidden="true"
                className={`ml-1 h-px w-6 sm:w-10 ${
                  done ? 'bg-primary' : 'bg-secondary/15'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

'use client';

import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Button from 'components/ui/Button';
import type { BillingInterval, Plan } from 'types/billing';

interface PlanCardProps {
  plan: Plan;
  interval: BillingInterval;
  /** Marks the plan the seller is already on. */
  current?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onChoose: (_planCode: string) => void;
}

/** Prices are whole dirhams, so no trailing .00. */
const formatAed = (amount: number, currency: string): string =>
  `${currency} ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

export default function PlanCard({
  plan,
  interval,
  current = false,
  loading = false,
  disabled = false,
  onChoose
}: PlanCardProps) {
  const quarterly = interval === 'QUARTERLY';
  const price = quarterly ? plan.quarterlyPrice : plan.monthlyPrice;

  const benefits = plan.features.filter((f) => f.kind === 'FEATURE');
  const notes = plan.features.filter((f) => f.kind === 'NOTE');

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.08)] ${
        current ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="px-6 pb-6 pt-7 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-18 text-secondary">{plan.name}</h3>
          {current && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-11 font-medium text-primary">
              Current plan
            </span>
          )}
        </div>

        <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-36 font-bold text-primary">
            {formatAed(price, plan.currency)}
          </span>
          <span className="text-13 text-secondary">
            {quarterly ? 'Per quarter' : 'Per month'}
          </span>
          {quarterly && (
            <span className="text-13 font-semibold text-secondary">
              (save 10%)
            </span>
          )}
        </p>

        <Button
          type="button"
          variant={current ? 'outline' : 'soft'}
          size="lg"
          fullWidth
          className="mt-5"
          loading={loading}
          disabled={disabled || current}
          onClick={() => onChoose(plan.code)}
        >
          {current ? 'Your current plan' : loading ? 'Setting up…' : 'Choose plan'}
        </Button>
      </div>

      <div className="border-t border-secondary/10 px-6 py-6 sm:px-8">
        <h4 className="text-12 font-semibold uppercase tracking-wide text-secondary">
          Benefits
        </h4>
        {plan.tagline && (
          <p className="mt-1 text-13 text-gray">{plan.tagline}</p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {benefits.map((feature) => (
            <li key={feature.id} className="flex items-start gap-2.5">
              {feature.included ? (
                <HiCheckCircle
                  className="mt-0.5 shrink-0 text-16 text-green-500"
                  aria-label="Included"
                />
              ) : (
                <HiXCircle
                  className="mt-0.5 shrink-0 text-16 text-primary"
                  aria-label="Not included"
                />
              )}
              <span className="text-13 text-secondary">{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {notes.length > 0 && (
        <div className="mt-auto border-t border-secondary/10 px-6 py-6 sm:px-8">
          <ul className="flex flex-col gap-4">
            {notes.map((note) => (
              <li key={note.id} className="flex items-start gap-2.5">
                <HiCheckCircle
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-16 text-secondary"
                />
                <p className="text-12 leading-relaxed text-gray">
                  {note.title && (
                    <span className="font-semibold text-secondary">
                      {note.title}:{' '}
                    </span>
                  )}
                  {note.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

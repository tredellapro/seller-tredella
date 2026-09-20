import type { IconType } from 'react-icons';
import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';

export interface Stat {
  icon: IconType;
  label: string;
  value: string;
  /** Small line under the value — usually the period the figure covers. */
  period?: string;
  delta?: {
    /** Already formatted, e.g. "12" or "AED 350". */
    value: string;
    direction: 'up' | 'down';
    /** What it is compared against. */
    comparison: string;
  };
}

/**
 * A headline figure. Takes two stats because the design pairs Orders with
 * Pending Orders in a single card; one is the common case.
 */
export default function StatCard({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex gap-6 rounded-2xl bg-white px-5 py-5 shadow-[0_4px_30px_rgba(43,52,69,0.06)] sm:px-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const Arrow = stat.delta?.direction === 'down' ? HiArrowSmDown : HiArrowSmUp;

        return (
          <div
            key={stat.label}
            className={`min-w-0 flex-1 ${
              index > 0 ? 'border-l border-secondary/10 pl-6' : ''
            }`}
          >
            <p className="flex items-center gap-2 text-13 text-secondary">
              <Icon className="shrink-0 text-16 text-secondary" aria-hidden="true" />
              <span className="truncate">{stat.label}</span>
            </p>

            <p className="mt-3 text-30 font-bold leading-none text-primary sm:text-36">
              {stat.value}
            </p>

            {stat.period && (
              <p className="mt-3 text-12 text-gray">{stat.period}</p>
            )}

            {stat.delta && (
              <p
                className={`mt-1 flex items-center gap-0.5 text-11 ${
                  stat.delta.direction === 'down'
                    ? 'text-primary'
                    : 'text-green-600'
                }`}
              >
                <Arrow className="shrink-0 text-13" aria-hidden="true" />
                <span className="truncate">
                  {stat.delta.value} {stat.delta.comparison}
                </span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';

export interface BarPoint {
  label: string;
  value: number;
  /** Extra figure shown in the tooltip only — not plotted. */
  secondary?: { label: string; value: number };
}

interface BarChartProps {
  data: BarPoint[];
  /** Top of the scale. Defaults to the largest value, rounded up by the tick step. */
  max?: number;
  ticks: number[];
  formatValue: (_value: number) => string;
  formatTick: (_value: number) => string;
  /** Names the plotted series — a single series needs no legend box. */
  seriesLabel: string;
}

/**
 * One series of columns over a categorical axis.
 *
 * Built from elements rather than SVG so the axis text stays crisp at any
 * width. Each column carries a recessive full-height track, which is the
 * design's way of showing how far short of the ceiling a month fell; it is
 * surface, not data.
 */
export default function BarChart({
  data,
  max,
  ticks,
  formatValue,
  formatTick,
  seriesLabel
}: BarChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const ceiling = max ?? Math.max(...ticks, ...data.map((d) => d.value));
  const pct = (value: number) => Math.max(0, Math.min(100, (value / ceiling) * 100));

  return (
    <div className="flex gap-3">
      {/* y axis */}
      <div className="relative hidden h-[240px] w-9 shrink-0 sm:block">
        {ticks.map((tick) => (
          <span
            key={tick}
            style={{ bottom: `${pct(tick)}%` }}
            className="absolute right-0 translate-y-1/2 text-11 text-gray"
          >
            {formatTick(tick)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-[240px]">
          {/* gridlines: hairline, solid, one step off the surface */}
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden="true"
              style={{ bottom: `${pct(tick)}%` }}
              className="absolute inset-x-0 h-px bg-secondary/10"
            />
          ))}

          <div className="absolute inset-0 flex items-end justify-between gap-1.5">
            {data.map((point, index) => (
              <div
                key={point.label}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                role="img"
                aria-label={`${point.label}: ${seriesLabel} ${formatValue(point.value)}${
                  point.secondary
                    ? `, ${point.secondary.label} ${formatValue(point.secondary.value)}`
                    : ''
                }`}
                className="group relative flex h-full max-w-[24px] flex-1 items-end justify-center outline-none"
              >
                {/* track — surface, not data */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 top-0 rounded-t bg-primary/10"
                />

                <span
                  aria-hidden="true"
                  style={{ height: `${pct(point.value)}%` }}
                  className={`relative w-full rounded-t bg-primary transition-opacity ${
                    active !== null && active !== index ? 'opacity-60' : 'opacity-100'
                  }`}
                />

                {active === index && (
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-left shadow-[0_4px_20px_rgba(43,52,69,0.18)]">
                    <p className="text-10 text-gray">{point.label}</p>
                    <div className="mt-1 flex gap-4">
                      <span>
                        <span className="block text-10 text-gray">
                          {seriesLabel}
                        </span>
                        <span className="block text-12 font-semibold text-secondary">
                          {formatValue(point.value)}
                        </span>
                      </span>
                      {point.secondary && (
                        <span>
                          <span className="block text-10 text-gray">
                            {point.secondary.label}
                          </span>
                          <span className="block text-12 font-semibold text-secondary">
                            {formatValue(point.secondary.value)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* x axis */}
        <div className="mt-2 flex justify-between gap-1.5">
          {data.map((point) => (
            <span
              key={point.label}
              className="max-w-[24px] flex-1 text-center text-11 text-gray"
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  /** Hex from the validated categorical palette — see dashboard-sample.ts. */
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  formatValue?: (_value: number) => string;
}

/** Width of the surface gap between touching segments, in px of arc. */
const GAP = 2;

/**
 * Part-to-whole for a handful of categories. Every slice is named in the
 * legend, so identity never rests on colour alone.
 */
export default function DonutChart({
  data,
  size = 200,
  thickness = 34,
  formatValue = (v) => String(v)
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let consumed = 0;
  const segments = data.map((slice) => {
    const length = total > 0 ? (slice.value / total) * circumference : 0;
    const segment = { slice, length, offset: consumed };
    consumed += length;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={data
            .map((s) => `${s.label} ${formatValue(s.value)}`)
            .join(', ')}
          // start at twelve o'clock rather than three
          className="-rotate-90"
        >
          {segments.map(({ slice, length, offset }, index) => (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              /* the gap is taken out of the segment, so the surface shows
                 through between neighbours instead of a stroke separating them */
              strokeDasharray={`${Math.max(0, length - GAP)} ${circumference - Math.max(0, length - GAP)}`}
              strokeDashoffset={-offset}
              opacity={active !== null && active !== index ? 0.55 : 1}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className="cursor-default transition-opacity"
            />
          ))}
        </svg>

        {active !== null && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-11 text-gray">{data[active].label}</span>
            <span className="text-18 font-semibold text-secondary">
              {formatValue(data[active].value)}
            </span>
          </div>
        )}
      </div>

      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ backgroundColor: slice.color }}
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
            />
            <span className="truncate text-12 text-secondary">{slice.label}</span>
            <span className="ml-auto text-12 font-medium text-secondary">
              {formatValue(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

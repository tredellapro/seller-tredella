export interface Detail {
  label: string;
  value: string;
  /** Renders the value in the brand colour — for amounts and states worth catching. */
  emphasis?: boolean;
}

/** The striped label/value list used across the order, product and payment screens. */
export default function DetailRows({ rows }: { rows: Detail[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-secondary/10">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-start justify-between gap-4 px-3 py-2 ${
            index % 2 === 0 ? 'bg-background' : 'bg-white'
          }`}
        >
          {/* min-w-0 on both: without it a long value overflows the rounded
              clip instead of wrapping, and loses its last characters. */}
          <dt className="min-w-0 text-12 text-gray">{row.label}</dt>
          <dd
            className={`min-w-0 break-words text-right text-12 font-medium ${
              row.emphasis ? 'text-primary' : 'text-secondary'
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

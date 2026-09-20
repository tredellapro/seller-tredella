import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (_row: T) => ReactNode;
  /** Extra classes for both the header cell and the body cells. */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (_row: T, _index: number) => string;
  emptyMessage?: string;
}

/**
 * Column-driven table. Scrolls horizontally rather than squeezing columns,
 * because a wide table on a phone is better read by panning than by wrapping
 * every cell.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Nothing to show yet.'
}: DataTableProps<T>) {
  if (rows.length === 0)
    return (
      <p className="px-5 py-10 text-center text-13 text-gray sm:px-6">
        {emptyMessage}
      </p>
    );

  return (
    <div className="brand-scroll overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="bg-background">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-left text-13 font-medium text-secondary first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 ${
                  column.className ?? ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className="border-b border-secondary/8 last:border-0"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 align-middle first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6 ${
                    column.className ?? ''
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

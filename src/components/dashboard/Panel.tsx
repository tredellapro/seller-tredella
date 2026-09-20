import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  /** Sits opposite the title — a period selector, a "See all" link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Drop the inner padding when the child manages its own (e.g. a table). */
  flush?: boolean;
}

/** The white card every dashboard block sits in. */
export default function Panel({
  title,
  action,
  children,
  className = '',
  flush = false
}: PanelProps) {
  return (
    <section
      className={`rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.06)] ${className}`}
    >
      {(title || action) && (
        <header
          className={`flex flex-wrap items-center justify-between gap-3 ${
            flush ? 'px-5 pt-5 sm:px-6' : 'px-5 pt-5 sm:px-6 sm:pt-6'
          }`}
        >
          {title && (
            <h2 className="text-16 font-semibold text-secondary">{title}</h2>
          )}
          {action}
        </header>
      )}
      <div className={flush ? '' : 'px-5 pb-5 pt-4 sm:px-6 sm:pb-6'}>
        {children}
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HiChevronLeft } from 'react-icons/hi';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  /** Trail above the title. The last entry is the current page. */
  breadcrumb?: Crumb[];
  /** Buttons opposite the title. */
  actions?: ReactNode;
  /** Shows a back chevron before the title. */
  backHref?: string;
}

/** Title, breadcrumb and actions — the same three things on every inner page. */
export default function PageHeader({
  title,
  breadcrumb,
  actions,
  backHref
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 pb-5 pt-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-secondary/15 bg-white text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <HiChevronLeft className="h-4 w-4" />
            </Link>
          )}
          <h1 className="text-20 font-semibold text-secondary sm:text-22">
            {title}
          </h1>
        </div>

        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className={backHref ? 'mt-1.5 pl-10' : 'mt-1.5'}>
            <ol className="flex flex-wrap items-center gap-1.5 text-12 text-gray">
              {breadcrumb.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden="true">•</span>}
                  {crumb.href && index < breadcrumb.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={
                        index === breadcrumb.length - 1 ? 'page' : undefined
                      }
                      className={
                        index === breadcrumb.length - 1 ? 'text-secondary' : ''
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

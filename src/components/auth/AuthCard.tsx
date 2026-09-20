import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  /** Sits under the title — a line of guidance, or the email being acted on. */
  subtitle?: ReactNode;
  /** Optional mark above the title (the padlock on the reset screens). */
  icon?: ReactNode;
  /** 'wide' for the long registration form; the rest use the Figma width. */
  size?: 'default' | 'wide';
  /** Rendered between the subtitle and the body, e.g. a step indicator. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

const widths: Record<'default' | 'wide', string> = {
  default: 'max-w-[550px]',
  wide: 'max-w-[660px]'
};

export default function AuthCard({
  title,
  subtitle,
  icon,
  size = 'default',
  header,
  children,
  className = ''
}: AuthCardProps) {
  return (
    <div
      className={`w-full ${widths[size]} rounded-2xl bg-white px-6 py-8 shadow-[0_4px_30px_rgba(43,52,69,0.08)] sm:px-10 sm:py-10 ${className}`}
    >
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}

      <h1 className="text-center text-24 font-semibold text-secondary sm:text-30">
        {title}
      </h1>

      {subtitle && (
        <div className="mt-2 text-center text-13 text-gray">{subtitle}</div>
      )}

      {header}

      <div className="mt-7">{children}</div>
    </div>
  );
}

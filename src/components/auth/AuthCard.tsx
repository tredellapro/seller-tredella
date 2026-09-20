import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  /** Sits under the title — a line of guidance, or the email being acted on. */
  subtitle?: ReactNode;
  /** Optional mark above the title (the padlock on the reset screens). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function AuthCard({
  title,
  subtitle,
  icon,
  children,
  className = ''
}: AuthCardProps) {
  return (
    <div
      className={`w-full max-w-[550px] rounded-2xl bg-white px-6 py-8 shadow-[0_4px_30px_rgba(43,52,69,0.08)] sm:px-10 sm:py-10 ${className}`}
    >
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}

      <h1 className="text-center text-24 font-semibold text-secondary sm:text-30">
        {title}
      </h1>

      {subtitle && (
        <div className="mt-2 text-center text-13 text-gray">{subtitle}</div>
      )}

      <div className="mt-7">{children}</div>
    </div>
  );
}

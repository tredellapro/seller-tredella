import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'soft';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  /** Shows a spinner and blocks repeat submits. */
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const baseClasses =
  'flex_center gap-2 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60';

const sizeClasses: Record<ButtonSize, string> = {
  md: 'rounded-md px-5 py-2 text-14',
  lg: 'rounded-lg px-5 py-3 text-14'
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  outline:
    'border border-secondary/20 bg-white text-secondary hover:border-secondary/40',
  soft: 'border border-secondary/15 bg-background text-secondary hover:bg-secondary/5'
};

const Spinner = () => (
  <span
    aria-hidden="true"
    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
  />
);

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${sizeClasses[size]} ${
    variantClasses[variant]
  } ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

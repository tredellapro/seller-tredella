import { ReactNode } from 'react';

type FeatureBadgeVariant = 'primary' | 'dark';

interface FeatureBadgeProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  variant?: FeatureBadgeVariant;
  className?: string;
}
const variantClasses: Record<FeatureBadgeVariant, string> = {
  primary: 'flex-row rounded-full bg-primary px-4 py-3 sm:px-5',
  dark: 'flex-col rounded-2xl bg-secondary px-5 py-4 text-center sm:px-6 sm:py-5'
};

export default function FeatureBadge({
  icon,
  title,
  subtitle,
  variant = 'primary',
  className = ''
}: FeatureBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 text-white shadow-lg ${variantClasses[variant]} ${className}`}
    >
      <span
        className="flex_center h-9 w-9 shrink-0 rounded-full text-16 sm:h-10 sm:w-10 sm:text-18 bg-[#FFFFFF4D]"
      >
        {icon}
      </span>
      <span>
        <span className="block text-11 font-bold uppercase tracking-wide sm:text-12">
          {title}
        </span>
        <span className="block text-[9px] text-white/80 sm:text-10">
          {subtitle}
        </span>
      </span>
    </div>
  );
}

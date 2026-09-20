interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  className = ''
}: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-24 font-semibold text-secondary md:text-28 lg:text-32">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-13 text-gray md:text-14">{subtitle}</p>
      )}
    </div>
  );
}

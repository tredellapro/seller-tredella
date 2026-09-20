import Image from 'next/image';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureItem({
  icon,
  title,
  description,
  className = ''
}: FeatureItemProps) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <Image
        src={icon}
        alt=""
        width={36}
        height={36}
        className="mt-1 h-8 w-8 shrink-0 sm:h-9 sm:w-9"
      />
      <div>
        <h3 className="text-17 font-medium text-secondary sm:text-19">
          {title}
        </h3>
        <p className="mt-1 text-13 text-gray sm:text-14">{description}</p>
      </div>
    </div>
  );
}

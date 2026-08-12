import Image from 'next/image';

interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function InfoCard({
  icon,
  title,
  description,
  className = ''
}: InfoCardProps) {
  return (
    <div
      className={`rounded-xl border border-secondary/10 bg-white p-6 sm:p-7 ${className}`}
    >
      <Image
        src={icon}
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 sm:h-10 sm:w-10"
      />
      <h3 className="mt-5 text-17 font-semibold text-secondary sm:text-19">
        {title}
      </h3>
      <p className="mt-2 text-13 text-gray sm:text-14">{description}</p>
    </div>
  );
}

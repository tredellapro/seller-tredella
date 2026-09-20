import Image from 'next/image';
import { FaStar } from 'react-icons/fa6';
import { Testimonial } from 'data/data';

interface TestimonialCardProps extends Testimonial {
  className?: string;
}

export default function TestimonialCard({
  title,
  quote,
  rating,
  name,
  role,
  avatar,
  className = ''
}: TestimonialCardProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-secondary/10 bg-white p-6 sm:p-7 ${className}`}
    >
      <h3 className="text-17 font-semibold text-secondary sm:text-19">
        {title}
      </h3>
      <p className="mt-4 text-13 text-gray sm:text-14">{quote}</p>
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-1 text-16 text-primary">
          {Array.from({ length: rating }, (_, i) => (
            <FaStar key={i} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex_center h-10 w-10 rounded-full bg-secondary text-13 font-semibold text-white">
              {initials}
            </span>
          )}
          <div>
            <p className="text-13 font-semibold text-secondary sm:text-14">
              {name}
            </p>
            <p className="text-11 text-gray sm:text-12">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

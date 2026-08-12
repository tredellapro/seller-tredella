import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { PricingPlan, PricingNote } from 'data/data';
import Button from 'components/ui/Button';

interface PricingCardProps {
  plan: PricingPlan;
  price: number;
  priceLabel: string;
  notes: PricingNote[];
  className?: string;
}

export default function PricingCard({
  plan,
  price,
  priceLabel,
  notes,
  className = ''
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl border border-secondary/10 bg-white ${className}`}
    >
      <div className="p-6 sm:p-7">
        <h3 className="text-18 font-semibold text-secondary sm:text-20">
          {plan.name}
        </h3>
        <p className="mt-4 flex items-end gap-2">
          <span className="text-[40px] font-semibold leading-none text-primary sm:text-[48px]">
            ${price}
          </span>
          <span className="pb-1 text-11 text-gray sm:text-12">
            {priceLabel}
          </span>
        </p>
        <Button href="/signup" variant="soft" className="mt-6 w-full">
          Buy Now
        </Button>
      </div>

      <div className="border-t border-secondary/10 p-6 sm:p-7">
        <h4 className="text-13 font-bold uppercase tracking-wide text-secondary sm:text-14">
          Benefits
        </h4>
        <p className="mt-1 text-13 text-gray">{plan.benefitsIntro}</p>
        <ul className="mt-5 space-y-4">
          {plan.benefits.map((benefit) => (
            <li
              key={benefit.text}
              className="flex items-center gap-3 text-13 text-gray"
            >
              {benefit.included ? (
                <FaCircleCheck className="shrink-0 text-16 text-green-500" />
              ) : (
                <FaCircleXmark className="shrink-0 text-16 text-primary" />
              )}
              {benefit.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-secondary/10 p-6 sm:p-7">
        <ul className="space-y-5">
          {notes.map((note) => (
            <li key={note.label} className="flex items-start gap-3">
              <FaCircleCheck className="mt-0.5 shrink-0 text-16 text-gray/70" />
              <p className="text-13 text-gray">
                <strong className="font-semibold text-secondary">
                  {note.label}
                </strong>{' '}
                {note.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

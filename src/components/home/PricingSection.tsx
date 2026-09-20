import { pricingPlans, pricingNotes } from 'data/data';
import SectionHeading from 'components/ui/SectionHeading';
import PricingCard from 'components/ui/PricingCard';

/* Two plans, billed monthly. There is no period to choose — quarterly was
   dropped as a product — so this section holds no state and needs no client
   boundary. */
export default function PricingSection() {
  return (
    <section className="bg-background">
      <div className="container py-12 lg:py-16">
        <SectionHeading
          title="Flexible Plans That Grow With Your Business"
          subtitle="Enjoy 0% Commission Fees"
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2 lg:gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              price={plan.monthlyPrice}
              priceLabel="Per month"
              notes={pricingNotes}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

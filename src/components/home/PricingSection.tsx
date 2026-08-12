'use client';

import { useState } from 'react';
import { pricingPlans, pricingNotes } from 'data/data';
import SectionHeading from 'components/ui/SectionHeading';
import ToggleTabs from 'components/ui/ToggleTabs';
import PricingCard from 'components/ui/PricingCard';

const billingOptions = [
  { label: 'Wholesale', value: 'wholesale' },
  { label: 'Quarterly (save 10%)', value: 'quarterly' }
];

export default function PricingSection() {
  const [billing, setBilling] = useState('wholesale');
  const isQuarterly = billing === 'quarterly';

  return (
    <section className="bg-background">
      <div className="container py-12 lg:py-16">
        <SectionHeading
          title="Flexible Plans That Grow With Your Business"
          subtitle="Enjoy 0% Commission Fees"
        />

        <div className="mt-8 flex justify-center lg:mt-10">
          <ToggleTabs
            options={billingOptions}
            value={billing}
            onChange={setBilling}
          />
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2 lg:gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              price={
                isQuarterly
                  ? Math.round(plan.monthlyPrice * 3 * 0.9)
                  : plan.monthlyPrice
              }
              priceLabel={isQuarterly ? 'Per quarter' : 'Per month'}
              notes={pricingNotes}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

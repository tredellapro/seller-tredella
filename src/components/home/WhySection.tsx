import { whyFeatures } from 'data/data';
import SectionHeading from 'components/ui/SectionHeading';
import InfoCard from 'components/ui/InfoCard';

export default function WhySection() {
  return (
    <section className="bg-background">
      <div className="container py-12 lg:py-16">
        <SectionHeading
          title="Why create Tredella selling account?"
          subtitle="More Than Just a Platform Tredella is Your Growth Partner."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-7">
          {whyFeatures.map((feature) => (
            <InfoCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

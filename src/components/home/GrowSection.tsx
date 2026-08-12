import Image from 'next/image';
import { growFeatures } from 'data/data';
import SectionHeading from 'components/ui/SectionHeading';
import FeatureItem from 'components/ui/FeatureItem';

export default function GrowSection() {
  return (
    <section className="bg-white">
      <div className="container py-12 lg:py-16">
        <p className="mx-auto max-w-4xl text-center text-14 text-secondary md:text-16 lg:text-17">
          Simply click the{' '}
          <strong className="font-semibold text-primary">
            &quot;Join Tredella Now&quot;
          </strong>{' '}
          button, fill in your{' '}
          <strong className="font-semibold text-primary">details,</strong> and
          you&apos;ll be ready to{' '}
          <strong className="font-semibold text-primary">start selling.</strong>
        </p>

        <SectionHeading
          title="How Tredella Helps Your Business Grow"
          subtitle="Empowering Businesses with Smart Solutions for Growth and Success."
          className="mt-14 lg:mt-20"
        />

        <div className="mt-10 grid items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-12 lg:mt-12 lg:gap-16">
          <Image
            src="/assets/images/home/business-grow.png"
            alt="Seller counting earnings next to a laptop"
            width={401}
            height={401}
            className="mx-auto h-auto w-full max-w-[340px] rounded-2xl md:max-w-none"
          />
          <div className="space-y-7 lg:space-y-9">
            {growFeatures.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

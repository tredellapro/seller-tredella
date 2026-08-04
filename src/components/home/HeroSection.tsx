import Image from 'next/image';
import Button from 'components/ui/Button';
import FeatureBadge from 'components/ui/FeatureBadge';

export default function HeroSection() {
  return (
    <section className="bg-background">
      <div className="container grid items-center gap-12 py-12 lg:grid-cols-2 lg:gap-8 lg:py-20">
        <div>
          <h1 className="text-30 font-semibold leading-snug xsm:text-34 md:text-[44px] md:leading-[1.35] xl:text-[52px]">
            <span className="block text-primary">Welcome to Tredella</span>
            <span className="block text-secondary">
              Empowering Your Business for Online Success
            </span>
          </h1>
          <Button href="/signup" className="mt-8 w-fit px-6 py-3 text-15 lg:mt-12">
            Join Tredella Now
          </Button>
        </div>

        <div className="relative mx-auto w-full max-w-[320px] xsm:max-w-[380px] sm:max-w-[440px] lg:max-w-[480px]">
          <Image
            src="/assets/images/home/hero-img.png"
            alt="Shopping cart on a laptop representing online selling with Tredella"
            width={480}
            height={480}
            priority
            className="h-auto w-full"
          />
          <FeatureBadge
            variant="primary"
            icon={
              <Image
                src="/assets/icons/ion_analytics.png"
                alt=""
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
            }
            title="Advanced Analytics"
            subtitle="For smarter decisions and growth"
            className="absolute -top-2 right-0 sm:top-0 sm:-right-4 xl:-right-10"
          />
          <FeatureBadge
            variant="dark"
            icon={
              <Image
                src="/assets/icons/fluent_shield-checkmark-32-regular.png"
                alt=""
                width={20}
                height={20}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
            }
            title="Trusted by Sellers"
            subtitle="Support businesses of all sizes"
            className="absolute -bottom-6 left-0 sm:-left-4 xl:-left-10"
          />
        </div>
      </div>
    </section>
  );
}

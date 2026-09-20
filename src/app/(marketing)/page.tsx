import HeroSection from 'components/home/HeroSection';
import GrowSection from 'components/home/GrowSection';
import WhySection from 'components/home/WhySection';
import TestimonialsSection from 'components/home/TestimonialsSection';
import PricingSection from 'components/home/PricingSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <GrowSection />
      <WhySection />
      <TestimonialsSection />
      <PricingSection />
    </main>
  );
}

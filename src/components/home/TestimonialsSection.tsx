'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { testimonials } from 'data/data';
import SectionHeading from 'components/ui/SectionHeading';
import TestimonialCard from 'components/ui/TestimonialCard';
import 'swiper/css';

export default function TestimonialsSection() {
  return (
    <section className="bg-white">
      <div className="container py-12 lg:py-16">
        <SectionHeading
          title="Success Stories from Our Sellers"
          subtitle="Discover How Tredella Transformed Their Businesses."
        />
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.testimonials-prev',
            nextEl: '.testimonials-next'
          }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3, spaceBetween: 28 }
          }}
          className="mt-10 lg:mt-12 !px-1 !py-1"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.name} className="!h-auto">
              <TestimonialCard {...testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonials"
            className="testimonials-prev flex_center h-10 w-10 rounded-full border border-secondary/20 bg-white text-16 text-secondary transition-opacity duration-200 [&.swiper-button-disabled]:opacity-40"
          >
            <HiArrowLeft />
          </button>
          <button
            type="button"
            aria-label="Next testimonials"
            className="testimonials-next flex_center h-10 w-10 rounded-full bg-primary text-16 text-white transition-opacity duration-200 [&.swiper-button-disabled]:opacity-40"
          >
            <HiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

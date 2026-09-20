'use client';

import Link from 'next/link';
import Header from 'components/layout/Header';
import Footer from 'components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex_center h-[90vh]">
      <div className="flex flex-col items-center gap-4 relative">
        <h2 className="text-2xl xsm:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black">
          There&apos;s <span className="uppercase">Nothing</span> here ...
        </h2>
        <p className="text-center px-2 xsm:px-0 text-10 xsm:text-12 sm:text-base md:text-lg lg:text-xl">
          ...maybe the page you are looking for is not found or never existed.
        </p>
        <div className="flex_center gap-4">
          <Link
            className="w-35 sm:w-40 h-10 sm:h-12 text-sm sm:text-base flex_center rounded-full bg-primary text-white hover:bg-white border border-primary hover:text-primary transition px-6"
            href="/"
          >
            Back to Home
          </Link>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaLock } from 'react-icons/fa6';
import Button from 'components/ui/Button';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-background transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : 'shadow-none'
      }`}
    >
      <div className="container flex flex-wrap items-end justify-between gap-x-4 gap-y-2 py-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/assets/images/logo.webp"
            alt="Tredella"
            width={140}
            height={45}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <p className="order-3 flex w-full items-center justify-center gap-2 text-center text-13 text-secondary md:order-none md:w-auto md:text-14 lg:text-15">
          <FaLock className="shrink-0 text-16 text-secondary" />
          <span>
            Unlock Endless Opportunities with Tredella Start Selling{' '}
            <strong className="font-semibold">
              Smarter, Faster, and Easier
            </strong>
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <Button href="/login" variant="outline">
            Log in
          </Button>
          <Button href="/signup" variant="primary">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}

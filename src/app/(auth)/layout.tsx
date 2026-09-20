import Image from 'next/image';
import { ReactNode } from 'react';

/* Auth screens have their own chrome: no site header or footer, a centred card
   and the wave artwork anchored to the bottom of the viewport. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <Image
        src="/assets/images/auth/auth-waves.png"
        alt=""
        aria-hidden="true"
        width={1440}
        height={757}
        priority
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 w-full select-none object-cover"
      />

      {children}
    </div>
  );
}

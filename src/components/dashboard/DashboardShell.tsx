'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardUtilityBar from './DashboardUtilityBar';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

/* Frame for every dashboard page: contact strip across the top, sidebar on the
   left from lg up, and a drawer below that. */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // navigating from the drawer should not leave it sitting open behind the page
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    /* The drawer covers the page, so the page behind it must not scroll —
       otherwise closing it lands you somewhere you never chose. */
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardUtilityBar />

      <div className="flex">
        <DashboardSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* min-w-0 stops a wide table from stretching the column past the viewport */}
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar onMenuClick={() => setMenuOpen(true)} />
          <main className="flex-1 px-4 pb-12 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiX } from 'react-icons/hi';
import { DASHBOARD_NAV } from 'data/dashboard-nav';

interface DashboardSidebarProps {
  /** Mobile only: the drawer is open. */
  open: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({
  open,
  onClose
}: DashboardSidebarProps) {
  const pathname = usePathname();

  /* /dashboard is the Analytics page, so it must match exactly — otherwise it
     would light up on every section beneath it. */
  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Backdrop only exists while the drawer is open on small screens */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-secondary/40 lg:hidden"
        />
      )}

      {/* Shown or hidden outright rather than slid in: toggling a positioning
          class left the panel stuck off-canvas — the computed offset kept its
          closed value even with the open class applied. `display` is
          unambiguous, and the drawer is only ever on screen below lg. */}
      <aside
        aria-label="Dashboard"
        className={`fixed inset-y-0 left-0 z-50 w-[253px] shrink-0 flex-col overflow-y-auto border-r border-secondary/10 bg-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen ${
          open ? 'flex' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/dashboard" aria-label="Tredella dashboard">
            <Image
              src="/assets/images/logo.webp"
              alt="Tredella"
              width={150}
              height={48}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-20 text-secondary transition-colors hover:text-primary lg:hidden"
          >
            <HiX />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-7 px-6 pb-8">
          {DASHBOARD_NAV.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-11 font-semibold uppercase tracking-wider text-gray">
                {group.title}
              </p>

              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-14 transition-colors ${
                          active
                            ? 'bg-primary font-medium text-white'
                            : 'text-secondary hover:bg-background'
                        }`}
                      >
                        <Icon
                          className={`shrink-0 text-20 ${
                            active ? 'text-white' : 'text-gray'
                          }`}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

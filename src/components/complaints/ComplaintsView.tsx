'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineSearch
} from 'react-icons/hi';
import PageHeader from 'components/dashboard/PageHeader';
import { PriorityBadge, StatusBadge } from './ComplaintBadges';
import {
  COMPLAINTS,
  complaintDate,
  type Complaint
} from 'data/complaints-sample';

const TABS = ['Open', 'Solved'] as const;
type Tab = (typeof TABS)[number];

const PER_PAGE = 6;

export default function ComplaintsView() {
  const [tab, setTab] = useState<Tab>('Open');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      Open: COMPLAINTS.filter((c) => c.status === 'OPEN').length,
      Solved: COMPLAINTS.filter((c) => c.status === 'SOLVED').length
    }),
    []
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const wanted = tab === 'Open' ? 'OPEN' : 'SOLVED';

    return COMPLAINTS.filter((complaint) => {
      if (complaint.status !== wanted) return false;
      if (!term) return true;
      return `${complaint.title} ${complaint.category} ${complaint.raisedBy.name} ${complaint.id}`
        .toLowerCase()
        .includes(term);
    });
  }, [tab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Manage Complaints"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Complaints', href: '/dashboard/complaints' },
          { label: 'Manage Complaints' }
        ]}
      />

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Complaint status"
          className="flex min-w-max gap-6 border-b border-secondary/10"
        >
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => {
                setTab(name);
                setPage(1);
              }}
              className={`relative whitespace-nowrap pb-3 text-14 transition-colors ${
                tab === name
                  ? 'font-medium text-primary'
                  : 'text-gray hover:text-secondary'
              }`}
            >
              {name}
              <span className="ml-1.5 text-12 text-gray">({counts[name]})</span>
              {tab === name && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-[320px]">
        <label htmlFor="complaint-search" className="sr-only">
          Search complaints
        </label>
        <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
        <input
          id="complaint-search"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search"
          className="w-full rounded-lg border border-secondary/15 bg-white py-2 pl-9 pr-3 text-13 text-secondary outline-none transition-colors placeholder:text-gray focus:border-primary"
        />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-16 text-center text-13 text-gray shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
          {search.trim()
            ? 'No complaints match that search.'
            : `Nothing ${tab.toLowerCase()} right now.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((complaint: Complaint) => (
            <li key={complaint.id}>
              {/* The whole card is the target — an arrow that small is a poor
                  hit area on a phone. */}
              <Link
                href={`/dashboard/complaints/${complaint.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_4px_30px_rgba(43,52,69,0.06)] transition-shadow hover:shadow-[0_4px_30px_rgba(43,52,69,0.14)] sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-14 text-secondary">
                    {complaint.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <PriorityBadge priority={complaint.priority} />
                    <StatusBadge status={complaint.status} />
                    <span className="text-12 text-gray">
                      {complaintDate(complaint.createdAt)}
                    </span>
                    <span className="text-12 text-gray">
                      {complaint.category}
                    </span>
                  </div>
                </div>

                <HiArrowRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > PER_PAGE && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-1.5 pt-1"
        >
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary/8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiChevronLeft className="h-3.5 w-3.5" />
          </button>

          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                aria-current={number === current ? 'page' : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-12 transition-colors ${
                  number === current
                    ? 'border border-primary text-primary'
                    : 'text-gray hover:text-primary'
                }`}
              >
                {number}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current === pageCount}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 text-primary transition-colors hover:bg-primary/8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineSearch,
  HiX
} from 'react-icons/hi';
import DataTable, { type Column } from 'components/dashboard/DataTable';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import FilterSelect from 'components/common/FilterSelect';
import Modal from 'components/ui/Modal';
import { aedExact } from 'data/dashboard-sample';
import { longDate, monthLabel } from 'data/products-sample';
import { DRAWDOWNS, PAYMENT_MONTHS, TODAY, type Drawdown } from 'data/payments-sample';
import { daysBetween } from 'lib/payouts';

const SUB_TABS = ['Active Drawdowns', 'Approved', 'Cancelled'] as const;
type SubTab = (typeof SUB_TABS)[number];

const PER_PAGE = 6;

const STATUS_TONE: Record<Drawdown['status'], string> = {
  Pending: 'text-amber-600',
  Approved: 'text-green-600',
  Cancelled: 'text-primary'
};

const csvCell = (value: string | number): string => {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function OrderHistoryTab() {
  const [tab, setTab] = useState<SubTab>('Active Drawdowns');
  const [search, setSearch] = useState('');
  const [draftMonth, setDraftMonth] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Drawdown | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return DRAWDOWNS.filter((row) => {
      if (tab === 'Approved' && row.status !== 'Approved') return false;
      if (tab === 'Cancelled' && row.status !== 'Cancelled') return false;
      // "Active" means still owed — settled and cancelled rows drop out
      if (tab === 'Active Drawdowns' && row.status !== 'Pending') return false;
      if (month && !row.createdAt.startsWith(month)) return false;
      if (term && !`${row.orderId} ${row.amount}`.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [tab, search, month]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const exportCsv = () => {
    const header = ['Order ID', 'Amount (AED)', 'Payment Terms', 'Due Date', 'Status', 'Created'];
    const body = filtered.map((row) => [
      row.orderId, row.amount, `${row.paymentTermsDays} Days`,
      row.dueDate, row.status, row.createdAt
    ]);
    const csv = [header, ...body].map((line) => line.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(
      new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `tredella-drawdowns-${TODAY}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Drawdown>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      render: (row) => <span className="text-13 text-secondary">{row.orderId}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {aedExact(row.amount)}
        </span>
      )
    },
    {
      key: 'terms',
      header: 'Payment Terms',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.paymentTermsDays} Days
        </span>
      )
    },
    {
      key: 'due',
      header: 'Payment Due Date',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {longDate(row.dueDate)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`whitespace-nowrap text-13 ${STATUS_TONE[row.status]}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'created',
      header: 'Create at',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-gray">
          {longDate(row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          aria-label={`Payment details for order ${row.orderId}`}
          className="rounded-full border border-primary/20 p-1.5 text-15 text-primary transition-colors hover:bg-primary/8"
        >
          <HiOutlineEye />
        </button>
      )
    }
  ];

  const daysLeft = viewing ? daysBetween(TODAY, viewing.dueDate) : 0;

  return (
    <div className="flex flex-col gap-5">
      <Panel flush>
        <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-14 font-semibold text-secondary">Order History</h2>

            <div className="no-scrollbar -mb-px overflow-x-auto">
              <div role="tablist" aria-label="Drawdown status" className="flex min-w-max gap-6">
                {SUB_TABS.map((name) => (
                  <button
                    key={name}
                    role="tab"
                    type="button"
                    aria-selected={tab === name}
                    onClick={() => {
                      setTab(name);
                      setPage(1);
                    }}
                    className={`relative whitespace-nowrap pb-2 text-13 transition-colors ${
                      tab === name
                        ? 'font-medium text-secondary'
                        : 'text-gray hover:text-secondary'
                    }`}
                  >
                    {name}
                    {tab === name && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-secondary"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-[minmax(180px,1fr)_minmax(120px,160px)_auto_auto]">
            <div className="relative">
              <label htmlFor="drawdown-search" className="sr-only">
                Search drawdowns
              </label>
              <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
              <input
                id="drawdown-search"
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

            <FilterSelect
              idPrefix="dd"
              label="Date"
              value={draftMonth}
              icon={<HiOutlineCalendar className="h-4 w-4" />}
              onChange={setDraftMonth}
              options={PAYMENT_MONTHS.map((m) => ({ value: m, label: monthLabel(m) }))}
            />

            <button
              type="button"
              onClick={() => {
                setMonth(draftMonth);
                setPage(1);
              }}
              className="whitespace-nowrap rounded-lg bg-secondary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-secondary/90"
            >
              Apply Filter
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              <HiOutlineDownload className="h-4 w-4" />
              Export
            </button>
          </div>

          {month && (
            <ul className="flex flex-wrap items-center gap-2">
              <li>
                <span className="flex items-center gap-1.5 rounded-md bg-primary/8 py-1 pl-2.5 pr-1.5 text-12 text-secondary">
                  <span className="text-gray">Date:</span>
                  {monthLabel(month)}
                  <button
                    type="button"
                    onClick={() => {
                      setMonth('');
                      setDraftMonth('');
                      setPage(1);
                    }}
                    aria-label="Clear date filter"
                    className="rounded p-0.5 text-primary transition-colors hover:bg-primary/15"
                  >
                    <HiX className="h-3 w-3" />
                  </button>
                </span>
              </li>
            </ul>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => `${row.orderId}-${row.createdAt}`}
            emptyMessage="Nothing here for these filters."
          />
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-12 text-gray">
              Showing {(current - 1) * PER_PAGE + 1}–
              {Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-secondary/15 text-gray transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === current ? 'page' : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-12 transition-colors ${
                    number === current
                      ? 'bg-primary font-medium text-white'
                      : 'text-gray hover:text-primary'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(current + 1)}
                disabled={current === pageCount}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-secondary/15 text-gray transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiChevronRight className="h-3.5 w-3.5" />
              </button>
            </nav>
          </div>
        )}
      </Panel>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Order Payment Details"
      >
        {viewing && (
          <DetailRows
            rows={[
              { label: 'Order ID', value: viewing.orderId },
              { label: 'Payment Due Date', value: longDate(viewing.dueDate) },
              {
                label: 'Days Left',
                value:
                  daysLeft > 0
                    ? `${daysLeft} Days`
                    : daysLeft === 0
                      ? 'Due today'
                      : `${Math.abs(daysLeft)} days overdue`,
                emphasis: daysLeft <= 0
              },
              { label: 'Amount', value: aedExact(viewing.amount), emphasis: true },
              { label: 'Status', value: viewing.status }
            ]}
          />
        )}
      </Modal>
    </div>
  );
}

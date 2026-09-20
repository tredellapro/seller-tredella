'use client';

import { useMemo, useState } from 'react';
import {
  HiExclamationCircle,
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
import { firstWords } from 'lib/formatters';
import { longDate, monthLabel } from 'data/products-sample';
import { PAYMENT_MONTHS, REFUNDS, TODAY, type RefundRow } from 'data/payments-sample';

const PER_PAGE = 6;

const STATUS_TONE: Record<RefundRow['status'], string> = {
  Pending: 'text-amber-600',
  Approved: 'text-green-600',
  Cancelled: 'text-primary'
};

const csvCell = (value: string | number): string => {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function RefundsTab() {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ freeze: '', status: '', month: '' });
  const [applied, setApplied] = useState({ freeze: '', status: '', month: '' });
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<RefundRow | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return REFUNDS.filter((row) => {
      if (applied.freeze === 'Yes' && !row.freezeAmount) return false;
      if (applied.freeze === 'No' && row.freezeAmount) return false;
      if (applied.status && row.status !== applied.status) return false;
      if (applied.month && !row.date.startsWith(applied.month)) return false;
      if (term && !`${row.orderId} ${row.product.name}`.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [search, applied]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const frozenTotal = filtered
    .filter((row) => row.freezeAmount)
    .reduce((sum, row) => sum + row.refundAmount, 0);

  const exportCsv = () => {
    const header = ['Order ID', 'Product', 'Items', 'Refund Amount (AED)', 'Frozen', 'Status', 'Date', 'Note'];
    const body = filtered.map((row) => [
      row.orderId, row.product.name, row.items, row.refundAmount,
      row.freezeAmount ? 'Yes' : 'No', row.status, row.date, row.note ?? ''
    ]);
    const csv = [header, ...body].map((line) => line.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(
      new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `tredella-refunds-${TODAY}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<RefundRow>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      render: (row) => <span className="text-13 text-secondary">{row.orderId}</span>
    },
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        <div className="flex w-[300px] min-w-[240px] max-w-[300px] items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.product.image}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-lg bg-background object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-13 text-secondary">{row.product.name}</p>
            <p
              title={row.product.description}
              className="line-clamp-2 text-11 leading-snug text-gray"
            >
              {firstWords(row.product.description, 30)}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.items} {row.items === 1 ? 'Item' : 'Items'}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Refund Amount',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {aedExact(row.refundAmount)}
        </span>
      )
    },
    {
      key: 'freeze',
      header: 'Freeze Amount',
      render: (row) => (
        <span
          className={`whitespace-nowrap text-13 ${
            row.freezeAmount ? 'text-primary' : 'text-secondary'
          }`}
        >
          {row.freezeAmount ? 'Yes' : 'No'}
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
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          aria-label={`Refund details for order ${row.orderId}`}
          className="rounded-full border border-primary/20 p-1.5 text-15 text-primary transition-colors hover:bg-primary/8"
        >
          <HiOutlineEye />
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-5">
      <Panel flush>
        <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-14 font-semibold text-secondary">Refunds Details</h2>
            {frozenTotal > 0 && (
              <p className="text-12 text-gray">
                <span className="font-medium text-primary">
                  {aedExact(frozenTotal)}
                </span>{' '}
                frozen across these rows
              </p>
            )}
          </div>

          <div className="grid gap-2.5 lg:grid-cols-[minmax(180px,1fr)_repeat(3,minmax(120px,150px))_auto_auto]">
            <div className="relative">
              <label htmlFor="refund-search" className="sr-only">
                Search refunds
              </label>
              <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
              <input
                id="refund-search"
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
              idPrefix="rf"
              label="Freeze Amount"
              value={draft.freeze}
              onChange={(value) => setDraft({ ...draft, freeze: value })}
              options={[
                { value: 'Yes', label: 'Frozen' },
                { value: 'No', label: 'Not frozen' }
              ]}
            />
            <FilterSelect
              idPrefix="rf"
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft({ ...draft, status: value })}
              options={['Pending', 'Approved', 'Cancelled'].map((s) => ({
                value: s,
                label: s
              }))}
            />
            <FilterSelect
              idPrefix="rf"
              label="Date"
              value={draft.month}
              icon={<HiOutlineCalendar className="h-4 w-4" />}
              onChange={(value) => setDraft({ ...draft, month: value })}
              options={PAYMENT_MONTHS.map((m) => ({ value: m, label: monthLabel(m) }))}
            />

            <button
              type="button"
              onClick={() => {
                setApplied(draft);
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

          {(applied.freeze || applied.status || applied.month) && (
            <ul className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['freeze', 'Freeze Amount', applied.freeze],
                  ['status', 'Status', applied.status],
                  ['month', 'Date', applied.month ? monthLabel(applied.month) : '']
                ] as [string, string, string][]
              )
                .filter(([, , value]) => value)
                .map(([key, label, value]) => (
                  <li key={key}>
                    <span className="flex items-center gap-1.5 rounded-md bg-primary/8 py-1 pl-2.5 pr-1.5 text-12 text-secondary">
                      <span className="text-gray">{label}:</span>
                      {value}
                      <button
                        type="button"
                        onClick={() => {
                          setApplied((c) => ({ ...c, [key]: '' }));
                          setDraft((c) => ({ ...c, [key]: '' }));
                          setPage(1);
                        }}
                        aria-label={`Clear ${label} filter`}
                        className="rounded p-0.5 text-primary transition-colors hover:bg-primary/15"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => `${row.orderId}-${row.date}`}
            emptyMessage="No refunds match these filters."
          />
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-12 text-gray">
              Showing {(current - 1) * PER_PAGE + 1}–
              {Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <nav aria-label="Pagination" className="flex items-center gap-1.5">
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
            </nav>
          </div>
        )}
      </Panel>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Order Refund Details"
      >
        {viewing && (
          <div className="flex flex-col gap-4">
            {viewing.note && (
              <p className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-12 text-secondary">
                <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {viewing.note}
              </p>
            )}

            <DetailRows
              rows={[
                { label: 'Order ID', value: viewing.orderId },
                { label: 'Items', value: String(viewing.items) },
                {
                  label: 'Refund Amount',
                  value: aedExact(viewing.refundAmount),
                  emphasis: true
                },
                { label: 'Status', value: viewing.status },
                {
                  label: 'Freeze Amount',
                  value: viewing.freezeAmount ? 'Yes' : 'No',
                  emphasis: viewing.freezeAmount
                },
                { label: 'Date', value: longDate(viewing.date) }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

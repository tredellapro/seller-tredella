'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiDotsVertical,
  HiOutlineBan,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiX
} from 'react-icons/hi';
import DataTable, { type Column } from 'components/dashboard/DataTable';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import StatCard from 'components/dashboard/StatCard';
import { OrderStatus, PaymentStatus } from 'components/dashboard/StatusText';
import { useStorefront } from 'components/dashboard/StorefrontContext';
import ChangeStatusModal, { type StatusChange } from './ChangeStatusModal';
import { aedExact } from 'data/dashboard-sample';
import {
  ORDERS,
  ORDER_MONTHS,
  PAYMENT_METHODS,
  type OrderRow
} from 'data/orders-sample';
import { longDate, monthLabel } from 'data/products-sample';
import { firstWords } from 'lib/formatters';
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  customerEmailSubject,
  customerEmailTracking
} from 'lib/orderStatus';
import { MODE_LABEL } from 'lib/storefront';

/* No cash on delivery, so every order arrives paid — "Unpaid" from the design
   is not a state that can occur. Refunded takes its place as the other
   payment-side tab. */
const TABS = [
  'All',
  'Paid',
  'Refunded',
  'Processing',
  'Shipped',
  'Cancelled'
] as const;
type Tab = (typeof TABS)[number];

const PER_PAGE = 6;

interface Filters {
  paymentMethod: string;
  coupon: string;
  month: string;
}

const EMPTY: Filters = { paymentMethod: '', coupon: '', month: '' };

const FILTER_LABELS: Record<keyof Filters, string> = {
  paymentMethod: 'Payment Method',
  coupon: 'Coupon',
  month: 'Date'
};

/* Excel treats a leading =, +, - or @ as a formula, so an exported cell is
   quoted and prefixed before it can be executed by a spreadsheet. */
const csvCell = (value: string | number): string => {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** Which tabs narrow by payment state rather than order state. */
const matchesTab = (order: OrderRow, tab: Tab): boolean => {
  switch (tab) {
    case 'All':
      return true;
    case 'Paid':
      return order.paymentStatus === 'PAID';
    case 'Refunded':
      return order.paymentStatus === 'REFUNDED';
    case 'Processing':
      return order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PENDING';
    case 'Shipped':
      return order.orderStatus === 'SHIPPED';
    case 'Cancelled':
      return order.orderStatus === 'CANCELLED';
  }
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (_value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={`order-filter-${label}`} className="sr-only">
        {label}
      </label>
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray">
          {icon}
        </span>
      )}
      <select
        id={`order-filter-${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2 pr-8 text-13 outline-none transition-colors focus:border-primary ${
          icon ? 'pl-9' : 'pl-3'
        } ${value ? 'text-secondary' : 'text-gray'}`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <HiChevronDown className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-gray" />
    </div>
  );
}

export default function OrdersListView() {
  const { mode } = useStorefront();

  /* Held in state so a status change is visible straight away. The seller-side
     mutation does not exist yet — see the note on `saveStatus`. */
  const [orders, setOrders] = useState<OrderRow[]>(ORDERS);
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [changing, setChanging] = useState<OrderRow | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const book = useMemo(
    () => orders.filter((order) => order.mode === mode),
    [orders, mode]
  );

  useEffect(() => setPage(1), [mode]);

  const counts = useMemo(
    () => ({
      total: book.length,
      pending: book.filter(
        (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED'
      ).length,
      delivered: book.filter(
        (o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED'
      ).length,
      cancelled: book.filter((o) => o.orderStatus === 'CANCELLED').length
    }),
    [book]
  );

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((name) => [name, book.filter((o) => matchesTab(o, name)).length])
      ) as Record<Tab, number>,
    [book]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return book.filter((order) => {
      if (!matchesTab(order, tab)) return false;
      if (applied.paymentMethod && order.paymentMethod !== applied.paymentMethod)
        return false;
      if (applied.coupon === 'Yes' && !order.coupon) return false;
      if (applied.coupon === 'No' && order.coupon) return false;
      if (applied.month && !order.date.startsWith(applied.month)) return false;

      if (term) {
        const haystack =
          `${order.id} ${order.product.name} ${order.customer.name} ${order.customer.email} ${order.paymentMethod}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [book, tab, search, applied]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const activeChips = (Object.keys(applied) as (keyof Filters)[])
    .filter((key) => applied[key])
    .map((key) => ({
      key,
      label: FILTER_LABELS[key],
      value: key === 'month' ? monthLabel(applied[key]) : applied[key]
    }));

  /**
   * Apply a status change.
   *
   * The seller-side `updateSellerOrderStatus` mutation is not built yet — when
   * it is, this is the one call site, and the customer email is dispatched
   * server-side so it cannot be skipped by a client that never fires it.
   */
  const saveStatus = (orderId: string, change: StatusChange) => {
    const order = orders.find((o) => o.id === orderId);
    const statusMoved = order && order.orderStatus !== change.orderStatus;

    setOrders((all) =>
      all.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: change.orderStatus,
              paymentStatus: change.paymentStatus,
              ...(change.courier
                ? { courier: change.courier, shipping: change.courier.companyName }
                : {})
            }
          : o
      )
    );
    setChanging(null);

    if (!statusMoved) {
      setSent(`Order ${orderId} updated.`);
      return;
    }

    const tracking = customerEmailTracking(
      change.orderStatus,
      change.courier ?? null
    );

    setSent(
      `${order.customer.email} emailed — "${customerEmailSubject(orderId, change.orderStatus)}"${
        tracking.length > 0 ? `, with tracking (${tracking[0]}).` : '.'
      }`
    );
  };

  const exportCsv = () => {
    const header = [
      'Order ID', 'Product', 'Items', 'Total (AED)', 'Discount %', 'Coupon',
      'Payment Method', 'Payment Status', 'Shipping', 'Order Status',
      'Customer', 'Email', 'Date'
    ];

    const body = filtered.map((order) => [
      order.id, order.product.name, order.items, order.total,
      order.discountPercent || '', order.coupon ?? 'No',
      order.paymentMethod, PAYMENT_STATUS_LABEL[order.paymentStatus],
      order.shipping, ORDER_STATUS_LABEL[order.orderStatus],
      order.customer.name, order.customer.email, order.date
    ]);

    const csv = [header, ...body]
      .map((line) => line.map(csvCell).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `tredella-${mode.toLowerCase()}-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<OrderRow>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => <span className="text-13 text-secondary">{row.id}</span>
    },
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        <Link
          href={`/dashboard/orders/${row.id}`}
          className="group flex w-[300px] min-w-[240px] max-w-[300px] items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.product.image}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-lg bg-background object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-13 text-secondary transition-colors group-hover:text-primary">
              {row.product.name}
            </p>
            <p
              title={row.product.description}
              className="line-clamp-2 text-11 leading-snug text-gray"
            >
              {firstWords(row.product.description, 30)}
            </p>
          </div>
        </Link>
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
      key: 'total',
      header: 'Total',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {aedExact(row.total)}
        </span>
      )
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.discountPercent > 0 ? `${row.discountPercent}% OFF` : '—'}
        </span>
      )
    },
    {
      key: 'coupon',
      header: 'Coupon',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.coupon ?? 'No'}
        </span>
      )
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.paymentMethod}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      render: (row) => (
        <PaymentStatus status={PAYMENT_STATUS_LABEL[row.paymentStatus]} />
      )
    },
    {
      key: 'shipping',
      header: 'Shipping',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.shipping}
        </span>
      )
    },
    {
      key: 'orderStatus',
      header: 'Order Status',
      render: (row) => (
        <OrderStatus status={ORDER_STATUS_LABEL[row.orderStatus]} />
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-gray">
          {longDate(row.date)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/orders/${row.id}`}
            aria-label={`View order ${row.id}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlineEye />
          </Link>
          <button
            type="button"
            aria-label={`Delete order ${row.id}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlineTrash />
          </button>
          <button
            type="button"
            onClick={() => setChanging(row)}
            title="Change status"
            aria-label={`Change status for order ${row.id}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiDotsVertical />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Manage Orders"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard/orders' },
          { label: `${MODE_LABEL[mode]} orders` }
        ]}
      />

      {sent && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{sent}</span>
          <button
            type="button"
            onClick={() => setSent(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0 rounded p-0.5 text-gray transition-colors hover:text-primary"
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          stats={[
            {
              icon: HiOutlineShoppingCart,
              label: 'Total Orders',
              value: String(counts.total)
            }
          ]}
        />
        <StatCard
          stats={[
            {
              icon: HiOutlineClock,
              label: 'Pending Orders',
              value: String(counts.pending)
            }
          ]}
        />
        <StatCard
          stats={[
            {
              icon: HiOutlineCheckCircle,
              label: 'Delivered',
              value: String(counts.delivered)
            }
          ]}
        />
        <StatCard
          stats={[
            {
              icon: HiOutlineBan,
              label: 'Cancelled',
              value: String(counts.cancelled)
            }
          ]}
        />
      </div>

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Order status"
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
              <span className="ml-1.5 text-12 text-gray">({tabCounts[name]})</span>
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

      <Panel flush>
        <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6">
          <div className="grid gap-2.5 lg:grid-cols-[minmax(200px,1fr)_repeat(3,minmax(120px,160px))_auto_auto]">
            <div className="relative">
              <label htmlFor="order-search" className="sr-only">
                Search orders
              </label>
              <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
              <input
                id="order-search"
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
              label="Payment Method"
              value={draft.paymentMethod}
              onChange={(value) => setDraft({ ...draft, paymentMethod: value })}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
            <FilterSelect
              label="Coupon"
              value={draft.coupon}
              onChange={(value) => setDraft({ ...draft, coupon: value })}
              options={[
                { value: 'Yes', label: 'Used' },
                { value: 'No', label: 'Not used' }
              ]}
            />
            <FilterSelect
              label="Date"
              value={draft.month}
              icon={<HiOutlineCalendar className="h-4 w-4" />}
              onChange={(value) => setDraft({ ...draft, month: value })}
              options={ORDER_MONTHS.map((m) => ({
                value: m,
                label: monthLabel(m)
              }))}
            />

            <button
              type="button"
              onClick={() => {
                setApplied(draft);
                setPage(1);
              }}
              className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
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

          {activeChips.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <li key={chip.key}>
                  <span className="flex items-center gap-1.5 rounded-md bg-primary/8 py-1 pl-2.5 pr-1.5 text-12 text-secondary">
                    <span className="text-gray">{chip.label}:</span>
                    {chip.value}
                    <button
                      type="button"
                      onClick={() => {
                        setApplied((c) => ({ ...c, [chip.key]: '' }));
                        setDraft((c) => ({ ...c, [chip.key]: '' }));
                        setPage(1);
                      }}
                      aria-label={`Clear ${chip.label} filter`}
                      className="rounded p-0.5 text-primary transition-colors hover:bg-primary/15"
                    >
                      <HiX className="h-3 w-3" />
                    </button>
                  </span>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setApplied(EMPTY);
                    setDraft(EMPTY);
                    setPage(1);
                  }}
                  className="px-1 text-12 text-primary hover:underline"
                >
                  Clear all
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage={`No ${MODE_LABEL[mode].toLowerCase()} orders match these filters.`}
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

              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (number) => (
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
                )
              )}

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

      <ChangeStatusModal
        order={changing}
        onClose={() => setChanging(null)}
        onSave={saveStatus}
      />
    </div>
  );
}

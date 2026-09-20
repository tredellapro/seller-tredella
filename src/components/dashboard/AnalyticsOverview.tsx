'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineTag
} from 'react-icons/hi';
import Panel from './Panel';
import PeriodSelect from './PeriodSelect';
import StatCard from './StatCard';
import DataTable, { type Column } from './DataTable';
import { OrderStatus, PaymentStatus } from './StatusText';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import {
  INCOMING_ORDERS,
  ORDER_BREAKDOWN,
  REVENUE_BY_MONTH,
  REVENUE_CEILING,
  REVENUE_TICKS,
  aed,
  aedExact,
  compactAed,
  type IncomingOrder
} from 'data/dashboard-sample';

const MONTHS = ['Jan 2025', 'Feb 2025', 'Mar 2025'];
const QUARTERS = ['July 2024', 'Aug 2024', 'Sep 2024'];

const columns: Column<IncomingOrder>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="text-13 text-secondary">{row.id}</span>
  },
  {
    key: 'product',
    header: 'Product',
    render: (row) => (
      <div className="flex min-w-[260px] items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={row.product.image}
          alt=""
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-lg bg-background object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-13 text-secondary">{row.product.name}</p>
          <p className="truncate text-11 text-gray">{row.product.description}</p>
        </div>
      </div>
    )
  },
  {
    key: 'items',
    header: 'Items',
    render: (row) => (
      <span className="whitespace-nowrap text-13 text-secondary">
        {row.items} Items
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
    key: 'payment',
    header: 'Payment Status',
    render: (row) => <PaymentStatus status={row.paymentStatus} />
  },
  {
    key: 'order',
    header: 'Order Status',
    render: (row) => <OrderStatus status={row.orderStatus} />
  },
  {
    key: 'date',
    header: 'Date',
    render: (row) => (
      <span className="whitespace-nowrap text-13 text-gray">{row.date}</span>
    )
  }
];

/** The Analytics screen. Every block is a component that takes its data as props. */
export default function AnalyticsOverview() {
  const [revenueMonth, setRevenueMonth] = useState(MONTHS[0]);
  const [ordersMonth, setOrdersMonth] = useState(QUARTERS[0]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="sr-only">Analytics</h1>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          stats={[
            {
              icon: HiOutlineShoppingCart,
              label: 'Orders',
              value: '54',
              period: 'Today',
              delta: { value: '12', direction: 'up', comparison: 'vs same day last week' }
            },
            {
              icon: HiOutlineClock,
              label: 'Pending Orders',
              value: '07'
            }
          ]}
        />
        <StatCard
          stats={[
            {
              icon: HiOutlineCurrencyDollar,
              label: 'Total Sales',
              value: aed(2370),
              period: 'Today',
              delta: { value: aed(350), direction: 'up', comparison: 'vs same day last week' }
            }
          ]}
        />
        <StatCard
          stats={[
            {
              icon: HiOutlineTag,
              label: 'Total Deals',
              value: aed(1280),
              period: 'Today',
              delta: { value: aed(147), direction: 'up', comparison: 'vs same day last week' }
            }
          ]}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Panel
          title="Revenue Chart"
          action={
            <PeriodSelect
              label="Revenue period"
              value={revenueMonth}
              options={MONTHS}
              onChange={setRevenueMonth}
            />
          }
        >
          <BarChart
            data={REVENUE_BY_MONTH}
            max={REVENUE_CEILING}
            ticks={REVENUE_TICKS}
            seriesLabel="Sales"
            formatValue={aed}
            formatTick={compactAed}
          />
        </Panel>

        <Panel
          title="Order Analytics"
          action={
            <PeriodSelect
              label="Order analytics period"
              value={ordersMonth}
              options={QUARTERS}
              onChange={setOrdersMonth}
            />
          }
        >
          <DonutChart data={ORDER_BREAKDOWN} />
        </Panel>
      </div>

      <Panel
        flush
        title="Incoming Orders"
        action={
          <Link
            href="/dashboard/orders"
            className="rounded-lg border border-secondary/15 px-3 py-1.5 text-12 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
          >
            See all
          </Link>
        }
      >
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={INCOMING_ORDERS}
            rowKey={(row) => row.id}
            emptyMessage="No incoming orders yet."
          />
        </div>
      </Panel>
    </div>
  );
}

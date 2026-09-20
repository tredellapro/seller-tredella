'use client';

import { useState } from 'react';
import Link from 'next/link';
import Panel from './Panel';
import PageHeader from './PageHeader';
import PeriodSelect from './PeriodSelect';
import StatCard from './StatCard';
import DataTable, { type Column } from './DataTable';
import { OrderStatus, PaymentStatus } from './StatusText';
import { useStorefront } from './StorefrontContext';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import {
  DASHBOARD_BY_MODE,
  aed,
  aedExact,
  compactAed,
  type IncomingOrder
} from 'data/dashboard-sample';
import { firstWords } from 'lib/formatters';
import { MODE_LABEL } from 'lib/storefront';

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
      /* Bounded, or a long description takes its intrinsic width and stretches
         the table — see the same cell on the product list. */
      <div className="flex w-[340px] min-w-[260px] max-w-[340px] items-center gap-3">
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

/**
 * The Analytics screen, for whichever storefront is selected.
 *
 * Retail and wholesale get different headline cards, not just different
 * numbers — see dashboard-sample.ts for why.
 */
export default function AnalyticsOverview() {
  const { mode } = useStorefront();
  const data = DASHBOARD_BY_MODE[mode];

  const [revenueMonth, setRevenueMonth] = useState(data.months[0]);
  const [ordersMonth, setOrdersMonth] = useState(data.quarters[0]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Analytics"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: `${MODE_LABEL[mode]} analytics` }
        ]}
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data.stats.map((group) => (
          <StatCard key={group[0].label} stats={group} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Panel
          title="Revenue Chart"
          action={
            <PeriodSelect
              label="Revenue period"
              value={revenueMonth}
              options={data.months}
              onChange={setRevenueMonth}
            />
          }
        >
          <BarChart
            data={data.revenue}
            max={data.revenueCeiling}
            ticks={data.revenueTicks}
            seriesLabel={data.revenueSeriesLabel}
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
              options={data.quarters}
              onChange={setOrdersMonth}
            />
          }
        >
          <DonutChart data={data.breakdown} />
        </Panel>
      </div>

      <Panel
        flush
        title={data.ordersTitle}
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
            rows={data.orders}
            rowKey={(row) => row.id}
            emptyMessage={`No ${MODE_LABEL[mode].toLowerCase()} orders yet.`}
          />
        </div>
      </Panel>
    </div>
  );
}

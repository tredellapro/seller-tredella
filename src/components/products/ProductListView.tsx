'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiX
} from 'react-icons/hi';
import DataTable, { type Column } from 'components/dashboard/DataTable';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import { ApprovalStatus } from 'components/dashboard/StatusText';
import { useStorefront } from 'components/dashboard/StorefrontContext';
import { aedExact } from 'data/dashboard-sample';
import { ALL_BRANDS, ALL_CATEGORY_LABELS } from 'data/product-taxonomy';
import {
  PRODUCTS,
  PRODUCT_MONTHS,
  discountPercent,
  effectivePrice,
  monthLabel,
  pricingFor,
  type ProductRow
} from 'data/products-sample';
import { firstWords } from 'lib/formatters';
import { MODE_LABEL } from 'lib/storefront';

const TABS = ['All', 'Approved', 'Pending', 'Cancelled'] as const;
type Tab = (typeof TABS)[number];

const PER_PAGE = 6;

interface Filters {
  category: string;
  brand: string;
  variations: string;
  month: string;
}

const EMPTY: Filters = { category: '', brand: '', variations: '', month: '' };

const FILTER_LABELS: Record<keyof Filters, string> = {
  category: 'Category',
  brand: 'Brand',
  variations: 'Variations',
  month: 'Date'
};

/* Excel treats a leading =, +, - or @ as a formula, so an exported cell is
   quoted and prefixed before it can be executed by a spreadsheet. */
const csvCell = (value: string | number): string => {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
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
      <label htmlFor={`filter-${label}`} className="sr-only">
        {label}
      </label>
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray">
          {icon}
        </span>
      )}
      <select
        id={`filter-${label}`}
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

export default function ProductListView() {
  const { mode } = useStorefront();

  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  /* Two copies: what is typed, and what the table is actually showing. The
     design has an explicit Apply Filter button, so the table must not move
     until it is pressed. */
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);

  /* Only what is listed in the storefront you are looking at. */
  const catalogue = useMemo(
    () => PRODUCTS.filter((product) => product.channels.includes(mode)),
    [mode]
  );

  // switching storefront shows a different catalogue; page 4 of it may not exist
  useEffect(() => setPage(1), [mode]);

  const counts = useMemo(
    () => ({
      All: catalogue.length,
      Approved: catalogue.filter((p) => p.status === 'Approved').length,
      Pending: catalogue.filter((p) => p.status === 'Pending').length,
      Cancelled: catalogue.filter((p) => p.status === 'Cancelled').length
    }),
    [catalogue]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return catalogue.filter((product) => {
      if (tab !== 'All' && product.status !== tab) return false;
      if (applied.category && product.department !== applied.category) return false;
      if (applied.brand && product.brand !== applied.brand) return false;
      if (applied.month && !product.createdAt.startsWith(applied.month)) return false;
      if (applied.variations === 'Yes' && product.variations.length === 0) return false;
      if (applied.variations === 'No' && product.variations.length > 0) return false;

      if (term) {
        const haystack =
          `${product.name} ${product.description} ${product.brand} ${product.category} ${product.id}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [catalogue, tab, search, applied]);

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

  const clearChip = (key: keyof Filters) => {
    setApplied((current_) => ({ ...current_, [key]: '' }));
    setDraft((current_) => ({ ...current_, [key]: '' }));
    setPage(1);
  };

  const exportCsv = () => {
    const header = [
      'ID', 'Product', 'Description', 'Category', 'Sub category', 'Brand',
      mode === 'RETAIL' ? 'Price (AED)' : 'From price (AED)',
      'Discount price (AED)', 'Discount %',
      ...(mode === 'WHOLESALE' ? ['MOQ'] : []),
      'Stock', 'Variations', 'Status', 'Created'
    ];

    const body = filtered.map((product) => {
      const pricing = pricingFor(product, mode);
      const off = discountPercent(pricing);

      return [
        product.id, product.name, product.description, product.department,
        product.category, product.brand,
        pricing?.price ?? '',
        pricing?.discountPrice ?? '',
        off === null ? '' : `${off}%`,
        ...(mode === 'WHOLESALE' ? [product.wholesale?.moq ?? ''] : []),
        product.stock, product.variations.length, product.status, product.createdAt
      ];
    });

    const csv = [header, ...body]
      .map((line) => line.map(csvCell).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `tredella-${mode.toLowerCase()}-products-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<ProductRow>[] = [
    {
      key: 'id',
      header: 'Product ID',
      render: (row) => <span className="text-13 text-secondary">{row.id}</span>
    },
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        /* max-w matters as much as the word cap: without an upper bound the
           cell takes its intrinsic width and one long description stretches
           the whole table instead of being clipped. */
        <Link
          href={`/dashboard/products/${row.id}`}
          className="group flex w-[380px] min-w-[260px] max-w-[380px] items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.image}
            alt=""
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-lg bg-background object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-13 text-secondary transition-colors group-hover:text-primary">
              {row.name}
            </p>
            <p
              title={row.description}
              className="line-clamp-2 text-11 leading-snug text-gray"
            >
              {firstWords(row.description, 30)}
            </p>
          </div>
        </Link>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <div className="min-w-[120px]">
          <p className="text-13 text-secondary">{row.department}</p>
          <p className="text-11 text-gray">{row.category}</p>
        </div>
      )
    },
    {
      key: 'brand',
      header: 'Brand',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">{row.brand}</span>
      )
    },
    /* Both storefronts show what the buyer pays, with the regular price struck
       through beside the saving. Wholesale adds the quantity that unlocks it. */
    {
      key: 'price',
      header: 'Price',
      render: (row) => {
        const pricing = pricingFor(row, mode);
        if (!pricing)
          return <span className="text-13 text-gray">—</span>;

        const paid = effectivePrice(pricing) as number;
        const off = discountPercent(pricing);
        const prefix = mode === 'RETAIL' ? '' : 'from ';

        return (
          <div className="min-w-[130px] whitespace-nowrap">
            <span className="text-13 text-secondary">
              {prefix}
              {aedExact(paid)}
            </span>
            {off !== null && (
              <p className="text-11 text-gray">
                <s>{aedExact(pricing.price)}</s>{' '}
                <span className="text-primary">{off}% off</span>
              </p>
            )}
            {mode === 'WHOLESALE' && (
              <p className="text-11 text-gray">MOQ {row.wholesale!.moq}</p>
            )}
          </div>
        );
      }
    },
    {
      key: 'stock',
      header: 'Stock Quantity',
      render: (row) => (
        <span className="text-13 text-secondary">
          {row.stock.toLocaleString('en-AE')}
        </span>
      )
    },
    {
      key: 'variations',
      header: 'Variations',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-gray">
          {row.variations.length === 0 ? 'None' : `${row.variations.length} SKUs`}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <ApprovalStatus status={row.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/products/${row.id}`}
            aria-label={`View ${row.name}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlineEye />
          </Link>
          <Link
            href={`/dashboard/products/new?edit=${row.id}`}
            aria-label={`Edit ${row.name}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlinePencil />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${row.name}`}
            className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlineTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Product List"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: `${MODE_LABEL[mode]} listings` }
        ]}
        actions={
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Product
          </Link>
        }
      />

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Listing status"
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

      <Panel flush>
        <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6">
          <div className="grid gap-2.5 lg:grid-cols-[minmax(200px,1fr)_repeat(4,minmax(110px,150px))_auto_auto]">
            <div className="relative">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
              <input
                id="product-search"
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
              label="Category"
              value={draft.category}
              onChange={(value) => setDraft({ ...draft, category: value })}
              options={ALL_CATEGORY_LABELS.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              label="Brand"
              value={draft.brand}
              onChange={(value) => setDraft({ ...draft, brand: value })}
              options={ALL_BRANDS.map((b) => ({ value: b, label: b }))}
            />
            <FilterSelect
              label="Variations"
              value={draft.variations}
              onChange={(value) => setDraft({ ...draft, variations: value })}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' }
              ]}
            />
            <FilterSelect
              label="Date"
              value={draft.month}
              icon={<HiOutlineCalendar className="h-4 w-4" />}
              onChange={(value) => setDraft({ ...draft, month: value })}
              options={PRODUCT_MONTHS.map((m) => ({
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
                      onClick={() => clearChip(chip.key)}
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
            emptyMessage={`Nothing listed in your ${MODE_LABEL[
              mode
            ].toLowerCase()} storefront matches these filters.`}
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
    </div>
  );
}

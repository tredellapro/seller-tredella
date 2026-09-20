'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HiOutlinePencil } from 'react-icons/hi';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import { ApprovalStatus } from 'components/dashboard/StatusText';
import { useStorefront } from 'components/dashboard/StorefrontContext';
import { aedExact } from 'data/dashboard-sample';
import {
  discountPercent,
  longDate,
  productById,
  type ProductVariationRow,
  type RetailPricing,
  type WholesalePricing
} from 'data/products-sample';
import { MODE_LABEL, type StorefrontMode } from 'lib/storefront';

interface Detail {
  label: string;
  value: string;
}

/** The striped label/value rows the design uses throughout this screen. */
function DetailTable({ rows }: { rows: Detail[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-secondary/10">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-start justify-between gap-4 px-3 py-2 ${
            index % 2 === 0 ? 'bg-background' : 'bg-white'
          }`}
        >
          {/* min-w-0 on both: without it a long value overflows the rounded
              clip instead of wrapping, and loses its last characters. */}
          <dt className="min-w-0 text-12 text-gray">{row.label}</dt>
          <dd className="min-w-0 break-words text-right text-12 font-medium text-secondary">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Price rows differ per storefront: retail quotes one unit, wholesale quotes
 * the cheapest band and the quantity that unlocks it. Both carry a regular
 * price, an optional discount price, and the percentage between them.
 */
const pricingRows = (
  mode: StorefrontMode,
  retail: RetailPricing | null,
  wholesale: WholesalePricing | null
): Detail[] => {
  const pricing = mode === 'RETAIL' ? retail : wholesale;

  if (!pricing)
    return [
      {
        label: 'Price',
        value: `Not listed for ${MODE_LABEL[mode].toLowerCase()}`
      }
    ];

  /* Wholesale prices are a floor, since bulk gets cheaper per unit. */
  const money = (value: number) =>
    mode === 'RETAIL' ? aedExact(value) : `from ${aedExact(value)}`;

  const off = discountPercent(pricing);

  return [
    { label: 'Price', value: money(pricing.price) },
    // only worth a row when there is actually one
    ...(pricing.discountPrice !== null
      ? [{ label: 'Discount Price', value: money(pricing.discountPrice) }]
      : []),
    { label: 'Discount', value: off === null ? 'None' : `${off}% OFF` },
    ...(wholesale && mode === 'WHOLESALE'
      ? [{ label: 'Minimum order', value: `${wholesale.moq} units` }]
      : [])
  ];
};

function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[active] ?? images[0]}
        alt={alt}
        className="h-[220px] w-full rounded-xl bg-background object-cover"
      />
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={`h-12 w-12 overflow-hidden rounded-lg border transition-colors ${
                index === active
                  ? 'border-primary'
                  : 'border-secondary/10 hover:border-primary/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VariationCard({
  variation,
  mode
}: {
  variation: ProductVariationRow;
  mode: StorefrontMode;
}) {
  return (
    <Panel>
      <h3 className="text-14 font-semibold text-primary">{variation.label}</h3>

      <p className="mt-4 text-13 text-secondary">Product Images</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {variation.images.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${image}-${index}`}
            src={image}
            alt=""
            loading="lazy"
            className="h-[52px] w-[52px] rounded-lg bg-background object-cover"
          />
        ))}
      </div>

      <p className="mt-4 text-13 text-secondary">Product Details</p>
      <div className="mt-2">
        <DetailTable
          rows={[
            ...variation.details,
            ...pricingRows(mode, variation.retail, variation.wholesale),
            { label: 'Create at', value: longDate(variation.createdAt) },
            {
              label: 'Stock Quantity',
              value: variation.stock.toLocaleString('en-AE')
            }
          ]}
        />
      </div>
    </Panel>
  );
}

export default function ProductView({ productId }: { productId: string }) {
  const { mode } = useStorefront();
  const product = productById(productId);

  if (!product)
    return (
      <div className="flex_center min-h-[60vh]">
        <p className="text-14 text-gray">That product no longer exists.</p>
      </div>
    );

  const listedHere = product.channels.includes(mode);

  const leftRows: Detail[] = [
    { label: 'Category', value: product.department },
    { label: 'Brand', value: product.brand },
    ...pricingRows(mode, product.retail, product.wholesale),
    { label: 'Stock Quantity', value: product.stock.toLocaleString('en-AE') }
  ];

  const rightRows: Detail[] = [
    { label: 'Sub category', value: product.category },
    {
      label: 'Variations',
      value: product.variations.length > 0 ? `Yes — ${product.variations.length}` : 'No'
    },
    { label: 'Create at', value: longDate(product.createdAt) },
    {
      label: 'Storefronts',
      value: product.channels.map((c) => MODE_LABEL[c]).join(', ')
    }
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Product Information"
        backHref="/dashboard/products"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: product.name }
        ]}
        actions={
          <Link
            href={`/dashboard/products/new?edit=${product.id}`}
            className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <HiOutlinePencil className="h-4 w-4" />
            Edit
          </Link>
        }
      />

      {/* A wholesale-only line opened in the retail storefront would otherwise
          just show blank prices with no explanation. */}
      {!listedHere && (
        <p
          role="status"
          className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          This product is not listed in your {MODE_LABEL[mode].toLowerCase()}{' '}
          storefront — it sells through{' '}
          {product.channels.map((c) => MODE_LABEL[c]).join(' and ')} only.
        </p>
      )}

      <Panel>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <Gallery images={product.gallery} alt={product.name} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-16 font-semibold text-secondary">
                {product.name}
              </h2>
              <ApprovalStatus status={product.status} />
            </div>

            <p className="mt-2 text-13 leading-relaxed text-gray">
              {product.description}
            </p>

            <p className="mt-5 text-13 text-secondary">Product Details</p>
            {/* Side by side only once the column is genuinely wide — this sits
                inside a two-column card, so sm: is far too early. */}
            <div className="mt-2 grid gap-3 xl:grid-cols-2">
              <DetailTable rows={leftRows} />
              <DetailTable rows={rightRows} />
            </div>

            {product.attributes.length > 0 && (
              <>
                <p className="mt-5 text-13 text-secondary">
                  {product.category} attributes
                </p>
                <div className="mt-2">
                  <DetailTable rows={product.attributes} />
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      {product.variations.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {product.variations.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

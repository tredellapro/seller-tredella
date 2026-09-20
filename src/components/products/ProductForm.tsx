'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { HiChevronDown, HiOutlineCheckCircle } from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import PageHeader from 'components/dashboard/PageHeader';
import { useStorefront } from 'components/dashboard/StorefrontContext';
import { COUNTRIES } from 'data/countries';
import { MODE_LABEL } from 'lib/storefront';
import {
  categoryTrail,
  specAttributesFor,
  variantAxesFor
} from 'data/product-taxonomy';
import AttributeField, { type AttributeValue } from './AttributeField';
import CategoryPicker from './CategoryPicker';
import NumberField from './NumberField';
import { newTier } from './PriceTierEditor';
import {
  ImageTileGrid,
  PosterImage,
  type LocalImage
} from './ProductImages';
import VariationSection, {
  type SingleSku,
  type Variation
} from './VariationSection';

/** UAE VAT treatments a seller can put a line on. */
const VAT_TREATMENTS = [
  { value: 'STANDARD', label: 'Standard rated — 5%' },
  { value: 'ZERO', label: 'Zero rated — 0%' },
  { value: 'EXEMPT', label: 'Exempt' }
];

export default function ProductForm() {
  /* Which storefront this listing is for. It decides how the product is
     priced, and which of the sourcing fields apply. */
  const { mode } = useStorefront();
  const isRetail = mode === 'RETAIL';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState<LocalImage | null>(null);
  const [gallery, setGallery] = useState<LocalImage[]>([]);

  const [path, setPath] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [attributes, setAttributes] = useState<Record<string, AttributeValue>>({});

  const [countryOfOrigin, setCountryOfOrigin] = useState('AE');
  const [hsCode, setHsCode] = useState('');
  const [vatTreatment, setVatTreatment] = useState('STANDARD');
  const [weightKg, setWeightKg] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [handlingDays, setHandlingDays] = useState('');

  const [variationEnabled, setVariationEnabled] = useState(false);
  const [activeAxisKeys, setActiveAxisKeys] = useState<string[]>([]);
  const [axisValues, setAxisValues] = useState<Record<string, string[]>>({});
  const [variations, setVariations] = useState<Variation[]>([]);

  /* The first tier is on screen before hydration, so its id has to match on
     both sides — useId is the one generator that guarantees that. */
  const firstTierId = useId();
  const [single, setSingle] = useState<SingleSku>(() => ({
    stock: '',
    tiers: [newTier(`tier${firstTierId}`)],
    bulkDiscount: '',
    price: '',
    discountPrice: '',
    maxPerOrder: '',
    invoices: [],
    otherOptions: [],
    attributes: {}
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const axes = useMemo(() => variantAxesFor(path), [path]);
  const axisKeys = useMemo(() => axes.map((a) => a.key), [axes]);
  const specs = useMemo(() => specAttributesFor(path, axisKeys), [path, axisKeys]);

  /* Changing category changes what the product can vary by, so anything
     pointing at an axis the new category does not have has to go — otherwise a
     shirt keeps a Storage axis after being recategorised as a phone. */
  const axisFingerprint = axisKeys.join('|');
  useEffect(() => {
    const valid = new Set(axisFingerprint ? axisFingerprint.split('|') : []);

    setActiveAxisKeys((keys) => {
      const kept = keys.filter((key) => valid.has(key));
      return kept.length === keys.length ? keys : kept;
    });

    setAxisValues((values) => {
      const kept = Object.fromEntries(
        Object.entries(values).filter(([key]) => valid.has(key))
      );
      return Object.keys(kept).length === Object.keys(values).length ? values : kept;
    });

    setVariations((rows) => {
      const stripped = rows.map((row) => ({
        ...row,
        axisValues: Object.fromEntries(
          Object.entries(row.axisValues).filter(([key]) => valid.has(key))
        )
      }));

      /* Losing an axis can leave rows that are now the same SKU — six
         "Crimson / 36" shoe rows become "Crimson" three times over once Size
         goes. Keep the first of each. Rows with nothing left to tell apart are
         manual ones the seller added by hand, so those stay put. */
      const seen = new Set<string>();
      return stripped.filter((row) => {
        const entries = Object.entries(row.axisValues).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        if (entries.length === 0) return true;

        const print = JSON.stringify(entries);
        if (seen.has(print)) return false;
        seen.add(print);
        return true;
      });
    });
  }, [axisFingerprint]);

  const skuCount = variationEnabled ? variations.length : 1;

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};

    if (!title.trim()) found.title = 'Give the product a title.';
    if (!poster) found.poster = 'A poster image is required.';
    if (path.length === 0) found.category = 'Choose a category.';

    for (const spec of specs) {
      if (!spec.required) continue;
      const value = attributes[spec.key];
      const empty =
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);
      if (empty) found[`attr-${spec.key}`] = `${spec.label} is required.`;
    }

    if (variationEnabled) {
      if (variations.length === 0)
        found.variations = 'Add at least one variation, or turn variations off.';

      variations.forEach((variation, index) => {
        const missingAxis = activeAxisKeys.find(
          (key) => !variation.axisValues[key]
        );
        if (missingAxis)
          found[`var-${variation.id}`] = `Variation ${index + 1} is missing a value.`;

        /* Retail wants one price per variation; wholesale wants bands. */
        const priced = isRetail
          ? variation.price !== ''
          : variation.tiers.some((t) => t.minQty && t.price);
        if (!priced)
          found[`var-price-${variation.id}`] = isRetail
            ? `Variation ${index + 1} needs a price.`
            : `Variation ${index + 1} needs at least one price tier.`;
      });
    } else {
      const priced = isRetail
        ? single.price !== ''
        : single.tiers.some((t) => t.minQty && t.price);
      if (!priced)
        found.price = isRetail
          ? 'Enter the retail price.'
          : 'Add at least one wholesale price tier.';
      if (!single.stock) found.stock = 'Enter the stock quantity.';
    }

    return found;
  };

  const submit = (mode: 'draft' | 'publish') => {
    /* Drafts are allowed to be incomplete; publishing is not. */
    const found = mode === 'publish' ? validate() : {};
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setSaved(null);
      document
        .querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* The createProduct mutation is not built yet — this is where it goes, with
       the images uploaded through the storage service first. */
    setSaved(
      mode === 'publish'
        ? `Published — ${skuCount} ${skuCount === 1 ? 'SKU' : 'SKUs'} sent for approval.`
        : 'Draft saved.'
    );
  };

  const trail = categoryTrail(path);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit('publish');
      }}
      className="flex flex-col gap-5 pb-4"
    >
      <PageHeader
        title={`Add ${MODE_LABEL[mode]} Product`}
        backHref="/dashboard/products"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: `Add ${MODE_LABEL[mode].toLowerCase()} product` }
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => submit('draft')}
              className="rounded-md border border-secondary/20 bg-white px-5 py-2 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Save Changes
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Publish
            </button>
          </>
        }
      />

      {saved && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-primary" />
          {saved}
        </p>
      )}

      {Object.keys(errors).length > 0 && (
        <p
          role="alert"
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          {Object.keys(errors).length} thing
          {Object.keys(errors).length === 1 ? '' : 's'} still need attention before
          this can be published.
        </p>
      )}

      <Panel>
        <div data-error={Boolean(errors.poster)}>
          <PosterImage value={poster} onChange={setPoster} />
          {errors.poster && (
            <p className="mt-2 text-12 text-primary">{errors.poster}</p>
          )}
        </div>

        <div className="mt-5 border-t border-secondary/8 pt-5">
          <ImageTileGrid
            label="Gallery — up to 8 more photos buyers can swipe through"
            images={gallery}
            onChange={setGallery}
          />
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Basic Information">
          <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2" data-error={Boolean(errors.title)}>
              <label htmlFor="product-title" className="text-13 text-gray">
                Product Title <span className="text-primary">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Galaxy Buds Pro"
                aria-invalid={errors.title ? true : undefined}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
                  errors.title ? 'border-primary' : 'border-secondary/15 focus:border-primary'
                }`}
              />
              {errors.title && <p className="text-12 text-primary">{errors.title}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="product-description" className="text-13 text-gray">
                Description
              </label>
              <textarea
                id="product-description"
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series."
                className="w-full resize-y rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
              />
            </div>
          </div>
        </Panel>

        <Panel title="Category">
          <div className="mt-4" data-error={Boolean(errors.category)}>
            <CategoryPicker
              path={path}
              onPathChange={setPath}
              brand={brand}
              onBrandChange={setBrand}
            />
            {errors.category && (
              <p className="mt-2 text-12 text-primary">{errors.category}</p>
            )}
            {trail.length > 0 && (
              <p className="mt-4 rounded-lg bg-background px-3 py-2 text-12 text-gray">
                {trail.join(' › ')}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {specs.length > 0 && (
        <Panel title={`${trail[trail.length - 1] ?? 'Product'} details`}>
          <p className="mt-1 text-12 text-gray">
            These fields come from the category you picked.
          </p>
          <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.key} data-error={Boolean(errors[`attr-${spec.key}`])}>
                <AttributeField
                  spec={spec}
                  value={attributes[spec.key]}
                  error={errors[`attr-${spec.key}`]}
                  onChange={(value) =>
                    setAttributes((current) => ({ ...current, [spec.key]: value }))
                  }
                />
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Compliance">
          <p className="mt-1 text-12 text-gray">
            What UAE customs and the FTA need on every listing.
          </p>
          <div className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="country-of-origin" className="text-13 text-gray">
                Country of origin <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <select
                  id="country-of-origin"
                  value={countryOfOrigin}
                  onChange={(event) => setCountryOfOrigin(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
              </div>
            </div>

            {/* Customs tariff code — wholesale lines cross borders in bulk and
                need it; a single retail unit sold inside the UAE does not. */}
            {!isRetail && (
              <div className="flex flex-col gap-2">
                <label htmlFor="hs-code" className="text-13 text-gray">
                  HS code
                </label>
                <input
                  id="hs-code"
                  type="text"
                  inputMode="numeric"
                  value={hsCode}
                  onChange={(event) =>
                    setHsCode(event.target.value.replace(/[^0-9.]/g, '').slice(0, 12))
                  }
                  placeholder="8517.62"
                  className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
                />
                <p className="text-11 text-gray">
                  The customs tariff code for this product.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="vat-treatment" className="text-13 text-gray">
                VAT treatment
              </label>
              <div className="relative">
                <select
                  id="vat-treatment"
                  value={vatTreatment}
                  onChange={(event) => setVatTreatment(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
                >
                  {VAT_TREATMENTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Shipping">
          <p className="mt-1 text-12 text-gray">
            Used to quote delivery and to pick a courier.
          </p>
          <div className="mt-4 flex flex-col gap-5">
            <NumberField
              id="weight-kg"
              label="Shipping weight"
              value={weightKg}
              onChange={setWeightKg}
              placeholder="0.4"
              unit="kg"
              decimal
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="package-dimensions" className="text-13 text-gray">
                Package dimensions (L × W × H)
              </label>
              <input
                id="package-dimensions"
                type="text"
                value={dimensions}
                onChange={(event) => setDimensions(event.target.value)}
                placeholder="20 × 15 × 6 cm"
                className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
              />
            </div>

            <NumberField
              id="handling-days"
              label="Handling time"
              value={handlingDays}
              onChange={setHandlingDays}
              placeholder="2"
              unit="days"
            />
          </div>
        </Panel>
      </div>

      <div data-error={Boolean(errors.variations || errors.price || errors.stock)}>
        <VariationSection
          mode={mode}
          enabled={variationEnabled}
          onEnabledChange={setVariationEnabled}
          axes={axes}
          activeAxisKeys={activeAxisKeys}
          onActiveAxisKeysChange={setActiveAxisKeys}
          axisValues={axisValues}
          onAxisValuesChange={setAxisValues}
          variations={variations}
          onVariationsChange={setVariations}
          productTitle={title}
          single={single}
          onSingleChange={(changes) =>
            setSingle((current) => ({ ...current, ...changes }))
          }
        />

        {(errors.variations || errors.price || errors.stock) && (
          <ul className="mt-2 flex flex-col gap-1">
            {[errors.variations, errors.price, errors.stock]
              .filter(Boolean)
              .map((message) => (
                <li key={message} className="text-12 text-primary">
                  {message}
                </li>
              ))}
          </ul>
        )}
      </div>

      <p className="text-12 text-gray">
        Listing in your <strong className="font-medium">{MODE_LABEL[mode]}</strong>{' '}
        storefront.{' '}
        {variationEnabled
          ? `${variations.length} variation${variations.length === 1 ? '' : 's'} — each is stocked and priced on its own.`
          : 'One SKU. Turn on Variation above if this product comes in more than one option.'}
      </p>
    </form>
  );
}

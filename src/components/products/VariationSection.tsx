'use client';

import { HiOutlinePlus, HiOutlineTrash, HiSparkles } from 'react-icons/hi';
import type { AttributeSpec } from 'data/product-taxonomy';
import { combinationsOf } from 'data/product-taxonomy';
import { MODE_LABEL, type StorefrontMode } from 'lib/storefront';
import AttributeField, { type AttributeValue } from './AttributeField';
import ColorSwatchPicker from './ColorSwatchPicker';
import NumberField from './NumberField';
import PriceTierEditor, { newTier, type PriceTier } from './PriceTierEditor';
import RetailPriceFields from './RetailPriceFields';
import { ImageTileGrid, type LocalImage } from './ProductImages';
import Switch from 'components/ui/Switch';

export const OTHER_OPTIONS = [
  'Gift wrapping',
  'Made to order',
  'Free shipping',
  'Cash on delivery',
  'Returnable within 14 days'
];

export interface Variation {
  id: string;
  /** Axis key → the value this variation takes on that axis. */
  axisValues: Record<string, string>;
  sku: string;
  stock: string;
  /** Wholesale only. */
  tiers: PriceTier[];
  bulkDiscount: string;
  /** Retail only. */
  price: string;
  discountPrice: string;
  images: LocalImage[];
  invoices: LocalImage[];
  otherOptions: string[];
}

export interface SingleSku {
  stock: string;
  tiers: PriceTier[];
  bulkDiscount: string;
  price: string;
  discountPrice: string;
  maxPerOrder: string;
  invoices: LocalImage[];
  otherOptions: string[];
  attributes: Record<string, AttributeValue>;
}

export const newVariation = (
  axisValues: Record<string, string> = {}
): Variation => ({
  id: `var-${Math.random().toString(36).slice(2, 9)}`,
  axisValues,
  sku: '',
  stock: '',
  tiers: [newTier()],
  bulkDiscount: '',
  price: '',
  discountPrice: '',
  images: [],
  invoices: [],
  otherOptions: []
});

/** "Crimson / 128 GB" — what the row is called wherever it is listed. */
export const variationName = (
  variation: Variation,
  axes: AttributeSpec[]
): string => {
  const parts = axes
    .map((axis) => variation.axisValues[axis.key])
    .filter((value): value is string => Boolean(value));
  return parts.length ? parts.join(' / ') : 'New variation';
};

const skuSuggestion = (
  title: string,
  variation: Variation,
  axes: AttributeSpec[]
): string => {
  const stem = (title || 'SKU')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12);
  const tail = axes
    .map((axis) => variation.axisValues[axis.key])
    .filter(Boolean)
    .map((value) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 4))
    .join('-');
  return tail ? `${stem}-${tail}` : stem;
};

interface VariationSectionProps {
  /** Which storefront this product is being listed in. */
  mode: StorefrontMode;
  enabled: boolean;
  onEnabledChange: (_enabled: boolean) => void;
  /** Axes this category permits — empty until a category is chosen. */
  axes: AttributeSpec[];
  /** Keys of the axes the seller has switched on. */
  activeAxisKeys: string[];
  onActiveAxisKeysChange: (_keys: string[]) => void;
  /** Axis key → the values in play for this product. */
  axisValues: Record<string, string[]>;
  onAxisValuesChange: (_values: Record<string, string[]>) => void;
  variations: Variation[];
  onVariationsChange: (_variations: Variation[]) => void;
  /** Used to suggest SKUs. */
  productTitle: string;
  single: SingleSku;
  onSingleChange: (_patch: Partial<SingleSku>) => void;
}

/* Values a seller can pick for one axis. Colour gets swatches; everything else
   gets chips, because the options come straight from the taxonomy. */
function AxisValuePicker({
  spec,
  selected,
  onChange
}: {
  spec: AttributeSpec;
  selected: string[];
  onChange: (_values: string[]) => void;
}) {
  if (spec.type === 'color')
    return (
      <ColorSwatchPicker
        label={`${spec.label} values`}
        multiple
        selected={selected}
        onChange={onChange}
      />
    );

  return (
    <fieldset>
      <legend className="mb-2 text-13 text-gray">{spec.label} values</legend>
      <div className="flex flex-wrap gap-2">
        {(spec.options ?? []).map((option) => {
          const on = selected.includes(option);
          return (
            <label key={option} className="cursor-pointer">
              <input
                type="checkbox"
                checked={on}
                onChange={() =>
                  onChange(
                    on ? selected.filter((v) => v !== option) : [...selected, option]
                  )
                }
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-secondary/15 px-3 py-1.5 text-12 text-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary/8 peer-checked:text-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function BulkDiscountField({
  id,
  value,
  onChange
}: {
  id: string;
  value: string;
  onChange: (_value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-gray">
        Bulk Discount Promotion
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="E.g. Buy 100+ units & get 5% off"
        className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
      />
    </div>
  );
}

/**
 * Stock, pricing and — when the product needs them — its variations.
 *
 * Two things change shape here. **What a product varies by** comes from the
 * chosen category, so a shirt offers Size and Colour while a phone offers
 * Storage and Colour. **How it is priced** comes from the storefront: retail
 * takes a unit price and an optional discount price, wholesale takes quantity
 * bands — each with its own discount price — plus a purchase invoice. Neither
 * set is shown in the other's storefront.
 */
export default function VariationSection({
  mode,
  enabled,
  onEnabledChange,
  axes,
  activeAxisKeys,
  onActiveAxisKeysChange,
  axisValues,
  onAxisValuesChange,
  variations,
  onVariationsChange,
  productTitle,
  single,
  onSingleChange
}: VariationSectionProps) {
  const isRetail = mode === 'RETAIL';
  const activeAxes = axes.filter((axis) => activeAxisKeys.includes(axis.key));

  const patch = (id: string, changes: Partial<Variation>) =>
    onVariationsChange(
      variations.map((v) => (v.id === id ? { ...v, ...changes } : v))
    );

  /* Regenerating keeps any row whose axis values already exist, so prices and
     stock typed against "Crimson / M" survive adding a third colour. */
  const generate = () => {
    const wanted = combinationsOf(
      activeAxes.map((axis) => ({ key: axis.key, values: axisValues[axis.key] ?? [] }))
    );
    if (wanted.length === 0) return;

    const fingerprint = (values: Record<string, string>) =>
      activeAxes.map((axis) => values[axis.key] ?? '').join('|');

    const existing = new Map(variations.map((v) => [fingerprint(v.axisValues), v]));

    onVariationsChange(
      wanted.map(
        (values) => existing.get(fingerprint(values)) ?? newVariation(values)
      )
    );
  };

  const pending = combinationsOf(
    activeAxes.map((axis) => ({ key: axis.key, values: axisValues[axis.key] ?? [] }))
  ).length;

  return (
    <section className="rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
      <header className="flex items-center justify-between gap-3 rounded-t-2xl bg-background px-5 py-3.5 sm:px-6">
        <h2 id="variation-heading" className="text-15 font-medium text-secondary">
          Variation
        </h2>
        <Switch
          checked={enabled}
          onChange={onEnabledChange}
          label="This product has variations"
          labelledBy="variation-heading"
        />
      </header>

      <div className="px-5 py-5 sm:px-6">
        {!enabled ? (
          <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <NumberField
                id="single-stock"
                label="Total Stock Quantity"
                value={single.stock}
                onChange={(stock) => onSingleChange({ stock })}
                placeholder="0"
                stepper
              />

              {isRetail ? (
                <>
                  <RetailPriceFields
                    idPrefix="single"
                    price={single.price}
                    discountPrice={single.discountPrice}
                    onChange={onSingleChange}
                  />
                  <NumberField
                    id="single-max-per-order"
                    label="Max per order"
                    value={single.maxPerOrder}
                    onChange={(maxPerOrder) => onSingleChange({ maxPerOrder })}
                    placeholder="No limit"
                  />
                </>
              ) : (
                <>
                  <PriceTierEditor
                    idPrefix="single"
                    tiers={single.tiers}
                    onChange={(tiers) => onSingleChange({ tiers })}
                  />
                  <BulkDiscountField
                    id="single-bulk"
                    value={single.bulkDiscount}
                    onChange={(bulkDiscount) => onSingleChange({ bulkDiscount })}
                  />
                </>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {axes.length === 0 ? (
                <p className="rounded-lg border border-dashed border-secondary/20 px-4 py-6 text-center text-13 text-gray">
                  Choose a category and its options appear here.
                </p>
              ) : (
                axes.map((axis) => (
                  <AttributeField
                    key={axis.key}
                    spec={axis}
                    value={single.attributes[axis.key]}
                    onChange={(value) =>
                      onSingleChange({
                        attributes: { ...single.attributes, [axis.key]: value }
                      })
                    }
                  />
                ))
              )}

              {/* Proof of sourcing — a wholesale requirement, meaningless on a
                  retail listing. */}
              {!isRetail && (
                <ImageTileGrid
                  label="Purchase Invoice — max file size 10 MB"
                  variant="document"
                  accept="application/pdf,image/jpeg,image/png"
                  images={single.invoices}
                  onChange={(invoices) => onSingleChange({ invoices })}
                  max={5}
                />
              )}

              <AttributeField
                spec={{
                  key: 'otherOptions',
                  label: 'Other Options',
                  type: 'multiselect',
                  options: OTHER_OPTIONS
                }}
                value={single.otherOptions}
                onChange={(value) =>
                  onSingleChange({ otherOptions: value as string[] })
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {axes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-secondary/20 px-4 py-6 text-center text-13 text-gray">
                Pick a category first — what a product can vary by depends on it.
              </p>
            ) : (
              <>
                <fieldset className="rounded-xl border border-secondary/10 bg-background/60 px-4 py-4">
                  <legend className="px-1 text-13 font-medium text-secondary">
                    Vary this product by
                  </legend>
                  <p className="mb-3 text-12 text-gray">
                    These are the options this category can vary on.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {axes.map((axis) => {
                      const on = activeAxisKeys.includes(axis.key);
                      return (
                        <label key={axis.key} className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              onActiveAxisKeysChange(
                                on
                                  ? activeAxisKeys.filter((k) => k !== axis.key)
                                  : [...activeAxisKeys, axis.key]
                              )
                            }
                            className="peer sr-only"
                          />
                          <span className="block rounded-lg border border-secondary/15 bg-white px-3.5 py-2 text-13 text-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                            {axis.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {activeAxes.length > 0 && (
                    <div className="mt-5 flex flex-col gap-4 border-t border-secondary/10 pt-4">
                      {activeAxes.map((axis) => (
                        <AxisValuePicker
                          key={axis.key}
                          spec={axis}
                          selected={axisValues[axis.key] ?? []}
                          onChange={(values) =>
                            onAxisValuesChange({ ...axisValues, [axis.key]: values })
                          }
                        />
                      ))}
                    </div>
                  )}
                </fieldset>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={pending === 0}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiSparkles className="h-4 w-4" />
                    Generate {pending > 0 ? `${pending} ` : ''}combination
                    {pending === 1 ? '' : 's'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onVariationsChange([...variations, newVariation()])}
                    className="flex items-center gap-1.5 rounded-lg border border-secondary/20 px-4 py-2 text-13 font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    Add Variation
                    <HiOutlinePlus className="h-4 w-4" />
                  </button>

                  <p className="text-12 text-gray">
                    {variations.length} variation
                    {variations.length === 1 ? '' : 's'} in your{' '}
                    {MODE_LABEL[mode].toLowerCase()} storefront
                  </p>
                </div>

                {variations.map((variation, index) => (
                  <article
                    key={variation.id}
                    className="rounded-xl border border-secondary/10 px-4 py-4 sm:px-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-13 font-medium text-secondary">
                        {index + 1}. {variationName(variation, activeAxes)}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          onVariationsChange(
                            variations.filter((v) => v.id !== variation.id)
                          )
                        }
                        aria-label={`Remove variation ${index + 1}`}
                        className="rounded p-1 text-15 text-primary transition-colors hover:bg-primary/10"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>

                    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
                      <div className="flex flex-col gap-5">
                        <ImageTileGrid
                          label="Upload Images"
                          images={variation.images}
                          onChange={(images) => patch(variation.id, { images })}
                        />

                        {isRetail ? (
                          <RetailPriceFields
                            idPrefix={variation.id}
                            price={variation.price}
                            discountPrice={variation.discountPrice}
                            onChange={(changes) => patch(variation.id, changes)}
                          />
                        ) : (
                          <>
                            <PriceTierEditor
                              idPrefix={variation.id}
                              tiers={variation.tiers}
                              onChange={(tiers) => patch(variation.id, { tiers })}
                            />
                            <BulkDiscountField
                              id={`bulk-${variation.id}`}
                              value={variation.bulkDiscount}
                              onChange={(bulkDiscount) =>
                                patch(variation.id, { bulkDiscount })
                              }
                            />
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-5">
                        {activeAxes.map((axis) => (
                          <AttributeField
                            key={axis.key}
                            spec={{ ...axis, required: true }}
                            value={
                              axis.type === 'color'
                                ? variation.axisValues[axis.key]
                                  ? [variation.axisValues[axis.key]]
                                  : []
                                : variation.axisValues[axis.key] ?? ''
                            }
                            onChange={(value) =>
                              patch(variation.id, {
                                axisValues: {
                                  ...variation.axisValues,
                                  [axis.key]: Array.isArray(value)
                                    ? (value[0] ?? '')
                                    : String(value)
                                }
                              })
                            }
                          />
                        ))}

                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`sku-${variation.id}`}
                            className="text-13 text-gray"
                          >
                            SKU
                          </label>
                          <input
                            id={`sku-${variation.id}`}
                            type="text"
                            value={variation.sku}
                            onChange={(event) =>
                              patch(variation.id, { sku: event.target.value })
                            }
                            placeholder={skuSuggestion(
                              productTitle,
                              variation,
                              activeAxes
                            )}
                            className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
                          />
                        </div>

                        <NumberField
                          id={`stock-${variation.id}`}
                          label="Total Stock Quantity"
                          value={variation.stock}
                          onChange={(stock) => patch(variation.id, { stock })}
                          placeholder="0"
                          stepper
                        />

                        {!isRetail && (
                          <ImageTileGrid
                            label="Upload Purchase Invoice"
                            variant="document"
                            accept="application/pdf,image/jpeg,image/png"
                            images={variation.invoices}
                            onChange={(invoices) => patch(variation.id, { invoices })}
                            max={5}
                          />
                        )}

                        <AttributeField
                          spec={{
                            key: `other-${variation.id}`,
                            label: 'Other Options',
                            type: 'multiselect',
                            options: OTHER_OPTIONS
                          }}
                          value={variation.otherOptions}
                          onChange={(value) =>
                            patch(variation.id, { otherOptions: value as string[] })
                          }
                        />
                      </div>
                    </div>
                  </article>
                ))}

                {variations.length === 0 && activeAxes.length > 0 && (
                  <p className="rounded-lg border border-dashed border-secondary/20 px-4 py-6 text-center text-13 text-gray">
                    Pick the values above, then generate the combinations.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

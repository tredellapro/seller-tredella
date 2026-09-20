'use client';

import { HiOutlineTrash } from 'react-icons/hi';
import NumberField from './NumberField';

export interface PriceTier {
  id: string;
  minQty: string;
  maxQty: string;
  /** The regular price per unit in this quantity band. */
  price: string;
  /** Optional promotional price per unit. Blank means no discount. */
  discountPrice: string;
}

interface PriceTierEditorProps {
  tiers: PriceTier[];
  onChange: (_tiers: PriceTier[]) => void;
  /** Distinguishes the fields when several editors sit on one page. */
  idPrefix: string;
}

/**
 * `id` must be supplied for any tier that exists during the server render —
 * a random one there renders differently on the client and breaks hydration.
 * Tiers added by a click happen after mount, so they can take the default.
 */
export const newTier = (id?: string): PriceTier => ({
  id: id ?? `tier-${Math.random().toString(36).slice(2, 9)}`,
  minQty: '',
  maxQty: '',
  price: '',
  discountPrice: ''
});

/** Whole percent off, or null when this tier is not discounted. */
export const tierDiscount = (tier: PriceTier): number | null => {
  const price = Number(tier.price);
  const discount = Number(tier.discountPrice);
  if (!tier.price || !tier.discountPrice) return null;
  if (!(discount < price)) return null;
  return Math.round(((price - discount) / price) * 100);
};

/* Wholesale is priced in bands, so the bands have to be checked: a quantity
   that falls in two bands has no defined price, and one that falls in none is
   unsellable. Both are reported rather than blocked, since a seller part-way
   through typing is not yet wrong. */
const problemsIn = (tiers: PriceTier[]): string[] => {
  const ranges = tiers
    .map((tier, index) => ({
      index,
      min: Number(tier.minQty),
      max: tier.maxQty === '' ? Infinity : Number(tier.maxQty),
      filled: tier.minQty !== ''
    }))
    .filter((r) => r.filled && !Number.isNaN(r.min));

  const problems: string[] = [];

  for (const range of ranges) {
    if (range.max < range.min)
      problems.push(`Tier ${range.index + 1}: max quantity is below the min.`);
  }

  const sorted = [...ranges].sort((a, b) => a.min - b.min);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].min <= sorted[i - 1].max)
      problems.push(
        `Tiers ${sorted[i - 1].index + 1} and ${sorted[i].index + 1} overlap.`
      );
  }

  /* A discount above the regular price is not a discount. */
  tiers.forEach((tier, index) => {
    if (!tier.price || !tier.discountPrice) return;
    if (Number(tier.discountPrice) >= Number(tier.price))
      problems.push(
        `Tier ${index + 1}: the discount price must be below the price per unit.`
      );
  });

  return problems;
};

/** Min qty / max qty / price / discount price bands, as the designs lay them out. */
export default function PriceTierEditor({
  tiers,
  onChange,
  idPrefix
}: PriceTierEditorProps) {
  const update = (id: string, patch: Partial<PriceTier>) =>
    onChange(tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)));

  const problems = problemsIn(tiers);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-13 font-medium text-primary">Wholesale Price Tiers</p>

      {tiers.map((tier, index) => {
        const off = tierDiscount(tier);

        return (
          <div key={tier.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="sr-only">Tier {index + 1}</span>
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange(tiers.filter((t) => t.id !== tier.id))}
                  aria-label={`Remove tier ${index + 1}`}
                  className="ml-auto rounded p-1 text-14 text-primary transition-colors hover:bg-primary/10"
                >
                  <HiOutlineTrash />
                </button>
              )}
            </div>

            {/* Four fields do not fit across a half-width card, so they pair up
                until there is room for a single row. */}
            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
              <NumberField
                id={`${idPrefix}-min-${tier.id}`}
                label="Min Qty"
                value={tier.minQty}
                onChange={(value) => update(tier.id, { minQty: value })}
                placeholder="Min Qty"
              />
              <NumberField
                id={`${idPrefix}-max-${tier.id}`}
                label="Max Qty"
                value={tier.maxQty}
                onChange={(value) => update(tier.id, { maxQty: value })}
                placeholder="Max Qty"
              />
              <NumberField
                id={`${idPrefix}-price-${tier.id}`}
                label="Price per Unit (AED)"
                value={tier.price}
                onChange={(value) => update(tier.id, { price: value })}
                placeholder="0.00"
                decimal
              />
              <NumberField
                id={`${idPrefix}-discount-${tier.id}`}
                label="Discount Price (AED)"
                value={tier.discountPrice}
                onChange={(value) => update(tier.id, { discountPrice: value })}
                placeholder="Optional"
                decimal
              />
            </div>

            {off !== null && (
              <p className="text-12 text-gray">
                Tier {index + 1} sells at{' '}
                <span className="font-medium text-primary">{off}% OFF</span>.
              </p>
            )}
          </div>
        );
      })}

      {problems.length > 0 && (
        <ul className="flex flex-col gap-1">
          {problems.map((problem) => (
            <li key={problem} className="text-12 text-primary">
              {problem}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onChange([...tiers, newTier()])}
        className="w-full rounded-lg bg-primary py-2.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
      >
        Add Price Tier
      </button>
    </div>
  );
}

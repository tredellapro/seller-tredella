'use client';

import NumberField from './NumberField';

interface RetailPriceFieldsProps {
  price: string;
  discountPrice: string;
  onChange: (_patch: { price?: string; discountPrice?: string }) => void;
  idPrefix: string;
}

/**
 * Retail sells one unit at one price, with an optional discount price the
 * buyer actually pays — the regular price is then struck through and the
 * badge computed from the gap. There are no quantity bands here; that is what
 * wholesale is for.
 */
export default function RetailPriceFields({
  price,
  discountPrice,
  onChange,
  idPrefix
}: RetailPriceFieldsProps) {
  const regular = Number(price);
  const discounted = Number(discountPrice);

  const hasBoth = price !== '' && discountPrice !== '';
  const inverted = hasBoth && discounted >= regular;
  const off =
    hasBoth && discounted < regular
      ? Math.round(((regular - discounted) / regular) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-13 font-medium text-primary">Retail Price</p>

      <div className="grid grid-cols-2 gap-2.5">
        <NumberField
          id={`${idPrefix}-price`}
          label="Price (AED)"
          value={price}
          onChange={(value) => onChange({ price: value })}
          placeholder="0.00"
          decimal
        />
        <NumberField
          id={`${idPrefix}-discount`}
          label="Discount Price (AED)"
          value={discountPrice}
          onChange={(value) => onChange({ discountPrice: value })}
          placeholder="Optional"
          decimal
          error={inverted && 'Must be below the price.'}
        />
      </div>

      {off !== null && (
        <p className="text-12 text-gray">
          Sells at{' '}
          <span className="font-medium text-primary">{off}% OFF</span> — the
          price is struck through on the storefront.
        </p>
      )}
    </div>
  );
}

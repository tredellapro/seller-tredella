'use client';

import { HiChevronDown } from 'react-icons/hi';
import { brandsFor, childrenOf } from 'data/product-taxonomy';

interface CategoryPickerProps {
  /** Slugs from department down, as deep as the seller has gone. */
  path: string[];
  onPathChange: (_path: string[]) => void;
  brand: string;
  onBrandChange: (_brand: string) => void;
}

const LEVEL_LABELS = ['Product Category', 'Sub Category', 'Child Category'];

function Level({
  label,
  value,
  options,
  onChange,
  required
}: {
  label: string;
  value: string;
  options: { slug: string; label: string }[];
  onChange: (_value: string) => void;
  required?: boolean;
}) {
  const id = `category-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-gray">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 outline-none transition-colors focus:border-primary ${
            value ? 'text-secondary' : 'text-gray/60'
          }`}
        >
          <option value="">{`Select ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
      </div>
    </div>
  );
}

/**
 * Cascading category selects. Choosing at one level truncates everything below
 * it, so the path can never describe a category that does not exist — which
 * matters, because the whole form is generated from that path.
 */
export default function CategoryPicker({
  path,
  onPathChange,
  brand,
  onBrandChange
}: CategoryPickerProps) {
  const brands = brandsFor(path);

  /* Render a level for each step already taken plus the next one, up to three. */
  const levels = [0, 1, 2].filter((depth) => {
    if (depth === 0) return true;
    return path.length >= depth && childrenOf(path.slice(0, depth)).length > 0;
  });

  return (
    <div className="flex flex-col gap-5">
      {levels.map((depth) => (
        <Level
          key={depth}
          label={LEVEL_LABELS[depth]}
          required={depth === 0}
          value={path[depth] ?? ''}
          options={childrenOf(path.slice(0, depth))}
          onChange={(slug) =>
            onPathChange(slug ? [...path.slice(0, depth), slug] : path.slice(0, depth))
          }
        />
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor="product-brand" className="text-13 text-gray">
          Brand <span className="text-gray">(Optional)</span>
        </label>
        {brands.length > 0 ? (
          <>
            <input
              id="product-brand"
              type="text"
              list="brand-options"
              value={brand}
              onChange={(event) => onBrandChange(event.target.value)}
              placeholder="Start typing, or pick from the list"
              className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
            />
            {/* a datalist keeps the known brands one keystroke away without
                shutting out sellers whose brand is not on the list yet */}
            <datalist id="brand-options">
              {brands.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </>
        ) : (
          <input
            id="product-brand"
            type="text"
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            placeholder="Choose a category first"
            className="w-full rounded-lg border border-secondary/15 bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary"
          />
        )}
      </div>
    </div>
  );
}

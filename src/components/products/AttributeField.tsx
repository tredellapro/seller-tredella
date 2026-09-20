'use client';

import { HiChevronDown } from 'react-icons/hi';
import type { AttributeSpec } from 'data/product-taxonomy';
import ColorSwatchPicker from './ColorSwatchPicker';
import NumberField from './NumberField';

/** One attribute's value. Multi-valued types keep an array. */
export type AttributeValue = string | string[] | boolean;

interface AttributeFieldProps {
  spec: AttributeSpec;
  value: AttributeValue | undefined;
  onChange: (_value: AttributeValue) => void;
  error?: string | false;
}

const asString = (value: AttributeValue | undefined): string =>
  typeof value === 'string' ? value : '';

const asArray = (value: AttributeValue | undefined): string[] =>
  Array.isArray(value) ? value : [];

/**
 * Renders whichever control an attribute's type calls for. Everything the
 * category form draws goes through here, so adding a type to the taxonomy is
 * a change in one place.
 */
export default function AttributeField({
  spec,
  value,
  onChange,
  error
}: AttributeFieldProps) {
  const fieldId = `attr-${spec.key}`;

  const labelNode = (
    <label htmlFor={fieldId} className="text-13 text-gray">
      {spec.label}
      {spec.required && <span className="ml-1 text-primary">*</span>}
    </label>
  );

  const helpNode = spec.help && (
    <p className="text-11 text-gray">{spec.help}</p>
  );

  const errorNode = error && <p className="text-12 text-primary">{error}</p>;

  if (spec.type === 'color')
    return (
      <div className="flex flex-col gap-1">
        <ColorSwatchPicker
          label={spec.label}
          multiple={false}
          selected={asArray(value)}
          onChange={onChange}
        />
        {helpNode}
        {errorNode}
      </div>
    );

  if (spec.type === 'boolean')
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={fieldId}
          className="flex cursor-pointer items-center gap-2.5 text-13 text-secondary"
        >
          <input
            id={fieldId}
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded border border-secondary/30 bg-white bg-center bg-no-repeat transition-colors checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            style={{
              backgroundImage:
                value === true
                  ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'><path d='M7.6 13.5 4.3 10.2l1.1-1.1 2.2 2.2 6-6 1.1 1.1z'/></svg>\")"
                  : undefined
            }}
          />
          {spec.label}
        </label>
        {helpNode}
        {errorNode}
      </div>
    );

  if (spec.type === 'multiselect')
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-13 text-gray">
          {spec.label}
          {spec.required && <span className="ml-1 text-primary">*</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(spec.options ?? []).map((option) => {
            const on = asArray(value).includes(option);
            return (
              <label key={option} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    onChange(
                      on
                        ? asArray(value).filter((v) => v !== option)
                        : [...asArray(value), option]
                    )
                  }
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-secondary/15 px-3 py-1.5 text-12 text-secondary transition-colors peer-checked:border-primary peer-checked:bg-primary/8 peer-checked:text-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                  {option}
                </span>
              </label>
            );
          })}
        </div>
        {helpNode}
        {errorNode}
      </fieldset>
    );

  if (spec.type === 'select')
    return (
      <div className="flex flex-col gap-2">
        {labelNode}
        <div className="relative">
          <select
            id={fieldId}
            value={asString(value)}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            className={`w-full appearance-none rounded-lg border bg-white py-2.5 pl-3.5 pr-10 text-14 outline-none transition-colors ${
              asString(value) ? 'text-secondary' : 'text-gray/60'
            } ${error ? 'border-primary' : 'border-secondary/15 focus:border-primary'}`}
          >
            <option value="">{`Select ${spec.label.toLowerCase()}`}</option>
            {(spec.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
        </div>
        {helpNode}
        {errorNode}
      </div>
    );

  if (spec.type === 'number')
    return (
      <div className="flex flex-col gap-1">
        <NumberField
          id={fieldId}
          label={spec.label}
          value={asString(value)}
          onChange={onChange}
          placeholder={spec.placeholder}
          unit={spec.unit}
          decimal
          error={error}
        />
        {helpNode}
      </div>
    );

  if (spec.type === 'date')
    return (
      <div className="flex flex-col gap-2">
        {labelNode}
        <input
          id={fieldId}
          type="date"
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors ${
            error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
          }`}
        />
        {helpNode}
        {errorNode}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {labelNode}
      <input
        id={fieldId}
        type="text"
        value={asString(value)}
        placeholder={spec.placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
          error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
        }`}
      />
      {helpNode}
      {errorNode}
    </div>
  );
}

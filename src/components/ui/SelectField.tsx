import { SelectHTMLAttributes } from 'react';
import { HiChevronDown } from 'react-icons/hi';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | false;
  options: SelectOption[];
  placeholder?: string;
}

export default function SelectField({
  label,
  error,
  options,
  placeholder = 'Select an option',
  id,
  name,
  value,
  className = '',
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className="text-14 text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={fieldId}
          name={name}
          value={value}
          aria-invalid={error ? true : undefined}
          className={`w-full appearance-none rounded-lg border bg-white py-3 pl-4 pr-11 text-14 outline-none transition-colors ${
            value ? 'text-secondary' : 'text-gray/60'
          } ${
            error
              ? 'border-primary focus:border-primary'
              : 'border-secondary/15 focus:border-primary'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <HiChevronDown className="pointer-events-none absolute inset-y-0 right-4 my-auto h-5 w-5 text-gray" />
      </div>

      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

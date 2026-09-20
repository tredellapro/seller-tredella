import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | false;
  /** Rendered inside the field, on the right — e.g. a show/hide toggle. */
  adornment?: ReactNode;
  /** Rendered inside the field, on the left — e.g. a mail icon. */
  leadingIcon?: ReactNode;
  containerClassName?: string;
}

export const fieldShellClasses =
  'w-full rounded-lg border bg-white px-4 py-3 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60';

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      adornment,
      leadingIcon,
      containerClassName = '',
      className = '',
      id,
      name,
      ...props
    },
    ref
  ) {
    const fieldId = id ?? name;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className={`flex flex-col gap-2 ${containerClassName}`}>
        {label && (
          <label htmlFor={fieldId} className="text-14 text-secondary">
            {label}
          </label>
        )}

        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-16 text-secondary">
              {leadingIcon}
            </div>
          )}
          <input
            ref={ref}
            id={fieldId}
            name={name}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={`${fieldShellClasses} ${
              error
                ? 'border-primary focus:border-primary'
                : 'border-secondary/15 focus:border-primary'
            } ${adornment ? 'pr-12' : ''} ${
              leadingIcon ? 'pl-11' : ''
            } ${className}`}
            {...props}
          />
          {adornment && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {adornment}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-12 text-primary">
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default TextField;

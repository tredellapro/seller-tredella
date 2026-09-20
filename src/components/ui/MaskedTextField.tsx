'use client';

import {
  InputHTMLAttributes,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent
} from 'react';
import { fieldShellClasses } from './TextField';
import { caretAfter, significantBefore } from 'lib/formatters';

interface MaskedTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string | false;
  /** Fixed, non-editable text inside the field — e.g. the +971 dial code. */
  prefix?: string;
  value: string;
  /** Turns whatever was typed into what the field should show. */
  format: (_raw: string) => string;
  onValueChange: (_formatted: string) => void;
  containerClassName?: string;
}

/**
 * A field that can only ever hold well-formed input: every keystroke, paste and
 * autofill goes through `format`, so a letter simply never lands in a numeric
 * field. The caret is restored by counting characters rather than by index,
 * because re-formatting rebuilds the string around it.
 */
export default function MaskedTextField({
  label,
  error,
  prefix,
  value,
  format,
  onValueChange,
  containerClassName = '',
  className = '',
  id,
  name,
  onBlur,
  ...props
}: MaskedTextFieldProps) {
  const fieldId = id ?? name;
  const errorId = error ? `${fieldId}-error` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [caret, setCaret] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (caret === null) return;
    inputRef.current?.setSelectionRange(caret, caret);
    setCaret(null);
  }, [caret, value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const position = event.target.selectionStart ?? raw.length;
    const formatted = format(raw);

    onValueChange(formatted);
    setCaret(caretAfter(formatted, significantBefore(raw, position)));
  };

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={fieldId} className="text-14 text-secondary">
          {label}
        </label>
      )}

      <div
        className={`flex items-stretch overflow-hidden rounded-lg border bg-white transition-colors focus-within:border-primary ${
          error ? 'border-primary' : 'border-secondary/15'
        }`}
      >
        {prefix && (
          <span
            // decorative: the real value is assembled on submit
            aria-hidden="true"
            className="flex select-none items-center border-r border-secondary/15 bg-background px-3 text-14 text-secondary"
          >
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`${fieldShellClasses} border-0 focus:outline-none ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="text-12 text-primary">
          {error}
        </p>
      )}
    </div>
  );
}

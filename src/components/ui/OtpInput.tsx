'use client';

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef
} from 'react';

interface OtpInputProps {
  value: string;
  onChange: (_value: string) => void;
  length?: number;
  /** Fired once the last box is filled — lets Enter-free flows auto-submit. */
  onComplete?: (_value: string) => void;
  error?: string | false;
  autoFocus?: boolean;
  disabled?: boolean;
}

const DIGITS_ONLY = /\D/g;

export default function OtpInput({
  value,
  onChange,
  length = 6,
  onComplete,
  error,
  autoFocus = true,
  disabled = false
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ''),
    [value, length]
  );

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string) => {
    const clean = next.replace(DIGITS_ONLY, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const focusBox = (index: number) => {
    const box = inputs.current[Math.max(0, Math.min(length - 1, index))];
    box?.focus();
    box?.select();
  };

  const handleInput = (index: number, raw: string) => {
    const digits = raw.replace(DIGITS_ONLY, '');
    if (!digits) return;

    // typing one digit replaces this box; pasting/autofill spills forward
    const next = (
      value.slice(0, index) +
      digits +
      value.slice(index + digits.length)
    ).slice(0, length);

    const clean = commit(next);
    focusBox(Math.min(index + digits.length, clean.length));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (chars[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
        focusBox(index);
      } else {
        // already empty — clear the one before and step back
        commit(value.slice(0, index - 1) + value.slice(index));
        focusBox(index - 1);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const clean = commit(event.clipboardData.getData('text'));
    focusBox(clean.length);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-3">
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={char}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`h-12 w-11 rounded-lg border bg-white text-center text-20 font-medium text-secondary outline-none transition-colors disabled:opacity-60 ${
              error
                ? 'border-primary'
                : 'border-secondary/20 focus:border-primary'
            }`}
          />
        ))}
      </div>
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

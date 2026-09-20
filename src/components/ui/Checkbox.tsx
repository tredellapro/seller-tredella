import { InputHTMLAttributes, ReactNode } from 'react';
import { HiCheck } from 'react-icons/hi';

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string | false;
}

/* The native input stays in the DOM (keyboard + form semantics) and the square
   beside it is what actually gets painted. */
export default function Checkbox({
  label,
  error,
  id,
  name,
  checked,
  className = '',
  ...props
}: CheckboxProps) {
  const fieldId = id ?? name;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className={`flex cursor-pointer items-center gap-2 text-13 text-secondary ${className}`}
      >
        <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            id={fieldId}
            name={name}
            type="checkbox"
            checked={checked}
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded border border-secondary/30 bg-white transition-colors checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            {...props}
          />
          <HiCheck className="pointer-events-none relative text-13 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        <span>{label}</span>
      </label>
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

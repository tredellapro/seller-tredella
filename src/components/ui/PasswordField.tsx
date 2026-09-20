'use client';

import { InputHTMLAttributes, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import TextField from './TextField';

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string | false;
  containerClassName?: string;
}

export default function PasswordField({
  label,
  error,
  containerClassName,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      label={label}
      error={error}
      containerClassName={containerClassName}
      placeholder={props.placeholder ?? '••••••••'}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="text-18 text-gray transition-colors hover:text-secondary"
          // keeps focus in the field so typing continues uninterrupted
          tabIndex={-1}
        >
          {visible ? <HiOutlineEye /> : <HiOutlineEyeOff />}
        </button>
      }
    />
  );
}

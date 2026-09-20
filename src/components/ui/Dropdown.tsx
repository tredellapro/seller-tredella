'use client';

import { useEffect, useRef, useState } from 'react';
import { HiCheck, HiChevronDown } from 'react-icons/hi';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (_value: string) => void;
  /** Names the control for screen readers. */
  label: string;
  /** Rendered when nothing is selected. */
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
  /** Drops the border and padding, for use inside another bordered control. */
  bare?: boolean;
}

/**
 * A listbox, not a native `<select>`.
 *
 * The OS draws a native select's popup itself — square corners, system font,
 * its own blue highlight — so it cannot be made to look like the rest of the
 * app. This renders the list, which means it also has to carry the keyboard
 * behaviour a native select gives for free: arrows move, Enter and Space
 * select, Escape closes, Home and End jump.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  label,
  placeholder = 'Select',
  align = 'left',
  className = '',
  bare = false
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  /* Opening seeds the highlight from the current selection. Done here rather
     than in an effect: an effect would set state during the render that just
     opened the menu, costing a second pass for something already known. */
  const openMenu = () => {
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // keep the highlighted row in view when arrowing through a long list
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelectorAll('li')
      [highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlighted((index) => Math.min(options.length - 1, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlighted((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setHighlighted(0);
        break;
      case 'End':
        event.preventDefault();
        setHighlighted(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(highlighted);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`flex w-full items-center justify-between gap-1.5 text-13 transition-colors ${
          bare
            ? 'text-secondary'
            : 'rounded-lg border border-secondary/15 bg-white px-3 py-2 hover:border-primary/40'
        } ${selected ? 'text-secondary' : 'text-gray'}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <HiChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-gray transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className={`brand-scroll absolute z-30 mt-2 max-h-60 min-w-[160px] overflow-y-auto rounded-xl border border-secondary/10 bg-white p-1 shadow-[0_12px_32px_rgba(43,52,69,0.16)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => commit(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-13 transition-colors ${
                  index === highlighted
                    ? 'bg-primary/8 text-primary'
                    : 'text-secondary'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <HiCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

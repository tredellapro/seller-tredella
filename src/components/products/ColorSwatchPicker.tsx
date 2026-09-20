'use client';

import { useRef, useState } from 'react';
import { HiCheck } from 'react-icons/hi';
import { MdColorize } from 'react-icons/md';
import { COLOR_OPTIONS } from 'data/product-taxonomy';

interface ColorSwatchPickerProps {
  /** Colour names, not hexes — the name is what the buyer reads. */
  selected: string[];
  onChange: (_selected: string[]) => void;
  /** Single mode replaces the selection; multiple mode toggles. */
  multiple?: boolean;
  label: string;
}

/* A swatch alone would leave colour carrying meaning on its own, so each one
   is a checkbox with its colour name as the accessible label, and the chosen
   names are listed underneath in text. */
export default function ColorSwatchPicker({
  selected,
  onChange,
  multiple = false,
  label
}: ColorSwatchPickerProps) {
  const [custom, setCustom] = useState<{ name: string; hex: string }[]>([]);
  const colorInput = useRef<HTMLInputElement>(null);

  const swatches = [...COLOR_OPTIONS, ...custom];

  const toggle = (name: string) => {
    if (!multiple) {
      onChange(selected[0] === name ? [] : [name]);
      return;
    }
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    );
  };

  const addCustom = (hex: string) => {
    const name = `Custom ${hex.toUpperCase()}`;
    if (!custom.some((c) => c.hex === hex)) setCustom((list) => [...list, { name, hex }]);
    if (!selected.includes(name)) onChange(multiple ? [...selected, name] : [name]);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-13 text-gray">{label}</legend>

      <div className="flex flex-wrap items-center gap-2.5">
        {swatches.map((swatch) => {
          const isOn = selected.includes(swatch.name);
          return (
            <label
              key={swatch.name}
              title={swatch.name}
              className="relative cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggle(swatch.name)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                style={{ backgroundColor: swatch.hex }}
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-[box-shadow,transform] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                  isOn
                    ? 'border-transparent shadow-[0_0_0_2px_#fff,0_0_0_4px_rgb(var(--primary-rgb))]'
                    : 'border-secondary/15'
                }`}
              >
                {isOn && (
                  <HiCheck
                    className={`h-3.5 w-3.5 ${
                      ['White', 'Silver', 'Amber'].includes(swatch.name)
                        ? 'text-secondary'
                        : 'text-white'
                    }`}
                  />
                )}
              </span>
              <span className="sr-only">{swatch.name}</span>
            </label>
          );
        })}

        <button
          type="button"
          onClick={() => colorInput.current?.click()}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-secondary/20 text-gray transition-colors hover:border-primary hover:text-primary"
          aria-label="Pick a custom colour"
        >
          <MdColorize className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => colorInput.current?.click()}
          className="text-12 font-medium text-primary hover:underline"
        >
          Custom Color
        </button>

        <input
          ref={colorInput}
          type="color"
          className="sr-only"
          onChange={(event) => addCustom(event.target.value)}
        />
      </div>

      {selected.length > 0 && (
        <p className="text-12 text-gray">{selected.join(', ')}</p>
      )}
    </fieldset>
  );
}

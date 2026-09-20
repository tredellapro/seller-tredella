'use client';

import { useEffect, useRef } from 'react';
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi';

export interface LocalImage {
  id: string;
  name: string;
  /** Object URL for the preview — the File itself is uploaded on submit. */
  url: string;
  file: File;
}

export const toLocalImage = (file: File): LocalImage => ({
  id: `img-${Math.random().toString(36).slice(2, 9)}`,
  name: file.name,
  url: URL.createObjectURL(file),
  file
});

interface PosterImageProps {
  value: LocalImage | null;
  onChange: (_image: LocalImage | null) => void;
}

/** The single hero shot at the top of the form. */
export function PosterImage({ value, onChange }: PosterImageProps) {
  const input = useRef<HTMLInputElement>(null);

  /* Held in a ref so the unmount cleanup frees whatever is on screen at the
     time, not the null this started with. Replacing revokes in `pick`. */
  const latestUrl = useRef<string | null>(null);
  latestUrl.current = value?.url ?? null;

  useEffect(
    () => () => {
      if (latestUrl.current) URL.revokeObjectURL(latestUrl.current);
    },
    []
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (value) URL.revokeObjectURL(value.url);
    onChange(toLocalImage(file));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-14 text-secondary">Poster image</p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex items-center gap-1.5 text-13 font-medium text-primary hover:underline"
        >
          <HiOutlineUpload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {value ? (
        <div className="group relative w-full max-w-[280px] overflow-hidden rounded-lg border border-secondary/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.url}
            alt={value.name}
            className="h-[150px] w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/45 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="w-[110px] rounded border border-white/60 bg-secondary/70 py-1.5 text-12 text-white transition-colors hover:bg-secondary"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(value.url);
                onChange(null);
              }}
              className="w-[110px] rounded border border-white/60 bg-secondary/70 py-1.5 text-12 text-white transition-colors hover:bg-secondary"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex h-[150px] w-full max-w-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-secondary/25 bg-background text-gray transition-colors hover:border-primary hover:text-primary"
        >
          <HiOutlineUpload className="h-6 w-6" />
          <span className="text-12">Upload the main product photo</span>
          <span className="text-11 text-gray">JPG, PNG or WebP — up to 5 MB</span>
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}

interface ImageTileGridProps {
  label: string;
  images: LocalImage[];
  onChange: (_images: LocalImage[]) => void;
  max?: number;
  /** Swap the photo tiles for document tiles — used by purchase invoices. */
  variant?: 'photo' | 'document';
  accept?: string;
}

/** Row of square thumbnails with a trailing "+" tile, as the variation blocks draw it. */
export function ImageTileGrid({
  label,
  images,
  onChange,
  max = 8,
  variant = 'photo',
  accept = 'image/jpeg,image/png,image/webp'
}: ImageTileGridProps) {
  const input = useRef<HTMLInputElement>(null);

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - images.length;
    onChange([...images, ...Array.from(files).slice(0, room).map(toLocalImage)]);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-13 text-gray">{label}</p>

      <div className="flex flex-wrap items-center gap-2.5">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative h-[52px] w-[52px] overflow-hidden rounded-lg border border-secondary/10 bg-background"
          >
            {variant === 'photo' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center px-1 text-center">
                <span className="truncate text-10 text-gray">{image.name}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(image.url);
                onChange(images.filter((i) => i.id !== image.id));
              }}
              aria-label={`Remove ${image.name}`}
              className="absolute inset-0 flex items-center justify-center bg-secondary/55 text-11 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-label={`Add to ${label}`}
            className={`flex h-[52px] w-[52px] flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-secondary/25 text-gray transition-colors hover:border-primary hover:text-primary ${
              variant === 'document' ? 'text-10' : ''
            }`}
          >
            <HiOutlinePlus className="h-4 w-4" />
            {variant === 'document' && <span className="text-10">Upload</span>}
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          add(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}

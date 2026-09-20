'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  /** Describes the subject; the thumbnails are decorative. */
  alt: string;
  /** Height of the main image. */
  height?: string;
}

/** A main image with selectable thumbnails beneath it. */
export default function ImageGallery({
  images,
  alt,
  height = 'h-[220px]'
}: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[active] ?? images[0]}
        alt={alt}
        className={`w-full rounded-xl bg-background object-cover ${height}`}
      />

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === active}
              className={`h-14 w-14 overflow-hidden rounded-lg border transition-colors ${
                index === active
                  ? 'border-primary'
                  : 'border-secondary/10 hover:border-primary/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { DragEvent, useId, useRef, useState } from 'react';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiCheckCircle
} from 'react-icons/hi';

export interface UploadedFileInfo {
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  url?: string;
}

interface FileUploadProps {
  label: string;
  hint?: string;
  /** Marked optional in the UI when false. */
  required?: boolean;
  accept?: string;
  maxBytes?: number;
  /** Set once a file is stored server-side. */
  value?: UploadedFileInfo | null;
  onSelect: (_file: File) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  /** 0–100 while uploading, null when idle. */
  progress?: number | null;
  error?: string | false;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';
const DEFAULT_MAX_BYTES = 4 * 1024 * 1024;

export const formatBytes = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function FileUpload({
  label,
  hint,
  required = false,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  value,
  onSelect,
  onRemove,
  progress = null,
  error,
  disabled = false
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const busy = progress !== null;
  const shownError = error || localError;

  const accepts = (file: File) => {
    const allowed = accept.split(',').map((a) => a.trim());
    return allowed.some((a) =>
      a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a
    );
  };

  const handle = async (file: File | undefined) => {
    if (!file || disabled || busy) return;
    setLocalError(null);

    // check here too so an oversized file never leaves the browser
    if (file.size > maxBytes) {
      setLocalError(`That file is ${formatBytes(file.size)}. Keep it under ${formatBytes(maxBytes)}.`);
      return;
    }
    if (!accepts(file)) {
      setLocalError('Upload a PDF, JPEG, PNG or WebP.');
      return;
    }
    await onSelect(file);
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    await handle(event.dataTransfer.files?.[0]);
  };

  const Icon = value?.mimeType?.startsWith('image/')
    ? HiOutlinePhotograph
    : HiOutlineDocumentText;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-14 text-secondary">
          {label}
        </label>
        {!required && <span className="text-12 text-gray">Optional</span>}
      </div>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-secondary/15 bg-white px-4 py-3">
          <Icon className="shrink-0 text-20 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-13 text-secondary">{value.fileName}</p>
            <p className="text-12 text-gray">{formatBytes(value.sizeBytes)}</p>
          </div>
          <HiCheckCircle
            className="shrink-0 text-18 text-primary"
            aria-label="Uploaded"
          />
          {onRemove && (
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={disabled || busy}
              aria-label={`Remove ${label}`}
              className="shrink-0 rounded p-1 text-16 text-gray transition-colors hover:text-primary disabled:opacity-50"
            >
              <HiOutlineTrash />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !busy) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => void onDrop(e)}
          className={`rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
            shownError
              ? 'border-primary bg-white'
              : dragging
                ? 'border-primary bg-primary/5'
                : 'border-secondary/25 bg-white'
          } ${disabled || busy ? 'opacity-70' : ''}`}
        >
          <HiOutlineCloudUpload className="mx-auto text-24 text-gray" />

          {busy ? (
            <>
              <p className="mt-2 text-13 text-secondary">Uploading… {progress}%</p>
              <div
                className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-secondary/10"
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-13 text-secondary">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled}
                  className="font-medium text-primary hover:underline disabled:opacity-60"
                >
                  Click to upload
                </button>{' '}
                or drag and drop
              </p>
              <p className="mt-1 text-12 text-gray">
                {hint ?? `PDF, JPG, PNG or WebP — up to ${formatBytes(maxBytes)}`}
              </p>
            </>
          )}

          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled || busy}
            className="sr-only"
            onChange={(e) => {
              void handle(e.target.files?.[0]);
              // reset so choosing the same file again still fires onChange
              e.target.value = '';
            }}
          />
        </div>
      )}

      {shownError && <p className="text-12 text-primary">{shownError}</p>}
    </div>
  );
}

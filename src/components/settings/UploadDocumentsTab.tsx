'use client';

import { useRef, useState } from 'react';
import {
  HiCheckCircle,
  HiExclamationCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineUpload
} from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import { longDate } from 'data/products-sample';
import {
  DOCUMENTS,
  canUpload,
  documentMeta,
  formatBytes,
  type DocumentReviewStatus,
  type SellerDocument
} from 'data/documents-sample';
import type { SellerDocumentType } from 'data/uae-business';

/* The seller reads their documents here; they do not manage them. What is on
   file was verified at registration, and letting it be swapped afterwards
   would make that verification worthless. An upload slot appears only where
   there is nothing on file — because it was never given, or because an admin
   removed it. */

const STATUS_TONE: Record<DocumentReviewStatus, string> = {
  VERIFIED: 'bg-green-500/12 text-green-700',
  PENDING: 'bg-amber-500/12 text-amber-700',
  REJECTED: 'bg-primary/10 text-primary',
  MISSING: 'bg-secondary/8 text-gray'
};

const STATUS_LABEL: Record<DocumentReviewStatus, string> = {
  VERIFIED: 'Verified',
  PENDING: 'In review',
  REJECTED: 'Removed by Tredella',
  MISSING: 'Not provided'
};

const STATUS_ICON: Record<DocumentReviewStatus, typeof HiCheckCircle> = {
  VERIFIED: HiCheckCircle,
  PENDING: HiOutlineClock,
  REJECTED: HiExclamationCircle,
  MISSING: HiOutlineDocumentText
};

/** Where one slot's upload has got to. */
type Transfer =
  | { state: 'idle' }
  | { state: 'uploading'; percent: number }
  | { state: 'done'; name: string; sizeBytes: number }
  | { state: 'failed'; message: string; file: File };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export default function UploadDocumentsTab() {
  const [documents, setDocuments] = useState<SellerDocument[]>(DOCUMENTS);
  const [transfers, setTransfers] = useState<Record<string, Transfer>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const setTransfer = (type: string, transfer: Transfer) =>
    setTransfers((current) => ({ ...current, [type]: transfer }));

  const send = async (type: SellerDocumentType, file: File) => {
    if (file.size > MAX_BYTES) {
      setTransfer(type, {
        state: 'failed',
        message: `That file is ${formatBytes(file.size)}. Keep it under ${formatBytes(MAX_BYTES)}.`,
        file
      });
      return;
    }

    setTransfer(type, { state: 'uploading', percent: 0 });

    try {
      /* The real endpoint, and the one that reports progress — XHR is the only
         way to get a percentage out of an upload. */
      const { uploadSellerDocument } = await import('lib/api');
      const uploaded = await uploadSellerDocument(type, file, (percent) =>
        setTransfer(type, { state: 'uploading', percent })
      );

      setTransfer(type, {
        state: 'done',
        name: uploaded.fileName,
        sizeBytes: uploaded.sizeBytes
      });

      /* Back into review — an upload is a submission, not an approval. */
      setDocuments((all) =>
        all.map((document) =>
          document.type === type
            ? {
                ...document,
                status: 'PENDING',
                rejectionReason: null,
                file: {
                  name: uploaded.fileName,
                  sizeBytes: uploaded.sizeBytes,
                  url: uploaded.url,
                  uploadedAt: uploaded.uploadedAt.slice(0, 10)
                }
              }
            : document
        )
      );
    } catch (failure) {
      setTransfer(type, {
        state: 'failed',
        message:
          failure instanceof Error ? failure.message : 'That upload did not go through.',
        file
      });
    }
  };

  const verified = documents.filter((d) => d.status === 'VERIFIED').length;
  const required = documents.filter((d) => documentMeta(d.type).required).length;

  return (
    <Panel className="max-w-[720px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-14 font-semibold text-secondary">
            Upload Documents
          </h2>
          <p className="mt-1 text-12 text-gray">
            Your trade verification documents. These cannot be changed once they
            are on file — if something needs correcting, Tredella removes it and
            an upload slot appears here.
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-11 text-gray">
          <HiOutlineShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {verified} of {required} verified
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-4">
        {documents.map((document) => {
          const meta = documentMeta(document.type);
          const Icon = STATUS_ICON[document.status];
          const transfer = transfers[document.type] ?? { state: 'idle' };
          const open = canUpload(document);

          return (
            <li
              key={document.type}
              className="rounded-xl border border-secondary/10 px-4 py-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-13 font-medium text-secondary">
                    {meta.label}
                    {!meta.required && (
                      <span className="ml-2 text-11 font-normal text-gray">
                        Optional
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-11 text-gray">{meta.hint}</p>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-11 font-medium ${STATUS_TONE[document.status]}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {STATUS_LABEL[document.status]}
                </span>
              </div>

              {/* On file — read only. No replace, no delete. */}
              {document.file && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-background px-3 py-2.5">
                  <HiOutlineDocumentText
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-gray"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-12 text-secondary">
                      {document.file.name}
                    </span>
                    <span className="block text-11 text-gray">
                      {formatBytes(document.file.sizeBytes)} · uploaded{' '}
                      {longDate(document.file.uploadedAt)}
                    </span>
                  </span>
                  <a
                    href={document.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-11 font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <HiOutlineExternalLink className="h-3.5 w-3.5" />
                    View
                  </a>
                </div>
              )}

              {document.rejectionReason && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-12 text-secondary">
                  <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {document.rejectionReason}
                </p>
              )}

              {open && (
                <div className="mt-3">
                  {transfer.state === 'uploading' ? (
                    <div className="rounded-lg border border-secondary/15 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-12 text-secondary">
                          Uploading…
                        </span>
                        <span className="shrink-0 text-12 font-medium text-primary">
                          {transfer.percent}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={transfer.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Uploading ${meta.label}`}
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary/10"
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-200"
                          style={{ width: `${transfer.percent}%` }}
                        />
                      </div>
                    </div>
                  ) : transfer.state === 'failed' ? (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                      <HiExclamationCircle
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-12 text-secondary">
                          Upload failed
                        </span>
                        <span className="block text-11 text-gray">
                          {transfer.message}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => void send(document.type, transfer.file)}
                        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-11 font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <HiOutlineRefresh className="h-3.5 w-3.5" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputs.current[document.type]?.click()}
                      className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-secondary/25 px-4 py-5 text-gray transition-colors hover:border-primary hover:text-primary"
                    >
                      <HiOutlineUpload className="h-5 w-5" aria-hidden="true" />
                      <span className="text-12">
                        <span className="font-medium text-primary">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </span>
                      <span className="text-11 text-gray">
                        PDF, JPG, PNG or WebP — up to {formatBytes(MAX_BYTES)}
                      </span>
                    </button>
                  )}

                  <input
                    ref={(element) => {
                      inputs.current[document.type] = element;
                    }}
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void send(document.type, file);
                      event.target.value = '';
                    }}
                  />
                </div>
              )}

              {/* Spelled out, so a missing button does not read as a bug. */}
              {!open && (
                <p className="mt-2 text-11 text-gray">
                  {document.status === 'VERIFIED'
                    ? 'Verified — contact support if this needs replacing.'
                    : 'In review. You will be told if anything needs changing.'}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

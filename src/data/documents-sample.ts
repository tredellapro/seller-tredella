import { SELLER_DOCUMENTS, type SellerDocumentType } from './uae-business';

/* The KYC documents given at registration.
 *
 * A seller cannot replace or delete what is on file — these are the basis of
 * their trade verification, and letting them be swapped after approval would
 * make the approval meaningless. The upload slot only opens when there is
 * nothing on file: either the document was never given, or an admin removed it
 * because something was wrong with it.
 */

export type DocumentReviewStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'MISSING';

export interface SellerDocument {
  type: SellerDocumentType;
  status: DocumentReviewStatus;
  /** Null when nothing is on file. */
  file: {
    name: string;
    sizeBytes: number;
    url: string;
    uploadedAt: string;
  } | null;
  /** Why an admin removed it. Only set on REJECTED. */
  rejectionReason: string | null;
}

export const DOCUMENTS: SellerDocument[] = [
  {
    type: 'TRADE_LICENSE',
    status: 'VERIFIED',
    file: {
      name: 'trade-licence-2025.pdf',
      sizeBytes: 2_248_000,
      url: '#',
      uploadedAt: '2025-01-12'
    },
    rejectionReason: null
  },
  {
    type: 'EMIRATES_ID_FRONT',
    status: 'PENDING',
    file: {
      name: 'emirates-id-front.jpg',
      sizeBytes: 812_000,
      url: '#',
      uploadedAt: '2025-03-04'
    },
    rejectionReason: null
  },
  {
    /* Removed by an admin — this is the only way the seller gets an upload
       slot back. */
    type: 'EMIRATES_ID_BACK',
    status: 'REJECTED',
    file: null,
    rejectionReason:
      'The card number was not readable. Please upload a clearer photo of the back.'
  },
  {
    type: 'VAT_CERTIFICATE',
    status: 'MISSING',
    file: null,
    rejectionReason: null
  }
];

export const documentMeta = (type: SellerDocumentType) =>
  SELLER_DOCUMENTS.find((document) => document.type === type)!;

export const formatBytes = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Only an empty slot can be filled — see the note at the top. */
export const canUpload = (document: SellerDocument): boolean =>
  document.status === 'REJECTED' || document.status === 'MISSING';

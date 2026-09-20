export type VerificationStatus =
  | 'UNSUBMITTED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type SellerDocumentType =
  | 'TRADE_LICENSE'
  | 'EMIRATES_ID_FRONT'
  | 'EMIRATES_ID_BACK'
  | 'VAT_CERTIFICATE';

export interface SellerDocument {
  id: string;
  type: SellerDocumentType;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface SellerAccount {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  legalForm: string | null;
  emirate: string | null;
  addressLine: string | null;
  phone: string | null;
  tradeLicenseNumber: string | null;
  tradeLicenseExpiry: string | null;
  emiratesIdNumber: string | null;
  trn: string | null;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  submittedAt: string | null;
  missingDocuments: SellerDocumentType[];
  documents: SellerDocument[];
}

export interface MySellerAccountResult {
  mySellerAccount: SellerAccount | null;
}

export interface SubmitSellerVerificationResult {
  submitSellerVerification: SellerAccount;
}

export interface RemoveSellerDocumentResult {
  removeSellerDocument: boolean;
}

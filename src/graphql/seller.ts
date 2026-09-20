import { gql } from '@apollo/client';

/* The seller's own store. Separate from the public `Seller` type on purpose —
   trade licence and Emirates ID details are never exposed to shoppers. */

const ACCOUNT_FIELDS = gql`
  fragment SellerAccountFields on SellerAccount {
    id
    slug
    name
    legalName
    legalForm
    emirate
    addressLine
    phone
    tradeLicenseNumber
    tradeLicenseExpiry
    emiratesIdNumber
    trn
    verificationStatus
    verificationNote
    submittedAt
    missingDocuments
    documents {
      id
      type
      url
      fileName
      mimeType
      sizeBytes
      uploadedAt
    }
  }
`;

export const MY_SELLER_ACCOUNT = gql`
  ${ACCOUNT_FIELDS}
  query MySellerAccount {
    mySellerAccount {
      ...SellerAccountFields
    }
  }
`;

export const SUBMIT_SELLER_VERIFICATION = gql`
  ${ACCOUNT_FIELDS}
  mutation SubmitSellerVerification($input: SellerVerificationInput!) {
    submitSellerVerification(input: $input) {
      ...SellerAccountFields
    }
  }
`;

export const REMOVE_SELLER_DOCUMENT = gql`
  mutation RemoveSellerDocument($type: SellerDocumentType!) {
    removeSellerDocument(type: $type)
  }
`;

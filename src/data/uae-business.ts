import type { SelectOption } from 'components/ui/SelectField';

/* Values match the backend's Emirate and LegalForm GraphQL enums. */

export const EMIRATES: SelectOption[] = [
  { value: 'DUBAI', label: 'Dubai' },
  { value: 'ABU_DHABI', label: 'Abu Dhabi' },
  { value: 'SHARJAH', label: 'Sharjah' },
  { value: 'AJMAN', label: 'Ajman' },
  { value: 'UMM_AL_QUWAIN', label: 'Umm Al Quwain' },
  { value: 'RAS_AL_KHAIMAH', label: 'Ras Al Khaimah' },
  { value: 'FUJAIRAH', label: 'Fujairah' }
];

export const LEGAL_FORMS: SelectOption[] = [
  { value: 'SOLE_ESTABLISHMENT', label: 'Sole Establishment' },
  { value: 'LLC', label: 'Limited Liability Company (LLC)' },
  { value: 'FREE_ZONE', label: 'Free Zone Company' },
  { value: 'BRANCH', label: 'Branch of a Foreign Company' },
  { value: 'CIVIL_COMPANY', label: 'Civil Company' }
];

/** Document types the backend accepts, in the order the form presents them. */
export const SELLER_DOCUMENTS = [
  {
    type: 'TRADE_LICENSE',
    label: 'Trade Licence',
    hint: 'The licence issued by your DED or free zone authority',
    required: true
  },
  {
    type: 'EMIRATES_ID_FRONT',
    label: 'Emirates ID — front',
    hint: 'Of the owner or authorised signatory',
    required: true
  },
  {
    type: 'EMIRATES_ID_BACK',
    label: 'Emirates ID — back',
    hint: 'The side showing the card number',
    required: true
  },
  {
    type: 'VAT_CERTIFICATE',
    label: 'VAT Certificate',
    hint: 'Only if you are VAT registered',
    required: false
  }
] as const;

export type SellerDocumentType = (typeof SELLER_DOCUMENTS)[number]['type'];

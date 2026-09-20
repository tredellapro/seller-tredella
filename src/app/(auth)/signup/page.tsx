import SignUpFlow from 'components/auth/SignUpFlow';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';

export const metadata = createMetadata(pageMetadataData.SignUpPage);

/* The header varies by step — Sign In on the forms, Skip on the plan step — so
   SignUpFlow owns it rather than the page. */
export default function SignUpPage() {
  return <SignUpFlow />;
}

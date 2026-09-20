import AuthHeader from 'components/auth/AuthHeader';
import SignUpForm from 'components/auth/SignUpForm';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';

export const metadata = createMetadata(pageMetadataData.SignUpPage);

export default function SignUpPage() {
  return (
    <>
      <AuthHeader cta="signin" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <SignUpForm />
      </main>
    </>
  );
}

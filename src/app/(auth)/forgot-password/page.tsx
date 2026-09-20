import AuthHeader from 'components/auth/AuthHeader';
import ForgotPasswordForm from 'components/auth/ForgotPasswordForm';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';

export const metadata = createMetadata(pageMetadataData.ForgotPasswordPage);

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader cta="signup" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <ForgotPasswordForm />
      </main>
    </>
  );
}

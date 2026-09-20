import { Suspense } from 'react';
import AuthHeader from 'components/auth/AuthHeader';
import LoginForm from 'components/auth/LoginForm';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';

export const metadata = createMetadata(pageMetadataData.LoginPage);

export default function LoginPage() {
  return (
    <>
      <AuthHeader cta="signup" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        {/* useSearchParams needs a boundary so the shell can still prerender */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}

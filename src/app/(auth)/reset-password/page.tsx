import { Suspense } from 'react';
import AuthHeader from 'components/auth/AuthHeader';
import ResetPasswordFlow from 'components/auth/ResetPasswordFlow';
import { createMetadata } from 'utils/metadataHelper';
import { pageMetadataData } from 'data/meta-data';

export const metadata = createMetadata(pageMetadataData.ResetPasswordPage);

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeader cta="signin" />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        {/* the flow reads ?email= from the query, so it needs a boundary */}
        <Suspense fallback={null}>
          <ResetPasswordFlow />
        </Suspense>
      </main>
    </>
  );
}

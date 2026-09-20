'use client';

import { useRouter } from 'next/navigation';
import { useApolloClient, useQuery } from '@apollo/client';
import Button from 'components/ui/Button';
import { ME } from 'graphql/auth';
import { clearToken } from 'lib/token';
import type { AuthUser } from 'types/auth';

/* Placeholder. It exists so the auth flow lands somewhere real and so the
   middleware gate has something to guard — the designed dashboard replaces it. */
export default function DashboardPage() {
  const router = useRouter();
  const client = useApolloClient();
  const { data, loading } = useQuery<{ me: AuthUser | null }>(ME, {
    fetchPolicy: 'network-only'
  });

  const signOut = async () => {
    clearToken();
    await client.clearStore();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex_center min-h-screen bg-background px-4">
      <div className="w-full max-w-[550px] rounded-2xl bg-white px-8 py-10 text-center shadow-[0_4px_30px_rgba(43,52,69,0.08)]">
        <h1 className="text-24 font-semibold text-secondary">
          Seller Dashboard
        </h1>

        {loading ? (
          <p className="mt-3 text-14 text-gray">Loading your account…</p>
        ) : data?.me ? (
          <p className="mt-3 text-14 text-gray">
            Signed in as{' '}
            <span className="font-medium text-secondary">{data.me.name}</span> (
            {data.me.email}) — {data.me.role}
          </p>
        ) : (
          <p className="mt-3 text-14 text-gray">
            Your session has expired. Please sign in again.
          </p>
        )}

        <p className="mt-6 text-13 text-gray">
          The dashboard screens come next; this page only confirms sign-in works.
        </p>

        <div className="mt-7 flex justify-center">
          <Button type="button" variant="outline" size="lg" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </main>
  );
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import MessagesView from 'components/messages/MessagesView';

export const metadata: Metadata = {
  title: 'Messages | Tredella Seller'
};

/* A static segment, so this takes precedence over /dashboard/[section].
   The view reads ?c= to deep-link a thread, which needs a Suspense boundary. */
export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { HiArrowLeft } from 'react-icons/hi';
import NotificationItem from 'components/dashboard/NotificationItem';
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  UNREAD_NOTIFICATION_COUNT
} from 'graphql/notifications';
import type {
  GetNotificationsResult,
  MarkNotificationReadResult
} from 'types/notification';

/** The full list behind the dropdown's "See all". */
export default function NotificationList() {
  const { data, loading, refetch } = useQuery<GetNotificationsResult>(
    GET_NOTIFICATIONS,
    { fetchPolicy: 'cache-and-network', errorPolicy: 'all' }
  );
  const [markRead] = useMutation<MarkNotificationReadResult>(
    MARK_NOTIFICATION_READ,
    { refetchQueries: [{ query: UNREAD_NOTIFICATION_COUNT }] }
  );

  const notifications = data?.getNotifications ?? [];
  const unread = notifications.filter((n) => n.readAt === null).length;

  const markAllRead = async () => {
    await markRead({ variables: { id: null } });
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-14 text-secondary transition-colors hover:text-primary"
        >
          <HiArrowLeft aria-hidden="true" />
          Back to dashboard
        </Link>

        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unread === 0}
          className="text-13 text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark as all read
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.08)]">
        <h1 className="border-b border-secondary/10 px-5 py-4 text-16 font-semibold text-secondary">
          Notifications
        </h1>

        <div className="divide-y divide-secondary/8">
          {loading && notifications.length === 0 ? (
            <p className="px-5 py-10 text-center text-13 text-gray">Loading…</p>
          ) : notifications.length === 0 ? (
            <p className="px-5 py-10 text-center text-13 text-gray">
              You have no notifications yet.
            </p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

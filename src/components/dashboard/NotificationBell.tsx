'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { HiOutlineBell } from 'react-icons/hi';
import NotificationItem from './NotificationItem';
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  UNREAD_NOTIFICATION_COUNT
} from 'graphql/notifications';
import type {
  GetNotificationsResult,
  MarkNotificationReadResult,
  UnreadCountResult
} from 'types/notification';

/* The API also publishes a `notificationAdded` subscription, but WebSockets do
   not survive a serverless host — polling keeps the badge fresh everywhere.
   Swap this for the subscription once the API runs somewhere persistent. */
const POLL_MS = 45_000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: countData, refetch: refetchCount } =
    useQuery<UnreadCountResult>(UNREAD_NOTIFICATION_COUNT, {
      pollInterval: POLL_MS,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    });

  // the list is only worth fetching once the panel is actually opened
  const { data, loading, refetch } = useQuery<GetNotificationsResult>(
    GET_NOTIFICATIONS,
    { skip: !open, fetchPolicy: 'cache-and-network', errorPolicy: 'all' }
  );

  const [markRead] = useMutation<MarkNotificationReadResult>(
    MARK_NOTIFICATION_READ
  );

  const unread = countData?.unreadNotificationCount ?? 0;
  const notifications = data?.getNotifications ?? [];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // send focus back where it came from, not to the top of the page
      buttonRef.current?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const markAllRead = async () => {
    // no id means every unread one
    await markRead({ variables: { id: null } });
    await Promise.all([refetch(), refetchCount()]);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-24 text-secondary transition-colors hover:text-primary"
      >
        <HiOutlineBell />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* On a phone the panel is wider than the room beside the bell, so
          anchoring it to the bell would push it off-screen — there it spans the
          viewport instead, and only hangs off the bell from sm up. */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed left-4 right-4 z-50 mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(43,52,69,0.16)] sm:absolute sm:left-auto sm:right-0 sm:w-[419px]"
        >
          <h2 className="px-4 pb-1 pt-5 text-16 font-semibold text-secondary">
            Notifications
          </h2>

          <div className="max-h-[360px] divide-y divide-secondary/8 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-13 text-gray">
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-13 text-gray">
                You have no notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-secondary/10 px-4 py-3">
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unread === 0}
              className="text-12 text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark as all read
            </button>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-12 font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

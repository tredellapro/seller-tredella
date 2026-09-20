'use client';

import Link from 'next/link';
import {
  HiOutlineBadgeCheck,
  HiOutlineChatAlt2,
  HiOutlineGift,
  HiOutlineQuestionMarkCircle,
  HiOutlineShoppingBag,
  HiOutlineSpeakerphone,
  HiOutlineStar,
  HiOutlineTruck,
  HiOutlineXCircle
} from 'react-icons/hi';
import { relativeTime } from 'lib/relativeTime';
import type { AppNotification, NotificationType } from 'types/notification';

type Tone = 'primary' | 'success' | 'secondary';

/* The title colour carries the meaning at a glance, as in the design: product
   and promotion news in brand pink, fulfilment in green, the rest neutral. */
const TONE: Record<NotificationType, Tone> = {
  PRODUCT_APPROVED: 'primary',
  PRODUCT_REJECTED: 'primary',
  PROMOTION: 'primary',
  ORDER_UPDATE: 'success',
  DELIVERY_UPDATE: 'success',
  REVIEW_ELIGIBLE: 'success',
  MESSAGE: 'secondary',
  QUESTION_ANSWERED: 'secondary',
  SYSTEM: 'secondary'
};

const TONE_CLASS: Record<Tone, string> = {
  primary: 'text-primary',
  success: 'text-green-600',
  secondary: 'text-secondary'
};

/** Stands in when a notification carries no thumbnail of its own. */
const ICON: Record<NotificationType, typeof HiOutlineShoppingBag> = {
  PRODUCT_APPROVED: HiOutlineBadgeCheck,
  PRODUCT_REJECTED: HiOutlineXCircle,
  PROMOTION: HiOutlineSpeakerphone,
  ORDER_UPDATE: HiOutlineShoppingBag,
  DELIVERY_UPDATE: HiOutlineTruck,
  REVIEW_ELIGIBLE: HiOutlineStar,
  MESSAGE: HiOutlineChatAlt2,
  QUESTION_ANSWERED: HiOutlineQuestionMarkCircle,
  SYSTEM: HiOutlineGift
};

interface NotificationItemProps {
  notification: AppNotification;
  onNavigate?: () => void;
}

export default function NotificationItem({
  notification,
  onNavigate
}: NotificationItemProps) {
  const tone = TONE[notification.type] ?? 'secondary';
  const Icon = ICON[notification.type] ?? HiOutlineGift;
  const unread = notification.readAt === null;

  const body = (
    <>
      <span className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
        {notification.image ? (
          /* Plain img, not next/image: these thumbnails come from wherever the
             notification was raised, and next/image throws on a host that is
             not in remotePatterns — which would take the whole dropdown down.
             At 52px there is nothing to optimise anyway. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notification.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className={`text-22 ${TONE_CLASS[tone]}`} aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block text-14 font-medium ${TONE_CLASS[tone]}`}>
          {notification.title}
        </span>
        {notification.body && (
          <span className="mt-1 block text-12 leading-relaxed text-gray">
            {notification.body}
          </span>
        )}
        <span className="mt-1.5 block text-10 text-gray/80">
          {relativeTime(notification.createdAt)}
        </span>
      </span>

      {unread && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}
    </>
  );

  const classes = `flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-background ${
    unread ? 'bg-primary/[0.03]' : ''
  }`;

  // only a notification that points somewhere should behave like a link
  return notification.link ? (
    <Link href={notification.link} className={classes} onClick={onNavigate}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export type NotificationType =
  | 'MESSAGE'
  | 'QUESTION_ANSWERED'
  | 'ORDER_UPDATE'
  | 'DELIVERY_UPDATE'
  | 'REVIEW_ELIGIBLE'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_REJECTED'
  | 'PROMOTION'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  image: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface GetNotificationsResult {
  getNotifications: AppNotification[];
}

export interface UnreadCountResult {
  unreadNotificationCount: number;
}

export interface MarkNotificationReadResult {
  markNotificationAsRead: boolean;
}

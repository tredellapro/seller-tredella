import { gql } from '@apollo/client';

const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on Notification {
    id
    type
    title
    body
    link
    image
    readAt
    createdAt
  }
`;

export const GET_NOTIFICATIONS = gql`
  ${NOTIFICATION_FIELDS}
  query GetNotifications($unreadOnly: Boolean) {
    getNotifications(unreadOnly: $unreadOnly) {
      ...NotificationFields
    }
  }
`;

/** Drives the bell badge without pulling the list behind it. */
export const UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

/** Omitting the id marks every unread notification read. */
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationAsRead($id: ID) {
    markNotificationAsRead(id: $id)
  }
`;

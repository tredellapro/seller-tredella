import { gql } from '@apollo/client';

/* The API also publishes a `messageAdded` subscription, but the seller app
   polls for the same reason the notification bell does — WebSockets do not
   survive a serverless host. Swap these for the subscription once the API runs
   somewhere persistent. */

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    getConversations {
      id
      type
      unreadCount
      updatedAt
      orderId
      buyer {
        id
        name
      }
      seller {
        name
        slug
      }
      product {
        name
        slug
        image
      }
      lastMessage {
        text
        createdAt
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    getMessages(conversationId: $conversationId) {
      id
      text
      createdAt
      isMine
      attachment
      sender {
        name
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $text: String!, $attachment: String) {
    sendMessage(conversationId: $conversationId, text: $text, attachment: $attachment) {
      id
      text
      createdAt
      isMine
      attachment
      sender {
        name
      }
    }
  }
`;

/** The seller's support thread. Reuses the existing one if there is one. */
export const START_SUPPORT_CONVERSATION = gql`
  mutation StartSupportConversation {
    startConversation(type: "SELLER_ADMIN") {
      id
      type
    }
  }
`;

export const MARK_MESSAGES_READ = gql`
  mutation MarkMessagesRead($conversationId: ID!) {
    markMessageAsRead(conversationId: $conversationId)
  }
`;

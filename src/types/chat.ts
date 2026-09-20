/** Conversation kinds the API recognises. The seller only ever sees two. */
export type ConversationType = 'BUYER_SELLER' | 'BUYER_ADMIN' | 'SELLER_ADMIN';

export interface ChatParty {
  id: string;
  name: string;
}

export interface ChatProduct {
  name: string;
  slug: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: string;
  /** Set by the API from the caller's token — never inferred client-side. */
  isMine: boolean;
  /** Opaque string — read it through parseAttachment, not directly. */
  attachment: string | null;
  sender: { name: string };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  /** Null on a SELLER_ADMIN thread, which has no buyer on it. */
  buyer: ChatParty | null;
  seller: { name: string; slug: string } | null;
  product: ChatProduct | null;
  orderId: string | null;
  lastMessage: { text: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface GetConversationsResult {
  getConversations: Conversation[];
}

export interface GetMessagesResult {
  getMessages: ChatMessage[];
}

export interface SendMessageResult {
  sendMessage: ChatMessage;
}

export interface StartConversationResult {
  startConversation: { id: string; type: ConversationType };
}

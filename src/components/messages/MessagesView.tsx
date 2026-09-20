'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import {
  HiArrowLeft,
  HiOutlineDocumentText,
  HiOutlineEmojiHappy,
  HiOutlinePaperClip,
  HiOutlinePhotograph,
  HiOutlineSearch,
  HiOutlineSupport,
  HiPaperAirplane,
  HiOutlineBookmark
} from 'react-icons/hi';
import Dropdown from 'components/ui/Dropdown';
import {
  GET_CONVERSATIONS,
  GET_MESSAGES,
  MARK_MESSAGES_READ,
  SEND_MESSAGE,
  START_SUPPORT_CONVERSATION
} from 'graphql/chat';
import {
  CHAT_ATTACHMENT_ACCEPT,
  fileKind,
  formatBytes,
  isImage,
  parseAttachment,
  serialiseAttachment,
  uploadChatAttachment,
  type ChatAttachment
} from 'lib/chatAttachment';
import type {
  ChatMessage,
  Conversation,
  GetConversationsResult,
  GetMessagesResult,
  SendMessageResult,
  StartConversationResult
} from 'types/chat';

/* Polling rather than the messageAdded subscription — same reason as the
   notification bell: WebSockets do not survive a serverless host. */
const THREAD_POLL_MS = 5_000;
const LIST_POLL_MS = 20_000;

const FILTERS = ['All', 'Unread', 'Wholesale', 'Support'] as const;
type Filter = (typeof FILTERS)[number];

const EMOJI = [
  '👍', '🙏', '👌', '🙂', '😊', '😀', '😅', '🤝',
  '📦', '🚚', '💰', '📄', '✅', '❗', '❓', '🔥'
];

const isSupport = (conversation: Conversation) =>
  conversation.type === 'SELLER_ADMIN';

const partyName = (conversation: Conversation): string =>
  isSupport(conversation)
    ? 'Support Chat'
    : (conversation.buyer?.name ?? 'Buyer');

/** "01:15 PM" — written out rather than via Intl, whose data differs Node vs browser. */
const clockTime = (iso: string): string => {
  const date = new Date(iso);
  const hours = date.getHours();
  const suffix = hours < 12 ? 'AM' : 'PM';
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelve).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${suffix}`;
};

/**
 * Presence, derived from when they last said something.
 *
 * The API carries no presence at all, so rather than draw a green dot that
 * means nothing, the dot reports recency: active in the last five minutes,
 * within the hour, or neither.
 */
type Presence = 'ACTIVE' | 'RECENT' | 'AWAY';

const presenceOf = (conversation: Conversation): Presence => {
  const last = conversation.lastMessage?.createdAt ?? conversation.updatedAt;
  const minutes = (Date.now() - new Date(last).getTime()) / 60000;
  if (minutes < 5) return 'ACTIVE';
  if (minutes < 60) return 'RECENT';
  return 'AWAY';
};

const PRESENCE_DOT: Record<Presence, string> = {
  ACTIVE: 'bg-green-500',
  RECENT: 'bg-amber-400',
  AWAY: 'bg-secondary/25'
};

const PRESENCE_LABEL: Record<Presence, string> = {
  ACTIVE: 'Active Now',
  RECENT: 'Active recently',
  AWAY: 'Away'
};

function Avatar({
  conversation,
  size = 'h-10 w-10 text-13',
  showDot = true
}: {
  conversation: Conversation;
  size?: string;
  showDot?: boolean;
}) {
  const support = isSupport(conversation);
  const presence = presenceOf(conversation);

  return (
    <span className="relative shrink-0">
      <span
        aria-hidden="true"
        className={`flex ${size} items-center justify-center rounded-full font-semibold ${
          support ? 'bg-secondary text-white' : 'bg-primary/12 text-primary'
        }`}
      >
        {support ? (
          <HiOutlineSupport className="h-1/2 w-1/2" />
        ) : (
          partyName(conversation).charAt(0).toUpperCase()
        )}
      </span>
      {showDot && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${PRESENCE_DOT[presence]}`}
        />
      )}
    </span>
  );
}

function AttachmentCard({
  attachment,
  mine
}: {
  attachment: ChatAttachment;
  mine: boolean;
}) {
  const Icon = isImage(attachment) ? HiOutlinePhotograph : HiOutlineDocumentText;

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-opacity hover:opacity-90 ${
        mine ? 'bg-primary text-white' : 'bg-background text-secondary'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          mine ? 'bg-white/15' : 'bg-white'
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-12 font-medium">
          {attachment.name}
        </span>
        <span
          className={`block text-10 ${mine ? 'text-white/70' : 'text-gray'}`}
        >
          {fileKind(attachment)}
          {attachment.sizeBytes !== null && ` · ${formatBytes(attachment.sizeBytes)}`}
        </span>
      </span>
    </a>
  );
}

/** Consecutive messages from one person, drawn as a block with one timestamp. */
interface MessageGroup {
  mine: boolean;
  messages: ChatMessage[];
}

const groupMessages = (messages: ChatMessage[]): MessageGroup[] =>
  messages.reduce<MessageGroup[]>((groups, message) => {
    const last = groups[groups.length - 1];
    if (last && last.mine === message.isMine) last.messages.push(message);
    else groups.push({ mine: message.isMine, messages: [message] });
    return groups;
  }, []);

export default function MessagesView() {
  const deepLinked = useSearchParams().get('c');
  const [activeId, setActiveId] = useState<string | null>(deepLinked);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [pending, setPending] = useState<ChatAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: listData, refetch: refetchList } =
    useQuery<GetConversationsResult>(GET_CONVERSATIONS, {
      pollInterval: LIST_POLL_MS,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    });

  const all = useMemo(() => listData?.getConversations ?? [], [listData]);

  /* Support sits above everything and never gets filtered out — it is how a
     seller reaches a human when something is wrong. */
  const support = useMemo(() => all.find(isSupport) ?? null, [all]);

  const buyerThreads = useMemo(() => {
    const term = search.trim().toLowerCase();

    return all
      .filter((c) => !isSupport(c))
      .filter((c) => {
        if (filter === 'Unread' && c.unreadCount === 0) return false;
        if (filter === 'Support') return false;
        if (!term) return true;
        return `${partyName(c)} ${c.lastMessage?.text ?? ''}`
          .toLowerCase()
          .includes(term);
      });
  }, [all, search, filter]);

  const showSupport =
    support !== null &&
    filter !== 'Wholesale' &&
    (filter !== 'Unread' || support.unreadCount > 0) &&
    (!search.trim() || 'support chat'.includes(search.trim().toLowerCase()));

  const { data: threadData } = useQuery<GetMessagesResult>(GET_MESSAGES, {
    variables: { conversationId: activeId },
    skip: !activeId,
    pollInterval: THREAD_POLL_MS,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const messages = useMemo(() => threadData?.getMessages ?? [], [threadData]);
  const groups = useMemo(() => groupMessages(messages), [messages]);

  const [sendMessage, { loading: sending }] =
    useMutation<SendMessageResult>(SEND_MESSAGE);
  const [markRead] = useMutation(MARK_MESSAGES_READ);
  const [startSupport, { loading: startingSupport }] =
    useMutation<StartConversationResult>(START_SUPPORT_CONVERSATION);

  useEffect(() => {
    if (!activeId) return;
    void markRead({ variables: { conversationId: activeId } })
      .then(() => refetchList())
      .catch(() => undefined);
  }, [activeId, markRead, refetchList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groups]);

  const active = all.find((c) => c.id === activeId) ?? null;

  const send = useCallback(async () => {
    const body = text.trim();
    if ((!body && !pending) || !activeId || sending) return;

    setText('');
    setEmojiOpen(false);
    const attachment = pending;
    setPending(null);
    setError(null);

    try {
      await sendMessage({
        variables: {
          conversationId: activeId,
          text: body,
          attachment: attachment ? serialiseAttachment(attachment) : null
        },
        refetchQueries: [
          { query: GET_MESSAGES, variables: { conversationId: activeId } },
          { query: GET_CONVERSATIONS }
        ]
      });
    } catch {
      // put everything back rather than losing what was typed or attached
      setText(body);
      setPending(attachment);
      setError('That message did not send. Try again.');
    }
  }, [text, pending, activeId, sending, sendMessage]);

  const attach = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPending(await uploadChatAttachment(file));
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'That file could not be attached.'
      );
    } finally {
      setUploading(false);
    }
  };

  const contactSupport = async () => {
    setError(null);
    try {
      const { data } = await startSupport();
      await refetchList();
      if (data?.startConversation?.id) setActiveId(data.startConversation.id);
    } catch {
      setError('Could not open a support thread. Try again in a moment.');
    }
  };

  const row = (conversation: Conversation, pinned = false) => {
    const selected = activeId === conversation.id;

    return (
      <button
        key={conversation.id}
        type="button"
        onClick={() => setActiveId(conversation.id)}
        className={`flex w-full items-center gap-3 border-b border-secondary/8 px-4 py-3 text-left transition-colors last:border-0 ${
          selected ? 'bg-primary text-white' : 'hover:bg-background'
        }`}
      >
        <Avatar conversation={conversation} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span
              className={`truncate text-13 font-medium ${
                selected ? 'text-white' : 'text-secondary'
              }`}
            >
              {partyName(conversation)}
            </span>

            {pinned ? (
              <HiOutlineBookmark
                aria-label="Pinned"
                className={`h-3.5 w-3.5 shrink-0 ${
                  selected ? 'text-white' : 'text-primary'
                }`}
              />
            ) : (
              conversation.lastMessage && (
                <span
                  className={`shrink-0 text-11 ${
                    selected ? 'text-white/80' : 'text-gray'
                  }`}
                >
                  {clockTime(conversation.lastMessage.createdAt)}
                </span>
              )
            )}
          </span>

          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={`truncate text-11 ${
                selected ? 'text-white/80' : 'text-gray'
              }`}
            >
              {conversation.lastMessage?.text ||
                (conversation.lastMessage ? 'Attachment' : 'Start the conversation')}
            </span>
            {conversation.unreadCount > 0 && !selected && (
              <span className="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-10 font-semibold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="pb-4 pt-5">
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Conversations — full width on mobile, hidden once a thread is open */}
        <div className={`flex-col gap-4 lg:flex ${active ? 'hidden' : 'flex'}`}>
          <h1 className="text-20 font-semibold text-secondary sm:text-22">
            Messages
          </h1>

          <div className="flex items-center gap-2 rounded-xl border border-secondary/15 bg-white px-3 py-2">
            <HiOutlineSearch
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-gray"
            />
            <label htmlFor="chat-search" className="sr-only">
              Search conversations
            </label>
            <input
              id="chat-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-13 text-secondary outline-none placeholder:text-gray"
            />

            <span className="shrink-0 border-l border-secondary/15 pl-2">
              <Dropdown
                bare
                align="right"
                label="Filter conversations"
                value={filter}
                onChange={(next) => setFilter(next as Filter)}
                options={FILTERS.map((option) => ({
                  value: option,
                  label: option
                }))}
                className="w-[104px]"
              />
            </span>
          </div>

          <div className="brand-scroll max-h-[calc(70vh-40px)] min-h-[320px] overflow-y-auto rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
            {showSupport && support && row(support, true)}

            {buyerThreads.map((conversation) => row(conversation))}

            {!showSupport && buyerThreads.length === 0 && (
              <p className="px-5 py-12 text-center text-13 text-gray">
                {search.trim() || filter !== 'All'
                  ? 'Nothing matches that.'
                  : 'No conversations yet.'}
              </p>
            )}

            {!support && filter !== 'Wholesale' && (
              <div className="border-t border-secondary/8 px-4 py-4">
                <button
                  type="button"
                  onClick={() => void contactSupport()}
                  disabled={startingSupport}
                  className="w-full rounded-lg bg-primary/10 py-2 text-12 font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  Start a support chat
                </button>
              </div>
            )}
          </div>

          {/* The rule, stated where it matters rather than left to be discovered. */}
          {buyerThreads.length === 0 && filter !== 'Support' && (
            <p className="text-11 leading-relaxed text-gray">
              Buyers message you here about <strong>wholesale</strong> enquiries
              — quantities, tier pricing and lead times. Retail orders do not
              use chat.
            </p>
          )}
        </div>

        {/* Thread */}
        <div className={`lg:block ${active ? 'block' : 'hidden'}`}>
          <div className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-24 text-gray">
                  <HiOutlineSupport aria-hidden="true" />
                </span>
                <p className="mt-3 text-13 text-gray">
                  Select a conversation to start chatting.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-secondary/10 px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    aria-label="Back to conversations"
                    onClick={() => setActiveId(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-16 text-secondary transition-colors hover:bg-background lg:hidden"
                  >
                    <HiArrowLeft />
                  </button>

                  <Avatar conversation={active} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-14 font-semibold text-secondary">
                      {partyName(active)}
                    </p>
                    <p className="flex items-center gap-1.5 text-11 text-gray">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${PRESENCE_DOT[presenceOf(active)]}`}
                      />
                      {PRESENCE_LABEL[presenceOf(active)]}
                    </p>
                  </div>
                </div>

                <div className="brand-scroll flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
                  {groups.length === 0 && (
                    <p className="py-10 text-center text-12 text-gray">
                      No messages yet — say hello.
                    </p>
                  )}

                  {groups.map((group) => {
                    const last = group.messages[group.messages.length - 1];

                    return (
                      <div
                        key={group.messages[0].id}
                        className={`flex items-end gap-2.5 ${
                          group.mine ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar
                          conversation={active}
                          size="h-9 w-9 text-11"
                          showDot={false}
                        />

                        <div className="flex max-w-[78%] flex-col gap-2 sm:max-w-[70%]">
                          {group.messages.map((message) => {
                            const attachment = parseAttachment(message.attachment);

                            return (
                              <div
                                key={message.id}
                                className={`flex flex-col gap-2 ${
                                  group.mine ? 'items-end' : 'items-start'
                                }`}
                              >
                                {message.text && (
                                  <p
                                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-13 leading-relaxed ${
                                      group.mine
                                        ? 'bg-primary text-white'
                                        : 'bg-background text-secondary'
                                    }`}
                                  >
                                    {message.text}
                                  </p>
                                )}

                                {attachment && (
                                  <AttachmentCard
                                    attachment={attachment}
                                    mine={group.mine}
                                  />
                                )}
                              </div>
                            );
                          })}

                          {/* One stamp per block, tucked against the inner edge */}
                          <span
                            className={`text-10 text-gray ${
                              group.mine ? 'text-left' : 'text-right'
                            }`}
                          >
                            {clockTime(last.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="border-t border-primary/20 bg-primary/5 px-4 py-2 text-12 text-secondary sm:px-5"
                  >
                    {error}
                  </p>
                )}

                {pending && (
                  <div className="flex items-center gap-2 border-t border-secondary/10 px-4 py-2 sm:px-5">
                    <span className="min-w-0 flex-1">
                      <AttachmentCard attachment={pending} mine={false} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setPending(null)}
                      className="shrink-0 text-11 text-primary hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="relative border-t border-secondary/10 p-3 sm:p-4">
                  {emojiOpen && (
                    <div className="absolute bottom-full right-4 mb-2 grid grid-cols-8 gap-1 rounded-xl border border-secondary/10 bg-white p-2 shadow-[0_8px_30px_rgba(43,52,69,0.15)]">
                      {EMOJI.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setText((current) => current + emoji);
                            setEmojiOpen(false);
                          }}
                          className="h-7 w-7 rounded text-16 transition-colors hover:bg-background"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-full border border-secondary/15 py-1.5 pl-5 pr-1.5">
                    <label htmlFor="message-text" className="sr-only">
                      Type a message
                    </label>
                    <input
                      id="message-text"
                      type="text"
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void send();
                      }}
                      placeholder="Type message..."
                      className="min-w-0 flex-1 bg-transparent text-13 text-secondary outline-none placeholder:text-gray"
                    />

                    <button
                      type="button"
                      onClick={() => setEmojiOpen((open) => !open)}
                      aria-label="Insert an emoji"
                      aria-expanded={emojiOpen}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-18 text-gray transition-colors hover:text-primary"
                    >
                      <HiOutlineEmojiHappy />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      aria-label="Attach a file"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-18 text-gray transition-colors hover:text-primary disabled:opacity-50"
                    >
                      <HiOutlinePaperClip />
                    </button>

                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={sending || uploading || (!text.trim() && !pending)}
                      aria-label="Send message"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <HiPaperAirplane className="h-4 w-4 rotate-90" />
                    </button>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept={CHAT_ATTACHMENT_ACCEPT}
                    className="sr-only"
                    onChange={(event) => {
                      void attach(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

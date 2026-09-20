import { API_ORIGIN, GRAPHQL_URL } from './api';
import { getToken } from './token';

/* Message.attachment is a single String on the API. A stored filename is
   randomised, so a bare URL cannot say what the file was called or how big it
   is — which is exactly what the file card in the thread needs to show.

   So the seller app writes a small JSON blob into that field. Anything that is
   not JSON is treated as a plain URL, which is what the buyer app sends, so
   both render. */

export interface ChatAttachment {
  url: string;
  name: string;
  sizeBytes: number | null;
  mimeType: string | null;
}

export const parseAttachment = (raw: string | null): ChatAttachment | null => {
  if (!raw) return null;

  if (raw.trimStart().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as Partial<ChatAttachment>;
      if (typeof parsed.url === 'string')
        return {
          url: parsed.url,
          name: parsed.name ?? 'Attachment',
          sizeBytes: typeof parsed.sizeBytes === 'number' ? parsed.sizeBytes : null,
          mimeType: parsed.mimeType ?? null
        };
    } catch {
      // fall through and treat it as a URL
    }
  }

  const name = raw.split('/').pop() || 'Attachment';
  return { url: raw, name, sizeBytes: null, mimeType: null };
};

export const serialiseAttachment = (attachment: ChatAttachment): string =>
  JSON.stringify(attachment);

export const formatBytes = (bytes: number | null): string => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** "OrderInfo.pdf" → "PDF". Used for the little tag on the file card. */
export const fileKind = (attachment: ChatAttachment): string => {
  const fromMime = attachment.mimeType?.split('/')[1];
  const fromName = attachment.name.split('.').pop();
  const kind = (fromMime || fromName || 'file').toUpperCase();
  return kind === 'JPEG' ? 'JPG' : kind.slice(0, 4);
};

export const isImage = (attachment: ChatAttachment): boolean =>
  attachment.mimeType?.startsWith('image/') ??
  /\.(jpe?g|png|webp|gif)$/i.test(attachment.name);

export const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export const CHAT_ATTACHMENT_ACCEPT =
  'application/pdf,image/jpeg,image/png,image/webp,image/gif';

/** Uploads one file and returns what the thread needs to draw its card. */
export const uploadChatAttachment = async (
  file: File
): Promise<ChatAttachment> => {
  const token = getToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');

  if (file.size > CHAT_ATTACHMENT_MAX_BYTES)
    throw new Error('Attachments must be under 10 MB.');

  const body = new FormData();
  body.append('file', file);

  const response = await fetch(`${API_ORIGIN}/upload/chat-attachment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body
  });

  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(failure?.message ?? 'That file could not be uploaded.');
  }

  return (await response.json()) as ChatAttachment;
};

/* Re-exported so callers do not need two imports to build an attachment URL. */
export { GRAPHQL_URL };

import { getToken } from './token';

export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  'http://localhost:4000/graphql';

/** The API root, for the REST endpoints that sit beside /graphql. */
export const API_ORIGIN = GRAPHQL_URL.replace(/\/graphql\/?$/, '');

export type UploadedDocument = {
  id: string;
  type: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

/**
 * Multipart upload of one KYC document.
 *
 * XMLHttpRequest rather than fetch: documents can be a few megabytes over a
 * phone connection, and only XHR reports upload progress.
 */
export const uploadSellerDocument = (
  type: string,
  file: File,
  onProgress?: (_percent: number) => void
): Promise<UploadedDocument> =>
  new Promise((resolve, reject) => {
    const token = getToken();
    if (!token) {
      reject(new Error('Your session has expired. Please sign in again.'));
      return;
    }

    const body = new FormData();
    body.append('file', file);
    body.append('type', type);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_ORIGIN}/upload/seller-document`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      type Payload = { document?: UploadedDocument; error?: string };
      let parsed: Payload | null = null;
      try {
        parsed = JSON.parse(xhr.responseText) as Payload;
      } catch {
        parsed = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && parsed?.document) {
        resolve(parsed.document);
        return;
      }
      reject(new Error(parsed?.error ?? 'Could not upload that file.'));
    };

    xhr.onerror = () =>
      reject(new Error('Could not reach the server. Please try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    xhr.send(body);
  });

import Cookies from 'js-cookie';

/* The backend issues the JWT; we only carry it. A cookie (not localStorage) so
   middleware can gate /dashboard before the page renders. */

export const TOKEN_COOKIE = 'tredella_seller_token';

const TOKEN_DAYS = 30; // matches the backend's 30d expiry

export const getToken = (): string | null => Cookies.get(TOKEN_COOKIE) ?? null;

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: TOKEN_DAYS,
    sameSite: 'lax',
    secure:
      typeof window !== 'undefined' && window.location.protocol === 'https:'
  });
};

export const clearToken = (): void => Cookies.remove(TOKEN_COOKIE);

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE } from 'lib/token';

/* Next 16 calls this convention "proxy" (it replaced middleware.ts).

   Presence-only gate: it keeps signed-out visitors out of the dashboard shell
   and signed-in sellers off the auth screens. The token is still verified by
   the API on every request, so a forged cookie buys nothing. */

/* /signup is deliberately absent: its second step runs after the account is
   created, so a signed-in seller must be able to stay on it. */
const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function proxy(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname, search } = req.nextUrl;

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!token && isDashboard) {
    const login = new URL('/login', req.url);
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ]
};

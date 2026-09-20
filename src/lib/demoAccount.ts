/* The seeded preview account (backend-tredella: `npm run db:demo`).
 *
 * It is a real SELLER account signing in through the real login mutation — no
 * auth bypass — so what you see is what a seller sees.
 *
 * It is still a published door into a seller dashboard, so it only appears in
 * development. To show a deployed preview to someone, set
 * NEXT_PUBLIC_DEMO_LOGIN=true on that environment, and unset it before the site
 * is live.
 */

export const DEMO_EMAIL = 'demo@tredella.com';
export const DEMO_PASSWORD = 'demo1234';

export const demoLoginEnabled =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_DEMO_LOGIN === 'true';

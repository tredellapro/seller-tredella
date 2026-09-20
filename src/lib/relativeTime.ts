const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * "5 mins ago" while it is recent, a plain date once it is not.
 *
 * The date is assembled by hand rather than with toLocaleDateString: that
 * varies with the runtime's locale data, which differs between Node and the
 * browser and would trip hydration.
 */
export const relativeTime = (iso: string, now: number = Date.now()): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  // a clock a little behind the server should read "Just now", not "in 3 secs"
  const elapsed = Math.max(0, now - then);

  if (elapsed < MINUTE) return 'Just now';

  if (elapsed < HOUR) {
    const mins = Math.floor(elapsed / MINUTE);
    return `${mins} min${mins === 1 ? '' : 's'} ago`;
  }

  if (elapsed < DAY) {
    const hrs = Math.floor(elapsed / HOUR);
    return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  }

  if (elapsed < WEEK) {
    const days = Math.floor(elapsed / DAY);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const date = new Date(then);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

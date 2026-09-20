import { HiOutlineExclamationCircle } from 'react-icons/hi';

/** Submit-level failure (bad credentials, expired code) — not per-field validation. */
export default function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-primary/8 px-3 py-2.5 text-13 text-primary"
    >
      <HiOutlineExclamationCircle className="mt-0.5 shrink-0 text-15" />
      <span>{message}</span>
    </p>
  );
}

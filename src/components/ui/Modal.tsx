'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { HiX } from 'react-icons/hi';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Announced as the dialog's name. */
  title: string;
  /** Hide the visible heading when the body draws its own. */
  hideTitle?: boolean;
  children: ReactNode;
  /** Buttons along the bottom. */
  footer?: ReactNode;
  width?: 'sm' | 'md';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centred dialog. Escape, the close button and a click outside all dismiss it,
 * and Tab is kept inside — a dialog you can tab out of leaves a keyboard user
 * stranded behind the backdrop.
 */
export default function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  footer,
  width = 'sm'
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    /* Children mount before this effect runs, so anything that autofocuses —
       the OTP boxes — has already claimed focus. Leave it there rather than
       yanking it to the close button. */
    if (!panel.current?.contains(document.activeElement)) {
      const items = focusables();
      const preferred = items.find(
        (item) => item.dataset.modalClose !== 'true'
      );
      (preferred ?? items[0])?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      restoreTo.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      /* Tested against the panel rather than the event's own target: the
         backdrop below is a sibling that covers everything, so it — not this
         container — is what an outside click actually lands on.

         mousedown, not click, so selecting text inside the dialog and
         releasing outside it does not dismiss the thing you were reading. */
      onMouseDown={(event) => {
        if (panel.current && !panel.current.contains(event.target as Node))
          onClose();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-secondary/40" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`brand-scroll relative max-h-full w-full overflow-y-auto rounded-2xl bg-white px-6 py-6 shadow-[0_20px_60px_rgba(43,52,69,0.25)] ${
          width === 'md' ? 'max-w-[520px]' : 'max-w-[420px]'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          data-modal-close="true"
          aria-label={`Close ${title}`}
          className="absolute right-3 top-3 rounded-full p-1.5 text-16 text-gray transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <HiX />
        </button>

        {!hideTitle && (
          // pr keeps a long title clear of the close button
          <h2 className="pr-8 text-center text-16 font-semibold text-secondary">
            {title}
          </h2>
        )}

        <div className={hideTitle ? '' : 'mt-5'}>{children}</div>

        {footer && <div className="mt-6 flex items-center gap-3">{footer}</div>}
      </div>
    </div>
  );
}

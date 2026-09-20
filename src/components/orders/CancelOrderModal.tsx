'use client';

import { useEffect, useState } from 'react';
import { HiOutlineClock, HiOutlineShoppingCart } from 'react-icons/hi';
import Modal from 'components/ui/Modal';
import OtpInput from 'components/ui/OtpInput';

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  /** Where the code was sent. */
  email: string;
  onConfirm: (_code: string) => void;
}

const RESEND_SECONDS = 90;
const CODE_LENGTH = 6;

const mmss = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Cancelling is destructive and costs the seller 10%, so it is confirmed with
 * a code rather than a single click. The code goes to the account's email,
 * which is what makes this more than a second "are you sure".
 */
export default function CancelOrderModal({
  open,
  onClose,
  email,
  onConfirm
}: CancelOrderModalProps) {
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode('');
    setError(null);
    setRemaining(RESEND_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!open || remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [open, remaining]);

  const confirm = () => {
    if (code.length < CODE_LENGTH) {
      setError('Enter all six digits.');
      return;
    }
    onConfirm(code);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Order"
      hideTitle
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="text-center">
        <HiOutlineShoppingCart
          className="mx-auto h-8 w-8 text-primary"
          aria-hidden="true"
        />
        <h2 className="mt-3 text-16 font-semibold text-secondary">Cancel Order</h2>

        <p className="mt-2 text-13 text-gray">
          Enter the {CODE_LENGTH}-digit code we sent to{' '}
          <span className="break-all text-secondary">{email}</span>. Didn&apos;t
          receive a code?{' '}
          <button
            type="button"
            disabled={remaining > 0}
            onClick={() => {
              setRemaining(RESEND_SECONDS);
              setCode('');
              setError(null);
            }}
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-gray disabled:no-underline"
          >
            Try again.
          </button>
        </p>

        {remaining > 0 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-12 text-gray">
            <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
            Resend Code in{' '}
            <span className="font-medium text-secondary">{mmss(remaining)}</span>
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            length={CODE_LENGTH}
            onComplete={onConfirm}
            error={error ?? false}
          />
        </div>
      </div>
    </Modal>
  );
}

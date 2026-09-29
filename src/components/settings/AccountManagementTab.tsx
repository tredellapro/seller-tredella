'use client';

import { useState } from 'react';
import {
  HiExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineTrash
} from 'react-icons/hi';
import Panel from 'components/dashboard/Panel';
import PasswordField from 'components/ui/PasswordField';
import Switch from 'components/ui/Switch';
import Modal from 'components/ui/Modal';
import OtpInput from 'components/ui/OtpInput';
import { useAccount } from 'components/dashboard/AccountContext';
import { PROFILE } from 'data/account-sample';
import { longDate } from 'data/products-sample';
import {
  DATA_RETENTION_MONTHS,
  HOLIDAY_EFFECTS,
  WITHDRAW_COOLDOWN_HOURS,
  deletionSchedule
} from 'lib/accountState';

export default function AccountManagementTab() {
  const { account, gate, canRestore, liveProducts, setHoliday, requestDeletion, restore } =
    useAccount();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const deactivated = account.status === 'DEACTIVATED';
  const onHoliday = account.status === 'HOLIDAY';
  const schedule = account.deletionRequestedAt
    ? deletionSchedule(account.deletionRequestedAt)
    : null;

  const savePassword = () => {
    const found: Record<string, string> = {};
    if (!oldPassword) found.old = 'Enter your current password.';
    if (newPassword.length < 8)
      found.next = 'Use at least 8 characters.';
    if (newPassword !== confirmPassword)
      found.confirm = 'These do not match.';
    if (newPassword && newPassword === oldPassword)
      found.next = 'Choose a password you have not used here before.';

    setPasswordErrors(found);
    if (Object.keys(found).length > 0) return;

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNotice('Password changed.');
  };

  const confirmDeletion = (entered: string) => {
    if (entered.length < 6) {
      setCodeError('Enter all six digits.');
      return;
    }
    requestDeletion();
    setConfirmingDelete(false);
    setCode('');
    setNotice(null);
  };

  return (
    <>
      {notice && (
        <p
          role="status"
          className="mb-5 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {notice}
        </p>
      )}

      {deactivated && schedule && (
        <div className="mb-5 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4">
          <p className="flex items-start gap-2 text-13 text-secondary">
            <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-medium">Your account is deactivated.</span>{' '}
              Your store is hidden and withdrawals are closed. Nothing has been
              erased — you can bring it back yourself until{' '}
              <strong>{longDate(schedule.restoreBy)}</strong>. After that only
              Tredella support can, and the data is removed for good on{' '}
              <strong>{longDate(schedule.purgeAt)}</strong>.
            </span>
          </p>

          {canRestore && (
            <button
              type="button"
              onClick={() => {
                restore();
                setNotice(
                  `Account restored. Withdrawals reopen in ${WITHDRAW_COOLDOWN_HOURS} hours.`
                );
              }}
              className="mt-3 rounded-lg bg-primary px-5 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Restore my account
            </button>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-14 font-semibold text-secondary">Security</h2>
              <button
                type="button"
                onClick={savePassword}
                className="rounded-md bg-primary px-4 py-1.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <PasswordField
                name="old-password"
                label="Old Password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                error={passwordErrors.old}
              />
              <PasswordField
                name="new-password"
                label="New Password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                error={passwordErrors.next}
              />
              <PasswordField
                name="confirm-password"
                label="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={passwordErrors.confirm}
              />
            </div>
          </Panel>

          <Panel>
            <p className="flex items-start gap-2 text-12 text-secondary">
              <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              After enabling this option your notifications, live products and
              withdrawals will all be disabled.
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span id="holiday-label" className="text-14 text-secondary">
                Holidays or Flight Mode
              </span>
              <Switch
                checked={onHoliday}
                onChange={(on) => {
                  setHoliday(on);
                  setNotice(
                    on
                      ? `Holiday mode on. ${liveProducts} products taken offline.`
                      : `Welcome back. Your products stay inactive until you relist them, and withdrawals reopen in ${WITHDRAW_COOLDOWN_HOURS} hours.`
                  );
                }}
                label="Holidays or flight mode"
                labelledBy="holiday-label"
                disabled={deactivated}
              />
            </div>

            <ul className="mt-4 flex flex-col gap-1.5">
              {HOLIDAY_EFFECTS.map((effect) => (
                <li key={effect} className="flex items-start gap-2 text-11 text-gray">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray" />
                  {effect}
                </li>
              ))}
            </ul>

            {account.inactiveProducts > 0 && (
              <p className="mt-4 rounded-lg bg-background px-3 py-2.5 text-12 text-secondary">
                <strong>{account.inactiveProducts} products are inactive.</strong>{' '}
                Coming back does not relist them — bring back the ones you still
                want to sell from Products.
              </p>
            )}

            {!gate.allowed && (
              <p className="mt-3 text-11 text-primary">{gate.reason}</p>
            )}
          </Panel>
        </div>

        <Panel>
          <h2 className="text-14 font-semibold text-secondary">Delete Account</h2>

          <p className="mt-3 flex items-start gap-2 text-12 text-secondary">
            <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Deleting deactivates your account straight away. You have 30 days to
            bring it back yourself.
          </p>

          <p className="mt-4 text-13 font-medium text-secondary">Please note:</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {[
              'You will not be able to create labels anymore.',
              `All your account data is permanently removed after ${DATA_RETENTION_MONTHS} months.`,
              'Once the 30 days pass, only Tredella support can restore it.',
              'We recommend exporting your data before deleting this account.'
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-11 text-gray">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray" />
                {line}
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={deactivated}
            onClick={() => {
              setCode('');
              setCodeError(null);
              setConfirmingDelete(true);
            }}
            className="mt-6 w-full rounded-lg bg-red-600 py-2.5 text-14 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deactivated ? 'Already deactivated' : 'Delete Account'}
          </button>
        </Panel>
      </div>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete account"
        hideTitle
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmDeletion(code)}
              className="flex-1 rounded-lg bg-red-600 py-2.5 text-14 font-medium text-white transition-colors hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-24 text-red-600">
            <HiOutlineTrash aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-16 font-semibold text-secondary">
            Are you sure?
          </h2>

          {/* Deliberately not "permanently erased": it is not, and telling
              someone their data is gone when support can still restore it
              would be a lie that changes what they decide. */}
          <p className="mt-2 text-13 text-gray">
            Your account is deactivated and your store comes down straight away.
            Nothing is erased yet — you have 30 days to undo this yourself.
          </p>

          <p className="mt-4 text-13 text-gray">
            Enter the 6-digit code we sent to{' '}
            <span className="break-all font-medium text-secondary">
              {PROFILE.email}
            </span>
            .
          </p>

          <div className="mt-4 flex justify-center">
            <OtpInput
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(null);
              }}
              onComplete={confirmDeletion}
              error={codeError ?? false}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

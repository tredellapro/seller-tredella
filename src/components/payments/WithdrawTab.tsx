'use client';

import { useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiCheck,
  HiExclamationCircle,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineDownload,
  HiOutlineLibrary,
  HiOutlineLockClosed,
  HiOutlineSearch,
  HiOutlineTrash,
  HiX
} from 'react-icons/hi';
import DataTable, { type Column } from 'components/dashboard/DataTable';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import FilterSelect from 'components/common/FilterSelect';
import Modal from 'components/ui/Modal';
import OtpInput from 'components/ui/OtpInput';
import NumberField from 'components/products/NumberField';
import { aedExact } from 'data/dashboard-sample';
import { longDate, monthLabel } from 'data/products-sample';
import {
  EARNINGS,
  PAYMENT_MONTHS,
  TODAY,
  WITHDRAWALS,
  WITHDRAW_METHOD,
  type WithdrawMethod,
  type WithdrawalRequest
} from 'data/payments-sample';
import {
  HOLD_DAYS,
  WITHDRAWAL_STATUS_LABEL,
  accountStanding,
  balancesFor,
  classifyEarning,
  withdrawalProblem,
  type WithdrawalStatus
} from 'lib/payouts';

const PER_PAGE = 6;

const PAYMENT_METHODS = ['Bank Transfer', 'Wire Transfer', 'Cheque'];

const STATUS_TONE: Record<WithdrawalStatus, string> = {
  IN_PROCESS: 'text-amber-600',
  COMPLETED: 'text-green-600',
  REJECTED: 'text-primary'
};

function BalanceCard({
  icon: Icon,
  label,
  amount,
  hint,
  tone = 'primary'
}: {
  icon: typeof HiOutlineLibrary;
  label: string;
  amount: number;
  hint: string;
  tone?: 'primary' | 'muted';
}) {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_4px_30px_rgba(43,52,69,0.06)] sm:px-6">
      <p className="flex items-center gap-2 text-13 text-secondary">
        <Icon className="shrink-0 text-16" aria-hidden="true" />
        {label}
      </p>
      <p
        className={`mt-3 text-24 font-bold leading-none sm:text-28 ${
          tone === 'primary' ? 'text-primary' : 'text-secondary'
        }`}
      >
        {aedExact(amount)}
      </p>
      <p className="mt-2 text-11 text-gray">{hint}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error
}: {
  id: string;
  label: string;
  value: string;
  onChange: (_value: string) => void;
  placeholder: string;
  error?: string | false;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13 text-secondary">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
          error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
        }`}
      />
      {error && <p className="text-12 text-primary">{error}</p>}
    </div>
  );
}

export default function WithdrawTab() {
  const [method, setMethod] = useState<WithdrawMethod>(WITHDRAW_METHOD);
  const [requests, setRequests] = useState<WithdrawalRequest[]>(WITHDRAWALS);

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [formMethod, setFormMethod] = useState(WITHDRAW_METHOD.paymentMethod);
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState(WITHDRAW_METHOD.bankName);
  const [formError, setFormError] = useState<string | null>(null);

  const [changingMethod, setChangingMethod] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<WithdrawalRequest | null>(null);

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ method: '', status: '', month: '' });
  const [applied, setApplied] = useState({ method: '', status: '', month: '' });
  const [page, setPage] = useState(1);

  const balances = useMemo(() => balancesFor(EARNINGS, TODAY), []);
  const standing = useMemo(() => accountStanding(EARNINGS, TODAY), []);

  /* The next few amounts to clear, so "on hold" is a date rather than a mystery. */
  const upcoming = useMemo(
    () =>
      EARNINGS.map((earning) => ({ earning, verdict: classifyEarning(earning, TODAY) }))
        .filter((row) => row.verdict.state === 'ON_HOLD' && row.verdict.releaseOn)
        .sort((a, b) =>
          (a.verdict.releaseOn ?? '').localeCompare(b.verdict.releaseOn ?? '')
        )
        .slice(0, 3),
    []
  );

  const submit = () => {
    const value = Number(amount);
    const problem = withdrawalProblem(value, balances, standing.standing);
    if (problem) {
      setFormError(problem);
      return;
    }
    if (!bankName.trim() || !accountNumber.trim()) {
      setFormError('Enter the bank name and account number.');
      return;
    }

    const request: WithdrawalRequest = {
      id: `#WRD${String(requests.length + 1).padStart(3, '0')}`,
      amount: value,
      paymentMethod: formMethod,
      bankName: bankName.trim(),
      /* Only the tail is kept — the full IBAN belongs with the bank. */
      accountNumber: `**** ${accountNumber.replace(/\s/g, '').slice(-4)}`,
      status: 'IN_PROCESS',
      date: TODAY
    };

    setRequests((all) => [request, ...all]);
    setFormError(null);
    setShowForm(false);
    setAmount('');
    setAccountNumber('');
    setReceipt(request);
  };

  const confirmMethodChange = (entered: string) => {
    if (entered.length < 6) {
      setCodeError('Enter all six digits.');
      return;
    }
    setMethod((current) => ({
      ...current,
      paymentMethod: formMethod,
      bankName: bankName.trim() || current.bankName,
      accountNumber: accountNumber
        ? `**** ${accountNumber.replace(/\s/g, '').slice(-4)}`
        : current.accountNumber
    }));
    setChangingMethod(false);
    setCode('');
  };

  const downloadReceipt = (request: WithdrawalRequest) => {
    const lines = [
      'Tredella withdrawal request',
      `Request ID: ${request.id}`,
      `Bank: ${request.bankName}`,
      `Account: ${request.accountNumber}`,
      `Amount: AED ${request.amount.toFixed(2)}`,
      `Status: ${WITHDRAWAL_STATUS_LABEL[request.status]}`,
      `Date: ${longDate(request.date)}`
    ];
    const url = URL.createObjectURL(
      new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `tredella-${request.id.replace('#', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (applied.method && request.paymentMethod !== applied.method) return false;
      if (applied.status && request.status !== applied.status) return false;
      if (applied.month && !request.date.startsWith(applied.month)) return false;
      if (term) {
        const haystack =
          `${request.id} ${request.bankName} ${request.accountNumber} ${request.paymentMethod}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [requests, search, applied]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const columns: Column<WithdrawalRequest>[] = [
    {
      key: 'id',
      header: 'Request Id',
      render: (row) => <span className="text-13 text-secondary">{row.id}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {aedExact(row.amount)}
        </span>
      )
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.paymentMethod}
        </span>
      )
    },
    {
      key: 'bank',
      header: 'Bank Name',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-secondary">
          {row.bankName}
        </span>
      )
    },
    {
      key: 'account',
      header: 'Account Number',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-gray">
          {row.accountNumber}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`whitespace-nowrap text-13 ${STATUS_TONE[row.status]}`}>
          {WITHDRAWAL_STATUS_LABEL[row.status]}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="whitespace-nowrap text-13 text-gray">
          {longDate(row.date)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => downloadReceipt(row)}
          aria-label={`Download receipt for ${row.id}`}
          className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
        >
          <HiOutlineDownload />
        </button>
      )
    }
  ];

  const paused = standing.standing === 'DEACTIVATION_REVIEW';

  return (
    <div className="flex flex-col gap-5">
      {standing.standing !== 'GOOD' && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium">
              {paused ? 'Account under review' : 'Account at risk'}
            </span>{' '}
            — {standing.message}
          </span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <BalanceCard
          icon={HiOutlineLibrary}
          label="Withdrawable Balance"
          amount={balances.available}
          hint={`Cleared ${HOLD_DAYS} days after delivery.`}
        />
        <BalanceCard
          icon={HiOutlineClock}
          label="On Hold"
          amount={balances.onHold}
          tone="muted"
          hint={
            upcoming.length > 0 && upcoming[0].verdict.releaseOn
              ? `Next ${aedExact(upcoming[0].earning.amount)} clears ${longDate(upcoming[0].verdict.releaseOn)}.`
              : 'Nothing waiting to clear.'
          }
        />
        <BalanceCard
          icon={HiOutlineLockClosed}
          label="Frozen"
          amount={balances.frozen}
          tone="muted"
          hint={
            balances.frozenOrders.length > 0
              ? `${balances.frozenOrders.length} order${balances.frozenOrders.length === 1 ? '' : 's'} never dispatched.`
              : 'Nothing frozen.'
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-14 font-semibold text-secondary">Withdraw Funds</h2>
            {!showForm && (
              <button
                type="button"
                disabled={paused || balances.available <= 0}
                onClick={() => {
                  setShowForm(true);
                  setFormError(null);
                }}
                className="rounded-md bg-primary px-4 py-1.5 text-13 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Withdraw Funds
              </button>
            )}
          </div>

          {showForm ? (
            <div className="mt-4 flex flex-col gap-4">
              <NumberField
                id="withdraw-amount"
                label="Amount (AED)"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  setFormError(null);
                }}
                placeholder="0.00"
                decimal
              />

              <div className="flex flex-col gap-2">
                <label htmlFor="withdraw-method" className="text-13 text-secondary">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    id="withdraw-method"
                    value={formMethod}
                    onChange={(event) => setFormMethod(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-secondary/15 bg-white py-2.5 pl-3.5 pr-10 text-14 text-secondary outline-none transition-colors focus:border-primary"
                  >
                    {PAYMENT_METHODS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-gray" />
                </div>
              </div>

              <Field
                id="withdraw-account"
                label="Account Number (IBAN)"
                value={accountNumber}
                onChange={setAccountNumber}
                placeholder="AE07 0331 2345 6789 0123 456"
              />
              <Field
                id="withdraw-bank"
                label="Bank Name"
                value={bankName}
                onChange={setBankName}
                placeholder="Emirates NBD"
              />

              {formError && <p className="text-12 text-primary">{formError}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                  }}
                  className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="flex-1 rounded-lg bg-secondary py-2.5 text-14 font-medium text-white transition-colors hover:bg-secondary/90"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-12 text-gray">
              {paused
                ? 'Withdrawals are paused while your account is under review.'
                : `Requests are checked against your dispatched orders before they are paid, so a request sits as "in process" until that is done.`}
            </p>
          )}
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-14 font-semibold text-secondary">
              Withdraw Method
            </h2>
            <button
              type="button"
              onClick={() => {
                setCode('');
                setCodeError(null);
                setChangingMethod(true);
              }}
              className="rounded-md border border-secondary/20 px-4 py-1.5 text-13 font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              Change
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-secondary/10 px-4 py-3">
            <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-secondary/10 bg-white text-16 text-secondary">
              <HiOutlineLibrary aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-13 text-secondary">
                {method.paymentMethod} {method.accountNumber}
              </p>
              <p className="truncate text-12 text-gray">{method.bankName}</p>
            </div>
            <button
              type="button"
              aria-label="Remove withdraw method"
              className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
            >
              <HiOutlineTrash />
            </button>
          </div>

          <p className="mt-3 flex items-start gap-2 text-11 text-gray">
            <HiOutlineLockClosed className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Changing where money is sent needs a code from your email.
          </p>
        </Panel>
      </div>

      <Panel flush>
        <div className="flex flex-col gap-4 px-5 pt-5 sm:px-6">
          <h2 className="text-14 font-semibold text-secondary">Withdraw Details</h2>

          <div className="grid gap-2.5 lg:grid-cols-[minmax(180px,1fr)_repeat(3,minmax(120px,160px))_auto]">
            <div className="relative">
              <label htmlFor="withdraw-search" className="sr-only">
                Search withdrawals
              </label>
              <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
              <input
                id="withdraw-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full rounded-lg border border-secondary/15 bg-white py-2 pl-9 pr-3 text-13 text-secondary outline-none transition-colors placeholder:text-gray focus:border-primary"
              />
            </div>

            <FilterSelect
              idPrefix="wd"
              label="Payment Method"
              value={draft.method}
              onChange={(value) => setDraft({ ...draft, method: value })}
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
            <FilterSelect
              idPrefix="wd"
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft({ ...draft, status: value })}
              options={(
                Object.keys(WITHDRAWAL_STATUS_LABEL) as WithdrawalStatus[]
              ).map((s) => ({ value: s, label: WITHDRAWAL_STATUS_LABEL[s] }))}
            />
            <FilterSelect
              idPrefix="wd"
              label="Date"
              value={draft.month}
              icon={<HiOutlineCalendar className="h-4 w-4" />}
              onChange={(value) => setDraft({ ...draft, month: value })}
              options={PAYMENT_MONTHS.map((m) => ({ value: m, label: monthLabel(m) }))}
            />

            <button
              type="button"
              onClick={() => {
                setApplied(draft);
                setPage(1);
              }}
              className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Apply Filter
            </button>
          </div>

          {(applied.method || applied.status || applied.month) && (
            <ul className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['method', 'Payment Method', applied.method],
                  [
                    'status',
                    'Status',
                    applied.status
                      ? WITHDRAWAL_STATUS_LABEL[applied.status as WithdrawalStatus]
                      : ''
                  ],
                  ['month', 'Date', applied.month ? monthLabel(applied.month) : '']
                ] as [string, string, string][]
              )
                .filter(([, , value]) => value)
                .map(([key, label, value]) => (
                  <li key={key}>
                    <span className="flex items-center gap-1.5 rounded-md bg-primary/8 py-1 pl-2.5 pr-1.5 text-12 text-secondary">
                      <span className="text-gray">{label}:</span>
                      {value}
                      <button
                        type="button"
                        onClick={() => {
                          setApplied((c) => ({ ...c, [key]: '' }));
                          setDraft((c) => ({ ...c, [key]: '' }));
                          setPage(1);
                        }}
                        aria-label={`Clear ${label} filter`}
                        className="rounded p-0.5 text-primary transition-colors hover:bg-primary/15"
                      >
                        <HiX className="h-3 w-3" />
                      </button>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyMessage="No withdrawals match these filters."
          />
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-12 text-gray">
              Showing {(current - 1) * PER_PAGE + 1}–
              {Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-secondary/15 text-gray transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === current ? 'page' : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-12 transition-colors ${
                    number === current
                      ? 'bg-primary font-medium text-white'
                      : 'text-gray hover:text-primary'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(current + 1)}
                disabled={current === pageCount}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-secondary/15 text-gray transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiChevronRight className="h-3.5 w-3.5" />
              </button>
            </nav>
          </div>
        )}
      </Panel>

      <Modal
        open={changingMethod}
        onClose={() => setChangingMethod(false)}
        title="Change Withdraw Method"
        hideTitle
        footer={
          <>
            <button
              type="button"
              onClick={() => setChangingMethod(false)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmMethodChange(code)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="text-center">
          <HiOutlineLibrary className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-16 font-semibold text-secondary">
            Change Withdraw Method
          </h2>
          <p className="mt-2 text-13 text-gray">
            Enter the 6-digit code we emailed you. This is where your money is
            sent, so the change is confirmed before it takes effect.
          </p>
          <div className="mt-5 flex justify-center">
            <OtpInput
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(null);
              }}
              onComplete={confirmMethodChange}
              error={codeError ?? false}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={receipt !== null}
        onClose={() => setReceipt(null)}
        title="Withdrawal requested"
        hideTitle
        footer={
          <button
            type="button"
            onClick={() => receipt && downloadReceipt(receipt)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <HiOutlineDownload className="h-4 w-4" />
            Download
          </button>
        }
      >
        {receipt && (
          <div>
            <div className="text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white">
                <HiCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-16 font-semibold text-secondary">
                Withdrawal Requested
              </h2>
              {/* Deliberately not "successful": nothing has moved yet. */}
              <p className="mt-2 text-13 text-gray">
                It is in process while we check the orders behind it. You will be
                notified when the amount is credited to your bank account.
              </p>
            </div>

            <div className="my-5 border-t border-dashed border-secondary/20" />

            <DetailRows
              rows={[
                { label: 'Request ID', value: receipt.id },
                { label: 'Bank Account Name', value: receipt.bankName },
                { label: 'Account Number', value: receipt.accountNumber },
                { label: 'Total Amount', value: aedExact(receipt.amount), emphasis: true },
                {
                  label: 'Status',
                  value: WITHDRAWAL_STATUS_LABEL[receipt.status],
                  emphasis: true
                },
                { label: 'Date', value: longDate(receipt.date) }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

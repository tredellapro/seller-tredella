'use client';

import { useState } from 'react';
import PageHeader from 'components/dashboard/PageHeader';
import { useStorefront } from 'components/dashboard/StorefrontContext';
import { MODE_LABEL } from 'lib/storefront';
import InquiryTab from './InquiryTab';
import OrderHistoryTab from './OrderHistoryTab';
import PaymentMethodTab from './PaymentMethodTab';
import RefundsTab from './RefundsTab';
import WithdrawTab from './WithdrawTab';

const TABS = [
  'Payment Method',
  'Order History',
  'Withdraw',
  'Refunds',
  'Inquiry'
] as const;
type Tab = (typeof TABS)[number];

export default function PaymentsView() {
  const { mode } = useStorefront();
  const [tab, setTab] = useState<Tab>('Payment Method');

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Manage Payments"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Payments', href: '/dashboard/payments' },
          { label: `${MODE_LABEL[mode]} payments` }
        ]}
      />

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Payment sections"
          className="flex min-w-max gap-6 border-b border-secondary/10"
        >
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={`relative whitespace-nowrap pb-3 text-14 transition-colors ${
                tab === name
                  ? 'font-medium text-primary'
                  : 'text-gray hover:text-secondary'
              }`}
            >
              {name}
              {tab === name && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Payment Method' && <PaymentMethodTab />}
      {tab === 'Order History' && <OrderHistoryTab />}
      {tab === 'Withdraw' && <WithdrawTab />}
      {tab === 'Refunds' && <RefundsTab />}
      {tab === 'Inquiry' && <InquiryTab />}
    </div>
  );
}

'use client';

import { useState } from 'react';
import PageHeader from 'components/dashboard/PageHeader';
import AccountManagementTab from './AccountManagementTab';
import ProfileManagementTab from './ProfileManagementTab';
import StoreSettingsTab from './StoreSettingsTab';
import UploadDocumentsTab from './UploadDocumentsTab';

const TABS = [
  'Profile Management',
  'Store Settings',
  'Account Management',
  'Upload Documents'
] as const;
type Tab = (typeof TABS)[number];

export default function SettingsView() {
  const [tab, setTab] = useState<Tab>('Profile Management');

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Settings"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings', href: '/dashboard/settings' },
          { label: tab }
        ]}
      />

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex min-w-max gap-8 border-b border-secondary/10"
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

      {tab === 'Profile Management' && <ProfileManagementTab />}
      {tab === 'Store Settings' && <StoreSettingsTab />}
      {tab === 'Account Management' && <AccountManagementTab />}
      {tab === 'Upload Documents' && <UploadDocumentsTab />}
    </div>
  );
}

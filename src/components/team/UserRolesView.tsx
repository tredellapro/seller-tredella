'use client';

import { useMemo, useState } from 'react';
import {
  HiChevronDown,
  HiOutlineAdjustments,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineTrash,
  HiX
} from 'react-icons/hi';
import DataTable, { type Column } from 'components/dashboard/DataTable';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import Modal from 'components/ui/Modal';
import PermissionsModal from './PermissionsModal';
import { TEAM, avatarTone, initials } from 'data/team-sample';
import { longDate } from 'data/products-sample';
import {
  ASSIGNABLE_ROLES,
  ROLE_LABEL,
  inviteProblem,
  permissionsFor,
  removalProblem,
  roleChangeProblem,
  summarise,
  type Permissions,
  type Role,
  type TeamMember
} from 'lib/roles';

export default function UserRolesView() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM);
  const [invite, setInvite] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('VIEWER');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      `${member.name} ${member.email}`.toLowerCase().includes(term)
    );
  }, [members, search]);

  const sendInvite = () => {
    const problem = inviteProblem(invite, members);
    if (problem) {
      setError(problem);
      return;
    }

    const email = invite.trim().toLowerCase();
    const member: TeamMember = {
      id: `u-${Date.now()}`,
      /* Until they accept, the name is all we have — the local part reads
         better than a blank cell. */
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: inviteRole,
      joinedAt: null,
      status: 'Invited'
    };

    setMembers((all) => [...all, member]);
    setInvite('');
    setError(null);
    setNotice(
      `Invite sent to ${email} as ${ROLE_LABEL[inviteRole]}. They join once they accept.`
    );
  };

  const changeRole = (member: TeamMember, next: Role) => {
    const problem = roleChangeProblem(member, next);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setMembers((all) =>
      all.map((m) =>
        m.id === member.id
          ? { ...m, role: next, custom: next === 'CUSTOM' ? (m.custom ?? {}) : null }
          : m
      )
    );

    // custom means nothing until the sections are actually picked
    if (next === 'CUSTOM') {
      setEditing({ ...member, role: 'CUSTOM', custom: member.custom ?? {} });
      return;
    }

    setNotice(`${member.name} is now ${ROLE_LABEL[next]}.`);
  };

  const saveCustom = (memberId: string, permissions: Permissions) => {
    setMembers((all) =>
      all.map((m) =>
        m.id === memberId ? { ...m, role: 'CUSTOM', custom: permissions } : m
      )
    );
    const member = members.find((m) => m.id === memberId);
    setEditing(null);
    setNotice(
      `Access updated${member ? ` for ${member.name}` : ''} — ${summarise(permissions)}.`
    );
  };

  const remove = (member: TeamMember) => {
    const problem = removalProblem(member);
    if (problem) {
      setError(problem);
      setRemoving(null);
      return;
    }
    setMembers((all) => all.filter((m) => m.id !== member.id));
    setRemoving(null);
    setNotice(`${member.name} no longer has access.`);
  };

  const columns: Column<TeamMember>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-12 font-semibold ${avatarTone(row.id)}`}
          >
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-13 capitalize text-secondary">
              {row.name}
            </p>
            <p className="text-11 text-gray">
              {row.status === 'Invited'
                ? 'Invite pending'
                : row.joinedAt
                  ? `Joined ${longDate(row.joinedAt)}`
                  : ''}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="text-13 text-gray">{row.email}</span>
      )
    },
    {
      key: 'access',
      header: 'Can reach',
      render: (row) => (
        <span className="min-w-[150px] text-12 text-gray">
          {summarise(permissionsFor(row.role, row.custom))}
        </span>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => {
        const owner = row.role === 'OWNER';

        return (
          <div className="relative min-w-[150px]">
            <label htmlFor={`role-${row.id}`} className="sr-only">
              Role for {row.name}
            </label>
            <select
              id={`role-${row.id}`}
              value={row.role}
              disabled={owner}
              onChange={(event) => changeRole(row, event.target.value as Role)}
              className={`w-full appearance-none rounded-lg border border-secondary/15 py-2 pl-3 pr-8 text-13 outline-none transition-colors focus:border-primary ${
                owner
                  ? 'cursor-not-allowed bg-background text-gray'
                  : 'bg-white text-secondary'
              }`}
            >
              {owner && <option value="OWNER">{ROLE_LABEL.OWNER}</option>}
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
            {!owner && (
              <HiChevronDown className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-gray" />
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.role === 'OWNER' ? (
          <span className="text-11 text-gray">—</span>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(row)}
              aria-label={`Edit access for ${row.name}`}
              title="Choose exactly what they can reach"
              className="rounded p-1.5 text-15 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
            >
              <HiOutlineAdjustments />
            </button>
            <button
              type="button"
              onClick={() => setRemoving(row)}
              aria-label={`Remove ${row.name}`}
              className="rounded-full border border-primary/20 p-1.5 text-15 text-primary transition-colors hover:bg-primary/8"
            >
              <HiOutlineTrash />
            </button>
          </div>
        )
    }
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Manage User Roles"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'User Roles', href: '/dashboard/user-roles' },
          { label: 'Manage User Roles' }
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="invite-email" className="sr-only">
              Email to invite
            </label>
            <input
              id="invite-email"
              type="email"
              value={invite}
              onChange={(event) => {
                setInvite(event.target.value);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendInvite();
              }}
              placeholder="name@company.com"
              className="w-full min-w-[220px] rounded-lg border border-secondary/15 bg-white px-3.5 py-2 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary sm:w-[260px]"
            />

            <div className="relative">
              <label htmlFor="invite-role" className="sr-only">
                Role for the invite
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as Role)}
                className="appearance-none rounded-lg border border-secondary/15 bg-white py-2 pl-3 pr-8 text-13 text-secondary outline-none transition-colors focus:border-primary"
              >
                {ASSIGNABLE_ROLES.filter((role) => role !== 'CUSTOM').map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
              <HiChevronDown className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-gray" />
            </div>

            <button
              type="button"
              onClick={sendInvite}
              className="whitespace-nowrap rounded-md bg-primary px-5 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Invite People
            </button>
          </div>
        }
      />

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0 rounded p-0.5 text-gray transition-colors hover:text-primary"
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="ml-auto shrink-0 rounded p-0.5 text-gray transition-colors hover:text-primary"
          >
            <HiX className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      <Panel flush>
        <div className="px-5 pt-5 sm:px-6">
          <div className="relative max-w-[320px]">
            <label htmlFor="member-search" className="sr-only">
              Search team
            </label>
            <HiOutlineSearch className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray" />
            <input
              id="member-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-full rounded-lg border border-secondary/15 bg-white py-2 pl-9 pr-3 text-13 text-secondary outline-none transition-colors placeholder:text-gray focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            emptyMessage="Nobody matches that search."
          />
        </div>

        <p className="px-5 py-4 text-12 text-gray sm:px-6">
          Only the owner can move money, change the plan, or grant access.
          Use the sliders icon to give someone exactly the sections they need.
        </p>
      </Panel>

      <PermissionsModal
        member={editing}
        onClose={() => setEditing(null)}
        onSave={saveCustom}
      />

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove access"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRemoving(null)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Keep them
            </button>
            <button
              type="button"
              onClick={() => removing && remove(removing)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Remove
            </button>
          </>
        }
      >
        {removing && (
          <p className="text-13 text-gray">
            <span className="font-medium capitalize text-secondary">
              {removing.name}
            </span>{' '}
            loses access to your store straight away. Anything they have already
            done — orders they processed, products they listed — stays as it is.
          </p>
        )}
      </Modal>
    </div>
  );
}

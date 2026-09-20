'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  SECTIONS,
  canManage,
  canView,
  permissionsFor,
  type Permissions,
  type Role
} from 'lib/roles';

interface AccessValue {
  role: Role;
  permissions: Permissions;
  /** True when this member may open the section at all. */
  canView: (_sectionKey: string) => boolean;
  /** True when they may change things in it, not just read. */
  canManage: (_sectionKey: string) => boolean;
  /** Maps a nav href back to its section key. */
  sectionKeyFor: (_href: string) => string | null;
}

const AccessContext = createContext<AccessValue | null>(null);

export function useAccess(): AccessValue {
  const value = useContext(AccessContext);
  if (!value) throw new Error('useAccess must be used inside AccessProvider');
  return value;
}

/**
 * What the signed-in member is allowed to reach.
 *
 * The account signing in today is always the shop owner — the API has no
 * concept of a team member yet, so there is no role on the session to read.
 * Everything that gates on access already goes through here, so wiring the
 * real role in later is a change to this one default.
 */
export default function AccessProvider({
  children,
  role = 'OWNER',
  custom = null
}: {
  children: ReactNode;
  role?: Role;
  custom?: Permissions | null;
}) {
  const value = useMemo<AccessValue>(() => {
    const permissions = permissionsFor(role, custom);

    return {
      role,
      permissions,
      canView: (sectionKey: string) => canView(permissions, sectionKey),
      canManage: (sectionKey: string) => canManage(permissions, sectionKey),
      sectionKeyFor: (href: string) =>
        SECTIONS.find((section) => section.href === href)?.key ?? null
    };
  }, [role, custom]);

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

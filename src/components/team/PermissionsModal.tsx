'use client';

import { useEffect, useState } from 'react';
import { HiExclamationCircle } from 'react-icons/hi';
import Modal from 'components/ui/Modal';
import {
  ACCESS_LABEL,
  SECTIONS,
  permissionsFor,
  summarise,
  visibleSections,
  type Access,
  type Permissions,
  type TeamMember
} from 'lib/roles';

interface PermissionsModalProps {
  /** Null closes the dialog. */
  member: TeamMember | null;
  onClose: () => void;
  onSave: (_memberId: string, _permissions: Permissions) => void;
}

const LEVELS: Access[] = ['NONE', 'VIEW', 'MANAGE'];

/**
 * Pick exactly what one person can reach.
 *
 * This is the point of the whole feature: a seller hands a warehouse hand
 * Orders and Shipping and nothing else. The preview underneath spells out what
 * they will actually see in the sidebar, because a grid of radio buttons does
 * not answer that on its own.
 */
export default function PermissionsModal({
  member,
  onClose,
  onSave
}: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permissions>({});

  useEffect(() => {
    if (!member) return;
    setPermissions(permissionsFor(member.role, member.custom));
  }, [member]);

  if (!member) return null;

  const set = (key: string, level: Access) =>
    setPermissions((current) => ({ ...current, [key]: level }));

  const visible = visibleSections(permissions);
  const grantsSensitive = SECTIONS.filter(
    (section) => section.sensitive && permissions[section.key] === 'MANAGE'
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={`Access for ${member.name}`}
      width="md"
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
            onClick={() => onSave(member.id, permissions)}
            className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Save access
          </button>
        </>
      }
    >
      <p className="text-13 text-gray">
        Choose what {member.name.split(' ')[0]} can reach. Anything set to no
        access is hidden from their sidebar entirely.
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-secondary/10">
        <div className="grid grid-cols-[1fr_repeat(3,72px)] items-center gap-2 bg-background px-3 py-2">
          <span className="text-11 font-medium text-secondary">Section</span>
          {LEVELS.map((level) => (
            <span key={level} className="text-center text-10 text-gray">
              {level === 'NONE' ? 'None' : level === 'VIEW' ? 'View' : 'Manage'}
            </span>
          ))}
        </div>

        {SECTIONS.map((section, index) => (
          <fieldset
            key={section.key}
            className={`grid grid-cols-[1fr_repeat(3,72px)] items-center gap-2 px-3 py-2 ${
              index % 2 === 0 ? 'bg-white' : 'bg-background/50'
            }`}
          >
            <legend className="sr-only">{section.label} access</legend>
            <span className="text-12 text-secondary">
              {section.label}
              {section.sensitive && (
                <span className="ml-1.5 text-10 text-gray">sensitive</span>
              )}
            </span>

            {LEVELS.map((level) => (
              <label
                key={level}
                className="flex cursor-pointer justify-center"
                title={`${section.label}: ${ACCESS_LABEL[level]}`}
              >
                <input
                  type="radio"
                  name={`access-${section.key}`}
                  checked={(permissions[section.key] ?? 'NONE') === level}
                  onChange={() => set(section.key, level)}
                  className="h-[16px] w-[16px] cursor-pointer appearance-none rounded-full border border-secondary/30 bg-white transition-colors checked:border-primary checked:border-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span className="sr-only">
                  {section.label} — {ACCESS_LABEL[level]}
                </span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      {grantsSensitive.length > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-12 text-secondary">
          <HiExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          This gives {member.name.split(' ')[0]} full control of{' '}
          {grantsSensitive.map((section) => section.label).join(' and ')} —
          that covers your money and who else can get in.
        </p>
      )}

      <div className="mt-4 rounded-lg bg-background px-3 py-3">
        <p className="text-12 font-medium text-secondary">
          They will see: {summarise(permissions)}
        </p>
        {visible.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {visible.map((section) => (
              <li
                key={section.key}
                className="rounded-md bg-white px-2 py-0.5 text-11 text-gray"
              >
                {section.label}
                {permissions[section.key] === 'MANAGE' && (
                  <span className="ml-1 text-primary">manage</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

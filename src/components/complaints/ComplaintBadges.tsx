import type { ComplaintPriority, ComplaintStatus } from 'data/complaints-sample';

/* The designs give Urgent and Normal the same pink pill, and Open and Solved
   the same green one, which leaves neither badge saying anything. Priority is
   the thing a seller triages on, so it is the one that gets the brand colour;
   status separates waiting from done. The word carries the meaning either way,
   so colour is never doing the work alone. */

const PRIORITY_TONE: Record<ComplaintPriority, string> = {
  URGENT: 'bg-primary/10 text-primary',
  NORMAL: 'bg-secondary/8 text-gray'
};

const PRIORITY_LABEL: Record<ComplaintPriority, string> = {
  URGENT: 'Urgent',
  NORMAL: 'Normal'
};

const STATUS_TONE: Record<ComplaintStatus, string> = {
  OPEN: 'bg-amber-500/12 text-amber-700',
  SOLVED: 'bg-green-500/12 text-green-700'
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  SOLVED: 'Solved'
};

const pill = 'rounded-md px-2 py-0.5 text-11 font-medium';

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  return (
    <span className={`${pill} ${PRIORITY_TONE[priority]}`}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`${pill} ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

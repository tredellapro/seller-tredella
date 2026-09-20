'use client';

import { useRef, useState } from 'react';
import { HiCheckCircle, HiOutlineCheckCircle, HiOutlineRefresh, HiX } from 'react-icons/hi';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import DetailRows from 'components/common/DetailRows';
import Modal from 'components/ui/Modal';
import { PriorityBadge, StatusBadge } from './ComplaintBadges';
import {
  complaintDate,
  type Complaint,
  type ComplaintReply
} from 'data/complaints-sample';

/** Who the seller is, for their own replies. */
const SELLER_NAME = 'Electronics Store';

export default function ComplaintDetailView({
  complaint: initial
}: {
  complaint: Complaint;
}) {
  const [complaint, setComplaint] = useState<Complaint>(initial);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const solved = complaint.status === 'SOLVED';
  const today = new Date().toISOString().slice(0, 10);

  const send = () => {
    const text = reply.trim();
    if (!text) {
      setReplyError('Write a reply first.');
      return;
    }

    const message: ComplaintReply = {
      id: `r-${Date.now()}`,
      author: 'SELLER',
      authorName: SELLER_NAME,
      text,
      createdAt: today
    };

    setComplaint((current) => ({
      ...current,
      replies: [...current.replies, message]
    }));
    setReply('');
    setReplyError(null);
    setNotice(`Reply sent to ${complaint.raisedBy.name}.`);
    window.setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      0
    );
  };

  const markSolved = () => {
    if (!resolution.trim()) {
      setResolutionError('Say what resolved it — the buyer sees this.');
      return;
    }

    setComplaint((current) => ({
      ...current,
      status: 'SOLVED',
      solvedAt: today,
      resolution: resolution.trim()
    }));
    setSolving(false);
    setResolution('');
    setResolutionError(null);
    setNotice(`Marked as solved. ${complaint.raisedBy.name} has been notified.`);
  };

  const reopen = () => {
    setComplaint((current) => ({
      ...current,
      status: 'OPEN',
      solvedAt: null,
      resolution: null
    }));
    setNotice('Reopened. It is back in the Open list.');
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Complaint"
        backHref="/dashboard/complaints"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Complaints', href: '/dashboard/complaints' },
          { label: complaint.id }
        ]}
        actions={
          solved ? (
            <button
              type="button"
              onClick={reopen}
              className="flex items-center gap-1.5 rounded-md border border-secondary/20 bg-white px-5 py-2 text-14 font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <HiOutlineRefresh className="h-4 w-4" />
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setResolutionError(null);
                setSolving(true);
              }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              <HiOutlineCheckCircle className="h-4 w-4" />
              Mark as solved
            </button>
          )
        }
      />

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

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,340px)]">
        <div className="flex flex-col gap-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-16 font-semibold text-secondary">
                {complaint.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <p className="mt-3 text-13 leading-relaxed text-gray">
              {complaint.body}
            </p>

            {complaint.product && (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-background px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={complaint.product.image}
                  alt=""
                  className="h-9 w-9 rounded-lg bg-white object-cover"
                />
                <span className="min-w-0 truncate text-12 text-secondary">
                  {complaint.product.name}
                </span>
              </div>
            )}
          </Panel>

          <Panel>
            <h2 className="text-14 font-semibold text-secondary">
              Conversation
            </h2>

            {complaint.replies.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-secondary/20 px-4 py-8 text-center text-13 text-gray">
                No replies yet. Answering quickly is usually what stops a
                complaint becoming a refund.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {complaint.replies.map((message) => {
                  const mine = message.author === 'SELLER';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-13 ${
                          mine
                            ? 'rounded-br-sm bg-primary text-white'
                            : 'rounded-bl-sm bg-background text-secondary'
                        }`}
                      >
                        <p
                          className={`text-11 ${mine ? 'text-white/70' : 'text-gray'}`}
                        >
                          {message.authorName}
                        </p>
                        <p className="mt-0.5 break-words">{message.text}</p>
                        <p
                          className={`mt-1 text-10 ${
                            mine ? 'text-white/70' : 'text-gray'
                          }`}
                        >
                          {complaintDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}

            {solved ? (
              <p className="mt-4 text-12 text-gray">
                This complaint is solved. Reopen it if the buyer comes back.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <label htmlFor="complaint-reply" className="sr-only">
                  Write a reply
                </label>
                <textarea
                  id="complaint-reply"
                  rows={3}
                  value={reply}
                  onChange={(event) => {
                    setReply(event.target.value);
                    setReplyError(null);
                  }}
                  placeholder={`Reply to ${complaint.raisedBy.name}…`}
                  aria-invalid={replyError ? true : undefined}
                  className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
                    replyError
                      ? 'border-primary'
                      : 'border-secondary/15 focus:border-primary'
                  }`}
                />
                {replyError && (
                  <p className="text-12 text-primary">{replyError}</p>
                )}
                <button
                  type="button"
                  onClick={send}
                  className="self-end rounded-lg bg-primary px-5 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Send reply
                </button>
              </div>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel>
            <h2 className="text-14 font-semibold text-secondary">Details</h2>
            <div className="mt-3">
              <DetailRows
                rows={[
                  { label: 'Complaint ID', value: complaint.id },
                  { label: 'Category', value: complaint.category },
                  { label: 'Raised on', value: complaintDate(complaint.createdAt) },
                  { label: 'Raised by', value: complaint.raisedBy.name },
                  { label: 'Email', value: complaint.raisedBy.email },
                  ...(complaint.orderId
                    ? [{ label: 'Order', value: complaint.orderId }]
                    : []),
                  ...(complaint.solvedAt
                    ? [
                        {
                          label: 'Solved on',
                          value: complaintDate(complaint.solvedAt),
                          emphasis: true
                        }
                      ]
                    : [])
                ]}
              />
            </div>
          </Panel>

          {complaint.resolution && (
            <Panel>
              <h2 className="flex items-center gap-2 text-14 font-semibold text-secondary">
                <HiCheckCircle className="h-4 w-4 text-green-600" />
                Resolution
              </h2>
              <p className="mt-2 text-13 leading-relaxed text-gray">
                {complaint.resolution}
              </p>
            </Panel>
          )}
        </div>
      </div>

      <Modal
        open={solving}
        onClose={() => setSolving(false)}
        title="Mark as solved"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSolving(false)}
              className="flex-1 rounded-lg border border-secondary/20 py-2.5 text-14 font-medium text-secondary transition-colors hover:border-secondary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={markSolved}
              className="flex-1 rounded-lg bg-primary py-2.5 text-14 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Mark as solved
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="resolution" className="text-13 text-secondary">
            What resolved it?
          </label>
          <textarea
            id="resolution"
            rows={4}
            value={resolution}
            onChange={(event) => {
              setResolution(event.target.value);
              setResolutionError(null);
            }}
            placeholder="Replacement shipped and confirmed delivered."
            aria-invalid={resolutionError ? true : undefined}
            className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
              resolutionError
                ? 'border-primary'
                : 'border-secondary/15 focus:border-primary'
            }`}
          />
          {resolutionError ? (
            <p className="text-12 text-primary">{resolutionError}</p>
          ) : (
            <p className="text-11 text-gray">
              {complaint.raisedBy.name} sees this, and it is what you will have
              to point at if the complaint is escalated.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

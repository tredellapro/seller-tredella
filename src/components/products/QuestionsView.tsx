'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  HiChatAlt2,
  HiCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import PageHeader from 'components/dashboard/PageHeader';
import Panel from 'components/dashboard/Panel';
import {
  ANSWER_PRODUCT_QUESTION,
  MY_SELLER_QUESTIONS
} from 'graphql/questions';
import { errorMessage } from 'utils/graphqlError';
import type {
  AnswerQuestionResult,
  MySellerQuestionsResult,
  ProductQuestion
} from 'types/question';

const TABS = ['Unanswered', 'Answered', 'All'] as const;
type Tab = (typeof TABS)[number];

const ANSWERED_ARG: Record<Tab, boolean | null> = {
  Unanswered: false,
  Answered: true,
  All: null
};

/** "2h", "3d" — how long someone has been waiting. */
const waitedFor = (iso: string): string => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function QuestionCard({
  question,
  onAnswered
}: {
  question: ProductQuestion;
  onAnswered: (_message: string) => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [answer, { loading }] = useMutation<AnswerQuestionResult>(
    ANSWER_PRODUCT_QUESTION,
    { refetchQueries: [MY_SELLER_QUESTIONS] }
  );

  const send = async () => {
    const body = text.trim();
    if (body.length < 2) {
      setError('Write an answer first.');
      return;
    }

    setError(null);
    try {
      await answer({ variables: { questionId: question.id, answer: body } });
      setText('');
      onAnswered(`Answered — ${question.user.name} has been notified.`);
    } catch (failure) {
      setError(errorMessage(failure, 'That answer did not send.'));
    }
  };

  const answered = question.answer !== null;

  return (
    <li className="rounded-2xl bg-white px-5 py-4 shadow-[0_4px_30px_rgba(43,52,69,0.06)] sm:px-6">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={question.product.image}
          alt=""
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-lg bg-background object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-13 font-medium text-secondary">
            {question.product.name}
          </p>
          <p className="text-11 text-gray">
            {question.user.name} · asked {waitedFor(question.createdAt)}
          </p>
        </div>

        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-11 font-medium ${
            answered
              ? 'bg-green-500/12 text-green-700'
              : 'bg-amber-500/12 text-amber-700'
          }`}
        >
          {answered ? (
            <HiCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {answered ? 'Answered' : 'Waiting'}
        </span>
      </div>

      <p className="mt-3 rounded-xl bg-background px-4 py-3 text-13 leading-relaxed text-secondary">
        {question.text}
      </p>

      {answered ? (
        <div className="mt-3 rounded-xl border border-secondary/10 px-4 py-3">
          <p className="text-11 text-gray">
            Your answer · {question.answeredAt ? waitedFor(question.answeredAt) : ''}
          </p>
          <p className="mt-1 text-13 leading-relaxed text-secondary">
            {question.answer}
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <label htmlFor={`answer-${question.id}`} className="sr-only">
            Answer {question.user.name}
          </label>
          <textarea
            id={`answer-${question.id}`}
            rows={3}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError(null);
            }}
            placeholder={`Answer ${question.user.name.split(' ')[0]}…`}
            aria-invalid={error ? true : undefined}
            className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-13 text-secondary outline-none transition-colors placeholder:text-gray/60 ${
              error ? 'border-primary' : 'border-secondary/15 focus:border-primary'
            }`}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-11 text-gray">
              {error ? (
                <span className="text-primary">{error}</span>
              ) : (
                'Everyone looking at this product sees your answer.'
              )}
            </p>
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading}
              className="shrink-0 rounded-lg bg-primary px-5 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send answer'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function QuestionsView() {
  const [tab, setTab] = useState<Tab>('Unanswered');
  const [notice, setNotice] = useState<string | null>(null);

  const { data, loading, error } = useQuery<MySellerQuestionsResult>(
    MY_SELLER_QUESTIONS,
    {
      variables: { answered: ANSWERED_ARG[tab] },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }
  );

  const questions = useMemo(
    () => data?.mySellerQuestions ?? [],
    [data]
  );

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Product Questions"
        backHref="/dashboard/products"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Products', href: '/dashboard/products' },
          { label: 'Questions' }
        ]}
      />

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-13 text-secondary"
        >
          <HiOutlineExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {errorMessage(error, 'Could not load your questions.')}
        </p>
      )}

      <div className="no-scrollbar -mb-px overflow-x-auto">
        <div
          role="tablist"
          aria-label="Question status"
          className="flex min-w-max gap-6 border-b border-secondary/10"
        >
          {TABS.map((name) => (
            <button
              key={name}
              role="tab"
              type="button"
              aria-selected={tab === name}
              onClick={() => {
                setTab(name);
                setNotice(null);
              }}
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

      {loading && questions.length === 0 ? (
        <p className="py-10 text-center text-13 text-gray">Loading…</p>
      ) : questions.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-24 text-gray">
              <HiChatAlt2 aria-hidden="true" />
            </span>
            <p className="mt-3 text-13 text-gray">
              {tab === 'Unanswered'
                ? 'Nothing waiting. Questions buyers ask on your product pages land here.'
                : 'Nothing here yet.'}
            </p>
          </div>
        </Panel>
      ) : (
        <ul className="flex flex-col gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onAnswered={setNotice}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { InterviewSession } from '@/components/interviews/interview-session';
import { deserializeJson } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Interview Session' };

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { id } = await params;

  const interview = await prisma.interview.findFirst({
    where: { id, userId: session.user.id },
    include: {
      questions: {
        orderBy: { sequence: 'asc' },
        include: {
          answer: {
            include: {
              evaluation: true,
            },
          },
        },
      },
    },
  });

  if (!interview) redirect('/dashboard');

  // If already completed, redirect to report
  if (interview.status === 'COMPLETED') {
    redirect(`/interviews/${id}/report`);
  }

  const settings = deserializeJson<{ useVoice?: boolean; totalQuestions: number }>(
    interview.settings as string,
    { totalQuestions: interview.totalQuestions }
  );

  return (
    <InterviewSession
      interview={{
        id: interview.id,
        type: interview.type,
        role: interview.role,
        difficulty: interview.difficulty,
        status: interview.status,
        totalQuestions: interview.totalQuestions,
        currentIndex: interview.currentIndex,
        settings,
        questions: interview.questions.map((q) => ({
          id: q.id,
          sequence: q.sequence,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          isFollowUp: q.isFollowUp,
          answer: q.answer ? {
            id: q.answer.id,
            answerText: q.answer.answerText,
            submittedAt: q.answer.submittedAt.toISOString(),
          } : null,
        })),
      }}
    />
  );
}

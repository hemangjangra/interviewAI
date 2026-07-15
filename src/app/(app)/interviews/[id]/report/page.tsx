import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { InterviewReportView } from '@/components/interviews/interview-report-view';
import { deserializeArray, deserializeJson } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Interview Report' };

export default async function InterviewReportPage({
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
        include: { answer: { include: { evaluation: true } } },
      },
      report: true,
    },
  });

  if (!interview) redirect('/dashboard');

  if (interview.status !== 'COMPLETED' || !interview.report) {
    redirect(`/interviews/${id}`);
  }

  const report = interview.report;

  return (
    <InterviewReportView
      interview={{
        id: interview.id,
        type: interview.type,
        role: interview.role,
        difficulty: interview.difficulty,
        topics: deserializeArray(interview.topics as string),
        totalQuestions: interview.totalQuestions,
        startedAt: interview.startedAt?.toISOString() ?? null,
        completedAt: interview.completedAt?.toISOString() ?? null,
        overallScore: interview.overallScore ?? 0,
      }}
      report={{
        overallScore: report.overallScore,
        summary: report.summary,
        categoryScores: deserializeJson<Record<string, number>>(report.categoryScores as string, {}),
        topicScores: deserializeJson<Record<string, number>>(report.topicScores as string, {}),
        strengths: deserializeArray(report.strengths as string),
        weaknesses: deserializeArray(report.weaknesses as string),
        actionPlan: deserializeJson<any[]>(report.actionPlan as string, []),
        generatedAt: report.generatedAt.toISOString(),
      }}
      questions={interview.questions.map((q) => ({
        id: q.id,
        sequence: q.sequence,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        isFollowUp: q.isFollowUp,
        answer: q.answer?.answerText ?? null,
        evaluation: q.answer?.evaluation ? {
          score: q.answer.evaluation.score,
          correctness: q.answer.evaluation.correctness,
          completeness: q.answer.evaluation.completeness,
          clarity: q.answer.evaluation.clarity,
          strengths: deserializeArray(q.answer.evaluation.strengths as string),
          weaknesses: deserializeArray(q.answer.evaluation.weaknesses as string),
          betterAnswer: q.answer.evaluation.betterAnswer ?? null,
        } : null,
      }))}
    />
  );
}

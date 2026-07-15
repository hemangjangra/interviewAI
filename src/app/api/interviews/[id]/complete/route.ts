import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';
import { deserializeJson, serializeArray, serializeJson, deserializeArray } from '@/lib/db-helpers';
import type { CreateInterviewInput } from '@/lib/schemas/interview.schemas';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interview = await prisma.interview.findFirst({
      where: { id, userId: session.user.id },
      include: {
        questions: {
          orderBy: { sequence: 'asc' },
          include: { answer: { include: { evaluation: true } } },
        },
        report: { select: { id: true } },
      },
    });

    if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    if (interview.status === 'COMPLETED') {
      return NextResponse.json({ reportId: interview.report?.id, alreadyCompleted: true });
    }
    if (!['IN_PROGRESS', 'READY'].includes(interview.status)) {
      return NextResponse.json({ error: 'Interview cannot be completed in its current state' }, { status: 400 });
    }

    await prisma.interview.update({
      where: { id: interview.id },
      data: { status: 'EVALUATING' },
    });

    const answeredQuestions = interview.questions.filter((q) => q.answer);
    const topics = deserializeArray(interview.topics as string);

    const config: CreateInterviewInput = {
      type: interview.type as any,
      role: interview.role,
      experienceLevel: interview.experienceLevel as any,
      difficulty: interview.difficulty as any,
      topics: topics as any,
      settings: { totalQuestions: interview.totalQuestions, estimatedMinutes: 30, useVoice: false, useResumeContext: false },
    };

    const resume = await prisma.resume.findUnique({
      where: { userId: session.user.id },
      select: { structuredData: true },
    });
    const resumeData = deserializeJson<{ summary?: string }>(resume?.structuredData as string, {});
    const resumeSummary = resumeData.summary;

    const reportContext = {
      interviewConfig: config,
      questions: interview.questions.map((q) => ({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      answers: answeredQuestions.map((q) => ({
        question: q.question,
        answer: q.answer!.answerText,
        evaluation: {
          score: q.answer!.evaluation?.score ?? 5,
          correctness: q.answer!.evaluation?.correctness ?? 5,
          completeness: q.answer!.evaluation?.completeness ?? 5,
          clarity: q.answer!.evaluation?.clarity ?? 5,
          strengths: deserializeArray(q.answer!.evaluation?.strengths as string),
          missingConcepts: deserializeArray(q.answer!.evaluation?.weaknesses as string),
          internalNotes: q.answer!.evaluation?.internalNotes ?? '',
          followUpRecommended: q.answer!.evaluation?.followUpRecommended ?? false,
        },
      })),
      resumeSummary,
    };

    const ai = getAIProvider();
    const reportData = await ai.generateFinalReport(reportContext);
    const overallScore = reportData.overallScore;

    const report = await prisma.$transaction(async (tx) => {
      const newReport = await tx.interviewReport.create({
        data: {
          interviewId: interview.id,
          overallScore: reportData.overallScore,
          summary: reportData.summary,
          categoryScores: serializeJson(reportData.categoryScores),
          topicScores: serializeJson(reportData.topicScores),
          strengths: serializeArray(reportData.strengths),
          weaknesses: serializeArray(reportData.weaknesses),
          actionPlan: serializeJson(reportData.actionPlan),
          rawData: serializeJson({ provider: ai.name, isDemoMode: ai.isDemoMode }),
        },
        select: { id: true },
      });

      await tx.interview.update({
        where: { id: interview.id },
        data: { status: 'COMPLETED', completedAt: new Date(), overallScore },
      });

      return newReport;
    });

    return NextResponse.json({ reportId: report.id, overallScore });
  } catch (error) {
    const { id } = await params.catch(() => ({ id: '' }));
    if (id) {
      try {
        await prisma.interview.update({
          where: { id },
          data: { status: 'IN_PROGRESS' },
        });
      } catch { /* ignore */ }
    }

    console.error('[COMPLETE_INTERVIEW_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to generate report. Please try again.' }, { status: 500 });
  }
}

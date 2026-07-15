import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';
import { deserializeJson, serializeJson, deserializeArray } from '@/lib/db-helpers';
import type { CreateInterviewInput, InterviewPlan } from '@/lib/schemas/interview.schemas';

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
      },
    });

    if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    if (!['READY', 'IN_PROGRESS'].includes(interview.status)) {
      return NextResponse.json({ error: 'Interview is not active' }, { status: 400 });
    }

    const currentQuestionCount = interview.questions.length;
    if (currentQuestionCount >= interview.totalQuestions) {
      return NextResponse.json({ error: 'Interview is complete', done: true }, { status: 400 });
    }

    const interviewSettings = deserializeJson<{ useResumeContext?: boolean; plan?: InterviewPlan }>(
      interview.settings as string, {}
    );

    let resumeSummary: string | undefined;
    if (interviewSettings.useResumeContext) {
      const resume = await prisma.resume.findUnique({
        where: { userId: session.user.id },
        select: { structuredData: true },
      });
      if (resume?.structuredData) {
        const data = deserializeJson<{ summary?: string; skills?: string[] }>(resume.structuredData as string, {});
        resumeSummary = `${data.summary ?? ''} Skills: ${(data.skills ?? []).join(', ')}`;
      }
    }

    const config: CreateInterviewInput = {
      type: interview.type as any,
      role: interview.role,
      experienceLevel: interview.experienceLevel as any,
      difficulty: interview.difficulty as any,
      topics: deserializeArray(interview.topics as string) as any,
      settings: {
        totalQuestions: interview.totalQuestions,
        estimatedMinutes: 30,
        useVoice: false,
        useResumeContext: interviewSettings.useResumeContext ?? false,
      },
    };

    const previousQuestions = interview.questions.map((q) => ({ question: q.question, category: q.category }));
    const previousAnswers = interview.questions.filter((q) => q.answer?.answerText).map((q) => ({
      question: q.question, answer: q.answer!.answerText,
    }));

    const lastQuestion = interview.questions[interview.questions.length - 1];
    const shouldFollowUp = lastQuestion?.answer?.evaluation?.followUpRecommended && !lastQuestion.isFollowUp && currentQuestionCount < interview.totalQuestions - 1;

    const ai = getAIProvider();
    let generatedQuestion;

    if (shouldFollowUp && lastQuestion?.answer?.evaluation) {
      const evalData = lastQuestion.answer.evaluation;
      generatedQuestion = await ai.generateFollowUp({
        interviewConfig: config, previousQuestions, previousAnswers, resumeSummary,
        questionNumber: currentQuestionCount, totalQuestions: interview.totalQuestions,
        interviewPlan: interviewSettings.plan ?? { overview: '', questionCategories: [], focusAreas: [], estimatedDifficultyCurve: [] },
        lastQuestion: lastQuestion.question, lastAnswer: lastQuestion.answer?.answerText ?? '',
        lastEvaluation: {
          score: evalData.score, correctness: evalData.correctness, completeness: evalData.completeness,
          clarity: evalData.clarity, strengths: deserializeArray(evalData.strengths as string),
          missingConcepts: deserializeArray(evalData.weaknesses as string), internalNotes: evalData.internalNotes ?? '',
          followUpRecommended: evalData.followUpRecommended,
        },
        followUpFocus: evalData.suggestedFollowUp ?? undefined,
      });
    } else {
      generatedQuestion = await ai.generateQuestion({
        interviewConfig: config, previousQuestions, previousAnswers, resumeSummary,
        questionNumber: currentQuestionCount, totalQuestions: interview.totalQuestions,
        interviewPlan: interviewSettings.plan ?? { overview: '', questionCategories: [], focusAreas: [], estimatedDifficultyCurve: [] },
      });
    }

    const question = await prisma.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        sequence: currentQuestionCount + 1,
        question: generatedQuestion.question,
        category: generatedQuestion.category,
        difficulty: generatedQuestion.difficulty,
        isFollowUp: generatedQuestion.isFollowUp,
        followUpFor: shouldFollowUp ? lastQuestion?.id : null,
        metadata: serializeJson({ expectedConcepts: generatedQuestion.expectedConcepts, hints: generatedQuestion.hints }),
      },
      select: { id: true, sequence: true, question: true, category: true, difficulty: true, isFollowUp: true },
    });

    if (interview.status === 'READY') {
      await prisma.interview.update({ where: { id: interview.id }, data: { status: 'IN_PROGRESS', startedAt: new Date(), currentIndex: 1 } });
    } else {
      await prisma.interview.update({ where: { id: interview.id }, data: { currentIndex: currentQuestionCount + 1 } });
    }

    return NextResponse.json({
      question,
      progress: { current: currentQuestionCount + 1, total: interview.totalQuestions, isLast: currentQuestionCount + 1 >= interview.totalQuestions },
    });
  } catch (error) {
    console.error('[NEXT_QUESTION_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to generate question. Please try again.' }, { status: 500 });
  }
}

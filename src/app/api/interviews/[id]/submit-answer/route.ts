import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';
import { z } from 'zod';
import { deserializeJson, serializeArray } from '@/lib/db-helpers';

const SubmitAnswerSchema = z.object({
  questionId: z.string().cuid(),
  answerText: z.string().min(1).max(10000),
  transcript: z.string().max(10000).optional(),
  timeSpent: z.number().int().min(0).max(7200).optional(),
});

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

    const body = await request.json() as unknown;
    const parsed = SubmitAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { questionId, answerText, transcript, timeSpent } = parsed.data;

    const question = await prisma.interviewQuestion.findFirst({
      where: {
        id: questionId,
        interviewId: id,
        interview: { userId: session.user.id },
      },
      include: { interview: true },
    });

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const existingAnswer = await prisma.interviewAnswer.findUnique({ where: { questionId } });
    if (existingAnswer) return NextResponse.json({ error: 'Answer already submitted' }, { status: 409 });

    const answer = await prisma.interviewAnswer.create({
      data: { questionId, answerText: answerText.trim(), transcript: transcript?.trim(), timeSpent },
      select: { id: true, questionId: true, submittedAt: true },
    });

    // Evaluate asynchronously (fire and forget)
    (async () => {
      try {
        const ai = getAIProvider();
        const metadata = deserializeJson<{ expectedConcepts?: string[] }>(question.metadata as string, {});

        const evaluation = await ai.evaluateAnswer({
          question: question.question,
          expectedConcepts: metadata.expectedConcepts ?? [],
          answer: answerText,
          interviewType: question.interview.type,
          difficulty: question.difficulty,
          role: question.interview.role,
        });

        await prisma.answerEvaluation.create({
          data: {
            answerId: answer.id,
            score: evaluation.score,
            correctness: evaluation.correctness,
            completeness: evaluation.completeness,
            clarity: evaluation.clarity,
            strengths: serializeArray(evaluation.strengths),
            weaknesses: serializeArray(evaluation.missingConcepts),
            internalNotes: evaluation.internalNotes,
            betterAnswer: evaluation.betterAnswer,
            followUpRecommended: evaluation.followUpRecommended,
            suggestedFollowUp: evaluation.suggestedFollowUpFocus,
          },
        });
      } catch (evalError) {
        console.error('[EVAL_ERROR]', evalError instanceof Error ? evalError.message : 'Unknown');
      }
    })();

    return NextResponse.json({ answer, success: true });
  } catch (error) {
    console.error('[SUBMIT_ANSWER_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to submit answer. Please try again.' }, { status: 500 });
  }
}

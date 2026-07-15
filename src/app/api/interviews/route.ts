import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAIProvider } from '@/lib/ai';
import { CreateInterviewSchema } from '@/lib/schemas/interview.schemas';
import { serializeArray, serializeJson, deserializeJson } from '@/lib/db-helpers';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as unknown;
    const parsed = CreateInterviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid configuration', details: parsed.error.flatten() }, { status: 400 });
    }

    const config = parsed.data;
    const userId = session.user.id;

    // Generate interview plan via AI
    const ai = getAIProvider();
    const plan = await ai.generateInterviewPlan(config);

    const settingsWithPlan = { ...config.settings, plan };

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        userId,
        type: config.type,
        role: config.role,
        experienceLevel: config.experienceLevel,
        difficulty: config.difficulty,
        topics: serializeArray(config.topics as string[]),
        settings: serializeJson(settingsWithPlan),
        totalQuestions: config.settings.totalQuestions,
        status: 'READY',
      },
      select: { id: true, status: true, type: true, role: true, difficulty: true },
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    console.error('[CREATE_INTERVIEW_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to create interview.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'));
    const status = searchParams.get('status');

    const where = {
      userId: session.user.id,
      ...(status ? { status } : {}),
    };

    const [rawInterviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, type: true, role: true, difficulty: true, status: true,
          overallScore: true, totalQuestions: true, currentIndex: true,
          startedAt: true, completedAt: true, createdAt: true, topics: true,
        },
      }),
      prisma.interview.count({ where }),
    ]);

    const interviews = rawInterviews.map((i) => ({
      ...i,
      topics: deserializeJson<string[]>(i.topics, []),
    }));

    return NextResponse.json({
      interviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[LIST_INTERVIEWS_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to load interviews.' }, { status: 500 });
  }
}

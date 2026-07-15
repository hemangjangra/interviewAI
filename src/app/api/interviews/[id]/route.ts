import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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
        questions: { orderBy: { sequence: 'asc' }, include: { answer: { include: { evaluation: true } } } },
        report: true,
      },
    });

    if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    return NextResponse.json({ interview });
  } catch (error) {
    console.error('[GET_INTERVIEW_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to load interview.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { status?: string };

    const existing = await prisma.interview.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });

    const validStatuses = ['READY', 'IN_PROGRESS', 'ABANDONED'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
        ...(body.status === 'ABANDONED' ? { completedAt: new Date() } : {}),
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ interview: updated });
  } catch (error) {
    console.error('[PATCH_INTERVIEW_ERROR]', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to update interview.' }, { status: 500 });
  }
}

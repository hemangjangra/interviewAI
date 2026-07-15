import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { HistoryView } from '@/components/history/history-view';
import { deserializeArray } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Interview History' };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const rawInterviews = await prisma.interview.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, type: true, role: true, difficulty: true, topics: true, status: true,
      overallScore: true, totalQuestions: true, currentIndex: true,
      startedAt: true, completedAt: true, createdAt: true,
    },
  });

  const interviews = rawInterviews.map((i) => ({
    ...i,
    topics: deserializeArray(i.topics as string),
    startedAt: i.startedAt?.toISOString() ?? null,
    completedAt: i.completedAt?.toISOString() ?? null,
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Interview History</h1>
        <p className="text-muted-foreground mt-1">All your past interview sessions</p>
      </div>
      <HistoryView interviews={interviews} />
    </div>
  );
}

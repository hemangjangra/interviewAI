import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { getAIProvider } from '@/lib/ai';
import { deserializeJson, deserializeArray } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Dashboard' };

async function getDashboardData(userId: string) {
  const [rawInterviews, profile, rawResume] = await Promise.all([
    prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, type: true, role: true, difficulty: true, status: true,
        overallScore: true, totalQuestions: true, currentIndex: true,
        startedAt: true, completedAt: true, createdAt: true, topics: true,
      },
    }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.resume.findUnique({
      where: { userId },
      select: { id: true, fileName: true, analysisStatus: true },
    }),
  ]);

  const interviews = rawInterviews.map((i) => ({
    ...i,
    topics: deserializeArray(i.topics),
  }));

  const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED' && i.overallScore != null);
  const totalInterviews = interviews.length;
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((s, i) => s + (i.overallScore ?? 0), 0) / completedInterviews.length)
    : null;

  const latestScore = completedInterviews[0]?.overallScore ?? null;
  const recent = interviews.slice(0, 5);

  // Score trend (last 8 completed)
  const scoreTrend = completedInterviews.slice(0, 8).reverse().map((i, idx) => ({
    session: idx + 1,
    score: Math.round(i.overallScore ?? 0),
    date: i.completedAt?.toISOString() ?? i.createdAt.toISOString(),
  }));

  const aiProvider = getAIProvider();

  return {
    profile,
    resume: rawResume,
    stats: { totalInterviews, avgScore, latestScore, completedCount: completedInterviews.length },
    recent,
    scoreTrend,
    isDemoMode: aiProvider.isDemoMode,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getDashboardData(session.user.id);

  return (
    <DashboardView
      user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
      {...data}
    />
  );
}

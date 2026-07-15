import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AnalyticsView } from '@/components/analytics/analytics-view';
import { deserializeJson, deserializeArray } from '@/lib/db-helpers';

export const metadata: Metadata = { title: 'Analytics' };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const interviews = await prisma.interview.findMany({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'asc' },
    include: {
      report: {
        select: { topicScores: true, categoryScores: true },
      },
    },
  });

  const topicAccumulator: Record<string, { total: number; count: number }> = {};
  const typePerformance: Record<string, { total: number; count: number }> = {};

  for (const interview of interviews) {
    const key = interview.type;
    if (!typePerformance[key]) typePerformance[key] = { total: 0, count: 0 };
    if (interview.overallScore != null) {
      typePerformance[key].total += interview.overallScore;
      typePerformance[key].count += 1;
    }

    if (interview.report?.topicScores) {
      const topicScores = deserializeJson<Record<string, number>>(interview.report.topicScores as string, {});
      for (const [topic, score] of Object.entries(topicScores)) {
        if (!topicAccumulator[topic]) topicAccumulator[topic] = { total: 0, count: 0 };
        topicAccumulator[topic].total += score;
        topicAccumulator[topic].count += 1;
      }
    }
  }

  const avgTopicScores = Object.entries(topicAccumulator).map(([topic, data]) => ({
    topic,
    score: Math.round(data.total / data.count),
  })).sort((a, b) => b.score - a.score);

  const typeData = Object.entries(typePerformance).map(([type, data]) => ({
    type,
    avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
    count: data.count,
  }));

  const scoreTrend = interviews.map((i, idx) => ({
    session: idx + 1,
    score: Math.round(i.overallScore ?? 0),
    date: i.completedAt?.toISOString() ?? i.createdAt.toISOString(),
    type: i.type,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your improvement over time</p>
      </div>
      <AnalyticsView
        scoreTrend={scoreTrend}
        avgTopicScores={avgTopicScores}
        typeData={typeData}
        totalCompleted={interviews.length}
      />
    </div>
  );
}

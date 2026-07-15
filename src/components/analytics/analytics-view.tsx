'use client';

import * as React from 'react';
import Link from 'next/link';
import { BarChart2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreTrendChart } from '@/components/charts/score-trend-chart';
import { TopicScoreChart } from '@/components/charts/topic-score-chart';

interface AnalyticsViewProps {
  scoreTrend: { session: number; score: number; date: string; type: string }[];
  avgTopicScores: { topic: string; score: number }[];
  typeData: { type: string; avgScore: number; count: number }[];
  totalCompleted: number;
}

const typeLabels: Record<string, string> = {
  hr: 'HR', technical: 'Technical', dsa: 'DSA', core_cs: 'Core CS', mixed: 'Mixed',
};

export function AnalyticsView({ scoreTrend, avgTopicScores, typeData, totalCompleted }: AnalyticsViewProps) {
  if (totalCompleted === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <BarChart2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No data yet</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Complete your first interview to start seeing analytics and track your improvement.
        </p>
        <Button asChild>
          <Link href="/interviews/new">Start Interview</Link>
        </Button>
      </div>
    );
  }

  const overallAvg = scoreTrend.length > 0
    ? Math.round(scoreTrend.reduce((s, d) => s + d.score, 0) / scoreTrend.length)
    : 0;

  const topTopics = avgTopicScores.slice(0, 3);
  const weakTopics = avgTopicScores.slice(-3).reverse();

  const radarData = avgTopicScores.map((t) => ({
    name: t.topic.length > 10 ? t.topic.slice(0, 10) + '…' : t.topic,
    score: t.score,
  }));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{totalCompleted}</div>
            <div className="text-sm text-muted-foreground mt-1">Completed Interviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{overallAvg}</div>
            <div className="text-sm text-muted-foreground mt-1">Overall Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{avgTopicScores.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Topics Practiced</div>
          </CardContent>
        </Card>
      </div>

      {/* Score trend */}
      {scoreTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>Your performance across all completed interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={scoreTrend} />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Topic performance */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
              <CardDescription>Average scores across all sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicScoreChart data={radarData} />
            </CardContent>
          </Card>
        )}

        {/* Type performance */}
        {typeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Type</CardTitle>
              <CardDescription>How you perform in different interview formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {typeData.map((t) => (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{typeLabels[t.type] ?? t.type}</span>
                      <span className="text-muted-foreground">{t.avgScore}/100 · {t.count} session{t.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${t.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strongest/weakest topics */}
      {avgTopicScores.length >= 3 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-success">💪 Strongest Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topTopics.map((t) => (
                  <div key={t.topic} className="flex items-center justify-between text-sm">
                    <span>{t.topic}</span>
                    <span className="font-semibold text-success">{t.score}/100</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">📈 Topics to Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weakTopics.map((t) => (
                  <div key={t.topic} className="flex items-center justify-between text-sm">
                    <span>{t.topic}</span>
                    <span className="font-semibold text-destructive">{t.score}/100</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

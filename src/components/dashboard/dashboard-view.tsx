'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus, TrendingUp, Award, Target, Clock, BarChart2,
  FileText, ArrowRight, Brain, AlertCircle, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScoreTrendChart } from '@/components/charts/score-trend-chart';
import { cn, formatRelativeTime, scoreToGrade, scoreToColor, formatDate } from '@/lib/utils';

interface DashboardProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  profile: any;
  resume: { id: string; fileName: string; analysisStatus: string } | null;
  stats: { totalInterviews: number; avgScore: number | null; latestScore: number | null; completedCount: number };
  recent: any[];
  scoreTrend: { session: number; score: number; date: string }[];
  isDemoMode: boolean;
}

const interviewTypeLabel: Record<string, string> = {
  hr: 'HR', technical: 'Technical', dsa: 'DSA', core_cs: 'Core CS', mixed: 'Mixed',
};

const difficultyColor: Record<string, string> = {
  easy: 'success', medium: 'warning', hard: 'destructive', adaptive: 'info',
};

function StatCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: React.ReactNode; subtitle: string; icon: React.ElementType; trend?: string;
}) {
  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-3xl font-bold mt-1">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardView({ user, profile, resume, stats, recent, scoreTrend, isDemoMode }: DashboardProps) {
  const hasInterviews = stats.totalInterviews > 0;
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userInitials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Demo Mode:</strong> Running with mock AI. Add{' '}
            <code className="rounded bg-warning/20 px-1 font-mono text-xs">GEMINI_API_KEY</code>{' '}
            to your <code className="rounded bg-warning/20 px-1 font-mono text-xs">.env.local</code> for real AI responses.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-border">
            <AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {greeting}, {user.name?.split(' ')[0] ?? 'there'}! 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasInterviews ? 'Keep up the great work!' : 'Start your first interview to begin tracking progress'}
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/interviews/new">
            <Plus className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

      {!hasInterviews ? (
        /* ─── EMPTY STATE ───────────────────────────────────── */
        <div className="grid md:grid-cols-2 gap-6">
          {/* Get Started Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Start your first interview</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure a mock interview tailored to your role and get AI-powered feedback instantly.
                </p>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/interviews/new">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Interview
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upload Resume Card */}
          <Card className={cn(!resume && 'border-dashed')}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {resume ? 'Resume uploaded ✓' : 'Upload your resume'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {resume
                    ? `${resume.fileName} — ${resume.analysisStatus === 'done' ? 'Analyzed and ready' : 'Processing...'}`
                    : 'Get interview questions tailored to your skills, projects, and experience.'}
                </p>
              </div>
              <Button variant={resume ? 'outline' : 'default'} asChild size="lg" className="w-full">
                <Link href="/resume">
                  <FileText className="mr-2 h-4 w-4" />
                  {resume ? 'View Resume' : 'Upload Resume'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ─── MAIN DASHBOARD ────────────────────────────────── */
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Interviews"
              value={stats.totalInterviews}
              subtitle={`${stats.completedCount} completed`}
              icon={Target}
            />
            <StatCard
              title="Average Score"
              value={stats.avgScore != null ? `${stats.avgScore}` : '—'}
              subtitle={stats.avgScore != null ? scoreToGrade(stats.avgScore) : 'No data yet'}
              icon={Award}
            />
            <StatCard
              title="Latest Score"
              value={
                stats.latestScore != null ? (
                  <span className={scoreToColor(stats.latestScore)}>{Math.round(stats.latestScore)}</span>
                ) : '—'
              }
              subtitle={stats.latestScore != null ? `${scoreToGrade(stats.latestScore)} performance` : 'Complete an interview'}
              icon={TrendingUp}
            />
            <StatCard
              title="Resume"
              value={resume ? '✓' : 'None'}
              subtitle={resume ? `${resume.fileName}` : 'Upload to personalize interviews'}
              icon={FileText}
            />
          </div>

          {/* Score trend */}
          {scoreTrend.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Score Trend
                </CardTitle>
                <CardDescription>Your performance over recent interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreTrendChart data={scoreTrend} />
              </CardContent>
            </Card>
          )}

          {/* Recent interviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>Your last {recent.length} sessions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/history">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recent.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{interview.role}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{interviewTypeLabel[interview.type] ?? interview.type}</span>
                          <span>·</span>
                          <Badge variant={difficultyColor[interview.difficulty] as any} className="text-[10px] px-1.5 py-0">
                            {interview.difficulty}
                          </Badge>
                          <span>·</span>
                          <span>{formatRelativeTime(interview.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {interview.status === 'COMPLETED' && interview.overallScore != null ? (
                        <div className={cn('text-lg font-bold', scoreToColor(interview.overallScore))}>
                          {Math.round(interview.overallScore)}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {interview.status === 'IN_PROGRESS' ? 'In Progress' : interview.status}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={
                          interview.status === 'COMPLETED'
                            ? `/interviews/${interview.id}/report`
                            : interview.status === 'IN_PROGRESS'
                            ? `/interviews/${interview.id}`
                            : `/interviews/${interview.id}`
                        }>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

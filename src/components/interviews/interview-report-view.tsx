'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, RotateCcw, Trophy, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Target, Sparkles, ChevronDown, ChevronUp,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TopicScoreChart } from '@/components/charts/topic-score-chart';
import { CategoryScoreChart } from '@/components/charts/category-score-chart';
import { cn, scoreToGrade, scoreToColor, formatDateTime, formatDate } from '@/lib/utils';

interface ActionPlanItem {
  priority: 'high' | 'medium' | 'low';
  topic: string;
  recommendation: string;
  resources?: string[];
}

interface ReportProps {
  interview: {
    id: string; type: string; role: string; difficulty: string;
    topics: string[]; totalQuestions: number;
    startedAt: string | null; completedAt: string | null; overallScore: number;
  };
  report: {
    overallScore: number; summary: string;
    categoryScores: Record<string, number>; topicScores: Record<string, number>;
    strengths: string[]; weaknesses: string[];
    actionPlan: ActionPlanItem[]; generatedAt: string;
  };
  questions: {
    id: string; sequence: number; question: string; category: string;
    difficulty: string; isFollowUp: boolean; answer: string | null;
    evaluation: {
      score: number; correctness: number; completeness: number; clarity: number;
      strengths: string[]; weaknesses: string[]; betterAnswer: string | null;
    } | null;
  }[];
}

const priorityConfig = {
  high: { label: 'High Priority', color: 'text-destructive', bg: 'bg-destructive/10', badgeVariant: 'destructive' as const },
  medium: { label: 'Medium', color: 'text-warning', bg: 'bg-warning/10', badgeVariant: 'warning' as const },
  low: { label: 'Low', color: 'text-success', bg: 'bg-success/10', badgeVariant: 'success' as const },
};

function ScoreCircle({ score }: { score: number }) {
  const grade = scoreToGrade(score);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="rotate-[-90deg]">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-black leading-none">{Math.round(score)}</div>
        <div className="text-xs text-muted-foreground mt-1">{grade}</div>
      </div>
    </div>
  );
}

function QuestionReviewItem({ q }: { q: ReportProps['questions'][0] }) {
  const [expanded, setExpanded] = React.useState(false);
  const score = q.evaluation?.score ?? 0;
  const scorePercent = score * 10;

  return (
    <Card className={cn('transition-all duration-200', expanded && 'ring-1 ring-border')}>
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              score >= 7 ? 'bg-success/10 text-success' :
              score >= 4 ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            )}>
              {score >= 7 ? <CheckCircle className="h-4 w-4" /> : score.toFixed(1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">Q{q.sequence}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{q.category}</Badge>
                {q.isFollowUp && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Follow-up</Badge>}
              </div>
              <p className="text-sm font-medium line-clamp-2">{q.question}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn('text-sm font-bold', scoreToColor(scorePercent))}>{score.toFixed(1)}/10</span>
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <div className="border-t border-border">
          <CardContent className="p-4 space-y-4">
            {q.answer && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Answer</h4>
                <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">{q.answer}</p>
              </div>
            )}

            {q.evaluation && (
              <>
                {/* Dimension scores */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Correctness', value: q.evaluation.correctness },
                    { label: 'Completeness', value: q.evaluation.completeness },
                    { label: 'Clarity', value: q.evaluation.clarity },
                  ].map((dim) => (
                    <div key={dim.label} className="text-center">
                      <div className={cn('text-lg font-bold', scoreToColor(dim.value * 10))}>{dim.value.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">{dim.label}</div>
                    </div>
                  ))}
                </div>

                {q.evaluation.strengths.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-success uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {q.evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-success mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.evaluation.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Areas to Improve
                    </h4>
                    <ul className="space-y-1">
                      {q.evaluation.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.evaluation.betterAnswer && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Brain className="h-3 w-3" /> Model Answer Guide
                    </h4>
                    <p className="text-sm leading-relaxed">{q.evaluation.betterAnswer}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
}

export function InterviewReportView({ interview, report, questions }: ReportProps) {
  const router = useRouter();

  const topicScoreData = Object.entries(report.topicScores).map(([name, score]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    score: Math.round(score),
  }));

  const categoryScoreData = Object.entries(report.categoryScores).map(([name, score]) => ({
    name,
    score: Math.round(score),
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/interviews/new">
              <RotateCcw className="mr-2 h-4 w-4" />
              New Interview
            </Link>
          </Button>
        </div>
      </div>

      {/* Score overview */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <ScoreCircle score={report.overallScore} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Interview Complete</h1>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{interview.role} · {interview.type.replace('_', ' ')} · {interview.difficulty}</p>
              <p className="text-sm leading-relaxed">{report.summary}</p>
              {interview.completedAt && (
                <p className="text-xs text-muted-foreground mt-3">
                  Completed {formatDateTime(interview.completedAt)} · {questions.filter(q => q.answer).length}/{interview.totalQuestions} questions answered
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Review</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Category scores */}
          {categoryScoreData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryScoreData.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>{cat.name}</span>
                        <span className={cn('font-semibold', scoreToColor(cat.score))}>{cat.score}/100</span>
                      </div>
                      <Progress value={cat.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topic scores chart */}
          {topicScoreData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topic Breakdown</CardTitle>
                <CardDescription>Performance by topic area</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicScoreChart data={topicScoreData} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Question Review tab */}
        <TabsContent value="questions" className="space-y-3">
          <p className="text-sm text-muted-foreground">Click on a question to expand the detailed review.</p>
          {questions.map((q) => (
            <QuestionReviewItem key={q.id} q={q} />
          ))}
        </TabsContent>

        {/* Action Plan tab */}
        <TabsContent value="action-plan" className="space-y-4">
          <p className="text-sm text-muted-foreground">Personalized improvement recommendations based on your performance.</p>
          {report.actionPlan.map((item, i) => {
            const config = priorityConfig[item.priority];
            return (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                      <Target className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{item.topic}</h3>
                        <Badge variant={config.badgeVariant as any} className="text-xs">{config.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                      {item.resources && item.resources.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Recommended Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.resources.map((r, j) => (
                              <span key={j} className="text-xs bg-muted px-2.5 py-1 rounded-full">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

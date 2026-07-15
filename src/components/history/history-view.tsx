'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatDate, scoreToColor, scoreToGrade } from '@/lib/utils';

interface Interview {
  id: string; type: string; role: string; difficulty: string; topics: string[];
  status: string; overallScore: number | null; totalQuestions: number; currentIndex: number;
  startedAt: string | null; completedAt: string | null; createdAt: string;
}

interface HistoryViewProps {
  interviews: Interview[];
}

const typeLabels: Record<string, string> = {
  hr: 'HR', technical: 'Technical', dsa: 'DSA', core_cs: 'Core CS', mixed: 'Mixed',
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  COMPLETED: { label: 'Completed', variant: 'success' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  READY: { label: 'Ready', variant: 'secondary' },
  ABANDONED: { label: 'Abandoned', variant: 'destructive' },
  EVALUATING: { label: 'Evaluating...', variant: 'secondary' },
};

export function HistoryView({ interviews }: HistoryViewProps) {
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const filtered = interviews.filter((i) => {
    const matchSearch = !search || i.role.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || i.type === filterType;
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <Brain className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No interviews yet</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">Start your first AI-powered mock interview to begin building your history.</p>
        <Button asChild>
          <Link href="/interviews/new">Start First Interview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="dsa">DSA</SelectItem>
            <SelectItem value="core_cs">Core CS</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="ABANDONED">Abandoned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} interview{filtered.length !== 1 ? 's' : ''}</p>

      {/* Interview list */}
      <div className="space-y-2">
        {filtered.map((interview) => {
          const status = statusConfig[interview.status] ?? statusConfig['READY'];
          const isCompleted = interview.status === 'COMPLETED';
          const isInProgress = interview.status === 'IN_PROGRESS';

          return (
            <div
              key={interview.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">{interview.role}</span>
                  <Badge variant="outline" className="text-xs">{typeLabels[interview.type] ?? interview.type}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{interview.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(interview.createdAt)}</span>
                  <span>·</span>
                  <span>{interview.totalQuestions} questions</span>
                  {interview.topics.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="truncate">{interview.topics.slice(0, 2).join(', ')}{interview.topics.length > 2 ? ` +${interview.topics.length - 2}` : ''}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={status.variant as any} className="text-xs">{status.label}</Badge>

                {isCompleted && interview.overallScore != null && (
                  <div className={cn('text-lg font-bold tabular-nums', scoreToColor(interview.overallScore))}>
                    {Math.round(interview.overallScore)}
                  </div>
                )}

                <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={
                    isCompleted ? `/interviews/${interview.id}/report` :
                    isInProgress ? `/interviews/${interview.id}` :
                    `/interviews/${interview.id}`
                  }>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, Loader2, Send, SkipForward, StopCircle, Mic, MicOff,
  Clock, AlertCircle, CheckCircle, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn, formatDuration } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface Question {
  id: string;
  sequence: number;
  question: string;
  category: string;
  difficulty: string;
  isFollowUp: boolean;
  answer: { id: string; answerText: string; submittedAt: string } | null;
}

interface Interview {
  id: string;
  type: string;
  role: string;
  difficulty: string;
  status: string;
  totalQuestions: number;
  currentIndex: number;
  settings: { useVoice?: boolean; totalQuestions: number };
  questions: Question[];
}

type SessionState = 'idle' | 'loading_question' | 'question_ready' | 'submitting' | 'completing';

export function InterviewSession({ interview: initialInterview }: { interview: Interview }) {
  const router = useRouter();
  const [interview, setInterview] = React.useState(initialInterview);
  const [sessionState, setSessionState] = React.useState<SessionState>('idle');
  const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(
    () => {
      const unanswered = initialInterview.questions.find((q) => !q.answer);
      return unanswered ?? initialInterview.questions[initialInterview.questions.length - 1] ?? null;
    }
  );
  const [answer, setAnswer] = React.useState('');
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [showEndDialog, setShowEndDialog] = React.useState(false);
  const [showSkipDialog, setShowSkipDialog] = React.useState(false);
  const [questionStartTime, setQuestionStartTime] = React.useState(Date.now());
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    transcript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const useVoice = interview.settings.useVoice && isSpeechSupported;
  const answeredCount = interview.questions.filter((q) => q.answer).length;
  const progress = (answeredCount / interview.totalQuestions) * 100;
  const isLastQuestion = answeredCount >= interview.totalQuestions - 1;

  // Elapsed timer
  React.useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync voice transcript to answer
  React.useEffect(() => {
    if (transcript) setAnswer(transcript);
  }, [transcript]);

  // Load first question if none exist
  React.useEffect(() => {
    if (interview.questions.length === 0) {
      loadNextQuestion();
    }
  }, []);

  const loadNextQuestion = async () => {
    setSessionState('loading_question');
    setAnswer('');
    resetTranscript();
    try {
      const res = await fetch(`/api/interviews/${interview.id}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string; done?: boolean };
        if (err.done) {
          await completeInterview();
          return;
        }
        throw new Error(err.error ?? 'Failed to load question');
      }

      const data = await res.json() as { question: Question };
      setCurrentQuestion(data.question);
      setInterview((prev) => ({
        ...prev,
        questions: [...prev.questions, data.question],
      }));
      setQuestionStartTime(Date.now());
      setSessionState('question_ready');
      textareaRef.current?.focus();
    } catch (error) {
      toast({
        title: 'Failed to load question',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setSessionState('idle');
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) {
      toast({ title: 'Empty answer', description: 'Please write or speak your answer before submitting.', variant: 'destructive' });
      return;
    }

    // Prevent double submission
    if (sessionState !== 'question_ready') return;

    setSessionState('submitting');
    stopListening();

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      const res = await fetch(`/api/interviews/${interview.id}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer.trim(),
          transcript: isListening ? transcript : undefined,
          timeSpent,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Failed to submit');
      }

      // Mark question as answered locally
      setInterview((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === currentQuestion.id
            ? { ...q, answer: { id: 'temp', answerText: answer.trim(), submittedAt: new Date().toISOString() } }
            : q
        ),
      }));

      if (isLastQuestion) {
        await completeInterview();
      } else {
        await loadNextQuestion();
      }
    } catch (error) {
      toast({
        title: 'Failed to submit answer',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setSessionState('question_ready');
    }
  };

  const completeInterview = async () => {
    setSessionState('completing');
    try {
      const res = await fetch(`/api/interviews/${interview.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Failed to generate report');
      }

      const data = await res.json() as { reportId: string };
      toast({ title: 'Interview complete!', description: 'Your report is being generated...' });
      router.push(`/interviews/${interview.id}/report`);
    } catch (error) {
      toast({
        title: 'Failed to complete interview',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setSessionState('question_ready');
    }
  };

  const skipQuestion = async () => {
    setShowSkipDialog(false);
    // Submit empty/skipped indicator
    if (currentQuestion) {
      setSessionState('submitting');
      try {
        await fetch(`/api/interviews/${interview.id}/submit-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            answerText: '[Question skipped by user]',
            timeSpent: Math.round((Date.now() - questionStartTime) / 1000),
          }),
        });

        setInterview((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === currentQuestion.id
              ? { ...q, answer: { id: 'skip', answerText: '[Skipped]', submittedAt: new Date().toISOString() } }
              : q
          ),
        }));

        if (isLastQuestion) {
          await completeInterview();
        } else {
          await loadNextQuestion();
        }
      } catch {
        setSessionState('question_ready');
      }
    }
  };

  const handleEndInterview = async () => {
    setShowEndDialog(false);
    if (answeredCount === 0) {
      // Abandon without completing
      await fetch(`/api/interviews/${interview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ABANDONED' }),
      });
      router.push('/dashboard');
    } else {
      await completeInterview();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      setAnswer('');
      startListening();
    }
  };

  const isLoading = sessionState === 'loading_question' || sessionState === 'submitting' || sessionState === 'completing';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{interview.role}</div>
              <div className="text-xs text-muted-foreground capitalize">{interview.type.replace('_', ' ')} · {interview.difficulty}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums">{formatDuration(elapsedSeconds)}</span>
            </div>
            <div className="text-sm font-medium">
              {answeredCount + (currentQuestion && !currentQuestion.answer ? 1 : 0)}/{interview.totalQuestions}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowEndDialog(true)}
              id="end-interview-btn"
            >
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              End
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Main interview area */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {/* AI Interviewer */}
        <div className="flex items-start gap-4 mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow-brand">
            <Brain className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">AI Interviewer</div>
            <Card className="border-border">
              <CardContent className="p-5">
                {sessionState === 'loading_question' ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Generating your next question...</span>
                  </div>
                ) : sessionState === 'completing' ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Generating your performance report...</span>
                  </div>
                ) : currentQuestion ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Q{currentQuestion.sequence}</Badge>
                      <Badge variant="outline" className="text-xs">{currentQuestion.category}</Badge>
                      {currentQuestion.isFollowUp && (
                        <Badge variant="info" className="text-xs">Follow-up</Badge>
                      )}
                    </div>
                    <p className="text-base font-medium leading-relaxed text-foreground animate-fade-in">
                      {currentQuestion.question}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Preparing your interview...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Answer area */}
        {(sessionState === 'question_ready' || sessionState === 'submitting') && currentQuestion && (
          <div className="flex items-start gap-4 animate-fade-in">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
              <span className="text-sm font-medium">You</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">Your Answer</div>

              {/* Voice recording indicator */}
              {isListening && (
                <div className="flex items-center gap-2 text-sm text-rose-500 animate-recording">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  Listening... speak your answer
                </div>
              )}

              <textarea
                ref={textareaRef}
                className={cn(
                  'w-full min-h-[160px] resize-none rounded-xl border bg-background px-4 py-3 text-base',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'placeholder:text-muted-foreground transition-all duration-200',
                  isListening && 'border-rose-300 focus:ring-rose-300'
                )}
                placeholder="Type your answer here, or use the microphone to speak..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isLoading}
                aria-label="Your answer"
                id="answer-textarea"
              />

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {useVoice && (
                    <Button
                      variant={isListening ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={toggleVoice}
                      disabled={isLoading}
                      id="voice-btn"
                    >
                      {isListening ? (
                        <><MicOff className="mr-1.5 h-4 w-4" />Stop</>
                      ) : (
                        <><Mic className="mr-1.5 h-4 w-4" />Speak</>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSkipDialog(true)}
                    disabled={isLoading}
                    id="skip-question-btn"
                  >
                    <SkipForward className="mr-1.5 h-4 w-4" />
                    Skip
                  </Button>
                </div>

                <Button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isLoading}
                  id="submit-answer-btn"
                >
                  {sessionState === 'submitting' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : isLastQuestion ? (
                    <><CheckCircle className="mr-2 h-4 w-4" />Submit & Finish</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Submit Answer</>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        )}

        {/* Start interview */}
        {sessionState === 'idle' && interview.questions.length === 0 && (
          <div className="flex justify-center mt-8">
            <Button size="lg" onClick={loadNextQuestion} id="start-btn">
              <Brain className="mr-2 h-5 w-5" />
              Begin Interview
            </Button>
          </div>
        )}
      </main>

      {/* End Interview Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription>
              {answeredCount > 0
                ? `You've answered ${answeredCount} of ${interview.totalQuestions} questions. Ending now will generate a partial report.`
                : 'You haven\'t answered any questions. Ending now will abandon this session.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>Continue</Button>
            <Button variant="destructive" onClick={handleEndInterview} id="confirm-end-btn">
              {answeredCount > 0 ? 'End & Generate Report' : 'Abandon Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Question Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip this question?</DialogTitle>
            <DialogDescription>
              Skipping will count as a missed question in your evaluation. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>Cancel</Button>
            <Button onClick={skipQuestion} id="confirm-skip-btn">Skip Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

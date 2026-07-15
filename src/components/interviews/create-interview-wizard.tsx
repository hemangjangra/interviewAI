'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, ArrowRight, Check, Loader2, Brain,
  Users, Code2, GitBranch, Star, Zap, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CreateInterviewSchema, type CreateInterviewInput } from '@/lib/schemas/interview.schemas';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 6;

const INTERVIEW_TYPES = [
  { value: 'hr', label: 'HR / Behavioral', description: 'Communication, teamwork, culture fit', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'technical', label: 'Technical', description: 'Role-specific engineering questions', icon: Code2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'dsa', label: 'DSA', description: 'Data structures & algorithms', icon: GitBranch, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'core_cs', label: 'Core CS', description: 'OS, DBMS, Networks, OOP', icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { value: 'mixed', label: 'Mixed', description: 'Comprehensive coverage of all topics', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10' },
] as const;

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'Data Analyst', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer',
  'QA Engineer', 'System Architect', 'Product Manager (Technical)',
];

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Student / Fresher', desc: '0-1 years, final year students' },
  { value: 'entry', label: 'Entry Level', desc: '1-2 years of experience' },
  { value: 'intermediate', label: 'Intermediate', desc: '2-5 years of experience' },
  { value: 'advanced', label: 'Advanced', desc: '5+ years of experience' },
] as const;

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', desc: 'Conceptual, definition-level questions' },
  { value: 'medium', label: 'Medium', desc: 'Application and problem-solving' },
  { value: 'hard', label: 'Hard', desc: 'Advanced, scenario-based questions' },
  { value: 'adaptive', label: 'Adaptive', desc: 'Adjusts based on your answers' },
] as const;

const TOPICS = [
  { value: 'dsa', label: 'DSA' },
  { value: 'oop', label: 'OOP' },
  { value: 'dbms', label: 'DBMS' },
  { value: 'operating_systems', label: 'OS' },
  { value: 'computer_networks', label: 'Networks' },
  { value: 'system_design', label: 'System Design' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'behavioral', label: 'Behavioral' },
] as const;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
            i + 1 < current ? 'bg-primary text-primary-foreground' :
            i + 1 === current ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
            'bg-muted text-muted-foreground'
          )}>
            {i + 1 < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={cn(
              'flex-1 h-0.5 transition-all duration-500',
              i + 1 < current ? 'bg-primary' : 'bg-muted'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function CreateInterviewWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<Partial<CreateInterviewInput>>({
    settings: {
      totalQuestions: 8,
      estimatedMinutes: 30,
      useVoice: false,
      useResumeContext: true,
    },
  });

  const [customRole, setCustomRole] = React.useState('');
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);

  const update = (data: Partial<CreateInterviewInput>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateSettings = (settings: Partial<CreateInterviewInput['settings']>) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...(prev.settings as any), ...settings },
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.type;
      case 2: return !!(formData.role || customRole);
      case 3: return !!formData.experienceLevel;
      case 4: return !!formData.difficulty;
      case 5: return selectedTopics.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 2 && customRole) {
      update({ role: customRole });
    }
    if (step === 5) {
      update({ topics: selectedTopics as any });
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleSubmit = async () => {
    const role = formData.role || customRole;
    const payload: CreateInterviewInput = {
      type: formData.type!,
      role: role!,
      experienceLevel: formData.experienceLevel!,
      difficulty: formData.difficulty!,
      topics: selectedTopics as any,
      settings: formData.settings as any,
    };

    const parsed = CreateInterviewSchema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: 'Invalid configuration', description: 'Please check all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? 'Failed to create interview');
      }

      const data = await res.json() as { interview: { id: string } };
      toast({ title: 'Interview ready!', description: 'Starting your interview session...' });
      router.push(`/interviews/${data.interview.id}`);
    } catch (error) {
      toast({ title: 'Failed to create interview', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="max-w-2xl">
      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step 1: Interview Type */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">What type of interview?</h2>
            <p className="text-muted-foreground text-sm mt-1">Choose the interview format that matches your preparation goal.</p>
          </div>
          <div className="grid gap-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => update({ type: type.value as any })}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary/40',
                  formData.type === type.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                )}
                id={`type-${type.value}`}
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', type.bg)}>
                  <type.icon className={cn('h-5 w-5', type.color)} />
                </div>
                <div>
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
                {formData.type === type.value && (
                  <Check className="ml-auto h-5 w-5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Role */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">What role are you targeting?</h2>
            <p className="text-muted-foreground text-sm mt-1">Select from common roles or enter a custom one.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => { update({ role }); setCustomRole(''); }}
                className={cn(
                  'px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all duration-150 hover:border-primary/40',
                  formData.role === role && !customRole ? 'border-primary bg-primary/5 text-primary' : 'border-border'
                )}
                id={`role-${role.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-role">Or enter a custom role</Label>
            <Input
              id="custom-role"
              placeholder="e.g. Platform Engineer, Site Reliability Engineer"
              value={customRole}
              onChange={(e) => { setCustomRole(e.target.value); if (e.target.value) update({ role: undefined }); }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Experience Level */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">What&apos;s your experience level?</h2>
            <p className="text-muted-foreground text-sm mt-1">This helps calibrate the complexity of questions.</p>
          </div>
          <div className="grid gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => update({ experienceLevel: level.value })}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary/40',
                  formData.experienceLevel === level.value ? 'border-primary bg-primary/5' : 'border-border'
                )}
                id={`level-${level.value}`}
              >
                <div>
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm text-muted-foreground">{level.desc}</div>
                </div>
                {formData.experienceLevel === level.value && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Difficulty */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Choose difficulty</h2>
            <p className="text-muted-foreground text-sm mt-1">Select a challenge level appropriate for your preparation stage.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => update({ difficulty: d.value })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary/40',
                  formData.difficulty === d.value ? 'border-primary bg-primary/5' : 'border-border'
                )}
                id={`difficulty-${d.value}`}
              >
                <div className="font-semibold">{d.label}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Topics */}
      {step === 5 && (
        <div className="space-y-4 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Select topics</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Choose one or more topics to be covered ({selectedTopics.length} selected).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.value}
                onClick={() => toggleTopic(topic.value)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-150',
                  selectedTopics.includes(topic.value)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/40'
                )}
                id={`topic-${topic.value}`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 6: Settings */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Interview settings</h2>
            <p className="text-muted-foreground text-sm mt-1">Customize your session parameters.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="num-questions">Number of questions: {formData.settings?.totalQuestions}</Label>
              <input
                id="num-questions"
                type="range" min={3} max={20}
                value={formData.settings?.totalQuestions ?? 8}
                onChange={(e) => updateSettings({ totalQuestions: parseInt(e.target.value), estimatedMinutes: parseInt(e.target.value) * 4 })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 (Quick)</span><span>10 (Standard)</span><span>20 (Full)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <Label htmlFor="use-resume">Use resume context</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Questions tailored to your resume (if uploaded)</p>
              </div>
              <Switch
                id="use-resume"
                checked={formData.settings?.useResumeContext ?? true}
                onCheckedChange={(checked) => updateSettings({ useResumeContext: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <Label htmlFor="use-voice">Voice mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Speak your answers using the microphone</p>
              </div>
              <Switch
                id="use-voice"
                checked={formData.settings?.useVoice ?? false}
                onCheckedChange={(checked) => updateSettings({ useVoice: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-company">Target company (optional)</Label>
              <Input
                id="target-company"
                placeholder="e.g. Google, Amazon, TCS, Infosys"
                value={(formData.settings as any)?.targetCompany ?? ''}
                onChange={(e) => updateSettings({ targetCompany: e.target.value })}
              />
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">Interview Summary</h3>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{INTERVIEW_TYPES.find(t => t.value === formData.type)?.label}</span>
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{formData.role || customRole}</span>
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">{EXPERIENCE_LEVELS.find(l => l.value === formData.experienceLevel)?.label}</span>
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{formData.difficulty}</span>
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{formData.settings?.totalQuestions}</span>
                <span className="text-muted-foreground">Topics</span>
                <span className="font-medium">{selectedTopics.length} selected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={handleNext} disabled={!canProceed()} id="next-step-btn">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()} id="start-interview-btn">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
            ) : (
              <><Brain className="mr-2 h-4 w-4" />Start Interview</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import {
  Brain,
  ArrowRight,
  Sparkles,
  Mic,
  BarChart2,
  FileText,
  MessageSquare,
  Target,
  CheckCircle,
  Star,
  Zap,
  Code2,
  Users,
  Database,
  Cpu,
  Globe,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Sparkles,
    title: 'Personalized Interviews',
    description: 'Configure interview type, role, experience level, difficulty, and topics to match your target company.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: FileText,
    title: 'Resume-Aware Questions',
    description: 'Upload your resume and get questions tailored to your skills, projects, and experience.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Intelligent Follow-ups',
    description: 'The AI digs deeper with follow-up questions based on your actual answers.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Mic,
    title: 'Voice Practice',
    description: 'Practice speaking your answers aloud with speech-to-text support.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Target,
    title: 'Detailed Feedback',
    description: 'Get per-question scores, strength/weakness analysis, and a model answer after each session.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: BarChart2,
    title: 'Progress Analytics',
    description: 'Track your score trends, topic performance, and improvement over multiple sessions.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
];

const steps = [
  {
    step: '01',
    title: 'Upload Resume & Set Up',
    description: 'Upload your resume and complete your profile. InterviewAI analyzes your skills and experience.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Configure Your Interview',
    description: 'Choose the interview type, role, difficulty, and topics. Set the number of questions and duration.',
    icon: Target,
  },
  {
    step: '03',
    title: 'Practice With AI',
    description: 'Answer questions one by one. The AI asks intelligent follow-ups based on your responses.',
    icon: MessageSquare,
  },
  {
    step: '04',
    title: 'Review & Improve',
    description: 'Get a detailed report with scores, feedback, and a personalized action plan to improve.',
    icon: BarChart2,
  },
];

const categories = [
  { icon: Users, label: 'HR & Behavioral', count: '50+ questions' },
  { icon: Code2, label: 'Technical', count: 'Role-specific' },
  { icon: GitBranch, label: 'DSA', count: 'All patterns' },
  { icon: Star, label: 'OOP Concepts', count: 'Core principles' },
  { icon: Database, label: 'DBMS', count: 'SQL to NoSQL' },
  { icon: Cpu, label: 'Operating Systems', count: 'Processes & Memory' },
  { icon: Globe, label: 'Computer Networks', count: 'OSI to Security' },
  { icon: Zap, label: 'System Design', count: 'Scale ready' },
];

const stats = [
  { value: '8+', label: 'Interview Types' },
  { value: '20+', label: 'Target Roles' },
  { value: '500+', label: 'Practice Questions' },
  { value: '4', label: 'Difficulty Levels' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl px-4 text-center">
          <Badge variant="secondary" className="mb-6 inline-flex gap-1.5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">AI-Powered Interview Practice</span>
          </Badge>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
            Practice interviews.{' '}
            <span className="text-gradient">Get intelligent feedback.</span>{' '}
            Get job-ready.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            InterviewAI simulates realistic technical and HR interviews tailored to your resume, role, and target companies. 
            Get detailed feedback on every answer and track your progress over time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="group">
              <Link href="/signup">
                Start Practicing Free
                <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to ace your interviews</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Not just a question bank — a complete interview preparation system powered by AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-border hover:shadow-card-hover transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} mb-4 transition-transform group-hover:scale-110`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Process</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">From setup to job offer in 4 steps</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Get started in minutes. No credit card required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-black text-primary/20 leading-none">{step.step}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERVIEW CATEGORIES ───────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Categories</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Practice every interview type</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From HR behavioral questions to advanced system design — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href="/signup"
                className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-300 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{cat.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{cat.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="rounded-2xl border border-border bg-card p-12 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
              <Brain className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to get job-ready?</h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Start your first AI-powered mock interview today. 
              It&apos;s free to begin — no credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" asChild className="group">
                <Link href="/signup">
                  Start Your First Interview
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {['No credit card', 'Free to start', 'AI-powered', 'Instant feedback'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

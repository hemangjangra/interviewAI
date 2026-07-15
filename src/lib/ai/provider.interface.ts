import type {
  GeneratedQuestion,
  AnswerEvaluation,
  InterviewPlan,
  InterviewReport,
  ResumeAnalysis,
  CreateInterviewInput,
} from '@/lib/schemas/interview.schemas';

// ============================================================
// CONTEXT TYPES
// ============================================================

export interface QuestionContext {
  interviewConfig: CreateInterviewInput;
  previousQuestions: Array<{ question: string; category: string }>;
  previousAnswers: Array<{ question: string; answer: string }>;
  resumeSummary?: string;
  questionNumber: number;
  totalQuestions: number;
  interviewPlan: InterviewPlan;
}

export interface FollowUpContext extends QuestionContext {
  lastQuestion: string;
  lastAnswer: string;
  lastEvaluation: AnswerEvaluation;
  followUpFocus?: string;
}

export interface EvaluationContext {
  question: string;
  expectedConcepts: string[];
  answer: string;
  interviewType: string;
  difficulty: string;
  role: string;
}

export interface ReportContext {
  interviewConfig: CreateInterviewInput;
  questions: Array<{
    question: string;
    category: string;
    difficulty: string;
  }>;
  answers: Array<{
    question: string;
    answer: string;
    evaluation: AnswerEvaluation;
  }>;
  resumeSummary?: string;
}

// ============================================================
// AI PROVIDER INTERFACE
// ============================================================

export interface AIProvider {
  readonly name: string;
  readonly isDemoMode: boolean;

  analyzeResume(
    extractedText: string,
    fileName: string
  ): Promise<ResumeAnalysis>;

  generateInterviewPlan(config: CreateInterviewInput): Promise<InterviewPlan>;

  generateQuestion(context: QuestionContext): Promise<GeneratedQuestion>;

  generateFollowUp(context: FollowUpContext): Promise<GeneratedQuestion>;

  evaluateAnswer(context: EvaluationContext): Promise<AnswerEvaluation>;

  generateFinalReport(context: ReportContext): Promise<InterviewReport>;
}

// ============================================================
// PROVIDER ERROR TYPES
// ============================================================

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class AIParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string
  ) {
    super(message);
    this.name = 'AIParseError';
  }
}

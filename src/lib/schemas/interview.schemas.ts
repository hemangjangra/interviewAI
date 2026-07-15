import { z } from 'zod';

// ============================================================
// INTERVIEW CONFIGURATION SCHEMAS
// ============================================================

export const InterviewTypeSchema = z.enum([
  'hr',
  'technical',
  'dsa',
  'core_cs',
  'mixed',
]);

export const ExperienceLevelSchema = z.enum([
  'fresher',
  'entry',
  'intermediate',
  'advanced',
]);

export const DifficultySchema = z.enum(['easy', 'medium', 'hard', 'adaptive']);

export const InterviewTopicSchema = z.enum([
  'dsa',
  'oop',
  'dbms',
  'operating_systems',
  'computer_networks',
  'system_design',
  'javascript',
  'typescript',
  'react',
  'nodejs',
  'python',
  'java',
  'sql',
  'behavioral',
  'problem_solving',
  'leadership',
  'teamwork',
]);

export const InterviewSettingsSchema = z.object({
  totalQuestions: z.number().int().min(3).max(20).default(8),
  estimatedMinutes: z.number().int().min(10).max(90).default(30),
  useVoice: z.boolean().default(false),
  useResumeContext: z.boolean().default(true),
  targetCompany: z.string().max(100).optional(),
  targetCompanyStyle: z.string().max(200).optional(),
});

export const CreateInterviewSchema = z.object({
  type: InterviewTypeSchema,
  role: z.string().min(2).max(100),
  experienceLevel: ExperienceLevelSchema,
  difficulty: DifficultySchema,
  topics: z.array(InterviewTopicSchema).min(1).max(10),
  settings: InterviewSettingsSchema,
});

// ============================================================
// AI GENERATED QUESTION SCHEMA
// ============================================================

export const GeneratedQuestionSchema = z.object({
  question: z.string().min(10).max(2000),
  category: z.string().max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  expectedConcepts: z.array(z.string()).default([]),
  hints: z.array(z.string()).default([]),
  isFollowUp: z.boolean().default(false),
  followUpContext: z.string().optional(),
});

// ============================================================
// ANSWER EVALUATION SCHEMA
// ============================================================

export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(10),
  correctness: z.number().min(0).max(10),
  completeness: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  missingConcepts: z.array(z.string()),
  internalNotes: z.string(),
  betterAnswer: z.string().optional(),
  followUpRecommended: z.boolean().default(false),
  suggestedFollowUpFocus: z.string().optional(),
});

// ============================================================
// INTERVIEW PLAN SCHEMA
// ============================================================

export const InterviewPlanSchema = z.object({
  overview: z.string(),
  questionCategories: z.array(
    z.object({
      category: z.string(),
      count: z.number().int().min(1),
      topics: z.array(z.string()),
    })
  ),
  focusAreas: z.array(z.string()),
  estimatedDifficultyCurve: z.array(z.enum(['easy', 'medium', 'hard'])),
});

// ============================================================
// FINAL REPORT SCHEMA
// ============================================================

export const ActionPlanItemSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  topic: z.string(),
  recommendation: z.string(),
  resources: z.array(z.string()).optional(),
});

export const InterviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(50).max(2000),
  categoryScores: z.record(z.string(), z.number().min(0).max(100)),
  topicScores: z.record(z.string(), z.number().min(0).max(100)),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  actionPlan: z.array(ActionPlanItemSchema),
  recommendedNextDifficulty: z.enum(['easy', 'medium', 'hard']),
});

// ============================================================
// RESUME ANALYSIS SCHEMA
// ============================================================

export const ResumeAnalysisSchema = z.object({
  summary: z.string(),
  programmingLanguages: z.array(z.string()),
  frameworks: z.array(z.string()),
  tools: z.array(z.string()),
  databases: z.array(z.string()),
  skills: z.array(z.string()),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      year: z.string().optional(),
      cgpa: z.string().optional(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      duration: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    })
  ),
  certifications: z.array(z.string()),
  likelyInterviewTopics: z.array(z.string()),
  experienceLevel: z.enum(['fresher', 'entry', 'intermediate', 'advanced']),
  targetRoles: z.array(z.string()),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type InterviewType = z.infer<typeof InterviewTypeSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type InterviewTopic = z.infer<typeof InterviewTopicSchema>;
export type InterviewSettings = z.infer<typeof InterviewSettingsSchema>;
export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;
export type InterviewPlan = z.infer<typeof InterviewPlanSchema>;
export type InterviewReport = z.infer<typeof InterviewReportSchema>;
export type ActionPlanItem = z.infer<typeof ActionPlanItemSchema>;
export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

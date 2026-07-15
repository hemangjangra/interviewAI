/**
 * Mock AI Provider — deterministic responses for development/demo mode.
 * Used when AI_PROVIDER=mock or no API key is configured.
 * Never shows fake data as real AI responses.
 */
import type { AIProvider, QuestionContext, FollowUpContext, EvaluationContext, ReportContext } from './provider.interface';
import type {
  GeneratedQuestion,
  AnswerEvaluation,
  InterviewPlan,
  InterviewReport,
  ResumeAnalysis,
  CreateInterviewInput,
} from '@/lib/schemas/interview.schemas';

const MOCK_QUESTIONS: Record<string, string[]> = {
  dsa: [
    'Explain the difference between a stack and a queue, and give a real-world use case for each.',
    'What is the time complexity of binary search, and when can you use it?',
    'Explain how a hash map works internally. What happens during a collision?',
    'What is dynamic programming? Give an example of a problem that benefits from it.',
    'Explain the difference between BFS and DFS graph traversal.',
  ],
  oop: [
    'Explain the four pillars of object-oriented programming with examples.',
    'What is the difference between method overloading and method overriding?',
    'What is the SOLID principle? Explain the Single Responsibility Principle.',
    'What is the difference between an abstract class and an interface?',
    'Explain the Liskov Substitution Principle with a concrete example.',
  ],
  dbms: [
    'What is normalization? Explain 1NF, 2NF, and 3NF with examples.',
    'What is the difference between INNER JOIN and LEFT JOIN?',
    'Explain ACID properties in database transactions.',
    'What is an index in a database, and how does it improve query performance?',
    'What is the difference between a clustered and a non-clustered index?',
  ],
  operating_systems: [
    'Explain the difference between a process and a thread.',
    'What is deadlock? What are the four conditions for deadlock?',
    'Explain the concept of virtual memory and paging.',
    'What is a semaphore, and how is it used for process synchronization?',
    'Explain the differences between preemptive and non-preemptive scheduling.',
  ],
  computer_networks: [
    'Explain the OSI model and the function of each layer.',
    'What is the difference between TCP and UDP? When would you use each?',
    'Explain how DNS resolution works step by step.',
    'What is the three-way handshake in TCP?',
    'What is the difference between HTTP and HTTPS?',
  ],
  behavioral: [
    'Tell me about yourself and why you are interested in this role.',
    'Describe a challenging technical problem you solved. What was your approach?',
    'Tell me about a time you worked in a team with conflict. How did you handle it?',
    'What is your greatest technical strength, and how have you applied it?',
    'Where do you see yourself in five years?',
  ],
  javascript: [
    'Explain the difference between var, let, and const in JavaScript.',
    'What is the event loop in JavaScript, and how does it handle asynchronous code?',
    'What is closure in JavaScript? Give a practical example.',
    'Explain prototypal inheritance in JavaScript.',
    'What is the difference between == and === in JavaScript?',
  ],
  system_design: [
    'How would you design a URL shortening service like bit.ly?',
    'Explain horizontal scaling vs vertical scaling. When would you choose each?',
    'What is a CDN, and how does it improve application performance?',
    'How would you design a rate limiter for an API?',
    'Explain the CAP theorem and its implications for distributed systems.',
  ],
};

const MOCK_FOLLOW_UPS: string[] = [
  'Can you elaborate on that with a concrete example?',
  'What would be the time/space complexity implications of your approach?',
  'How would your approach change in a production environment at scale?',
  'What are the trade-offs of the solution you described?',
  'Can you think of any edge cases that might break this approach?',
];

export class MockAIProvider implements AIProvider {
  readonly name = 'Mock (Demo Mode)';
  readonly isDemoMode = true;

  private getQuestionsByTopic(topics: string[]): string[] {
    const questions: string[] = [];
    for (const topic of topics) {
      const topicQuestions = MOCK_QUESTIONS[topic] ?? MOCK_QUESTIONS['behavioral'] ?? [];
      questions.push(...topicQuestions);
    }
    // Shuffle and deduplicate
    return [...new Set(questions)].sort(() => Math.random() - 0.5);
  }

  async analyzeResume(extractedText: string, fileName: string): Promise<ResumeAnalysis> {
    // Simulate processing delay
    await this.mockDelay(800);

    return {
      summary: '[DEMO MODE] This resume analysis is simulated. Connect a real AI provider (GEMINI_API_KEY) to get actual resume analysis.',
      programmingLanguages: ['Python', 'Java', 'JavaScript', 'TypeScript'],
      frameworks: ['React', 'Node.js', 'Spring Boot', 'Django'],
      tools: ['Git', 'Docker', 'VS Code', 'Postman'],
      databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
      skills: ['REST APIs', 'Microservices', 'Agile', 'CI/CD', 'Problem Solving'],
      education: [
        {
          institution: 'Example University',
          degree: 'B.Tech',
          field: 'Computer Science Engineering',
          year: '2024',
          cgpa: '8.5',
        },
      ],
      experience: [],
      projects: [
        {
          name: 'Sample E-Commerce Platform',
          description: 'Full-stack web application with React frontend and Node.js backend',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        },
      ],
      certifications: [],
      likelyInterviewTopics: ['dsa', 'oop', 'dbms', 'javascript', 'system_design'],
      experienceLevel: 'fresher',
      targetRoles: ['Software Engineer', 'Full-Stack Developer', 'Backend Developer'],
    };
  }

  async generateInterviewPlan(config: CreateInterviewInput): Promise<InterviewPlan> {
    await this.mockDelay(600);

    const topicCounts = Math.ceil(config.settings.totalQuestions / config.topics.length);

    return {
      overview: `[DEMO MODE] ${config.settings.totalQuestions}-question ${config.type} interview for ${config.role} at ${config.difficulty} difficulty.`,
      questionCategories: config.topics.map((topic) => ({
        category: topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count: Math.max(1, topicCounts),
        topics: [topic],
      })),
      focusAreas: config.topics.map((t) => t.replace(/_/g, ' ')),
      estimatedDifficultyCurve: Array.from(
        { length: config.settings.totalQuestions },
        (_, i) => {
          if (i < config.settings.totalQuestions * 0.3) return 'easy';
          if (i < config.settings.totalQuestions * 0.7) return 'medium';
          return 'hard';
        }
      ) as Array<'easy' | 'medium' | 'hard'>,
    };
  }

  async generateQuestion(context: QuestionContext): Promise<GeneratedQuestion> {
    await this.mockDelay(700);

    const allQuestions = this.getQuestionsByTopic(context.interviewConfig.topics);
    const usedQuestions = new Set(context.previousQuestions.map((q) => q.question));

    const availableQuestion =
      allQuestions.find((q) => !usedQuestions.has(q)) ??
      `[DEMO] Explain a key concept related to ${context.interviewConfig.topics[0] ?? 'software engineering'}.`;

    const topicIndex = context.questionNumber % context.interviewConfig.topics.length;
    const category = context.interviewConfig.topics[topicIndex] ?? 'general';

    return {
      question: availableQuestion,
      category: category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      difficulty: context.questionNumber < 2 ? 'easy' : context.questionNumber < 5 ? 'medium' : 'hard',
      expectedConcepts: ['Core concept understanding', 'Practical application', 'Edge case awareness'],
      hints: [],
      isFollowUp: false,
    };
  }

  async generateFollowUp(context: FollowUpContext): Promise<GeneratedQuestion> {
    await this.mockDelay(600);

    const followUp = MOCK_FOLLOW_UPS[context.questionNumber % MOCK_FOLLOW_UPS.length]!;

    return {
      question: followUp,
      category: 'Follow-up',
      difficulty: context.interviewConfig.difficulty === 'easy' ? 'easy' : 'medium',
      expectedConcepts: ['Deeper understanding', 'Examples', 'Trade-offs'],
      hints: [],
      isFollowUp: true,
      followUpContext: context.lastQuestion,
    };
  }

  async evaluateAnswer(context: EvaluationContext): Promise<AnswerEvaluation> {
    await this.mockDelay(1000);

    const wordCount = context.answer.trim().split(/\s+/).length;
    const hasContent = wordCount > 20;
    const baseScore = hasContent ? 6.5 : 3.0;
    const lengthBonus = Math.min(2.0, wordCount / 100);
    const finalScore = Math.min(9.5, baseScore + lengthBonus);

    return {
      score: Number(finalScore.toFixed(1)),
      correctness: Number((finalScore * 1.0).toFixed(1)),
      completeness: Number((finalScore * 0.95).toFixed(1)),
      clarity: Number((finalScore * 1.05).toFixed(1)),
      strengths: hasContent
        ? ['Provided a structured response', 'Demonstrated awareness of the topic']
        : ['Attempted to answer the question'],
      missingConcepts: hasContent
        ? ['Could provide more concrete examples', 'Consider discussing trade-offs']
        : ['Answer needs more depth', 'Include specific examples', 'Cover key concepts'],
      internalNotes: '[DEMO MODE] This evaluation is simulated. Add a real AI API key for accurate assessment.',
      betterAnswer: 'A complete answer would cover the core concepts, provide a real-world example, discuss trade-offs, and mention any edge cases.',
      followUpRecommended: wordCount < 50,
      suggestedFollowUpFocus: wordCount < 50 ? 'Ask for more detail and examples' : undefined,
    };
  }

  async generateFinalReport(context: ReportContext): Promise<InterviewReport> {
    await this.mockDelay(1500);

    const avgScore =
      context.answers.length > 0
        ? (context.answers.reduce((sum, a) => sum + a.evaluation.score, 0) / context.answers.length) * 10
        : 65;

    const topicScores: Record<string, number> = {};
    for (const topic of context.interviewConfig.topics) {
      topicScores[topic.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())] =
        Math.round(40 + Math.random() * 50);
    }

    return {
      overallScore: Math.round(Math.min(100, avgScore)),
      summary: '[DEMO MODE] This report is simulated. To get an accurate AI-generated report, add a GEMINI_API_KEY to your .env.local file.',
      categoryScores: {
        'Technical Accuracy': Math.round(avgScore * 0.9),
        'Conceptual Understanding': Math.round(avgScore * 0.95),
        Communication: Math.round(avgScore * 1.05),
        Clarity: Math.round(avgScore),
        'Problem Solving': Math.round(avgScore * 0.92),
      },
      topicScores,
      strengths: [
        'Showed willingness to engage with difficult questions',
        'Demonstrated foundational knowledge in key areas',
        'Structured answers clearly',
      ],
      weaknesses: [
        'Can provide more concrete examples from experience',
        'Some answers need more depth on edge cases',
        'Technical precision can be improved',
      ],
      actionPlan: [
        {
          priority: 'high' as const,
          topic: 'Practice Coding Problems',
          recommendation: 'Solve 2-3 DSA problems daily on LeetCode/HackerRank. Focus on arrays, strings, and trees.',
          resources: ['LeetCode Blind 75', 'NeetCode.io', 'GeeksForGeeks'],
        },
        {
          priority: 'medium' as const,
          topic: 'System Design',
          recommendation: 'Study common system design patterns and practice designing systems like URL shorteners, chat apps.',
          resources: ['System Design Primer (GitHub)', 'Designing Data-Intensive Applications'],
        },
        {
          priority: 'low' as const,
          topic: 'Communication Skills',
          recommendation: 'Practice explaining technical concepts out loud. Use the STAR method for behavioral questions.',
          resources: ['Pramp.com for mock interviews', 'The Complete Interview Guide'],
        },
      ],
      recommendedNextDifficulty: avgScore > 75 ? 'hard' : avgScore > 55 ? 'medium' : 'easy',
    };
  }

  private mockDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * SQLite JSON helpers for serializing/deserializing arrays and objects
 * stored as JSON strings in SQLite (which lacks native array/JSON support).
 * 
 * These are no-ops in production PostgreSQL (handled natively by Prisma).
 * 
 * IMPORTANT: When migrating to PostgreSQL, remove these helpers and use
 * native Prisma JSON/Array types in the schema.
 */

export function serializeArray(arr: string[] | undefined | null): string {
  if (!arr) return '[]';
  return JSON.stringify(arr);
}

export function deserializeArray(str: string | undefined | null): string[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeJson<T>(obj: T): string {
  return JSON.stringify(obj ?? null);
}

export function deserializeJson<T>(str: string | undefined | null, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Parses an Interview row from SQLite format to application format.
 */
export function parseInterview(raw: any) {
  return {
    ...raw,
    topics: deserializeArray(raw.topics),
    settings: deserializeJson(raw.settings, {}),
  };
}

/**
 * Parses an InterviewReport row from SQLite format to application format.
 */
export function parseReport(raw: any) {
  return {
    ...raw,
    strengths: deserializeArray(raw.strengths),
    weaknesses: deserializeArray(raw.weaknesses),
    categoryScores: deserializeJson(raw.categoryScores, {}),
    topicScores: deserializeJson(raw.topicScores, {}),
    actionPlan: deserializeJson(raw.actionPlan, []),
  };
}

/**
 * Parses an AnswerEvaluation row from SQLite format to application format.
 */
export function parseEvaluation(raw: any) {
  if (!raw) return null;
  return {
    ...raw,
    strengths: deserializeArray(raw.strengths),
    weaknesses: deserializeArray(raw.weaknesses),
  };
}

/**
 * Parses Resume.structuredData from JSON string to object.
 */
export function parseResumeData(raw: any) {
  if (!raw) return null;
  return {
    ...raw,
    structuredData: deserializeJson(raw.structuredData, null),
  };
}

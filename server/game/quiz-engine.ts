import { z } from "zod";

export const quizModeSchema = z.enum(["know", "bluff", "chain", "boss", "world"]);
export type QuizMode = z.infer<typeof quizModeSchema>;

export const difficultySchema = z.enum(["easy", "medium", "hard", "boss"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const publicAnswerSchema = z.object({ id: z.string().min(1).max(32), text: z.string().min(1).max(500) });
export const questionRowSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  difficulty: difficultySchema,
  question: z.string().min(1),
  answers: z.array(publicAnswerSchema).min(2).max(6),
  time_limit_ms: z.number().int().positive(),
  explanation: z.string().default(""),
});

export type PublicQuestion = {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  answers: Array<{ id: string; text: string }>;
  timeLimitMs: number;
  sequence: number;
  sessionId: string;
  expiresAt: string;
};

export function toPublicQuestion(row: unknown, sessionId: string, sequence: number, expiresAt: string): PublicQuestion {
  const question = questionRowSchema.parse(row);
  return {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    question: question.question,
    answers: question.answers,
    timeLimitMs: question.time_limit_ms,
    sequence,
    sessionId,
    expiresAt,
  };
}

export function questionCountFor(mode: QuizMode): number {
  switch (mode) {
    case "boss":
    case "world":
      return 1;
    case "know":
      return 5;
    case "bluff":
    case "chain":
      return 5;
  }
}

export function sessionDurationMs(mode: QuizMode, questionCount: number): number {
  const perQuestion = mode === "boss" ? 10_000 : 25_000;
  return Math.max(30_000, questionCount * perQuestion + 10_000);
}

export function safeClientResponseMs(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(Math.round(value), 120_000));
}

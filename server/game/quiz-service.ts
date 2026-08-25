import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSupabaseServerClient, type GameQuestPlayer } from "../supabase";
import { questionCountFor, quizModeSchema, safeClientResponseMs, sessionDurationMs, toPublicQuestion, type PublicQuestion, type QuizMode } from "./quiz-engine";

const startSchema = z.object({ mode: quizModeSchema });
const answerSchema = z.object({
  sessionId: z.string().uuid(),
  answerId: z.string().min(1).max(32),
  clientResponseMs: z.number().finite().optional(),
});

type QuestionRow = {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "boss";
  question: string;
  answers: Array<{ id: string; text: string }>;
  time_limit_ms: number;
  explanation?: string;
};

type SessionRow = {
  id: string;
  mode: QuizMode;
  question_ids: string[];
  current_index: number;
  nonce: string;
  expires_at: string;
};

function asQuestionRows(value: unknown): QuestionRow[] {
  return z.array(z.object({
    id: z.string().uuid(),
    category: z.string(),
    difficulty: z.enum(["easy", "medium", "hard", "boss"]),
    question: z.string(),
    answers: z.array(z.object({ id: z.string(), text: z.string() })),
    time_limit_ms: z.number().int(),
    explanation: z.string().optional(),
  })).parse(value) as QuestionRow[];
}

async function nextPublicQuestion(session: SessionRow): Promise<PublicQuestion | null> {
  const questionId = session.question_ids[session.current_index];
  if (!questionId) return null;
  const { data, error } = await getSupabaseServerClient()
    .from("qm_questions")
    .select("id,category,difficulty,question,answers,time_limit_ms,explanation")
    .eq("id", questionId)
    .eq("active", true)
    .single();
  if (error || !data) throw new Error("QUESTION_NOT_AVAILABLE");
  return toPublicQuestion(data, session.id, session.current_index, session.expires_at);
}

export async function startQuiz(player: GameQuestPlayer, rawInput: unknown) {
  const { mode } = startSchema.parse(rawInput);
  const count = questionCountFor(mode);
  const supabase = getSupabaseServerClient();
  const { data: questions, error: questionError } = await supabase
    .from("qm_questions")
    .select("id,category,difficulty,question,answers,time_limit_ms,explanation")
    .eq("active", true)
    .eq("season", "alpha-1")
    .order("difficulty", { ascending: true })
    .order("id", { ascending: true })
    .limit(count);
  if (questionError) throw new Error(questionError.message);
  const safeRows = asQuestionRows(questions ?? []);
  if (safeRows.length < count) throw new Error("QUIZ_POOL_UNAVAILABLE");

  const expiresAt = new Date(Date.now() + sessionDurationMs(mode, safeRows.length)).toISOString();
  const { data: created, error: sessionError } = await supabase.rpc("qm_start_quiz_session", {
    p_player_id: player.id,
    p_mode: mode,
    p_question_ids: safeRows.map(question => question.id),
    p_nonce: randomUUID(),
    p_expires_at: expiresAt,
  });
  if (sessionError || !created) throw new Error(sessionError?.message ?? "QUIZ_SESSION_CREATE_FAILED");

  const payload = created as { sessionId: string; mode: QuizMode; nonce: string; expiresAt: string; energy: number };
  const session: SessionRow = {
    id: payload.sessionId,
    mode: payload.mode,
    question_ids: safeRows.map(question => question.id),
    current_index: 0,
    nonce: payload.nonce,
    expires_at: payload.expiresAt,
  };
  return {
    session: {
      id: session.id,
      mode: session.mode,
      expiresAt: session.expires_at,
      questionCount: safeRows.length,
      energy: payload.energy,
    },
    question: await nextPublicQuestion(session),
  };
}

export async function submitQuizAnswer(player: GameQuestPlayer, rawInput: unknown) {
  const input = answerSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data: session, error: sessionError } = await supabase
    .from("qm_question_sessions")
    .select("id,mode,question_ids,current_index,nonce,expires_at")
    .eq("id", input.sessionId)
    .eq("player_id", player.id)
    .single();
  if (sessionError || !session) throw new Error("QUIZ_SESSION_NOT_FOUND");

  const { data: result, error } = await supabase.rpc("qm_submit_answer", {
    p_session_id: input.sessionId,
    p_player_id: player.id,
    p_answer_id: input.answerId,
    p_client_response_ms: safeClientResponseMs(input.clientResponseMs),
  });
  if (error || !result) throw new Error(error?.message ?? "QUIZ_ANSWER_FAILED");
  const resolved = result as {
    duplicate: boolean;
    correct: boolean;
    qcAwarded: number;
    xpAwarded: number;
    mindScoreAwarded: number;
    combo: number;
    sequence: number;
    sessionCompleted: boolean;
    explanation?: string;
    serverResponseMs?: number;
    fraudScore?: number;
  };

  let nextQuestion: PublicQuestion | null = null;
  if (!resolved.sessionCompleted) {
    const { data: nextSession, error: nextSessionError } = await supabase
      .from("qm_question_sessions")
      .select("id,mode,question_ids,current_index,nonce,expires_at")
      .eq("id", input.sessionId)
      .single();
    if (nextSessionError || !nextSession) throw new Error("QUIZ_SESSION_NOT_FOUND");
    nextQuestion = await nextPublicQuestion(nextSession as SessionRow);
  }

  return {
    sessionId: input.sessionId,
    mode: session.mode,
    duplicate: resolved.duplicate,
    result: {
      correct: resolved.correct,
      qcAwarded: resolved.qcAwarded,
      xpAwarded: resolved.xpAwarded,
      mindScoreAwarded: resolved.mindScoreAwarded,
      combo: resolved.combo,
      sequence: resolved.sequence,
      explanation: resolved.explanation ?? "",
      serverResponseMs: resolved.serverResponseMs ?? null,
      fraudScore: resolved.fraudScore ?? 0,
      sessionCompleted: resolved.sessionCompleted,
    },
    question: nextQuestion,
  };
}

// server/game/quiz-service.ts
import { randomUUID } from "node:crypto";
import { z as z2 } from "zod";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// server/game/quiz-engine.ts
import { z } from "zod";
var quizModeSchema = z.enum(["know", "bluff", "chain", "boss", "world"]);
var difficultySchema = z.enum(["easy", "medium", "hard", "boss"]);
var publicAnswerSchema = z.object({ id: z.string().min(1).max(32), text: z.string().min(1).max(500) });
var questionRowSchema = z.object({
  id: z.string().uuid(),
  category: z.string().min(1),
  difficulty: difficultySchema,
  question: z.string().min(1),
  answers: z.array(publicAnswerSchema).min(2).max(6),
  time_limit_ms: z.number().int().positive(),
  explanation: z.string().default("")
});
function toPublicQuestion(row, sessionId, sequence, expiresAt) {
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
    expiresAt
  };
}
function questionCountFor(mode) {
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
function sessionDurationMs(mode, questionCount) {
  const perQuestion = mode === "boss" ? 1e4 : 25e3;
  return Math.max(3e4, questionCount * perQuestion + 1e4);
}
function safeClientResponseMs(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(Math.round(value), 12e4));
}

// server/game/quiz-service.ts
var startSchema = z2.object({ mode: quizModeSchema });
var answerSchema = z2.object({
  sessionId: z2.string().uuid(),
  answerId: z2.string().min(1).max(32),
  clientResponseMs: z2.number().finite().optional()
});
function asQuestionRows(value) {
  return z2.array(z2.object({
    id: z2.string().uuid(),
    category: z2.string(),
    difficulty: z2.enum(["easy", "medium", "hard", "boss"]),
    question: z2.string(),
    answers: z2.array(z2.object({ id: z2.string(), text: z2.string() })),
    time_limit_ms: z2.number().int(),
    explanation: z2.string().optional()
  })).parse(value);
}
async function nextPublicQuestion(session) {
  const questionId = session.question_ids[session.current_index];
  if (!questionId) return null;
  const { data, error } = await getSupabaseServerClient().from("qm_questions").select("id,category,difficulty,question,answers,time_limit_ms,explanation").eq("id", questionId).eq("active", true).single();
  if (error || !data) throw new Error("QUESTION_NOT_AVAILABLE");
  return toPublicQuestion(data, session.id, session.current_index, session.expires_at);
}
async function startQuiz(player, rawInput) {
  const { mode } = startSchema.parse(rawInput);
  const count = questionCountFor(mode);
  const supabase = getSupabaseServerClient();
  const { data: questions, error: questionError } = await supabase.from("qm_questions").select("id,category,difficulty,question,answers,time_limit_ms,explanation").eq("active", true).eq("season", "alpha-1").order("difficulty", { ascending: true }).order("id", { ascending: true }).limit(count);
  if (questionError) throw new Error(questionError.message);
  const safeRows = asQuestionRows(questions ?? []);
  if (safeRows.length < count) throw new Error("QUIZ_POOL_UNAVAILABLE");
  const expiresAt = new Date(Date.now() + sessionDurationMs(mode, safeRows.length)).toISOString();
  const { data: created, error: sessionError } = await supabase.rpc("qm_start_quiz_session", {
    p_player_id: player.id,
    p_mode: mode,
    p_question_ids: safeRows.map((question) => question.id),
    p_nonce: randomUUID(),
    p_expires_at: expiresAt
  });
  if (sessionError || !created) throw new Error(sessionError?.message ?? "QUIZ_SESSION_CREATE_FAILED");
  const payload = created;
  const session = {
    id: payload.sessionId,
    mode: payload.mode,
    question_ids: safeRows.map((question) => question.id),
    current_index: 0,
    nonce: payload.nonce,
    expires_at: payload.expiresAt
  };
  return {
    session: {
      id: session.id,
      mode: session.mode,
      expiresAt: session.expires_at,
      questionCount: safeRows.length,
      energy: payload.energy
    },
    question: await nextPublicQuestion(session)
  };
}
async function submitQuizAnswer(player, rawInput) {
  const input = answerSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data: session, error: sessionError } = await supabase.from("qm_question_sessions").select("id,mode,question_ids,current_index,nonce,expires_at").eq("id", input.sessionId).eq("player_id", player.id).single();
  if (sessionError || !session) throw new Error("QUIZ_SESSION_NOT_FOUND");
  const { data: result, error } = await supabase.rpc("qm_submit_answer", {
    p_session_id: input.sessionId,
    p_player_id: player.id,
    p_answer_id: input.answerId,
    p_client_response_ms: safeClientResponseMs(input.clientResponseMs)
  });
  if (error || !result) throw new Error(error?.message ?? "QUIZ_ANSWER_FAILED");
  const resolved = result;
  let nextQuestion = null;
  if (!resolved.sessionCompleted) {
    const { data: nextSession, error: nextSessionError } = await supabase.from("qm_question_sessions").select("id,mode,question_ids,current_index,nonce,expires_at").eq("id", input.sessionId).single();
    if (nextSessionError || !nextSession) throw new Error("QUIZ_SESSION_NOT_FOUND");
    nextQuestion = await nextPublicQuestion(nextSession);
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
      sessionCompleted: resolved.sessionCompleted
    },
    question: nextQuestion
  };
}
export {
  startQuiz,
  submitQuizAnswer
};

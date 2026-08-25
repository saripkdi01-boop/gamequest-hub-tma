import { describe, expect, it } from "vitest";
import { questionCountFor, safeClientResponseMs, sessionDurationMs, toPublicQuestion } from "./quiz-engine";

describe("QUEST//MIND question engine", () => {
  const row = {
    id: "11111111-1111-4111-8111-111111111111",
    category: "Logic",
    difficulty: "medium" as const,
    question: "Which option is valid?",
    answers: [{ id: "a", text: "First" }, { id: "b", text: "Second" }],
    correct_answer: "b",
    explanation: "The second option is valid.",
    time_limit_ms: 15000,
  };

  it("does not expose correct answer in the public DTO", () => {
    const dto = toPublicQuestion(row, "22222222-2222-4222-8222-222222222222", 0, "2026-08-25T00:00:00.000Z");
    expect(dto).toMatchObject({ id: row.id, category: "Logic", sequence: 0, timeLimitMs: 15000 });
    expect(dto).not.toHaveProperty("correct_answer");
    expect(dto).not.toHaveProperty("explanation");
  });

  it("keeps quiz mode counts bounded", () => {
    expect(questionCountFor("know")).toBe(5);
    expect(questionCountFor("chain")).toBe(5);
    expect(questionCountFor("boss")).toBe(1);
    expect(sessionDurationMs("boss", 1)).toBeGreaterThanOrEqual(30000);
  });

  it("clamps malformed client timing instead of trusting it", () => {
    expect(safeClientResponseMs(-10)).toBe(0);
    expect(safeClientResponseMs(999999)).toBe(120000);
    expect(safeClientResponseMs("fast")).toBeNull();
  });
});

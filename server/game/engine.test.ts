import { describe, expect, it } from "vitest";
import { calculateLevel, checkpointFor, experienceToNextLevel, initialGenesisProgress, resolveChoice } from "./engine";

describe("Genesis Run engine", () => {
  it("moves through exactly three validated checkpoints", () => {
    const seed = "quest-seed";
    const first = resolveChoice(seed, initialGenesisProgress(), "scan");
    const second = resolveChoice(seed, first, "anchor");
    const final = resolveChoice(seed, second, "align");
    expect(first.checkpointIndex).toBe(1);
    expect(second.checkpointIndex).toBe(2);
    expect(final.checkpointIndex).toBe(3);
    expect(final.history).toHaveLength(3);
    expect(checkpointFor(final)).toBeNull();
  });

  it("rejects a choice not offered by the active checkpoint", () => {
    expect(() => resolveChoice("quest-seed", initialGenesisProgress(), "not-a-real-choice")).toThrow("Invalid checkpoint choice");
  });

  it("calculates deterministic level boundaries and next threshold", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
    expect(experienceToNextLevel(0)).toBe(100);
    expect(experienceToNextLevel(100)).toBe(300);
  });
});

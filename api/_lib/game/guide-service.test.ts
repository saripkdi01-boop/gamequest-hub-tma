import { describe, expect, it } from "vitest";
import { GUIDE_IDS, getDailyLoginState } from "./guide-service";

describe("Quest Nexus guide and retention primitives", () => {
  it("keeps the ten-character roster as the single server catalog", () => {
    expect(GUIDE_IDS).toHaveLength(10);
    expect(GUIDE_IDS).toContain("nexus");
    expect(GUIDE_IDS).toContain("legenda");
  });

  it("marks a claim made today as duplicate-safe", () => {
    const today = new Date().toISOString().slice(0, 10);
    const state = getDailyLoginState({ dailyLoginStreak: 4, dailyLoginLastDay: today } as never);
    expect(state.claimedToday).toBe(true);
    expect(state.streakDay).toBe(4);
    expect(state.nextRewardRelics).toBe(4);
  });

  it("advances a consecutive streak without exceeding the seven-day track", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const state = getDailyLoginState({ dailyLoginStreak: 6, dailyLoginLastDay: yesterday } as never);
    expect(state.claimedToday).toBe(false);
    expect(state.streakDay).toBe(6);
    expect(state.nextRewardRelics).toBe(10);
  });

  it("resets the next claim to day one after a missed day", () => {
    const state = getDailyLoginState({ dailyLoginStreak: 7, dailyLoginLastDay: "2020-01-01" } as never);
    expect(state.claimedToday).toBe(false);
    expect(state.nextRewardRelics).toBe(1);
    expect(state.rewardTrack).toEqual([1, 2, 3, 4, 5, 6, 10]);
  });
});

import { describe, expect, it } from "vitest";
import { canCreateRewardedIntent, isEligibleRewardedPostback } from "./ad-service";

describe("rewarded-ad guardrails", () => {
  it("enforces the daily cap and cooldown before an intent is created", () => {
    const now = Date.UTC(2026, 7, 24, 9, 0, 0);
    expect(canCreateRewardedIntent(3, null, now)).toBe(false);
    expect(canCreateRewardedIntent(0, new Date(now - 9 * 60 * 1000).toISOString(), now)).toBe(false);
    expect(canCreateRewardedIntent(2, new Date(now - 10 * 60 * 1000).toISOString(), now)).toBe(true);
  });

  it("only considers valued impressions from the expected zone eligible for rewards", () => {
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "impression", zoneId: "zone-a" }, "zone-a")).toBe(true);
    expect(isEligibleRewardedPostback({ rewardEventType: "non_valued", eventType: "impression", zoneId: "zone-a" }, "zone-a")).toBe(false);
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "click", zoneId: "zone-a" }, "zone-a")).toBe(false);
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "impression", zoneId: "zone-b" }, "zone-a")).toBe(false);
  });
});

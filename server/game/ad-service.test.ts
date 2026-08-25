import { describe, expect, it } from "vitest";
import { canCreateRewardedIntent, configuredRewardAdProvider, isEligibleRewardedPostback } from "./ad-service";

describe("rewarded-ad guardrails", () => {
  it("enforces the daily cap and cooldown before an intent is created", () => {
    const now = Date.UTC(2026, 7, 24, 9, 0, 0);
    expect(canCreateRewardedIntent(3, null, now)).toBe(false);
    expect(canCreateRewardedIntent(0, new Date(now - 9 * 60 * 1000).toISOString(), now)).toBe(false);
    expect(canCreateRewardedIntent(2, new Date(now - 10 * 60 * 1000).toISOString(), now)).toBe(true);
  });

  it("requires provider credentials before enabling the AdsGram adapter", () => {
    const previous = { ...process.env };
    try {
      process.env.VITE_ADS_ENABLED = "true";
      process.env.ADS_PROVIDER = "adsgram";
      delete process.env.ADSGRAM_BLOCK_ID;
      delete process.env.VITE_ADSGRAM_BLOCK_ID;
      expect(configuredRewardAdProvider()).toBeNull();
      process.env.ADSGRAM_BLOCK_ID = "12345";
      expect(configuredRewardAdProvider()).toBe("adsgram");
    } finally {
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });

  it("keeps the existing Monetag provider available only with its zone", () => {
    const previous = { ...process.env };
    try {
      process.env.VITE_ADS_ENABLED = "true";
      process.env.ADS_PROVIDER = "monetag";
      process.env.VITE_MONETAG_ZONE_ID = "zone-a";
      expect(configuredRewardAdProvider()).toBe("monetag");
    } finally {
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });

  it("only considers valued impressions from the expected zone eligible for rewards", () => {
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "impression", zoneId: "zone-a" }, "zone-a")).toBe(true);
    expect(isEligibleRewardedPostback({ rewardEventType: "non_valued", eventType: "impression", zoneId: "zone-a" }, "zone-a")).toBe(false);
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "click", zoneId: "zone-a" }, "zone-a")).toBe(false);
    expect(isEligibleRewardedPostback({ rewardEventType: "valued", eventType: "impression", zoneId: "zone-b" }, "zone-a")).toBe(false);
  });
});

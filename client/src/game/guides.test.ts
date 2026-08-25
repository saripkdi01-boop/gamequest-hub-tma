import { describe, expect, it } from "vitest";
import { getGuide, guideIds, guides, isGuideId } from "./guides";

describe("ten guide roster", () => {
  it("keeps exactly ten unique named guide identities", () => {
    expect(guides).toHaveLength(10);
    expect(new Set(guides.map((guide) => guide.id)).size).toBe(10);
    expect(new Set(guides.map((guide) => guide.name)).size).toBe(10);
  });

  it("resolves every advertised guide with safe visual metadata", () => {
    guideIds.forEach((id) => {
      const guide = getGuide(id);
      expect(guide.id).toBe(id);
      expect(guide.primary).toMatch(/^#/);
      expect(guide.secondary).toMatch(/^#/);
      expect(guide.protocol.length).toBeGreaterThan(2);
    });
  });

  it("rejects arbitrary local-storage values", () => {
    expect(isGuideId("nexus")).toBe(true);
    expect(isGuideId("relic-mint")).toBe(false);
    expect(isGuideId(null)).toBe(false);
  });
});

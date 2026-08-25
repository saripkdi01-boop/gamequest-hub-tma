import { describe, expect, it } from "vitest";
import { gameErrorStatus } from "./http";

class FakeTelegramValidationError extends Error {}

// The classifier is intentionally tested with plain errors because domain services
// surface stable error messages after Supabase/RPC boundaries.
describe("game API error classification", () => {
  it("keeps malformed and validation failures actionable", () => {
    expect(gameErrorStatus(new SyntaxError("bad JSON"))).toEqual({ status: 400, message: "Malformed request body" });
    expect(gameErrorStatus(new Error("Invalid game request"))).toEqual({ status: 503, message: "Game service is temporarily unavailable" });
  });

  it("maps expected arena state conflicts away from generic outage", () => {
    expect(gameErrorStatus(new Error("ENERGY_DEPLETED"))).toEqual({ status: 409, message: "Arena energy is depleted. Return to the Nexus and recharge before the next run." });
    expect(gameErrorStatus(new Error("Genesis Run has already been completed today"))).toEqual({ status: 409, message: "This daily route is already complete. A new route unlocks with the next daily cycle." });
    expect(gameErrorStatus(new Error("QUIZ_POOL_UNAVAILABLE"))).toEqual({ status: 503, message: "Game service is temporarily unavailable" });
  });

  it("keeps unknown infrastructure errors behind a stable 503", () => {
    expect(gameErrorStatus(new Error("connection reset by peer"))).toEqual({ status: 503, message: "Game service is temporarily unavailable" });
  });

  it("does not classify unrelated errors as arena state", () => {
    expect(gameErrorStatus(new FakeTelegramValidationError("invalid"))).toEqual({ status: 503, message: "Game service is temporarily unavailable" });
  });
});

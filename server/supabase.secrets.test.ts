import { describe, expect, it } from "vitest";
import { checkGameQuestPlayersAccess } from "./supabase";

describe("Supabase credentials", () => {
  it("authorizes a lightweight REST API request", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    expect(url, "SUPABASE_URL must be configured").toBeTruthy();
    expect(key, "SUPABASE_KEY must be configured").toBeTruthy();

    await expect(checkGameQuestPlayersAccess()).resolves.toBeUndefined();
  }, 15_000);
});

import { describe, expect, it } from "vitest";

describe("Telegram credentials", () => {
  it.skipIf(process.env.RUN_INTEGRATION_TESTS !== "true")("authenticates the configured bot token with Telegram", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token, "TELEGRAM_BOT_TOKEN must be configured").toBeTruthy();

    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const payload = await response.json() as { ok?: boolean; result?: { id?: number; is_bot?: boolean } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(payload.result?.is_bot).toBe(true);
    expect(payload.result?.id).toBeTypeOf("number");
  }, 15_000);
});

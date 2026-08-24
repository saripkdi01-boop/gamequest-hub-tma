import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "./webhook";

const originalFetch = global.fetch;
const originalToken = process.env.TELEGRAM_BOT_TOKEN;
const originalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

afterEach(() => {
  global.fetch = originalFetch;
  process.env.TELEGRAM_BOT_TOKEN = originalToken;
  process.env.TELEGRAM_WEBHOOK_SECRET = originalSecret;
});

describe("production Telegram webhook", () => {
  it("replies to /start as a plain message after authenticating the webhook secret", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_WEBHOOK_SECRET = "test-webhook-secret";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as typeof fetch;
    const end = vi.fn();
    const response = { statusCode: 0, setHeader: vi.fn(), end };
    const request = {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "test-webhook-secret" },
      body: { message: { text: "/start", chat: { id: 123 } } },
    };

    await handler(request as never, response as never);

    expect(response.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/sendMessage"), expect.objectContaining({ method: "POST" }));
    const sentPayload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentPayload).toMatchObject({ chat_id: 123, text: expect.stringContaining("Menu button") });
    expect(sentPayload.reply_markup).toBeUndefined();
    expect(end).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
  });
});

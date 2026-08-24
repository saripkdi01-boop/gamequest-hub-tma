import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleTelegramUpdate, TelegramValidationError, verifyTelegramInitData, verifyWebhookSecret } from "./telegram";

const botToken = "123456:test-bot-token";

function signedInitData(user: Record<string, unknown>, authDate = 1_725_000_000) {
  const parameters = new URLSearchParams({
    auth_date: String(authDate),
    query_id: "AAEAAAE",
    user: JSON.stringify(user),
  });
  const dataCheckString = Array.from(parameters.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  parameters.set("hash", createHmac("sha256", secretKey).update(dataCheckString).digest("hex"));
  return parameters.toString();
}

afterEach(() => vi.unstubAllGlobals());

describe("Telegram initData verification", () => {
  it("accepts a correctly signed and recent Telegram user payload", () => {
    const initData = signedInitData({ id: 12345, first_name: "Quest", username: "quester" });
    const user = verifyTelegramInitData(initData, botToken, 1_725_000_060);
    expect(user).toMatchObject({ id: 12345, first_name: "Quest", username: "quester" });
  });

  it("rejects tampered or expired payloads", () => {
    const valid = signedInitData({ id: 12345, first_name: "Quest" });
    expect(() => verifyTelegramInitData(`${valid}&start_param=altered`, botToken, 1_725_000_060)).toThrow(TelegramValidationError);
    expect(() => verifyTelegramInitData(valid, botToken, 1_725_086_402)).toThrow("Expired initData");
  });
});

describe("Telegram webhook security", () => {
  it("compares the webhook secret without accepting a mismatch", () => {
    expect(verifyWebhookSecret("webhook-secret", "webhook-secret")).toBe(true);
    expect(verifyWebhookSecret("webhook-secret", "incorrect-secret")).toBe(false);
    expect(verifyWebhookSecret(undefined, "webhook-secret")).toBe(false);
  });

  it("handles /start by sending a Mini App button", async () => {
    const previousToken = process.env.TELEGRAM_BOT_TOKEN;
    const previousUrl = process.env.TELEGRAM_WEB_APP_URL;
    process.env.TELEGRAM_BOT_TOKEN = botToken;
    process.env.TELEGRAM_WEB_APP_URL = "https://gamequest.example";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(handleTelegramUpdate({ update_id: 1, message: { text: "/start", chat: { id: 99 } } })).resolves.toEqual({ handled: true });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/sendMessage"), expect.objectContaining({ method: "POST" }));
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.reply_markup.inline_keyboard[0][0].web_app.url).toBe("https://gamequest.example");

    process.env.TELEGRAM_BOT_TOKEN = previousToken;
    process.env.TELEGRAM_WEB_APP_URL = previousUrl;
  });
});

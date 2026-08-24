import type { Express, Request, Response } from "express";
import { upsertTelegramPlayer } from "./db";
import { getGameDashboard } from "./game/service";
import { handleTelegramUpdate, TelegramValidationError, verifyTelegramInitData, verifyWebhookSecret, type TelegramUpdate } from "./telegram";

function headerValue(request: Request, name: string): string | undefined {
  const value = request.header(name);
  return value || undefined;
}

export function registerTelegramRoutes(app: Express) {
  app.get("/api/telegram/health", (_request, response) => {
    const configuredWebAppUrl = process.env.TELEGRAM_WEB_APP_URL;
    let webAppOrigin: string | null = null;
    try {
      webAppOrigin = configuredWebAppUrl ? new URL(configuredWebAppUrl).origin : null;
    } catch {
      webAppOrigin = null;
    }
    response.status(200).json({
      service: "telegram",
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_WEBHOOK_SECRET),
      webAppOrigin,
    });
  });

  app.post("/api/telegram/auth", async (request: Request, response: Response) => {
    try {
      const initData = typeof request.body?.initData === "string" ? request.body.initData : "";
      const user = verifyTelegramInitData(initData);
      const player = await upsertTelegramPlayer(user);
      response.status(200).json({ player, dashboard: await getGameDashboard(player) });
    } catch (error) {
      const status = error instanceof TelegramValidationError ? 401 : 503;
      response.status(status).json({ error: status === 401 ? "Invalid Telegram authentication data" : "Player profile is temporarily unavailable" });
    }
  });

  app.post("/api/telegram/webhook", async (request: Request, response: Response) => {
    const secret = headerValue(request, "x-telegram-bot-api-secret-token");
    if (!verifyWebhookSecret(secret)) {
      response.status(401).json({ error: "Unauthorized webhook" });
      return;
    }

    try {
      await handleTelegramUpdate(request.body as TelegramUpdate);
      response.status(200).json({ ok: true });
    } catch (error) {
      console.error("[Telegram] Webhook handler error", error);
      response.status(500).json({ error: "Webhook processing failed" });
    }
  });
}

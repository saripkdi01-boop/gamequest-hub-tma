import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const configuredWebAppUrl = process.env.TELEGRAM_WEB_APP_URL;
  let webAppOrigin: string | null = null;
  try {
    webAppOrigin = configuredWebAppUrl ? new URL(configuredWebAppUrl).origin : null;
  } catch {
    webAppOrigin = null;
  }

  response.statusCode = 200;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify({
    service: "telegram",
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_WEBHOOK_SECRET),
    webAppOrigin,
  }));
}

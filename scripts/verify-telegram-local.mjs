import { createHmac } from "node:crypto";

const baseUrl = "http://localhost:3000";
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const testUserId = 900000001;

if (!botToken || !webhookSecret || !supabaseUrl || !supabaseKey) {
  throw new Error("Required server credentials are not configured");
}

function signedInitData() {
  const parameters = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "LOCAL_ENDPOINT_CHECK",
    user: JSON.stringify({ id: testUserId, first_name: "Endpoint", username: "gamequest_endpoint_check" }),
  });
  const dataCheckString = Array.from(parameters.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  parameters.set("hash", createHmac("sha256", secretKey).update(dataCheckString).digest("hex"));
  return parameters.toString();
}

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { status: response.status, body: await response.text() };
}

async function cleanupTestPlayer() {
  const response = await fetch(`${supabaseUrl}/rest/v1/gamequest_players?telegram_user_id=eq.${testUserId}`, {
    method: "DELETE",
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
    },
  });
  if (!response.ok) throw new Error("Unable to clean up the temporary endpoint-check player");
}

try {
  const validAuth = await request("/api/telegram/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData: signedInitData() }),
  });
  if (validAuth.status !== 200) throw new Error(`Expected valid auth 200, received ${validAuth.status}`);

  const invalidAuth = await request("/api/telegram/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData: "invalid" }),
  });
  if (invalidAuth.status !== 401) throw new Error(`Expected invalid auth 401, received ${invalidAuth.status}`);

  const rejectedWebhook = await request("/api/telegram/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ update_id: 1 }),
  });
  if (rejectedWebhook.status !== 401) throw new Error(`Expected rejected webhook 401, received ${rejectedWebhook.status}`);

  const acceptedWebhook = await request("/api/telegram/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": webhookSecret },
    body: JSON.stringify({ update_id: 2, message: { text: "health check", chat: { id: testUserId } } }),
  });
  if (acceptedWebhook.status !== 200) throw new Error(`Expected accepted webhook 200, received ${acceptedWebhook.status}`);

  console.log("Local Telegram endpoint verification passed: auth 200/401 and webhook 200/401.");
} finally {
  await cleanupTestPlayer();
}

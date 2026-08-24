import { createHmac, randomUUID } from "node:crypto";

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

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${body}`);
  return body ? JSON.parse(body) : null;
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

  const initData = signedInitData();
  const initialDashboard = await request("/api/game/dashboard", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  if (initialDashboard.status !== 200) throw new Error(`Expected game dashboard 200, received ${initialDashboard.status}: ${initialDashboard.body}`);

  const started = await request("/api/game/genesis/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData, questSlug: "genesis-run" }),
  });
  if (started.status !== 200) throw new Error(`Expected Genesis Run start 200, received ${started.status}: ${started.body}`);
  let run = JSON.parse(started.body).run;

  for (const choiceId of ["scan", "anchor", "align"]) {
    const response = await request("/api/game/genesis/choice", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initData, runId: run.runId, choiceId }),
    });
    if (response.status !== 200) throw new Error(`Expected Genesis choice 200, received ${response.status}: ${response.body}`);
    run = JSON.parse(response.body).run;
  }
  if (run.status !== "completed" || run.result?.xpAwarded !== 25 || run.result?.relicsAwarded !== 3) {
    throw new Error("Genesis Run completion did not return verified rewards");
  }

  const replay = await request("/api/game/genesis/choice", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData, runId: run.runId, choiceId: "align" }),
  });
  const replayRun = JSON.parse(replay.body).run;
  if (replay.status !== 200 || replayRun.status !== "completed" || replayRun.result?.xpAwarded !== 0 || replayRun.result?.relicsAwarded !== 0) {
    throw new Error("Genesis Run replay did not return an idempotent completion response");
  }

  const completedDashboard = await request("/api/game/dashboard", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  const completedState = JSON.parse(completedDashboard.body).dashboard;
  if (completedDashboard.status !== 200 || completedState.player.experience !== 25 || completedState.player.relics !== 3) {
    throw new Error("Genesis Run rewards were not persisted to the dashboard");
  }

  const blockedDailyRun = await request("/api/game/genesis/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData, questSlug: "genesis-run" }),
  });
  if (blockedDailyRun.status !== 409) throw new Error(`Expected daily Genesis Run limit 409, received ${blockedDailyRun.status}`);

  const [{ id: testPlayerId }] = await supabaseRequest(`gamequest_players?telegram_user_id=eq.${testUserId}&select=id`, { method: "GET" });
  const ymid = randomUUID();
  await supabaseRequest("ad_reward_intents", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ ymid, player_id: testPlayerId, placement: "daily_bonus", reward_currency: "relic", reward_amount: 5, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() }),
  });
  const firstAdReward = await supabaseRequest("rpc/grant_monetag_reward", { method: "POST", body: JSON.stringify({ p_ymid: ymid }) });
  const replayAdReward = await supabaseRequest("rpc/grant_monetag_reward", { method: "POST", body: JSON.stringify({ p_ymid: ymid }) });
  if (!firstAdReward.rewarded || !replayAdReward.duplicate || replayAdReward.rewarded) throw new Error("Rewarded-ad database function is not idempotent");
  const [{ relics: relicsAfterAd }] = await supabaseRequest(`gamequest_players?telegram_user_id=eq.${testUserId}&select=relics`, { method: "GET" });
  if (relicsAfterAd !== 8) throw new Error("Atomic rewarded-ad grant did not persist exactly five relics");

  console.log("Local verification passed: Telegram auth/webhook, Genesis Run, idempotent replay, daily limit, and atomic rewarded-ad ledger grant.");
} finally {
  await cleanupTestPlayer();
}

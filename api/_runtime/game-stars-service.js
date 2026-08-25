// api/_lib/game/stars-service.ts
import { randomUUID } from "node:crypto";
import { z } from "zod";

// api/_lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// api/_lib/game/stars-service.ts
var skuSchema = z.object({ sku: z.string().regex(/^[a-z0-9._-]{2,64}$/) });
var payloadSchema = z.string().regex(/^questmind:[0-9a-f-]{36}:[a-z0-9._-]{2,64}$/);
var DEFAULT_STARS_CATALOG = {
  "energy.cell": { title: "Energy Cell", description: "Restore one energy charge for a future arena run.", amountXtr: 15, benefit: { type: "utility", item: "energy.cell", effect: "energy_plus_one" } },
  "relic.key": { title: "Relic Key", description: "A cosmetic relic key for the Nexus collection.", amountXtr: 25, benefit: { type: "cosmetic", item: "relic.key" } },
  "streak.sigil": { title: "Streak Sigil", description: "Protect one streak break in the next eligible run.", amountXtr: 35, benefit: { type: "utility", item: "streak.sigil", effect: "streak_shield_one" } },
  "focus.lens": { title: "Focus Lens", description: "A focus utility for the precision arena.", amountXtr: 20, benefit: { type: "utility", item: "focus.lens", effect: "focus_boost" } },
  "yuki.skin": { title: "Yuki Prism Skin", description: "A cosmetic prism skin for companion Yuki.", amountXtr: 75, benefit: { type: "cosmetic", item: "yuki.skin", cosmeticId: "prism" } },
  "chain.booster": { title: "Chain Booster", description: "A cosmetic chain aura for high-combo runs.", amountXtr: 45, benefit: { type: "cosmetic", item: "chain.booster", cosmeticId: "aura" } }
};
function catalog() {
  if (process.env.TELEGRAM_STARS_CATALOG_LIVE !== "true") return {};
  const raw = process.env.TELEGRAM_STARS_CATALOG_JSON;
  if (!raw) return DEFAULT_STARS_CATALOG;
  try {
    const parsed = JSON.parse(raw);
    const valid = Object.fromEntries(Object.entries(parsed).filter(([, item]) => Number.isInteger(item.amountXtr) && item.amountXtr > 0 && typeof item.title === "string" && typeof item.description === "string"));
    return Object.keys(valid).length ? valid : DEFAULT_STARS_CATALOG;
  } catch {
    return DEFAULT_STARS_CATALOG;
  }
}
function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot token is not configured");
  return token;
}
function payloadParts(rawPayload) {
  const payload = payloadSchema.parse(rawPayload);
  const [, orderId, sku] = payload.split(":");
  return { orderId, sku };
}
async function telegramApi(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.description ?? `Telegram ${method} failed`);
  return result.result;
}
function getPublicStarsCatalog() {
  return Object.entries(catalog()).map(([sku, item]) => ({ sku, title: item.title, description: item.description, amountXtr: item.amountXtr, benefitType: typeof item.benefit?.type === "string" ? item.benefit.type : "digital" }));
}
async function createStarsInvoiceLink(player, rawInput) {
  const { sku } = skuSchema.parse(rawInput);
  const item = catalog()[sku];
  if (!item) throw new Error("Stars SKU is not configured");
  const orderId = randomUUID();
  const payload = `questmind:${orderId}:${sku}`;
  const supabase = getSupabaseServerClient();
  const { error: orderError } = await supabase.from("telegram_star_orders").insert({ order_id: orderId, player_id: player.id, telegram_user_id: player.telegramUserId, sku, amount_xtr: item.amountXtr, status: "created", payload_json: { sku, amountXtr: item.amountXtr } });
  if (orderError) throw new Error(orderError.message);
  try {
    const invoiceLink = await telegramApi("createInvoiceLink", { title: item.title, description: item.description, payload, currency: "XTR", prices: [{ label: item.title, amount: item.amountXtr }], provider_token: "" });
    return { orderId, sku, amountXtr: item.amountXtr, invoiceLink };
  } catch (error) {
    await supabase.from("telegram_star_orders").update({ status: "rejected", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("order_id", orderId).eq("status", "created");
    throw error;
  }
}
async function answerStarsPreCheckout(query) {
  let orderId = "invalid";
  try {
    const parsed = payloadParts(query.invoice_payload ?? "");
    orderId = parsed.orderId;
    const { sku } = parsed;
    const item = catalog()[sku];
    const supabase = getSupabaseServerClient();
    const { data: order } = await supabase.from("telegram_star_orders").select("order_id,telegram_user_id,sku,amount_xtr,status").eq("order_id", orderId).maybeSingle();
    const valid = Boolean(order && item && order.status === "created" && order.sku === sku && order.amount_xtr === query.total_amount && query.currency === "XTR" && Number(query.from?.id) === Number(order.telegram_user_id));
    await telegramApi("answerPreCheckoutQuery", { pre_checkout_query_id: query.id, ok: valid, ...valid ? {} : { error_message: "This offer is no longer available." } });
    return { accepted: valid, orderId };
  } catch {
    await telegramApi("answerPreCheckoutQuery", { pre_checkout_query_id: query.id, ok: false, error_message: "This offer is no longer available." });
    return { accepted: false, orderId };
  }
}
async function recordStarsSuccessfulPayment(message) {
  const payment = message.successful_payment;
  const { orderId, sku } = payloadParts(payment?.invoice_payload ?? "");
  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase.from("telegram_star_orders").select("order_id,player_id,telegram_user_id,sku,amount_xtr,status").eq("order_id", orderId).maybeSingle();
  if (!order) return { accepted: false, reason: "order_not_found" };
  if (order.status === "paid") return { accepted: true, duplicate: true, orderId };
  const valid = order.sku === sku && order.status === "created" && order.amount_xtr === payment?.total_amount && payment?.currency === "XTR" && Boolean(payment.telegram_payment_charge_id) && Number(message.from?.id) === Number(order.telegram_user_id);
  if (!valid) {
    await supabase.from("telegram_star_orders").update({ status: "rejected", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("order_id", orderId).eq("status", "created");
    return { accepted: false, reason: "payment_mismatch" };
  }
  const { error } = await supabase.from("telegram_star_orders").update({ status: "paid", telegram_payment_charge_id: payment.telegram_payment_charge_id, paid_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("order_id", orderId).eq("status", "created");
  if (error) throw new Error(error.message);
  const item = catalog()[sku];
  const { data: grantResult, error: grantError } = await supabase.rpc("grant_stars_item", { p_order_id: orderId, p_player_id: order.player_id, p_item_key: sku, p_benefit_json: item?.benefit ?? {} });
  if (grantError || !grantResult) throw new Error(grantError?.message ?? "Unable to grant Stars item");
  return { accepted: true, duplicate: false, orderId, sku, inventory: grantResult };
}
export {
  answerStarsPreCheckout,
  createStarsInvoiceLink,
  getPublicStarsCatalog,
  recordStarsSuccessfulPayment
};

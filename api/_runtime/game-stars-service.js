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
function catalog() {
  const raw = process.env.TELEGRAM_STARS_CATALOG_JSON;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return Object.fromEntries(Object.entries(parsed).filter(([, item]) => Number.isInteger(item.amountXtr) && item.amountXtr > 0 && typeof item.title === "string" && typeof item.description === "string"));
  } catch {
    return {};
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
  const { error: entitlementError } = await supabase.from("telegram_star_entitlements").insert({ order_id: orderId, player_id: order.player_id, sku, benefit_json: item?.benefit ?? {} });
  if (entitlementError && entitlementError.code !== "23505") throw new Error(entitlementError.message);
  return { accepted: true, duplicate: false, orderId, sku };
}
export {
  answerStarsPreCheckout,
  createStarsInvoiceLink,
  recordStarsSuccessfulPayment
};

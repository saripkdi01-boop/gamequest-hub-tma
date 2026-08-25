import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSupabaseServerClient, type GameQuestPlayer } from "../supabase";

const intentSchema = z.object({ placement: z.literal("daily_bonus") });
const postbackSchema = z.object({
  ymid: z.string().uuid(),
  event_type: z.string().min(1).max(32),
  reward_event_type: z.string().optional(),
  zone_id: z.string().optional(),
  sub_zone_id: z.string().optional(),
  telegram_id: z.string().optional(),
  estimated_price: z.string().optional(),
});

const DAILY_AD_CAP = 3;
const AD_COOLDOWN_MS = 10 * 60 * 1000;
export type RewardAdProvider = "monetag" | "adsgram";

export function configuredRewardAdProvider(): RewardAdProvider | null {
  if (process.env.ADS_ENABLED !== "true" && process.env.VITE_ADS_ENABLED !== "true") return null;
  const provider = process.env.ADS_PROVIDER ?? process.env.VITE_ADS_PROVIDER ?? "monetag";
  if (provider === "adsgram" && (process.env.ADSGRAM_BLOCK_ID || process.env.VITE_ADSGRAM_BLOCK_ID)) return "adsgram";
  if (provider === "monetag" && process.env.VITE_MONETAG_ZONE_ID) return "monetag";
  return null;
}

function todayUtc() { return new Date().toISOString().slice(0, 10); }

export function canCreateRewardedIntent(dailyCount: number, lastIntentAt: string | null, now = Date.now()) {
  if (dailyCount >= DAILY_AD_CAP) return false;
  if (!lastIntentAt) return true;
  return now - new Date(lastIntentAt).getTime() >= AD_COOLDOWN_MS;
}

export function isEligibleRewardedPostback(input: { rewardEventType?: string; eventType: string; zoneId?: string }, expectedZone?: string) {
  return Boolean(expectedZone && input.rewardEventType === "valued" && input.eventType === "impression" && input.zoneId === expectedZone);
}

export async function createDailyBonusIntent(player: GameQuestPlayer, rawInput: unknown) {
  intentSchema.parse(rawInput);
  const provider = configuredRewardAdProvider();
  if (!provider) throw new Error("Rewarded ads are not configured");
  const supabase = getSupabaseServerClient();
  const now = new Date();
  const { data: daily, error: dailyError } = await supabase.from("daily_player_stats").select("rewarded_ads_count").eq("player_id", player.id).eq("day_utc", todayUtc()).maybeSingle();
  if (dailyError) throw new Error(dailyError.message);
  const cutoff = new Date(now.getTime() - AD_COOLDOWN_MS).toISOString();
  const { data: recent, error: recentError } = await supabase.from("ad_reward_intents").select("created_at").eq("player_id", player.id).eq("placement", "daily_bonus").gte("created_at", cutoff).order("created_at", { ascending: false }).limit(1);
  if (recentError) throw new Error(recentError.message);
  if (!canCreateRewardedIntent(daily?.rewarded_ads_count ?? 0, recent?.[0]?.created_at ?? null, now.getTime())) {
    throw new Error((daily?.rewarded_ads_count ?? 0) >= DAILY_AD_CAP ? "Daily rewarded-ad limit reached" : "Reward vault is cooling down");
  }

  const ymid = randomUUID();
  const { error } = await supabase.from("ad_reward_intents").insert({
    ymid,
    player_id: player.id,
    provider,
    placement: "daily_bonus",
    reward_currency: "relic",
    reward_amount: 5,
    expires_at: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);
  return { ymid, provider, placement: "daily_bonus", rewardCurrency: "relic", rewardAmount: 5, expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), verification: provider === "monetag" ? "server_postback" : "provider_callback_pending" };
}

export async function processMonetagPostback(rawInput: unknown) {
  const input = postbackSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data: intent, error: intentError } = await supabase.from("ad_reward_intents").select("ymid,player_id,provider,placement,reward_currency,reward_amount,status,expires_at").eq("ymid", input.ymid).maybeSingle();
  if (intentError) throw new Error(intentError.message);
  if (!intent) return { accepted: false, reason: "intent_not_found" as const };
  if (intent.provider !== "monetag") return { accepted: false, reason: "provider_mismatch" as const };

  const { data: existing } = await supabase.from("ad_postbacks").select("id").eq("ymid", input.ymid).eq("event_type", input.event_type).eq("reward_event_type", input.reward_event_type ?? null).maybeSingle();
  if (existing) return { accepted: true, duplicate: true, rewarded: false };

  const safePayload = { event_type: input.event_type, reward_event_type: input.reward_event_type ?? null, zone_id: input.zone_id ?? null, sub_zone_id: input.sub_zone_id ?? null, telegram_id: input.telegram_id ?? null, estimated_price: input.estimated_price ?? null };
  const { error: logError } = await supabase.from("ad_postbacks").insert({ ymid: input.ymid, event_type: input.event_type, reward_event_type: input.reward_event_type ?? null, zone_id: input.zone_id ?? null, sub_zone_id: input.sub_zone_id ?? null, telegram_id: input.telegram_id ?? null, estimated_price: input.estimated_price ? Number(input.estimated_price) : null, payload_safe_json: safePayload });
  if (logError) {
    if (logError.code === "23505") return { accepted: true, duplicate: true, rewarded: false };
    throw new Error(logError.message);
  }

  const expectedZone = process.env.VITE_MONETAG_ZONE_ID;
  const eligible = intent.status === "pending" && new Date(intent.expires_at).getTime() > Date.now() && isEligibleRewardedPostback({ rewardEventType: input.reward_event_type, eventType: input.event_type, zoneId: input.zone_id }, expectedZone);
  if (!eligible) {
    await supabase.from("ad_reward_intents").update({ status: "rejected" }).eq("ymid", input.ymid).eq("status", "pending");
    return { accepted: true, duplicate: false, rewarded: false };
  }

  const { data: player, error: playerError } = await supabase.from("gamequest_players").select("id,telegram_user_id").eq("id", intent.player_id).single();
  if (playerError || !player || (input.telegram_id && Number(input.telegram_id) !== Number(player.telegram_user_id))) {
    await supabase.from("ad_reward_intents").update({ status: "rejected" }).eq("ymid", input.ymid).eq("status", "pending");
    return { accepted: true, duplicate: false, rewarded: false };
  }

  const { data: rewardResult, error: rewardError } = await supabase.rpc("grant_ad_reward", { p_ymid: intent.ymid });
  if (rewardError || !rewardResult) throw new Error(rewardError?.message ?? "Unable to grant rewarded-ad bonus");
  const result = rewardResult as { rewarded: boolean; duplicate: boolean };
  return { accepted: true, duplicate: result.duplicate, rewarded: result.rewarded };
}

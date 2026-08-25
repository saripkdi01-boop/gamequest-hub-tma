import { useCallback, useEffect, useMemo, useState } from "react";

type AdFormat = "rewarded" | "interstitial" | "task";
type AdStatus = "disabled" | "ready" | "opening" | "verifying" | "pending" | "error";
type AdIntent = { ymid: string; provider: "monetag" | "adsgram"; placement: "daily_bonus"; rewardCurrency: "relic"; rewardAmount: number; expiresAt: string; verification: "server_postback" | "provider_callback_pending" };
type AdsgramController = { show: () => Promise<unknown> };
type AdsgramApi = { init: (config: { blockId: string }) => AdsgramController };
type MonetagBridge = { showRewarded: (payload: { ymid: string; requestVar: string }) => Promise<unknown> };

declare global {
  interface Window { Adsgram?: AdsgramApi; GameQuestMonetag?: MonetagBridge }
}

const SDK_SRC = "https://sad.adsgram.ai/js/sad.min.js";

function blockIdFor(format: AdFormat) {
  if (format === "interstitial") return import.meta.env.VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID as string | undefined;
  if (format === "task") return import.meta.env.VITE_ADSGRAM_TASK_BLOCK_ID as string | undefined;
  return import.meta.env.VITE_ADSGRAM_BLOCK_ID as string | undefined;
}

export function useMonetagAd(initData?: string) {
  const [status, setStatus] = useState<AdStatus>("disabled");
  const provider = (import.meta.env.VITE_ADS_PROVIDER ?? "monetag") as "monetag" | "adsgram";
  const adsEnabled = import.meta.env.VITE_ADS_ENABLED === "true";
  const adsgramAvailable = provider === "adsgram" && Boolean(blockIdFor("rewarded"));
  const monetagAvailable = provider === "monetag" && Boolean(import.meta.env.VITE_MONETAG_SDK_SRC);
  const enabled = adsEnabled && (adsgramAvailable || monetagAvailable);

  useEffect(() => {
    if (!enabled) { setStatus("disabled"); return; }
    if (provider === "adsgram") {
      const existing = document.querySelector(`script[src="${SDK_SRC}"]`);
      if (existing) { setStatus(window.Adsgram ? "ready" : "disabled"); return; }
      const script = document.createElement("script");
      script.src = SDK_SRC;
      script.async = true;
      script.dataset.adsgram = "true";
      script.onload = () => setStatus(window.Adsgram ? "ready" : "disabled");
      script.onerror = () => setStatus("error");
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
    const source = import.meta.env.VITE_MONETAG_SDK_SRC as string | undefined;
    if (!source) return;
    const existing = document.querySelector(`script[data-monetag-src="${source}"]`);
    if (existing) { setStatus(window.GameQuestMonetag ? "ready" : "disabled"); return; }
    const script = document.createElement("script");
    script.src = source; script.async = true; script.dataset.monetagSrc = source;
    script.onload = () => setStatus(window.GameQuestMonetag ? "ready" : "disabled");
    script.onerror = () => setStatus("error");
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [enabled, provider]);

  const showAdsgram = useCallback(async (format: AdFormat) => {
    const blockId = blockIdFor(format);
    if (!window.Adsgram || !blockId) throw new Error("adsNotConfigured");
    const controller = window.Adsgram.init({ blockId });
    return controller.show();
  }, []);

  const watchDailyBonus = useCallback(async () => {
    if (!enabled || !initData) throw new Error("adsNotConfigured");
    setStatus("opening");
    const response = await fetch("/api/game/ads/intent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, placement: "daily_bonus" }) });
    const payload = await response.json() as { intent?: AdIntent; error?: string };
    if (!response.ok || !payload.intent) { setStatus("error"); throw new Error(payload.error ?? "rewardPrepareFailed"); }
    try {
      if (payload.intent.provider === "adsgram") {
        await showAdsgram("rewarded");
        setStatus("pending");
      } else {
        if (!window.GameQuestMonetag) throw new Error("adsNotConfigured");
        await window.GameQuestMonetag.showRewarded({ ymid: payload.intent.ymid, requestVar: payload.intent.placement });
        setStatus("verifying");
      }
      return payload.intent;
    } catch (error) {
      setStatus("error");
      throw error;
    }
  }, [enabled, initData, showAdsgram]);

  const showRevenueAd = useCallback(async (format: Exclude<AdFormat, "rewarded">) => {
    if (!enabled || provider !== "adsgram") throw new Error("adsNotConfigured");
    setStatus("opening");
    try { await showAdsgram(format); setStatus("ready"); } catch (error) { setStatus("error"); throw error; }
  }, [enabled, provider, showAdsgram]);

  return useMemo(() => ({ status, enabled, provider, supportsInterstitial: adsgramAvailable && Boolean(blockIdFor("interstitial")), supportsTasks: adsgramAvailable && Boolean(blockIdFor("task")), watchDailyBonus, showRevenueAd }), [adsgramAvailable, enabled, provider, showRevenueAd, status, watchDailyBonus]);
}

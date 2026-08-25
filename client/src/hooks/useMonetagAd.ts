import { useCallback, useEffect, useState } from "react";

type AdIntent = { ymid: string; placement: "daily_bonus"; rewardCurrency: "relic"; rewardAmount: number; expiresAt: string };
type MonetagBridge = { showRewarded: (payload: { ymid: string; requestVar: string }) => Promise<unknown> };

declare global { interface Window { GameQuestMonetag?: MonetagBridge } }

export function useMonetagAd(initData?: string) {
  const [status, setStatus] = useState<"disabled" | "ready" | "opening" | "verifying" | "error">("disabled");
  const enabled = import.meta.env.VITE_ADS_ENABLED === "true";

  useEffect(() => {
    if (!enabled || !import.meta.env.VITE_MONETAG_SDK_SRC) return;
    const source = import.meta.env.VITE_MONETAG_SDK_SRC as string;
    const existing = document.querySelector(`script[data-monetag-src="${source}"]`);
    if (existing) { setStatus(window.GameQuestMonetag ? "ready" : "disabled"); return; }
    const script = document.createElement("script");
    script.src = source; script.async = true; script.dataset.monetagSrc = source;
    script.onload = () => setStatus(window.GameQuestMonetag ? "ready" : "disabled");
    script.onerror = () => setStatus("error");
    document.head.appendChild(script);
  }, [enabled]);

  const watchDailyBonus = useCallback(async () => {
    if (!enabled || !initData || !window.GameQuestMonetag) throw new Error("adsNotConfigured");
    setStatus("opening");
    const response = await fetch("/api/game/ads/intent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, placement: "daily_bonus" }) });
    const payload = await response.json() as { intent?: AdIntent; error?: string };
    if (!response.ok || !payload.intent) { setStatus("error"); throw new Error(payload.error ?? "rewardPrepareFailed"); }
    await window.GameQuestMonetag.showRewarded({ ymid: payload.intent.ymid, requestVar: payload.intent.placement });
    setStatus("verifying");
    return payload.intent;
  }, [enabled, initData]);

  return { status, enabled: enabled && status !== "disabled", watchDailyBonus };
}

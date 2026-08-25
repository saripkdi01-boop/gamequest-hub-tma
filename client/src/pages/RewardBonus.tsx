import { useLocation } from "wouter";
import { ArrowLeft, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useMonetagAd } from "@/hooks/useMonetagAd";
import { useI18n } from "@/i18n";

export default function RewardBonus() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t } = useI18n();
  const { enabled, status, watchDailyBonus } = useMonetagAd(webApp?.initData);
  const start = () => watchDailyBonus().catch(error => { const code = error instanceof Error ? error.message : ""; window.alert(code === "adsNotConfigured" ? t("adsNotConfigured") : code === "rewardPrepareFailed" ? t("rewardPrepareFailed") : code || t("providerNotConfigured")); });
  const waiting = status === "opening" || status === "verifying";
  return <div className="game-shell min-h-[100dvh] px-4 pb-6 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><section className="mt-6 rounded-2xl border border-white/10 bg-[#1a2639]/90 p-5 shadow-[0_18px_44px_rgba(0,0,0,.23)]"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d7fb70]/10 text-[#d7fb70]"><Sparkles size={22} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#d7fb70]">{t("rewardVault")}</p><h1 className="mt-1.5 font-display text-[30px] leading-none tracking-[-.05em]">{t("bonusProtected")}</h1><p className="mt-3 text-[13px] leading-relaxed text-[#aebac4]">{t("rewardedAdsDescription")}</p>{enabled ? <button disabled={waiting} onClick={start} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7fb70] py-3 text-sm font-semibold text-[#16200f] disabled:opacity-60">{waiting && <Loader2 size={16} className="animate-spin" />}{status === "verifying" ? t("verifyingReward") : t("watchRelics")}</button> : <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[12px] leading-relaxed text-[#aebac4]"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#d7fb70]" />{t("adsDisabled")}</div>}</section></main></div>;
}

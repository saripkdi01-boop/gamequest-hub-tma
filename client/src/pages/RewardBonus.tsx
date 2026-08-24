import { useLocation } from "wouter";
import { ArrowLeft, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useMonetagAd } from "@/hooks/useMonetagAd";

export default function RewardBonus() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { enabled, status, watchDailyBonus } = useMonetagAd(webApp?.initData);
  const start = () => watchDailyBonus().catch(error => window.alert(error instanceof Error ? error.message : "Rewarded ad unavailable"));
  const waiting = status === "opening" || status === "verifying";
  return <div className="game-shell min-h-[100dvh] px-5 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9]"><ArrowLeft size={18} /> GameQuest Hub</button><section className="mt-10 rounded-[30px] border border-white/10 bg-[#1a2639]/90 p-7"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d7fb70]/10 text-[#d7fb70]"><Sparkles size={27} /></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Reward vault</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">Bonus is protected.</h1><p className="mt-4 text-sm leading-relaxed text-[#aebac4]">Rewarded ads only add relics after the provider sends a verified server-side confirmation.</p>{enabled ? <button disabled={waiting} onClick={start} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d7fb70] py-4 font-semibold text-[#16200f] disabled:opacity-60">{waiting && <Loader2 size={17} className="animate-spin" />}{status === "verifying" ? "Verifying reward…" : "Watch for +5 relics"}</button> : <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm text-[#aebac4]"><LockKeyhole size={18} className="shrink-0 text-[#d7fb70]" />Rewarded ads are not enabled until a verified provider zone is configured.</div>}</section></main></div>;
}

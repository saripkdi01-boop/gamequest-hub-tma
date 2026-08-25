import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Flame, Gem, Gauge, MapPinned, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { getDashboard, type Dashboard } from "@/lib/game-api";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const previewDashboard: Dashboard = {
  player: { id: "preview", firstName: "Adventurer", username: null, level: 1, experience: 0, experienceToNextLevel: 100, questStreak: 0, relics: 0, questCoins: 0, mindScore: 0, dailyScore: 0, energy: 10, comboBest: 0 },
  genesisRun: { id: null, status: "available", title: "Genesis Run", description: "Navigate three frontier checkpoints to secure the first relic route.", rewardXp: 25, rewardRelics: 3, checkpointIndex: 0 },
  daily: { completedQuests: 0, rewardedAdsCount: 0, correctAnswers: 0, qcEmitted: 0 },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { webApp, isTelegram } = useTelegramWebApp();
  const { t, language } = useI18n();
  const hasVerifiedTelegramContext = Boolean(webApp?.initData);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = dashboard ?? previewDashboard;
  const xpProgress = useMemo(() => Math.min(100, Math.round((state.player.experience / Math.max(1, state.player.experience + state.player.experienceToNextLevel)) * 100)), [state.player.experience, state.player.experienceToNextLevel]);

  useEffect(() => {
    if (!hasVerifiedTelegramContext || !webApp?.initData) return;
    setLoading(true);
    getDashboard(webApp.initData)
      .then(({ dashboard: nextDashboard }) => setDashboard(nextDashboard))
      .catch(caught => setError(caught instanceof Error ? caught.message : "Unable to sync game state."))
      .finally(() => setLoading(false));
  }, [hasVerifiedTelegramContext, webApp]);

  useEffect(() => {
    const button = webApp?.MainButton;
    const openQuest = () => setLocation("/explore");
    if (!button) return;
    button.setText(state.genesisRun.status === "active" ? "LANJUTKAN GENESIS RUN" : "MULAI GENESIS RUN");
    button.show();
    button.onClick(openQuest);
    return () => {
      button.hide();
      button.offClick(openQuest);
    };
  }, [state.genesisRun.status, webApp, setLocation]);

  const statistics = [
    { icon: Sparkles, label: t("questCoins"), value: state.player.questCoins.toLocaleString(language), tint: "text-[#d7fb70]" },
    { icon: Trophy, label: t("mindScore"), value: state.player.mindScore.toLocaleString(language), tint: "text-[#f7d774]" },
    { icon: Flame, label: t("streak"), value: String(state.player.questStreak), tint: "text-[#ff9a6e]" },
    { icon: Gem, label: t("relics"), value: String(state.player.relics), tint: "text-[#8de4ff]" },
    { icon: Gauge, label: t("energy"), value: String(state.player.energy), tint: "text-[#8de4ff]" },
    { icon: Target, label: t("dailyScore"), value: state.player.dailyScore.toLocaleString(language), tint: "text-[#d7fb70]" },
  ];

  return (
    <div className="game-shell min-h-[100dvh] overflow-x-hidden pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]">
      <main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]">
        <header className="flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="text-left">
            <p className="font-display text-[21px] leading-none tracking-[-.04em] text-[#fbf8ed]">GameQuest</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[.17em] text-[#9fae9d]">Hub · Season Alpha</p>
          </button>
          <div className="flex items-center gap-2"><LanguageSwitcher compact /><button onClick={() => setLocation("/profile")} className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[.045] px-3 text-[10px] font-medium text-[#d7fb70]"><span className="h-1.5 w-1.5 rounded-full bg-[#d7fb70] shadow-[0_0_10px_#d7fb70]" />{loading ? t("loading") : hasVerifiedTelegramContext ? t("online") : t("preview")}</button></div>
        </header>

        <section className="relative mt-9 overflow-hidden rounded-[28px] border border-white/[.12] bg-[#1a2639]/80 px-6 pb-6 pt-7 shadow-[0_24px_60px_rgba(0,0,0,.26)]">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d7fb70]/10 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[.16em] text-[#d7fb70]"><Sparkles size={13} /> {t("profile")}</div>
            <div className="mt-7">
              <p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#9fae9d]">{hasVerifiedTelegramContext ? t("dashboard") : t("preview")}</p>
              <h1 className="mt-2 font-display text-[36px] leading-[.95] tracking-[-.055em] text-[#fbf8ed]">{state.player.firstName}<span className="text-[#d7fb70]">.</span></h1>
            </div>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10"><div style={{ width: `${xpProgress}%` }} className="h-full rounded-full bg-[#d7fb70] shadow-[0_0_12px_#d7fb70]" /></div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#aeb8b1]"><span>LEVEL {String(state.player.level).padStart(2, "0")} · PATHFINDER</span><span className="text-[#e8f5c6]">{state.player.experience} XP</span></div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Statistik pemain">
            {statistics.map(({ icon: Icon, label, value, tint }) => (
            <div key={label} className="rounded-2xl border border-white/[.09] bg-white/[.035] px-3 py-3.5"><Icon size={16} className={tint} /><p className="mt-4 font-display text-[25px] leading-none text-[#f8f5e9]">{value}</p><p className="mt-1.5 font-mono text-[9px] uppercase tracking-[.11em] text-[#8490a0]">{label}</p></div>
          ))}
        </section>

        <section className="mt-8 rounded-[24px] border border-[#d7fb70]/20 bg-[#d7fb70]/[.05] p-4"><div className="flex items-center gap-3"><div className="brand-mark"><Sparkles size={18} /></div><div className="flex-1"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#d7fb70]">QUEST//MIND</p><p className="mt-1 text-sm text-[#dce8d2]">{t("questMind")}</p></div><button onClick={() => setLocation("/mind")} className="rounded-xl bg-[#d7fb70] px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[.1em] text-[#16200f]">{t("play")}</button></div></section>

        <section className="mt-8">
          <div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#a3b58f]">{t("questBoard")}</p><h2 className="mt-1 font-display text-[28px] tracking-[-.04em] text-[#fbf8ed]">{t("nextMove")}</h2></div><button onClick={() => setLocation("/leaderboard")} className="pb-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#d7fb70]">{t("rank")}</button></div>
          <article className="quest-card mt-4 rounded-[24px] border border-white/[.1] p-4">
            <div className="flex gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-[19px] border border-[#d7fb70]/25 text-[#d7fb70]"><MapPinned size={29} /></div><div className="min-w-0 flex-1"><span className="rounded-full bg-[#d7fb70]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-[#d7fb70]">{state.genesisRun.status}</span><h3 className="mt-2 font-display text-[22px] leading-none tracking-[-.035em] text-[#fbf8ed]">{state.genesisRun.title}</h3><p className="mt-2 text-[12px] leading-relaxed text-[#9dabb8]">{state.genesisRun.description}</p></div></div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-3.5"><div className="flex items-center gap-2 font-mono text-[10px] text-[#a7b69d]"><ShieldCheck size={15} className="text-[#d7fb70]" />+{state.genesisRun.rewardXp} XP · +{state.genesisRun.rewardRelics} {t("relics")}</div><button onClick={() => setLocation("/explore")} className="grid h-9 w-9 place-items-center rounded-full bg-[#d7fb70] text-[#16200f] transition-transform active:scale-95" aria-label="Explore Genesis Run"><ChevronRight size={18} strokeWidth={2.7} /></button></div>
          </article>
        </section>

        <button onClick={() => setLocation("/bonus")} className="mt-7 flex w-full items-center gap-3 rounded-[22px] border border-dashed border-white/[.14] bg-white/[.02] px-4 py-4 text-left"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.055] text-[#93a2b1]"><Sparkles size={19} /></div><div className="flex-1"><p className="text-[13px] font-medium text-[#dfe6de]">{t("questCoins")}</p><p className="mt-.5 text-[11px] text-[#8290a0]">{t("questMind")}</p></div><ChevronRight size={15} className="text-[#708091]" /></button>
        {error && <p className="mt-4 text-center text-xs text-[#ffb28f]">{error}</p>}
      </main>
    </div>
  );
}

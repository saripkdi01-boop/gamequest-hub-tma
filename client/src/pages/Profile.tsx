import { useEffect, useState } from "react";
import { ArrowLeft, Award, CalendarDays, Flame, Gem, Gauge, Globe2, Loader2, Medal, Sparkles, Trophy, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { getProfile, type Profile as ProfileData } from "@/lib/game-api";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const previewProfile: ProfileData = {
  id: "preview", telegramUserId: 0, firstName: "Adventurer", lastName: null, username: null, photoUrl: null, languageCode: "en", preferredLanguage: "en", playerStatus: "new", createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
  stats: { level: 1, experience: 0, experienceToNextLevel: 100, questStreak: 0, relics: 0, questCoins: 0, mindScore: 0, dailyScore: 0, energy: 10, comboBest: 0 },
  rank: { seasonId: "alpha-1", rank: null, score: 0 },
};

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { month: "short", year: "numeric" }).format(new Date(value));
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t, language } = useI18n();
  const [profile, setProfile] = useState<ProfileData>(previewProfile);
  const [loading, setLoading] = useState(Boolean(webApp?.initData));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!webApp?.initData) return;
    setLoading(true);
    getProfile(webApp.initData).then(response => setProfile(response.profile)).catch(caught => setError(caught instanceof Error ? caught.message : "Profile unavailable")).finally(() => setLoading(false));
  }, [webApp]);

  const stats = [
    { icon: Sparkles, label: t("questCoins"), value: profile.stats.questCoins.toLocaleString(language) },
    { icon: Trophy, label: t("mindScore"), value: profile.stats.mindScore.toLocaleString(language) },
    { icon: Flame, label: t("streak"), value: String(profile.stats.questStreak) },
    { icon: Gem, label: t("relics"), value: String(profile.stats.relics) },
    { icon: Gauge, label: t("energy"), value: String(profile.stats.energy) },
    { icon: Medal, label: t("rank"), value: profile.rank.rank ? `#${profile.rank.rank}` : "—" },
  ];

  return (
    <div className="game-shell min-h-[100dvh] overflow-x-hidden pb-10 text-[#fbf8ed]">
      <main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]">
        <header className="flex items-center justify-between gap-3">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9]"><ArrowLeft size={17} /> {t("back")}</button>
          <LanguageSwitcher compact />
        </header>

        <section className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[.12] bg-[#1a2639]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,.26)]">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d7fb70]/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex items-start gap-4">
            {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.firstName} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#d7fb70]/40" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#d7fb70]/30 bg-[#d7fb70]/10 text-[#d7fb70]"><UserRound size={28} /></div>}
            <div className="min-w-0 flex-1"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">{t("profile")}</p><h1 className="mt-2 truncate font-display text-[32px] leading-none tracking-[-.05em]">{profile.firstName}<span className="text-[#d7fb70]">.</span></h1><p className="mt-2 truncate text-sm text-[#9dabb8]">{profile.username ? `@${profile.username}` : t("username")}</p></div>
            <span className="rounded-full border border-[#d7fb70]/20 bg-[#d7fb70]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-[#d7fb70]">{profile.playerStatus}</span>
          </div>
          <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-4 text-[11px] text-[#aeb8b1]"><p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#d7fb70]" /> {formatDate(profile.createdAt, language)}</p><p className="flex items-center justify-end gap-2"><Globe2 size={14} className="text-[#d7fb70]" /> {profile.preferredLanguage.toUpperCase()}</p></div>
        </section>

        <section className="mt-5 rounded-[24px] border border-[#f7d774]/20 bg-[#f7d774]/[.05] p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f7d774]/10 text-[#f7d774]"><Award size={22} /></div><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#f7d774]">{t("leaderboard")}</p><p className="mt-1 font-display text-2xl text-[#fbf8ed]">{profile.rank.rank ? `#${profile.rank.rank}` : "—"}<span className="ml-2 text-sm text-[#aeb8b1]">{profile.rank.score.toLocaleString(language)} XP</span></p></div></div></section>

        <section className="mt-7"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#a3b58f]">{t("stats")}</p><h2 className="mt-1 font-display text-[28px] tracking-[-.04em]">{t("dashboard")}</h2></div><button onClick={() => setLocation("/leaderboard")} className="font-mono text-[9px] uppercase tracking-[.12em] text-[#d7fb70]">{t("leaderboard")}</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl border border-white/[.09] bg-white/[.035] px-3 py-3.5"><Icon size={16} className="text-[#d7fb70]" /><p className="mt-4 font-display text-[25px] leading-none">{value}</p><p className="mt-1.5 font-mono text-[9px] uppercase tracking-[.11em] text-[#8490a0]">{label}</p></div>)}</div></section>

        <section className="mt-7 rounded-[24px] border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#a3b58f]">{t("level")} {profile.stats.level}</p><p className="mt-2 text-sm text-[#c8d4cf]">{profile.stats.experience.toLocaleString(language)} / {(profile.stats.experience + profile.stats.experienceToNextLevel).toLocaleString(language)} XP</p></div><p className="font-mono text-xs text-[#d7fb70]">{Math.round(profile.stats.experience / Math.max(1, profile.stats.experience + profile.stats.experienceToNextLevel) * 100)}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7fb70]" style={{ width: `${Math.min(100, Math.round(profile.stats.experience / Math.max(1, profile.stats.experience + profile.stats.experienceToNextLevel) * 100))}%` }} /></div></section>
        {loading && <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#d7fb70]"><Loader2 size={14} className="animate-spin" /> {t("loading")}</p>}
        {error && <p className="mt-5 text-center text-xs text-[#ffb28f]">{error}</p>}
      </main>
    </div>
  );
}

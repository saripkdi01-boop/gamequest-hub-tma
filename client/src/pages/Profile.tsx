import { useEffect, useState } from "react";
import { ArrowLeft, Award, CalendarCheck, CalendarDays, Flame, Gem, Gauge, Globe2, Loader2, Medal, Sparkles, Trophy, UserRound, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { getProfile, type Profile as ProfileData } from "@/lib/game-api";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Character3D from "@/components/Character3D";

const previewProfile: ProfileData = {
  id: "preview", telegramUserId: 0, firstName: "Adventurer", lastName: null, username: null, photoUrl: null, languageCode: "en", preferredLanguage: "en", playerStatus: "new", createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(),
  stats: { level: 1, experience: 0, experienceToNextLevel: 100, questStreak: 0, relics: 0, questCoins: 0, mindScore: 0, dailyScore: 0, energy: 10, maxEnergy: 10, comboBest: 0, activeGuideId: "nexus", dailyLoginStreak: 0, dailyLoginClaimedToday: false, guideBenefitLabel: "+10% Genesis XP" },
  rank: { seasonId: "alpha-1", rank: null, score: 0 },
};

function formatDate(value: string, language: string) { return new Intl.DateTimeFormat(language, { month: "short", year: "numeric" }).format(new Date(value)); }

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
    getProfile(webApp.initData).then(response => setProfile(response.profile)).catch(caught => setError(caught instanceof Error ? caught.message : t("routeUnavailable"))).finally(() => setLoading(false));
  }, [webApp?.initData, t]);

  const stats = [
    { icon: Sparkles, label: t("questCoins"), value: profile.stats.questCoins.toLocaleString(language) },
    { icon: Trophy, label: t("mindScore"), value: profile.stats.mindScore.toLocaleString(language) },
    { icon: Flame, label: t("streak"), value: String(profile.stats.questStreak) },
    { icon: Gem, label: t("relics"), value: String(profile.stats.relics) },
    { icon: Gauge, label: t("energy"), value: `${profile.stats.energy}/${profile.stats.maxEnergy}` },
    { icon: Medal, label: t("rank"), value: profile.rank.rank ? `#${profile.rank.rank}` : "—" },
  ];
  const status = profile.playerStatus === "active" ? t("active") : profile.playerStatus === "inactive" ? t("inactive") : t("newPlayer");
  const progress = Math.min(100, Math.round(profile.stats.experience / Math.max(1, profile.stats.experience + profile.stats.experienceToNextLevel) * 100));

  return (
    <div className="game-shell min-h-[100dvh] overflow-x-hidden pb-6 text-[#fbf8ed]">
      <main className="mx-auto w-full max-w-[520px] px-4 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)]">
        <header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("back")}</button><LanguageSwitcher compact /></header>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/[.12] bg-[#1a2639]/90 p-4 shadow-[0_18px_46px_rgba(0,0,0,.24)]"><div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#d7fb70]/10 blur-3xl" aria-hidden="true" /><div className="relative flex items-start gap-3">{profile.photoUrl ? <img src={profile.photoUrl} alt={profile.firstName} className="h-14 w-14 rounded-xl object-cover ring-2 ring-[#d7fb70]/40" /> : <div className="grid h-14 w-14 place-items-center rounded-xl border border-[#d7fb70]/30 bg-[#d7fb70]/10 text-[#d7fb70]"><UserRound size={24} /></div>}<div className="min-w-0 flex-1"><p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#d7fb70]">{t("profile")}</p><h1 className="mt-1 truncate font-display text-[28px] leading-none tracking-[-.05em]">{profile.firstName}<span className="text-[#d7fb70]">.</span></h1><p className="mt-1 truncate text-[12px] text-[#9dabb8]">{profile.username ? `@${profile.username}` : t("username")}</p></div><span className="rounded-full border border-[#d7fb70]/20 bg-[#d7fb70]/10 px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-[#d7fb70]">{status}</span></div><div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-white/[.08] pt-3 text-[10px] text-[#aeb8b1]"><p className="flex items-center gap-1.5"><CalendarDays size={13} className="text-[#d7fb70]" /> {formatDate(profile.createdAt, language)}</p><p className="flex items-center justify-end gap-1.5"><Globe2 size={13} className="text-[#d7fb70]" /> {profile.preferredLanguage.toUpperCase()}</p></div></section>

        <section className="mt-3 grid grid-cols-[.85fr_1.15fr] gap-2"><article className="rounded-xl border border-[#4ce0c4]/25 bg-[#4ce0c4]/[.06] p-3"><div className="flex items-center gap-2"><Character3D guideId={profile.stats.activeGuideId} size="sm" /><div><p className="font-mono text-[8px] uppercase tracking-[.1em] text-[#4ce0c4]">{t("activeGuide")}</p><p className="mt-1 font-display text-[19px] leading-none">{profile.stats.activeGuideId.toUpperCase()}</p></div></div><p className="mt-2 text-[10px] leading-relaxed text-[#b6c9c9]">{profile.stats.guideBenefitLabel}</p><button onClick={() => setLocation("/guides")} className="mt-2 font-mono text-[8px] uppercase tracking-[.08em] text-[#d7fb70]">{t("guideRoster")} →</button></article><article className="rounded-xl border border-[#f7d774]/20 bg-[#f7d774]/[.05] p-3"><div className="flex items-center gap-1.5"><CalendarCheck size={14} className="text-[#f7d774]" /><p className="font-mono text-[8px] uppercase tracking-[.1em] text-[#f7d774]">{t("dailyLogin")}</p></div><p className="mt-2 font-display text-[26px] leading-none">{profile.stats.dailyLoginStreak}<span className="ml-1 text-[10px] text-[#b9a96d]">/7 {t("streakDay")}</span></p><p className="mt-1 text-[9px] text-[#aeb8b1]">{profile.stats.dailyLoginClaimedToday ? t("claimedToday") : t("nextReward")}</p></article></section>

        <section className="mt-3 rounded-xl border border-[#f7d774]/20 bg-[#f7d774]/[.05] p-3"><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#f7d774]/10 text-[#f7d774]"><Award size={18} /></div><div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#f7d774]">{t("leaderboard")}</p><p className="mt-0.5 font-display text-xl">{profile.rank.rank ? `#${profile.rank.rank}` : "—"}<span className="ml-2 text-[11px] text-[#aeb8b1]">{profile.rank.score.toLocaleString(language)} {t("xp")}</span></p></div></div></section>

        <section className="mt-5"><div className="flex items-end justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#a3b58f]">{t("stats")}</p><h2 className="mt-1 font-display text-[25px] tracking-[-.04em]">{t("dashboard")}</h2></div><button onClick={() => setLocation("/leaderboard")} className="font-mono text-[8px] uppercase tracking-[.1em] text-[#d7fb70]">{t("leaderboard")}</button></div><div className="mt-3 grid grid-cols-3 gap-1.5">{stats.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-xl border border-white/[.09] bg-white/[.035] px-2.5 py-2.5"><Icon size={14} className="text-[#d7fb70]" /><p className="mt-2 font-display text-[20px] leading-none">{value}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[.08em] text-[#8490a0]">{label}</p></div>)}</div></section>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/[.035] p-3"><div className="flex items-center justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#a3b58f]">{t("level")} {profile.stats.level}</p><p className="mt-1 text-[11px] text-[#c8d4cf]">{profile.stats.experience.toLocaleString(language)} / {(profile.stats.experience + profile.stats.experienceToNextLevel).toLocaleString(language)} {t("xp")}</p></div><p className="font-mono text-[10px] text-[#d7fb70]">{progress}%</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7fb70]" style={{ width: `${progress}%` }} /></div><p className="mt-1.5 text-right font-mono text-[8px] uppercase tracking-[.1em] text-[#7f8d9b]">{t("nextLevel")}</p></section>
        <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[8px] uppercase tracking-[.1em] text-[#8de4ff]"><Zap size={11} />{t("verifiedEconomy")}</p>
        {loading && <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#d7fb70]"><Loader2 size={13} className="animate-spin" /> {t("loading")}</p>}
        {error && <p className="mt-4 text-center text-[11px] text-[#ffb28f]">{error}</p>}
      </main>
    </div>
  );
}

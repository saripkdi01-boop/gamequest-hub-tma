import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Loader2, Medal, Trophy, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { getLeaderboard, getProfile, type LeaderboardRow } from "@/lib/game-api";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t, language } = useI18n();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [season, setSeason] = useState("alpha-1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getLeaderboard().then(result => { setRows(result.leaderboard); setSeason(result.season); }),
      webApp?.initData ? getProfile(webApp.initData).then(result => setMyRank(result.profile.rank.rank)) : Promise.resolve(),
    ]).catch(caught => setError(caught instanceof Error ? caught.message : "Leaderboard unavailable")).finally(() => setLoading(false));
  }, [webApp]);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="game-shell min-h-[100dvh] px-5 pb-10 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]">
      <main className="mx-auto w-full max-w-[520px]">
        <header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9]"><ArrowLeft size={18} /> {t("back")}</button><div className="flex items-center gap-2"><LanguageSwitcher compact /><button onClick={() => setLocation("/profile")} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.045] text-[#d7fb70]" aria-label={t("profile")}><UserRound size={15} /></button></div></header>

        <section className="mt-9"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">{t("season")} · {season}</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">{t("leaderboard")}</h1><p className="mt-2 max-w-[330px] text-sm leading-relaxed text-[#9cabba]">{t("mindScore")} and XP define the current Pathfinder order.</p></div><Crown className="text-[#f7d774]" /></div>
          {myRank && <button onClick={() => setLocation("/profile")} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-[#d7fb70]/25 bg-[#d7fb70]/[.07] px-4 py-3 text-left"><span className="font-mono text-[10px] uppercase tracking-[.13em] text-[#d7fb70]">{t("rank")}</span><span className="font-display text-xl text-[#fbf8ed]">#{myRank}</span></button>}
        </section>

        {loading ? <div className="mt-12 grid place-items-center text-[#d7fb70]"><Loader2 className="animate-spin" /></div> : error ? <p className="mt-8 rounded-2xl border border-[#ffb28f]/20 bg-[#ffb28f]/[.05] p-5 text-center text-sm text-[#ffb28f]">{error}</p> : rows.length === 0 ? <p className="mt-9 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-[#9cabba]">{t("noEntries")}</p> : <>
          <section className="mt-8 grid grid-cols-3 items-end gap-3" aria-label={t("leaderboard")}>
            {podium.map((row, index) => <article key={row.player.id ?? `${row.rank}-${row.player.first_name}`} className={`rounded-[22px] border p-3 text-center ${index === 0 ? "border-[#f7d774]/50 bg-[#f7d774]/[.08] pb-6" : "border-white/10 bg-white/[.035]"}`}><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[#f7d774]">{index === 0 ? <Trophy size={22} /> : <Medal size={20} />}</div><p className="mt-3 truncate text-sm font-semibold">{row.player.first_name}</p><p className="mt-1 font-mono text-[10px] text-[#9aa8b4]">{t("level")} {row.player.level}</p><p className="mt-3 font-mono text-xs text-[#d7fb70]">{row.score.toLocaleString(language)} XP</p><p className="mt-2 font-display text-lg text-[#f7d774]">#{row.rank}</p></article>)}
          </section>
          <section className="mt-5 space-y-3">{rows.slice(3).map(row => <article key={row.player.id ?? `${row.rank}-${row.player.username ?? row.player.first_name}`} className={`flex items-center gap-4 rounded-2xl border p-4 ${myRank === row.rank ? "border-[#d7fb70]/40 bg-[#d7fb70]/[.07]" : "border-white/10 bg-white/[.035]"}`}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 font-display text-lg text-[#f7d774]">{row.rank}</span>{row.player.photo_url ? <img src={row.player.photo_url} alt="" className="h-9 w-9 rounded-xl object-cover" /> : <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-[#91a2ae]"><UserRound size={16} /></div>}<div className="min-w-0 flex-1"><p className="truncate font-medium">{row.player.first_name}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#9aa8b4]">{t("level")} {row.player.level}{row.player.username ? ` · @${row.player.username}` : ""}</p></div><span className="font-mono text-sm text-[#d7fb70]">{row.score.toLocaleString(language)} XP</span></article>)}</section>
        </>}
      </main>
    </div>
  );
}

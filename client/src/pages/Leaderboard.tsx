import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";
import { getLeaderboard } from "@/lib/game-api";

type Row = { rank: number; score: number; player: { first_name: string; username: string | null; level: number } };
export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getLeaderboard().then(setRows).catch(() => setRows([])).finally(() => setLoading(false)); }, []);
  return <div className="game-shell min-h-[100dvh] px-5 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9]"><ArrowLeft size={18} /> GameQuest Hub</button><section className="mt-9"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Season alpha</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">Pathfinder ranks</h1></div><Crown className="text-[#f7d774]" /></div>{loading ? <div className="mt-12 grid place-items-center text-[#d7fb70]"><Loader2 className="animate-spin" /></div> : rows.length === 0 ? <p className="mt-9 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-[#9cabba]">Complete Genesis Run to become the first Pathfinder on the board.</p> : <div className="mt-7 space-y-3">{rows.map(row => <article key={`${row.rank}-${row.player.username ?? row.player.first_name}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 font-display text-lg text-[#f7d774]">{row.rank}</span><div className="min-w-0 flex-1"><p className="truncate font-medium">{row.player.first_name}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#9aa8b4]">Level {row.player.level}</p></div><span className="font-mono text-sm text-[#d7fb70]">{row.score} XP</span></article>)}</div>}</section></main></div>;
}

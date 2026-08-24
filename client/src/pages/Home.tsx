import { BadgeCheck, ChevronRight, Compass, Flame, Gem, MapPinned, Play, ShieldCheck, Sparkles, Swords, Trophy, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function Home() {
  const { webApp, isTelegram } = useTelegramWebApp();
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const player = webApp?.initDataUnsafe?.user;
  const playerName = verifiedName || player?.first_name || "Adventurer";

  const beginQuest = () => {
    webApp?.HapticFeedback?.impactOccurred("medium");
    document.getElementById("quest-now")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const mainButton = webApp?.MainButton;
    if (!mainButton) return;
    mainButton.setText("MULAI QUEST PERTAMA");
    mainButton.show();
    mainButton.onClick(beginQuest);
    return () => {
      mainButton.offClick(beginQuest);
      mainButton.hide();
    };
  }, [webApp]);

  useEffect(() => {
    if (!webApp?.initData) return;
    let mounted = true;
    fetch("/api/telegram/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initData: webApp.initData }),
    })
      .then(async response => response.ok ? response.json() : null)
      .then(payload => {
        if (mounted && payload?.player?.firstName) setVerifiedName(payload.player.firstName);
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, [webApp]);

  return (
    <div className="game-shell min-h-[100dvh] overflow-x-hidden pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]">
      <main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]">
        <header className="flex items-center justify-between" aria-label="Header aplikasi">
          <div className="flex items-center gap-3">
            <div className="brand-mark" aria-hidden="true"><Swords size={19} strokeWidth={2.4} /></div>
            <div>
              <p className="font-display text-[21px] leading-none tracking-[-0.04em] text-[#fbf8ed]">GameQuest</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.17em] text-[#9fae9d]">Hub · Season Alpha</p>
            </div>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 text-[10px] font-medium text-[#d7fb70]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d7fb70] shadow-[0_0_10px_#d7fb70]" />
            {isTelegram ? "Online" : "Preview"}
          </div>
        </header>

        <section className="relative mt-9 overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#1a2639]/80 px-6 pb-6 pt-7 shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d7fb70]/10 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 h-40 w-40 opacity-70" aria-hidden="true">
            <div className="absolute bottom-10 right-10 h-20 w-20 rotate-45 rounded-[24px] border border-[#d7fb70]/20" />
            <div className="absolute bottom-3 right-3 h-20 w-20 rotate-45 rounded-[24px] border border-[#d7fb70]/10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#d7fb70]"><Sparkles size={13} /> Player Card</div>
            <div className="mt-7 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#9fae9d]">Selamat datang kembali</p>
                <h1 className="mt-2 font-display text-[36px] leading-[0.95] tracking-[-0.055em] text-[#fbf8ed]">{playerName}<span className="text-[#d7fb70]">.</span></h1>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#d7fb70]/30 bg-[#d7fb70]/10 text-[#d7fb70]"><UserRound size={25} /></div>
            </div>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[8%] rounded-full bg-[#d7fb70] shadow-[0_0_12px_#d7fb70]" /></div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#aeb8b1]"><span>LEVEL 01 · PATHFINDER</span><span className="text-[#e8f5c6]">0 / 100 XP</span></div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3" aria-label="Statistik pemain awal">
          {[
            { icon: Trophy, label: "Level", value: "01", tint: "text-[#f7d774]" },
            { icon: Flame, label: "Streak", value: "0", tint: "text-[#ff9a6e]" },
            { icon: Gem, label: "Relics", value: "0", tint: "text-[#8de4ff]" },
          ].map(({ icon: Icon, label, value, tint }) => (
            <div key={label} className="rounded-2xl border border-white/[0.09] bg-white/[0.035] px-3 py-3.5">
              <Icon size={16} className={tint} />
              <p className="mt-4 font-display text-[25px] leading-none text-[#f8f5e9]">{value}</p>
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.11em] text-[#8490a0]">{label}</p>
            </div>
          ))}
        </section>

        <section id="quest-now" className="mt-9" aria-labelledby="quest-title">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#a3b58f]">Quest Board</p>
              <h2 id="quest-title" className="mt-1 font-display text-[28px] tracking-[-0.04em] text-[#fbf8ed]">Your next move</h2>
            </div>
            <span className="pb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8391a0]">01 Available</span>
          </div>

          <article className="quest-card mt-4 rounded-[24px] border border-white/[0.1] p-4">
            <div className="flex gap-4">
              <div className="quest-emblem grid h-16 w-16 shrink-0 place-items-center rounded-[19px] border border-[#d7fb70]/25 text-[#d7fb70]"><Compass size={29} /></div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-1.5"><span className="rounded-full bg-[#d7fb70]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#d7fb70]">Starter</span><BadgeCheck size={14} className="text-[#b7c8d7]" /></div>
                <h3 className="mt-2 font-display text-[22px] leading-none tracking-[-0.035em] text-[#fbf8ed]">Genesis Run</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-[#9dabb8]">Claim your first path and unlock the quest map.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3.5">
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#a7b69d]"><ShieldCheck size={15} className="text-[#d7fb70]" /> +25 XP upon completion</div>
              <button onClick={beginQuest} className="grid h-9 w-9 place-items-center rounded-full bg-[#d7fb70] text-[#16200f] transition-transform duration-150 active:scale-95" aria-label="Mulai Genesis Run"><ChevronRight size={18} strokeWidth={2.7} /></button>
            </div>
          </article>
        </section>

        <section className="mt-7 rounded-[22px] border border-dashed border-white/[0.14] bg-white/[0.02] px-4 py-4" aria-label="Misi berikutnya">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.055] text-[#93a2b1]"><MapPinned size={19} /></div>
            <div className="flex-1"><p className="text-[13px] font-medium text-[#dfe6de]">The map is waiting</p><p className="mt-0.5 text-[11px] text-[#8290a0]">Selesaikan Genesis Run untuk membuka dunia quest.</p></div>
            <Play size={15} className="text-[#708091]" />
          </div>
        </section>
      </main>
    </div>
  );
}

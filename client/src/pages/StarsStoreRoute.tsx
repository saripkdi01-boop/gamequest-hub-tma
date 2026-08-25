import { ArrowLeft, CircleGauge, Gem, KeyRound, Layers3, LockKeyhole, Sparkles, Star, Target, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useI18n, type TranslationKey } from "@/i18n";
import { readGameResponse } from "@/lib/game-api";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type PublicItem = { sku: string; title: string; description: string; amountXtr: number; benefitType: string };
const itemBlueprints: Array<{ sku: string; title: TranslationKey; description: TranslationKey; icon: typeof Star; tone: string }> = [
  { sku: "energy.cell", title: "energyCell", description: "energyCellDescription", icon: Zap, tone: "#8de4ff" },
  { sku: "relic.key", title: "relicKey", description: "relicKeyDescription", icon: KeyRound, tone: "#f7d774" },
  { sku: "streak.sigil", title: "streakSigil", description: "streakSigilDescription", icon: Layers3, tone: "#ff9a6e" },
  { sku: "focus.lens", title: "focusLens", description: "focusLensDescription", icon: Target, tone: "#d7fb70" },
  { sku: "yuki.skin", title: "yukiSkin", description: "yukiSkinDescription", icon: Sparkles, tone: "#4ce0c4" },
  { sku: "chain.booster", title: "chainBooster", description: "chainBoosterDescription", icon: CircleGauge, tone: "#b89dff" },
];

export default function StarsStoreRoute() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { webApp, isTelegram } = useTelegramWebApp();
  const [catalog, setCatalog] = useState<PublicItem[]>([]);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initData = webApp?.initData;
  const catalogBySku = useMemo(() => new Map(catalog.map(item => [item.sku, item])), [catalog]);

  useEffect(() => {
    if (!initData) return;
    let active = true;
    fetch("/api/game/dashboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, action: "stars_catalog" }) })
      .then(response => readGameResponse<{ catalog: PublicItem[] }>(response))
      .then(payload => { if (active) setCatalog(payload.catalog); })
      .catch(caught => { if (active) setError(caught instanceof Error ? caught.message : t("providerNotConfigured")); });
    return () => { active = false; };
  }, [initData, t]);

  async function buy(sku: string) {
    if (!initData || !webApp?.openInvoice || !catalogBySku.has(sku)) return;
    setBusySku(sku); setError(null);
    try {
      const response = await fetch("/api/game/dashboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData, action: "stars_invoice", sku }) });
      const payload = await readGameResponse<{ invoice: { invoiceLink: string } }>(response);
      webApp.openInvoice(payload.invoice.invoiceLink);
    } catch (caught) { setError(caught instanceof Error ? caught.message : t("providerNotConfigured")); } finally { setBusySku(null); }
  }

  return <div className="game-shell min-h-[100dvh] px-4 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><LanguageSwitcher compact /></header><section className="quest-nexus-panel mt-5 p-4"><div className="relative z-[1]"><div className="flex items-start justify-between gap-3"><div><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b942]/10 text-[#f5b942]"><Star size={20} /></div><p className="mt-3 font-mono text-[9px] uppercase tracking-[.15em] text-[#f5b942]">{t("starsStore")}</p><h1 className="mt-1 font-display text-[28px] leading-none tracking-[-.05em]">{t("buyWithStars")}</h1></div><div className="rounded-lg border border-white/10 bg-black/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[.08em] text-[#aebac4]">XTR</div></div><p className="mt-3 text-[12px] leading-relaxed text-[#aebac4]">{t("starsOnlyGoods")}</p><div className="mt-4 grid gap-2">{itemBlueprints.map(item => { const Icon = item.icon; const serverItem = catalogBySku.get(item.sku); const title = t(item.title); const description = t(item.description); return <article key={item.sku} className="rounded-xl border border-white/10 bg-white/[.035] p-3"><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border" style={{ color: item.tone, borderColor: `${item.tone}55`, backgroundColor: `${item.tone}0b` }}><Icon size={17} /></div><div className="min-w-0 flex-1"><h2 className="text-[12px] font-semibold text-[#f3f5eb]">{title}</h2><p className="mt-0.5 text-[10px] leading-snug text-[#8998a6]">{description}</p></div><span className="whitespace-nowrap font-mono text-[10px] font-semibold text-[#f5d77c]">{serverItem ? `${serverItem.amountXtr} XTR` : "— XTR"}</span></div><button disabled={!isTelegram || !serverItem || busySku !== null} onClick={() => buy(item.sku)} className="btn-3d btn-ghost mt-2.5 flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-45">{busySku === item.sku ? <CircleGauge size={13} className="animate-spin" /> : serverItem ? <Star size={13} /> : <LockKeyhole size={13} />}{serverItem ? t("buyWithStars") : t("starsCatalogLocked")}</button></article>; })}</div>{!isTelegram && <p className="mt-3 rounded-lg border border-[#f7d774]/20 bg-[#f7d774]/[.06] p-2.5 text-[11px] text-[#e5d8a3]">{t("browserPreview")} {t("openVerifiedSession")}</p>}{catalog.length === 0 && <p className="mt-3 text-center text-[10px] text-[#8493a0]">{t("starsCatalogEmpty")}</p>}{error && <p className="mt-3 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-2.5 text-[11px] text-[#ffd5c2]">{error}</p>}</div></section></main></div>;
}

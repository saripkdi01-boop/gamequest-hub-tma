import { ArrowLeft, LockKeyhole, Sparkles, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function StarsStoreRoute() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { webApp, isTelegram } = useTelegramWebApp();
  const catalogEnabled = Boolean(import.meta.env.VITE_STARS_CATALOG_ENABLED === "true");
  const sku = import.meta.env.VITE_STARS_FEATURED_SKU as string | undefined;

  async function buy() {
    if (!isTelegram || !webApp?.initData || !catalogEnabled || !sku) return;
    const response = await fetch("/api/game/dashboard", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ initData: webApp.initData, action: "stars_invoice", sku }) });
    const payload = await response.json() as { invoice?: { invoiceLink: string }; error?: string };
    if (!response.ok || !payload.invoice?.invoiceLink) { window.alert(payload.error ?? t("providerNotConfigured")); return; }
    webApp.openInvoice?.(payload.invoice.invoiceLink);
  }

  return <div className="game-shell min-h-[100dvh] px-4 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><LanguageSwitcher compact /></header><section className="quest-nexus-panel mt-6 p-5"><div className="relative z-[1]"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5b942]/10 text-[#f5b942]"><Star size={22} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#f5b942]">{t("starsStore")}</p><h1 className="mt-1.5 font-display text-[30px] leading-none tracking-[-.05em]">{t("buyWithStars")}</h1><p className="mt-3 text-[13px] leading-relaxed text-[#aebac4]">{t("starsOnlyGoods")}</p>{catalogEnabled && sku ? <button onClick={buy} disabled={!isTelegram} className="btn-3d btn-quest mt-5 flex w-full items-center justify-center gap-2 py-3 text-sm"><Sparkles size={16} />{t("buyWithStars")}</button> : <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[12px] leading-relaxed text-[#aebac4]"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#f5b942]" />{t("starsCatalogEmpty")}</div>}</div></section></main></div>;
}

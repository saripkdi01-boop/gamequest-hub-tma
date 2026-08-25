import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  return <div className="game-shell relative grid min-h-[100dvh] place-items-center p-5 text-[#fbf8ed]"><div className="absolute right-4 top-[calc(var(--tg-content-safe-area-inset-top)+14px)]"><LanguageSwitcher compact /></div><main className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a2639]/90 p-5 text-center shadow-[0_18px_48px_rgba(0,0,0,.28)]"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#ff9a6e]/10 text-[#ff9a6e]"><AlertCircle size={23} /></div><p className="mt-3 font-mono text-[10px] uppercase tracking-[.16em] text-[#ff9a6e]">404</p><h1 className="mt-1.5 font-display text-[28px] leading-none tracking-[-.04em]">{t("questUnavailable")}</h1><p className="mt-2 text-[13px] leading-relaxed text-[#aebac4]">{t("routeUnavailable")}</p><button onClick={() => setLocation("/")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d7fb70] px-4 py-2.5 text-sm font-semibold text-[#16200f]"><ArrowLeft size={15} /> {t("backToHub")}</button></main></div>;
}

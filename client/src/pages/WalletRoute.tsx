import { ArrowLeft, ShieldCheck, WalletCards } from "lucide-react";
import { TonConnectButton, TonConnectUIProvider, useTonAddress } from "@tonconnect/ui-react";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const manifestUrl = "https://gamequest-hub-tma.vercel.app/tonconnect-manifest.json";

function WalletPanel() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const address = useTonAddress();
  return <div className="game-shell min-h-[100dvh] px-4 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><LanguageSwitcher compact /></header><section className="quest-nexus-panel mt-6 p-5"><div className="relative z-[1]"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#4ce0c4]/10 text-[#4ce0c4]"><WalletCards size={22} /></div><TonConnectButton /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#4ce0c4]">{t("wallet")}</p><h1 className="mt-1.5 font-display text-[30px] leading-none tracking-[-.05em]">{address ? t("walletConnected") : t("connectWallet")}</h1><p className="mt-3 text-[13px] leading-relaxed text-[#aebac4]">{t("walletSafety")}</p>{address ? <div className="mt-5 rounded-xl border border-[#4ce0c4]/25 bg-[#4ce0c4]/[.06] p-3"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-[#4ce0c4]">{t("verified")}</p><p className="mt-1 break-all font-mono text-[11px] text-[#e5fff8]">{address}</p><p className="mt-2 text-[11px] leading-relaxed text-[#9ed7c9]">{t("walletProofPending")}</p></div> : null}<div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[11px] leading-relaxed text-[#aebac4]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#f5b942]" />{t("futureSettlement")}</div></div></section></main></div>;
}

export default function WalletRoute() {
  return <TonConnectUIProvider manifestUrl={manifestUrl}><WalletPanel /></TonConnectUIProvider>;
}

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { useI18n } from "@/i18n";

type Labels = { unexpectedError: string; reloadPage: string; technicalDetails: string; errorProtected: string; unknownError: string };
type Props = { children: ReactNode; labels: Labels };
type State = { hasError: boolean; error: Error | null };

class ErrorBoundaryCore extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className="game-shell grid min-h-[100dvh] place-items-center px-4 py-8 text-[#fbf8ed]"><main className="quest-nexus-panel w-full max-w-[420px] p-5 text-center"><div className="relative z-[1]"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#ff9a6e]/30 bg-[#ff9a6e]/10 text-[#ffb28f]"><AlertTriangle size={23} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#ffb28f]">QUEST//MIND</p><h1 className="mt-2 font-display text-[27px] leading-none tracking-[-.04em]">{this.props.labels.unexpectedError}</h1><p className="mt-3 text-[12px] leading-relaxed text-[#aebac4]">{this.props.labels.errorProtected}</p><details className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3 text-left"><summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[.1em] text-[#aebac4]">{this.props.labels.technicalDetails}</summary><pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words text-[10px] text-[#8290a0]">{this.state.error?.message || this.props.labels.unknownError}</pre></details><button onClick={() => window.location.reload()} className="btn-3d btn-quest mt-4 flex w-full items-center justify-center gap-2 py-3 text-xs"><RotateCcw size={15} />{this.props.labels.reloadPage}</button></div></main></div>;
  }
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return <ErrorBoundaryCore labels={{ unexpectedError: t("unexpectedError"), reloadPage: t("reloadPage"), technicalDetails: t("technicalDetails"), errorProtected: t("errorProtected"), unknownError: t("unknownError") }}>{children}</ErrorBoundaryCore>;
}

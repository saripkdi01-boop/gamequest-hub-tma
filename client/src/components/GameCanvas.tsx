import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene } from "@/game/scene";
import type { ExploreRouteState, GameHandle } from "@/game/types";
import { useI18n } from "@/i18n";

type GameCanvasProps = ExploreRouteState & { onGateFocus: (gateIndex: number) => void };

export function GameCanvas({ checkpointIndex, focusedGate, onGateFocus }: GameCanvasProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const callbackRef = useRef(onGateFocus);
  const [ready, setReady] = useState(false);
  callbackRef.current = onGateFocus;
  useEffect(() => { const canvas = canvasRef.current; if (!canvas || handleRef.current) return; const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true, disableWebGL2Support: true }); let disposed = false; const onResize = () => engine.resize(); window.addEventListener("resize", onResize); createGameScene(engine, canvas, { onGateFocus: index => callbackRef.current(index) }).then(handle => { if (disposed) { handle.dispose(); return; } handleRef.current = handle; engine.runRenderLoop(() => handleRef.current && engine.scenes[0]?.render()); setReady(true); }); return () => { disposed = true; window.removeEventListener("resize", onResize); engine.stopRenderLoop(); handleRef.current?.dispose(); handleRef.current = null; engine.dispose(); }; }, []);
  useEffect(() => { handleRef.current?.updateRoute({ checkpointIndex, focusedGate }); }, [checkpointIndex, focusedGate]);
  return <div className="quest-nexus-panel relative h-[39svh] min-h-[260px] max-h-[390px]"><canvas ref={canvasRef} className="quest-nexus-canvas h-full w-full touch-pan-y" aria-label={t("routeAtlas")} />{!ready && <div className="absolute inset-0 grid place-items-center bg-[#0b0925]/90 font-mono text-[9px] uppercase tracking-[.14em] text-[#4ce0c4]">{t("syncingRoute")}</div>}<div className="quest-nexus-scanline" aria-hidden="true" /></div>;
}

import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene } from "@/game/scene";
import type { ExploreRouteState, GameHandle } from "@/game/types";

type GameCanvasProps = ExploreRouteState & { onGateFocus: (gateIndex: number) => void };

export function GameCanvas({ checkpointIndex, focusedGate, onGateFocus }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const callbackRef = useRef(onGateFocus);
  const [ready, setReady] = useState(false);
  callbackRef.current = onGateFocus;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || handleRef.current) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true, disableWebGL2Support: true });
    let disposed = false;
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    createGameScene(engine, canvas, { onGateFocus: index => callbackRef.current(index) }).then(handle => {
      if (disposed) { handle.dispose(); return; }
      handleRef.current = handle;
      engine.runRenderLoop(() => handleRef.current && engine.scenes[0]?.render());
      setReady(true);
    });
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      engine.stopRenderLoop();
      handleRef.current?.dispose();
      handleRef.current = null;
      engine.dispose();
    };
  }, []);

  useEffect(() => { handleRef.current?.updateRoute({ checkpointIndex, focusedGate }); }, [checkpointIndex, focusedGate]);

  return <div className="relative h-[47svh] min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[#081326] shadow-[0_28px_70px_rgba(0,0,0,.42)]"><canvas ref={canvasRef} className="block h-full w-full touch-pan-y" aria-label="Genesis Run exploration map" />{!ready && <div className="absolute inset-0 grid place-items-center bg-[#081326] font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Synchronizing route…</div>}</div>;
}

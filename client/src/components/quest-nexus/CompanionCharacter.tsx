import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type CompanionState = "idle" | "press" | "success" | "fail" | "celebrate";
export type CompanionHandle = { play: (state: CompanionState, durationMs?: number) => void };

type Props = { name?: string; className?: string };

const stateDuration: Record<Exclude<CompanionState, "idle">, number> = { press: 280, success: 760, fail: 540, celebrate: 980 };

const CompanionCharacter = forwardRef<CompanionHandle, Props>(function CompanionCharacter({ name = "Yuki", className = "" }, ref) {
  const [state, setState] = useState<CompanionState>("idle");
  const timer = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    play(nextState, durationMs) {
      if (timer.current) window.clearTimeout(timer.current);
      setState(nextState);
      if (nextState !== "idle") {
        timer.current = window.setTimeout(() => setState("idle"), durationMs ?? stateDuration[nextState]);
      }
    },
  }), []);

  return (
    <div className={`gq-companion gq-companion-${state} ${className}`} role="img" aria-label={`${name}, ${state}`} aria-live="polite">
      <svg className="yuki-svg" viewBox="0 0 130 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="yukiCape" x1="20" y1="30" x2="105" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#6258C8" /><stop offset="1" stopColor="#211E51" /></linearGradient>
          <linearGradient id="yukiHair" x1="35" y1="20" x2="95" y2="78" gradientUnits="userSpaceOnUse"><stop stopColor="#D2D8FF" /><stop offset="1" stopColor="#7188FF" /></linearGradient>
          <radialGradient id="yukiCore" cx="0" cy="0" r="1" gradientTransform="translate(65 109) rotate(90) scale(28)"><stop stopColor="#EFFFFB" /><stop offset="0.46" stopColor="#4CE0C4" /><stop offset="1" stopColor="#1C927E" stopOpacity="0" /></radialGradient>
          <filter id="yukiGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <g className="yuki-body">
          <ellipse cx="65" cy="148" rx="31" ry="6" fill="#050512" fillOpacity=".55" />
          <path d="M36 83C40 72 51 66 65 66C79 66 90 72 94 83L108 132C93 144 79 148 65 148C51 148 37 144 22 132L36 83Z" fill="url(#yukiCape)" stroke="#938DFF" strokeOpacity=".45" strokeWidth="2" />
          <path d="M45 84L29 128C41 137 50 140 65 141V79L45 84Z" fill="#7871DF" fillOpacity=".28" />
          <circle className="yuki-core" cx="65" cy="109" r="26" fill="url(#yukiCore)" filter="url(#yukiGlow)" />
          <path d="M49 70C43 63 39 54 41 42C43 27 54 17 65 17C79 17 91 28 92 45C93 57 88 65 81 71C72 77 57 76 49 70Z" fill="#F3EFFF" stroke="#9BA8FF" strokeWidth="2" />
          <path d="M39 48C34 36 40 18 53 12L62 23L72 8L80 24L94 18C100 34 95 53 89 61L79 43L69 50L60 37L49 54L39 48Z" fill="url(#yukiHair)" stroke="#A9B6FF" strokeWidth="2" />
          <ellipse className="yuki-eye-l" cx="54" cy="51" rx="4" ry="6" fill="#171431" />
          <ellipse className="yuki-eye-r" cx="76" cy="51" rx="4" ry="6" fill="#171431" />
          <path d="M60 62C63 65 67 65 70 62" stroke="#7563B4" strokeWidth="2" strokeLinecap="round" />
          <path className="yuki-arm-l" d="M37 91C24 93 18 104 21 114" stroke="#F3EFFF" strokeWidth="10" strokeLinecap="round" />
          <path className="yuki-arm-r" d="M93 91C106 93 112 104 109 114" stroke="#F3EFFF" strokeWidth="10" strokeLinecap="round" />
          <circle cx="22" cy="113" r="6" fill="#4CE0C4" />
          <circle cx="108" cy="113" r="6" fill="#4CE0C4" />
          <circle cx="104" cy="92" r="10" fill="#4CE0C4" fillOpacity=".8" stroke="#C9FFF5" strokeWidth="2" />
        </g>
      </svg>
      {state === "success" || state === "celebrate" ? <span className="gq-sparkle" style={{ left: "12px", top: "24px" }} aria-hidden="true">✦</span> : null}
      {state === "success" || state === "celebrate" ? <span className="gq-sparkle" style={{ right: "6px", top: "42px", animationDelay: "110ms" }} aria-hidden="true">✧</span> : null}
    </div>
  );
});

export default CompanionCharacter;

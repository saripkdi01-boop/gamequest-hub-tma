import { getGuide, type GuideId } from "@/game/guides";

type Character3DProps = {
  guideId: GuideId;
  size?: "sm" | "md" | "lg";
  autoRotate?: boolean;
  className?: string;
};

const dimensions = { sm: 40, md: 64, lg: 94 } as const;

export default function Character3D({ guideId, size = "md", autoRotate = false, className = "" }: Character3DProps) {
  const guide = getGuide(guideId);
  const dim = dimensions[size];
  const gradientId = `guide-${guide.id}`;
  const core = guide.form === "orb" || guide.form === "mist" || guide.form === "crown";

  return (
    <div className={`relative grid shrink-0 place-items-center ${autoRotate ? "animate-[spin_12s_linear_infinite]" : ""} ${className}`} style={{ width: dim, height: dim }} role="img" aria-label={guide.name}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="12" y1="10" x2="88" y2="92"><stop stopColor={guide.primary} /><stop offset="1" stopColor={guide.secondary} /></linearGradient><filter id={`${gradientId}-glow`} x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="4" /></filter></defs>
        <circle cx="50" cy="50" r="43" fill={guide.primary} fillOpacity=".09" stroke={guide.primary} strokeOpacity=".55" />
        <circle cx="50" cy="50" r="31" fill={`url(#${gradientId})`} fillOpacity={core ? ".75" : ".2"} filter={`url(#${gradientId}-glow)`} />
        {guide.form === "console" && <><rect x="23" y="34" width="54" height="33" rx="10" fill="#101326" stroke={`url(#${gradientId})`} strokeWidth="5" /><circle cx="36" cy="50" r="4" fill={guide.primary} /><circle cx="64" cy="50" r="4" fill={guide.secondary} /></>}
        {guide.form === "orb" && <><circle cx="50" cy="50" r="22" fill={`url(#${gradientId})`} /><ellipse cx="50" cy="50" rx="35" ry="13" fill="none" stroke={guide.secondary} strokeWidth="3" transform="rotate(-22 50 50)" /></>}
        {guide.form === "mist" && <><path d="M27 63c-6-18 10-36 25-31 8-12 28 1 19 14 15 8 2 27-13 23-9 10-28 3-31-6Z" fill={`url(#${gradientId})`} /><circle cx="42" cy="50" r="3" fill="#101326" /><circle cx="58" cy="50" r="3" fill="#101326" /></>}
        {guide.form === "link" && <><circle cx="35" cy="51" r="12" fill={guide.primary} /><circle cx="50" cy="41" r="12" fill={guide.secondary} /><circle cx="65" cy="51" r="12" fill="#ffd169" /></>}
        {guide.form === "warden" && <path d="M50 18 75 29v22c0 17-10 25-25 32-15-7-25-15-25-32V29l25-11Z" fill={`url(#${gradientId})`} stroke="#e6f9ff" strokeOpacity=".6" strokeWidth="3" />}
        {guide.form === "prism" && <path d="m50 17 26 24-13 40H37L24 41l26-24Z" fill={`url(#${gradientId})`} stroke="#fff" strokeOpacity=".55" strokeWidth="3" />}
        {guide.form === "runner" && <><path d="m21 56 31-34 27 13-30 43-28-22Z" fill={`url(#${gradientId})`} /><path d="m15 63 19 1M10 71l25-2" stroke={guide.primary} strokeWidth="4" strokeLinecap="round" /></>}
        {guide.form === "crown" && <><path d="m26 69 6-38 18 16 18-16 6 38H26Z" fill={`url(#${gradientId})`} /><rect x="27" y="68" width="46" height="10" rx="4" fill="#fff0b2" /></>}
        {(guide.form === "guardian" || guide.form === "scout") && <><circle cx="50" cy="38" r="14" fill="#f3efff" /><path d="M28 78c4-23 13-31 22-31s18 8 22 31" fill={`url(#${gradientId})`} /><path d="M32 36c2-17 31-20 36 0" stroke={guide.primary} strokeWidth="7" strokeLinecap="round" /></>}
      </svg>
    </div>
  );
}

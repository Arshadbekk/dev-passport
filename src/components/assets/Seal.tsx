import { useId } from "react";

// Scalloped foil seal outline, computed once
const OUTLINE = (() => {
  const n = 28;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? 44 : 49;
    const a = (i * Math.PI) / n;
    d += `${i ? "L" : "M"}${(50 + r * Math.sin(a)).toFixed(2)},${(50 - r * Math.cos(a)).toFixed(2)}`;
  }
  return d + "Z";
})();

/** Gold foil seal with a check mark. Marks a platform-verified stamp. */
export default function Seal({ className = "h-8 w-8" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`sg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E7B8" />
          <stop offset="0.5" stopColor="#C9A45C" />
          <stop offset="1" stopColor="#8F6D2E" />
        </linearGradient>
      </defs>
      <path d={OUTLINE} fill={`url(#sg${uid})`} />
      <circle cx="50" cy="50" r="35" fill="none" stroke="#3A0A15" strokeWidth="1.4" opacity="0.5" />
      <path d="M33 51l11 11 23-25" fill="none" stroke="#3A0A15" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import { useId } from "react";

function star(cx: number, cy: number, R: number, r: number): string {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = (i * Math.PI) / 5;
    d += `${i ? "L" : "M"}${(cx + rad * Math.sin(a)).toFixed(2)},${(cy - rad * Math.cos(a)).toFixed(2)}`;
  }
  return d + "Z";
}

// Laurel wreath: leaves placed along both sides of an arc, computed once
const LEAVES = (() => {
  const out: { x: string; y: string; rot: string }[] = [];
  const n = 9;
  for (const side of [1, -1]) {
    for (let k = 0; k < n; k++) {
      const phi = ((85 - k * (130 / (n - 1))) * Math.PI) / 180;
      const a = side === 1 ? phi : Math.PI - phi;
      const x = 100 + 49 * Math.cos(a);
      const y = 100 + 49 * Math.sin(a);
      const rot = (a * 180) / Math.PI + (side === 1 ? -25 : 25);
      out.push({ x: x.toFixed(2), y: y.toFixed(2), rot: rot.toFixed(1) });
    }
  }
  return out;
})();

/** Gold foil crest: ring lettering, laurel wreath, globe and star. */
export default function Crest({ className = "h-24 w-24", simple = false }: { className?: string; simple?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const grad = `url(#cg${uid})`;

  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`cg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E7B8" />
          <stop offset="0.5" stopColor="#C9A45C" />
          <stop offset="1" stopColor="#8F6D2E" />
        </linearGradient>
        <path id={`ring${uid}`} d="M 28,100 A 72,72 0 1,1 172,100 A 72,72 0 1,1 28,100" />
      </defs>

      <circle cx="100" cy="100" r="95" stroke={grad} strokeWidth="1.6" />
      <circle cx="100" cy="100" r="89" stroke={grad} strokeWidth="0.6" />

      {!simple && (
        <>
          <text
            fill={grad}
            fontSize="9.5"
            fontWeight="600"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            <textPath href={`#ring${uid}`} textLength="438" lengthAdjust="spacing">
              DEV PASSPORT • MOBILE DEV CONNECT • PROOF NOT CLAIMS •
            </textPath>
          </text>
          <circle cx="100" cy="100" r="62" stroke={grad} strokeWidth="0.6" />
        </>
      )}

      {/* Laurel wreath */}
      <g fill={grad} opacity="0.9">
        {LEAVES.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx="2.4" ry="6.2" transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
        ))}
      </g>

      {/* Globe */}
      <g stroke={grad} strokeWidth="1.1">
        <circle cx="100" cy="100" r="34" />
        <ellipse cx="100" cy="100" rx="13" ry="34" />
        <ellipse cx="100" cy="100" rx="34" ry="12" />
        <path d="M66 100h68M100 66v68" />
      </g>

      {/* Star */}
      <path d={star(100, 56, 6, 2.5)} fill={grad} />
    </svg>
  );
}

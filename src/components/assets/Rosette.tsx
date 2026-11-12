/** Guilloche rosette: the fine interlocking line pattern printed on real passports and banknotes. */
function rose(R: number, r: number, d: number, turns: number, pts: number): string {
  const k = (R - r) / r;
  const scale = 100 / (R - r + d);
  let s = "";
  for (let i = 0; i <= pts; i++) {
    const t = (i / pts) * turns * 2 * Math.PI;
    const x = ((R - r) * Math.cos(t) + d * Math.cos(k * t)) * scale;
    const y = ((R - r) * Math.sin(t) - d * Math.sin(k * t)) * scale;
    s += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return s;
}

const A = rose(48, 11, 11, 11, 1400);
const B = rose(40, 7, 9, 7, 1000);

export default function Rosette({ className = "h-64 w-64 text-gold" }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth="0.3" className={className} aria-hidden>
      <path d={A} />
      <path d={B} transform="rotate(6)" opacity="0.65" />
      <circle r="99" strokeWidth="0.5" />
      <circle r="92" opacity="0.5" />
      <circle r="30" opacity="0.5" />
    </svg>
  );
}

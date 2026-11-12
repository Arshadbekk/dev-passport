import { useId } from "react";

/** The big rectangular "ISSUED" ink stamp pressed onto a new passport. */
export default function IssuedStamp({
  number,
  date,
  className = "h-24 w-52",
}: {
  number: string;
  date: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const ink = "#E8C97F";
  const serif = { fontFamily: "var(--font-serif), Georgia, serif" };

  return (
    <svg viewBox="0 0 260 120" className={className} role="img" aria-label={`Issued ${date}, passport number ${number}`}>
      <defs>
        <filter id={`r${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
      </defs>
      <g filter={`url(#r${uid})`} fill="none" stroke={ink}>
        <rect x="6" y="6" width="248" height="108" rx="10" strokeWidth="3.2" />
        <rect x="14" y="14" width="232" height="92" rx="6" strokeWidth="1" />
        <text x="130" y="34" textAnchor="middle" fill={ink} stroke="none" fontSize="8.5" letterSpacing="4" fontWeight="600" style={serif}>
          MOBILE DEV CONNECT
        </text>
        <text x="130" y="72" textAnchor="middle" fill={ink} stroke="none" fontSize="40" fontWeight="700" letterSpacing="7" style={serif}>
          ISSUED
        </text>
        <text x="130" y="94" textAnchor="middle" fill={ink} stroke="none" fontSize="9.5" letterSpacing="2.5" fontFamily="ui-monospace, monospace">
          {date.toUpperCase()} · {number}
        </text>
      </g>
    </svg>
  );
}

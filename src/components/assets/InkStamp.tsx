import { useId } from "react";
import { StampCategory } from "@/lib/types";
import { StampGlyph } from "../StampIcon";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function monthYear(date: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(date);
  if (!m) return "";
  const name = MONTHS[Number(m[2]) - 1];
  return name ? `${name} ${m[1]}` : "";
}

/** A round passport ink stamp. Verified = solid gold ink; self-reported = dashed, faded ink. */
export default function InkStamp({
  category,
  verified,
  date = "",
  className = "h-24 w-24",
}: {
  category: StampCategory;
  verified: boolean;
  date?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const ink = verified ? "#E0C07A" : "#C9AFA6";
  const font = { fontFamily: "var(--font-sans), Helvetica, Arial, sans-serif" };

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`${category} stamp, ${verified ? "verified" : "self-reported"}`}
    >
      <defs>
        <path id={`t${uid}`} d="M 24,60 A 36,36 0 0,1 96,60" />
        <path id={`b${uid}`} d="M 15,60 A 45,45 0 0,0 105,60" />
        <filter id={`r${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" />
        </filter>
      </defs>

      <g filter={`url(#r${uid})`} fill="none" stroke={ink} color={ink}>
        <circle cx="60" cy="60" r="55" strokeWidth="2.4" strokeDasharray={verified ? undefined : "5 3"} />
        <circle cx="60" cy="60" r="49.5" strokeWidth="0.9" />
        <circle cx="60" cy="60" r="32" strokeWidth="0.9" />

        <text fill={ink} stroke="none" fontSize="8.5" fontWeight="600" letterSpacing="2.2" textAnchor="middle" style={font}>
          <textPath href={`#t${uid}`} startOffset="50%">{category.toUpperCase()}</textPath>
        </text>
        <text fill={ink} stroke="none" fontSize="8" fontWeight="600" letterSpacing="2.2" textAnchor="middle" style={font}>
          <textPath href={`#b${uid}`} startOffset="50%">{verified ? "VERIFIED" : "SELF-REPORTED"}</textPath>
        </text>

        <g transform="translate(42 33) scale(1.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <StampGlyph category={category} />
        </g>

        {date && (
          <text x="60" y="80" fill={ink} stroke="none" fontSize="6.5" letterSpacing="1.2" textAnchor="middle" fontFamily="ui-monospace, monospace">
            {monthYear(date)}
          </text>
        )}
      </g>
    </svg>
  );
}

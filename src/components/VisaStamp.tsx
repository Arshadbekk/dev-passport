"use client";

import { motion } from "framer-motion";
import type { Stamp } from "@/lib/types";
import { safeUrl } from "@/lib/share";
import { fmtDate } from "@/lib/format";
import InkStamp from "./assets/InkStamp";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** One stamp on a visa page: pressed in at a slightly different angle, with its title and proof link. */
export default function VisaStamp({ stamp, index = 0, compact = false }: { stamp: Stamp; index?: number; compact?: boolean }) {
  const tilt = (hash(stamp.id) % 9) - 4; // -4..4 degrees, stable per stamp
  const proof = safeUrl(stamp.proofUrl);

  return (
    <motion.li
      initial={{ opacity: 0, scale: 1.25, rotate: tilt * 2.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.07, 0.7), ease: "easeOut" }}
      className={`group flex flex-col items-center text-center ${stamp.hidden ? "opacity-60" : ""}`}
    >
      <div style={{ transform: `rotate(${tilt}deg)` }} className="transition duration-300 group-hover:scale-105">
        <InkStamp category={stamp.category} verified={stamp.verified} date={stamp.date} className={compact ? "h-24 w-24" : "h-28 w-28 sm:h-32 sm:w-32"} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-snug text-cream">{stamp.title}</p>
      <p className="mt-1 flex items-center gap-2 text-[11px] text-muted">
        <span>{fmtDate(stamp.date)}</span>
        {stamp.hidden && <span className="text-amber-300">Hidden</span>}
      </p>
      {proof && (
        <a
          href={proof}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-1 text-[11px] text-soft underline decoration-gold/30 underline-offset-4 transition hover:text-white"
        >
          View proof
        </a>
      )}
    </motion.li>
  );
}

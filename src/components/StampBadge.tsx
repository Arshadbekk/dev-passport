"use client";

import { motion } from "framer-motion";
import { Stamp, StampCategory } from "@/lib/types";
import { safeUrl } from "@/lib/share";
import StampIcon from "./StampIcon";
import Seal from "./assets/Seal";

const TINT: Record<StampCategory, string> = {
  Contribution: "text-goldsoft",
  Project: "text-rose-300",
  Learning: "text-emerald-300",
  Community: "text-amber-300",
  Career: "text-orange-300",
};

export default function StampBadge({ stamp, delay = 0 }: { stamp: Stamp; delay?: number }) {
  const proof = safeUrl(stamp.proofUrl);
  const v = stamp.verified;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1, rotate: -1.5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-xl border p-4 ${
        v
          ? "border-gold/50 bg-gradient-to-br from-wine/40 via-winedeep/30 to-transparent"
          : "border-dashed border-line bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] ${TINT[stamp.category]}`}>
          <StampIcon category={stamp.category} />
          {stamp.category}
        </span>
        {v ? (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-goldsoft">
            <Seal className="h-6 w-6" />
            Verified
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted">Self-reported</span>
        )}
      </div>

      <p className="mt-3 font-medium leading-snug text-cream">{stamp.title}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{stamp.date}</span>
        {proof && (
          <a
            href={proof}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-soft underline decoration-gold/30 underline-offset-4 transition hover:text-white"
          >
            View proof
          </a>
        )}
      </div>
    </motion.div>
  );
}

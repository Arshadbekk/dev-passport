"use client";

import { motion } from "framer-motion";
import type { Passport } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import ShareBox from "../ShareBox";
import { StepIntro } from "./ui";
import type { StepId, Tip } from "./model";

const R = 42;
const C = 2 * Math.PI * R;

function Gauge({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="#3B1B24" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r={R} fill="none" stroke="#C9A45C" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - score / 100) }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-3xl">{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted">of 100</span>
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Passport strength</p>
        <p className="mt-1 font-serif text-2xl">{label}</p>
      </div>
    </div>
  );
}

export default function StepReview({
  passport, score, label, tips, goTo, isPublic, setPublic, issued, canIssue, onIssue, publicPath,
}: {
  passport: Passport;
  score: number;
  label: string;
  tips: Tip[];
  goTo: (id: StepId) => void;
  isPublic: boolean;
  setPublic: (v: boolean) => void;
  issued: boolean;
  canIssue: boolean;
  onIssue: () => void;
  /** /u/username when the passport is issued and public. */
  publicPath?: string;
}) {
  return (
    <div>
      <StepIntro title={issued ? "Your passport is issued" : "Review and issue"}>
        {issued
          ? "Changes you make are saved and appear on your passport straight away."
          : "Check the preview, then issue your passport. The server gives it a unique passport number."}
      </StepIntro>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gold/20 bg-panel/70 p-5">
          <Gauge score={score} label={label} />
          {tips.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {tips.map((t) => (
                <li key={t.text}>
                  <button type="button" onClick={() => goTo(t.step)} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5 text-left text-sm text-soft transition hover:border-gold/50 hover:text-cream">
                    <span>{t.text}</span>
                    <span aria-hidden className="text-gold/60 transition group-hover:translate-x-0.5">→</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-emerald-300">Everything looks great. Nothing left to improve.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-panel/70 p-5">
          <div>
            <p className="font-medium">{isPublic ? "Public passport" : "Private passport"}</p>
            <p className="mt-0.5 text-sm text-muted">
              {isPublic ? "Anyone with your link can view it." : "Only you can see it. Shared links still work for people you send them to."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Make passport public"
            onClick={() => setPublic(!isPublic)}
            className={`relative h-7 w-12 shrink-0 rounded-full border transition ${isPublic ? "border-gold bg-gold/30" : "border-line bg-ink"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-goldsoft transition-all ${isPublic ? "left-[1.5rem]" : "left-0.5"}`} />
          </button>
        </div>

        {issued ? (
          <>
            <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-wine/40 to-winedeep/30 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Passport No.</p>
              <p className="mt-1 font-mono text-xl tracking-wider text-goldsoft">{passport.passportNo}</p>
              {passport.issuedAt && <p className="mt-1 text-sm text-muted">Issued {fmtDate(passport.issuedAt.slice(0, 10))}</p>}
            </div>
            {publicPath ? (
              <ShareBox passport={passport} path={publicPath} />
            ) : (
              <p className="rounded-2xl border border-gold/25 bg-panel/70 p-5 text-sm text-soft">
                Your passport is private, so it has no public link. Switch it to <span className="text-goldsoft">Public</span> above to share your permanent link.
              </p>
            )}
          </>
        ) : (
          <div>
            <button type="button" onClick={onIssue} disabled={!canIssue} className="btn-gold w-full !py-4 text-base disabled:opacity-40">
              Issue my passport
            </button>
            {!canIssue && <p className="mt-2 text-center text-xs text-amber-300">Add your name in the Identity step first.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

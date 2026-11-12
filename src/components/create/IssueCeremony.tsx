"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Crest from "../assets/Crest";
import IssuedStamp from "../assets/IssuedStamp";
import { fmtDate } from "@/lib/format";

export type CeremonyPhase = "issuing" | "stamped" | "done" | "error";

/**
 * Full-screen moment: the passport cover appears, the ISSUED stamp presses onto it,
 * the passport number is revealed, then the next actions appear.
 */
export default function IssueCeremony({
  open, phase, passportNo, firstName, error, onClose, children,
}: {
  open: boolean;
  phase: CeremonyPhase;
  passportNo: string | null;
  firstName: string;
  error: string | null;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  // Esc closes once the moment is over; focus the close button when actions appear
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (phase === "done" || phase === "error")) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  useEffect(() => {
    if (open && (phase === "done" || phase === "error")) closeRef.current?.focus();
  }, [open, phase]);

  const digits = (passportNo ?? "").split("");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Issuing your passport"
          className="fixed inset-0 z-[80] overflow-y-auto bg-ink/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
            {/* Passport cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: phase === "stamped" ? [0, 4, 0] : 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="leather relative flex h-72 w-52 flex-col items-center justify-center overflow-hidden rounded-l-md rounded-r-2xl border border-gold/40 bg-gradient-to-br from-[#7C1832] via-[#5B1024] to-[#33060F] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
            >
              <div className="pointer-events-none absolute inset-3 rounded-xl border border-gold/50" />
              <Crest className="relative h-24 w-24" />
              <p className="gold-text relative mt-4 font-serif text-xl tracking-[0.28em]">PASSPORT</p>

              {(phase === "stamped" || phase === "done") && passportNo && (
                <motion.div
                  initial={{ opacity: 0, scale: 2.4, rotate: -22 }}
                  animate={{ opacity: 0.96, scale: 1, rotate: -8 }}
                  transition={{ delay: 0.5, duration: 0.45, ease: [0.2, 0.9, 0.3, 1] }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                  <IssuedStamp number={passportNo} date={fmtDate(today)} className="h-20 w-44" />
                </motion.div>
              )}
            </motion.div>

            <div className="mt-10 min-h-[11rem]" aria-live="polite">
              {phase === "issuing" && <p className="text-soft">Preparing your passport…</p>}

              {phase === "error" && (
                <div>
                  <p className="font-serif text-2xl">We couldn&apos;t issue it</p>
                  <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>
                  <button ref={closeRef} type="button" onClick={onClose} className="btn-ghost mt-6">Back to editing</button>
                </div>
              )}

              {(phase === "stamped" || phase === "done") && passportNo && (
                <div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-[11px] uppercase tracking-[0.3em] text-gold/80">
                    Passport No.
                  </motion.p>
                  <p className="mt-2 font-mono text-2xl tracking-wider text-goldsoft" aria-label={passportNo}>
                    {digits.map((d, i) => (
                      <motion.span
                        key={i}
                        aria-hidden
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + i * 0.05 }}
                      >
                        {d}
                      </motion.span>
                    ))}
                  </p>
                  <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }} className="mt-6 font-serif text-3xl">
                    Welcome{firstName ? `, ${firstName}` : ""}.
                  </motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="mt-1 text-sm text-soft">
                    Your passport is issued.
                  </motion.p>
                </div>
              )}
            </div>

            {phase === "done" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full text-left">
                {children}
                <div className="mt-4 text-center">
                  <button ref={closeRef} type="button" onClick={onClose} className="btn-gold">View my passport</button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

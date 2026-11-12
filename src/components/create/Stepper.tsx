"use client";

import { motion } from "framer-motion";
import { STEPS } from "./model";

export default function Stepper({ current, onGo }: { current: number; onGo: (i: number) => void }) {
  const pct = (current / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Passport steps" className="mt-8">
      <ol className="relative flex justify-between">
        {/* Track */}
        <div aria-hidden className="absolute left-[18px] right-[18px] top-[17px] h-px bg-line" />
        <motion.div
          aria-hidden
          className="absolute left-[18px] top-[17px] h-px bg-gold"
          initial={false}
          animate={{ width: `calc((100% - 36px) * ${pct / 100})` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onGo(i)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.label}${done ? " (completed)" : ""}`}
                className="group flex flex-col items-center gap-2 focus:outline-none"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full border text-sm transition group-focus-visible:ring-2 group-focus-visible:ring-gold/50 ${
                    active
                      ? "border-gold bg-gold text-winedeep"
                      : done
                        ? "border-gold bg-ink text-goldsoft"
                        : "border-line bg-ink text-muted group-hover:border-gold/50"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`text-[11px] uppercase tracking-[0.2em] ${active ? "block text-goldsoft" : "hidden text-muted sm:block"}`}>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

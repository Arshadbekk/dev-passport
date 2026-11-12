"use client";

import { useRef } from "react";
import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { StampCategory } from "@/lib/types";
import Crest from "./assets/Crest";
import InkStamp from "./assets/InkStamp";
import Rosette from "./assets/Rosette";
import Seal from "./assets/Seal";

type HeroStamp = { title: string; category: StampCategory; verified: boolean; date: string; r: number };

const STAMPS: HeroStamp[] = [
  { title: "Merged PR #42", category: "Contribution", verified: true, date: "2026-03-02", r: -5 },
  { title: "Live on Google Play", category: "Project", verified: false, date: "2026-04-18", r: 4 },
  { title: "20+ code reviews", category: "Community", verified: true, date: "2026-06-01", r: 3 },
  { title: "Advanced Flutter course", category: "Learning", verified: false, date: "2026-07-12", r: -4 },
];

/** An ink stamp that presses onto the page at its own point in the scroll. */
function ScrollStamp({ stamp, index, progress }: { stamp: HeroStamp; index: number; progress: MotionValue<number> }) {
  const start = 0.55 + index * 0.09;
  const opacity = useTransform(progress, [start, start + 0.05], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.05], [1.6, 1]);
  const rotate = useTransform(progress, [start, start + 0.05], [stamp.r * 3, stamp.r]);

  return (
    <motion.div style={{ opacity, scale, rotate }} className="flex flex-col items-center text-center">
      <InkStamp category={stamp.category} verified={stamp.verified} date={stamp.date} className="h-[78px] w-[78px]" />
      <p className="mt-1 text-[10px] leading-tight text-soft">{stamp.title}</p>
    </motion.div>
  );
}

/** Caption that fades in and out over a scroll range. */
function Caption({
  progress,
  range,
  values,
  children,
}: {
  progress: MotionValue<number>;
  range: number[];
  values: number[];
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, range, values);
  return (
    <motion.p style={{ opacity }} className="absolute inset-x-0 top-0 text-center font-serif text-xl text-goldsoft sm:text-2xl">
      {children}
    </motion.p>
  );
}

export default function PassportHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll progress through this tall section: 0 = closed, 1 = fully open
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.3 });
  const alwaysOpen = useMotionValue(1);
  const progress = reduce ? alwaysOpen : smooth;

  // Cursor tilt (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 18 });
  const sy = useSpring(my, { stiffness: 70, damping: 18 });
  const tiltY = useTransform(sx, [-1, 1], [-6, 6]);
  const tiltX = useTransform(sy, [-1, 1], [5, -5]);

  // Scroll-driven values
  const coverRotate = useTransform(progress, [0.1, 0.5], [0, -180]);
  const bookX = useTransform(progress, [0.1, 0.5], [-160, 0]);
  const stageScale = useTransform(progress, [0, 0.5], [0.94, 1]);
  const stageLift = useTransform(progress, [0, 1], [30, -10]);
  const bar = useTransform(progress, [0, 1], [0, 1]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div ref={sectionRef} className={`relative ${reduce ? "" : "h-[340vh]"}`}>
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div
          role="img"
          aria-label="A burgundy and gold Dev Passport opening as you scroll, revealing a developer profile with ink stamps"
          className="relative h-[270px] w-full sm:h-[480px]"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div
            className="absolute left-1/2 top-0 h-[450px] w-[640px] origin-top -translate-x-1/2 scale-[0.55] sm:scale-100"
            style={{ perspective: 1800 }}
          >
            <div className="absolute left-1/2 top-[445px] h-10 w-[420px] -translate-x-1/2 rounded-full bg-black/80 blur-2xl" />

            <motion.div
              className="relative h-full w-full"
              style={{ rotateX: tiltX, rotateY: tiltY, scale: stageScale, y: stageLift, transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute left-[320px] top-0 h-[450px] w-[320px]"
                style={{ transformStyle: "preserve-3d", x: bookX }}
              >
                {/* Inside page */}
                <div className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-2xl border border-gold/30 bg-gradient-to-br from-[#2B0E18] to-[#15060C] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
                  <Rosette className="pointer-events-none absolute -right-20 -top-12 h-80 w-80 text-gold opacity-[0.1]" />

                  <div className="relative">
                    <p className="eyebrow !text-[10px] !text-gold/80">Developer Passport</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-goldsoft via-gold to-golddeep p-[1.5px]">
                        <div className="flex h-12 w-11 items-center justify-center rounded-[7px] bg-ink font-serif text-goldsoft">AK</div>
                      </div>
                      <div>
                        <p className="font-serif text-lg leading-tight">Aisha Khan</p>
                        <p className="text-xs text-soft">Flutter Developer</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["Flutter", "Dart", "Firebase", "CI/CD"].map((t) => (
                        <span key={t} className="rounded-full border border-gold/25 px-2 py-0.5 text-[10px] text-soft">{t}</span>
                      ))}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-x-2 gap-y-3">
                      {STAMPS.map((s, i) => (
                        <ScrollStamp key={s.title} stamp={s} index={i} progress={progress} />
                      ))}
                    </div>
                  </div>

                  <div className="absolute inset-x-6 bottom-4 font-mono text-[7.5px] leading-tight tracking-[0.12em] text-gold/45">
                    <p className="whitespace-nowrap">P&lt;DEVKHAN&lt;&lt;AISHA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                    <p className="whitespace-nowrap">AISHAKHAN&lt;&lt;DEV&lt;&lt;4&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  </div>
                </div>

                {/* Cover, hinged on the spine */}
                <motion.div
                  className="absolute inset-0"
                  style={{ transformOrigin: "left center", transformStyle: "preserve-3d", rotateY: coverRotate }}
                >
                  {/* Front: burgundy leather with gold foil */}
                  <div
                    className="leather absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-l-sm rounded-r-2xl border border-gold/40 bg-gradient-to-br from-[#7C1832] via-[#5B1024] to-[#33060F] px-6 py-10"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="pointer-events-none absolute inset-3 rounded-xl border border-gold/50" />
                    <div className="pointer-events-none absolute inset-[18px] rounded-lg border border-gold/20" />
                    <p className="eyebrow relative !text-[10px] !tracking-[0.4em] !text-goldsoft/80">Mobile Dev Connect</p>
                    <div className="relative flex flex-col items-center gap-5">
                      <Crest className="h-32 w-32 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
                      <h2 className="gold-text font-serif text-3xl tracking-[0.28em]">PASSPORT</h2>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-goldsoft/70">Developer</p>
                    </div>
                    <div className="relative flex h-5 w-8 items-center justify-center rounded-sm border border-gold/60">
                      <div className="h-2.5 w-2.5 rounded-full border border-gold/60" />
                    </div>
                  </div>

                  {/* Inside of cover */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-l-2xl rounded-r-sm border border-gold/25 bg-gradient-to-bl from-[#2B0E18] to-[#15060C] px-8 text-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <Rosette className="pointer-events-none absolute -left-24 top-8 h-80 w-80 text-gold opacity-[0.08]" />
                    <Seal className="relative h-16 w-16" />
                    <p className="relative font-serif text-2xl italic leading-snug text-goldsoft">Proof, not claims.</p>
                    <p className="relative text-xs leading-relaxed text-soft">
                      Every stamp links to evidence. Verified stamps carry a gold seal; the rest are clearly marked.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {!reduce && (
          <div className="relative mt-6 h-10 w-full max-w-xl">
            <Caption progress={progress} range={[0, 0.07, 0.13]} values={[1, 1, 0]}>Scroll to open your passport</Caption>
            <Caption progress={progress} range={[0.13, 0.2, 0.45, 0.52]} values={[0, 1, 1, 0]}>Your profile, stack and links</Caption>
            <Caption progress={progress} range={[0.52, 0.6, 0.86, 0.93]} values={[0, 1, 1, 0]}>Every contribution becomes a stamp</Caption>
            <Caption progress={progress} range={[0.93, 0.98]} values={[0, 1]}>One link. Share it with anyone.</Caption>
          </div>
        )}

        {!reduce && (
          <div className="mt-4 h-px w-40 bg-line">
            <motion.div className="h-px origin-left bg-gold" style={{ scaleX: bar }} />
          </div>
        )}
      </div>
    </div>
  );
}

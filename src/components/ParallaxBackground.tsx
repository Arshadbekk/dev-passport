"use client";

import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Rosette from "./assets/Rosette";

const RANGE = [0, 5200];

/** Maps page scroll to a vertical offset. Different distances create depth. */
function useParallax(scrollY: MotionValue<number>, distance: number, enabled: boolean) {
  return useTransform(scrollY, RANGE, [0, enabled ? distance : 0]);
}

const DOTS = [
  { left: "8%", top: "18%", size: 3, d: -260 },
  { left: "22%", top: "62%", size: 2, d: -520 },
  { left: "35%", top: "30%", size: 2, d: -180 },
  { left: "48%", top: "80%", size: 3, d: -640 },
  { left: "63%", top: "22%", size: 2, d: -340 },
  { left: "74%", top: "55%", size: 3, d: -720 },
  { left: "86%", top: "14%", size: 2, d: -220 },
  { left: "92%", top: "70%", size: 2, d: -560 },
];

function Dot({ dot, scrollY, enabled }: { dot: (typeof DOTS)[number]; scrollY: MotionValue<number>; enabled: boolean }) {
  const y = useParallax(scrollY, dot.d, enabled);
  return (
    <div className="absolute" style={{ left: dot.left, top: dot.top }}>
      <motion.span
        className="block rounded-full bg-gold/70"
        style={{ y, width: dot.size, height: dot.size, boxShadow: "0 0 10px rgba(201,164,92,0.8)" }}
      />
    </div>
  );
}

export default function ParallaxBackground() {
  const reduce = useReducedMotion();
  const enabled = !reduce;

  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 80, damping: 30, mass: 0.4 });

  const goldY = useParallax(smooth, -200, enabled);
  const wineY = useParallax(smooth, -450, enabled);
  const patternY = useParallax(smooth, -320, enabled);
  const patternRotate = useTransform(smooth, RANGE, [0, enabled ? 90 : 0]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Far layer: warm gold glow */}
      <div className="absolute -left-40 top-[2%] h-[760px] w-[760px]">
        <motion.div
          className="h-full w-full bg-[radial-gradient(circle,rgba(201,164,92,0.16),transparent_65%)]"
          style={{ y: goldY }}
        />
      </div>

      {/* Mid layer: deep burgundy glow */}
      <div className="absolute -right-48 top-[44%] h-[760px] w-[760px]">
        <motion.div
          className="h-full w-full bg-[radial-gradient(circle,rgba(154,34,64,0.35),transparent_65%)]"
          style={{ y: wineY }}
        />
      </div>

      {/* Guilloche rosette: drifts and slowly rotates */}
      <div
        className="absolute left-1/2 top-[12%] h-[980px] w-[980px] -translate-x-1/2 opacity-[0.09]"
        style={{
          WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        }}
      >
        <motion.div className="h-full w-full" style={{ y: patternY, rotate: patternRotate }}>
          <Rosette className="h-full w-full text-gold" />
        </motion.div>
      </div>

      {/* Near layer: gold dust */}
      {DOTS.map((dot, i) => (
        <Dot key={i} dot={dot} scrollY={smooth} enabled={enabled} />
      ))}
    </div>
  );
}

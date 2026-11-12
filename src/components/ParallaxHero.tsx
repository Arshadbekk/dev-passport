"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, MotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/** Each layer fades up on load (outer), then drifts at its own speed on scroll (inner). */
function Layer({
  progress,
  distance,
  delay,
  fade = true,
  className,
  children,
}: {
  progress: MotionValue<number>;
  distance: number;
  delay: number;
  fade?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [0, distance]);
  const opacity = useTransform(progress, [0, 0.75], [1, fade ? 0 : 1]);
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <motion.div style={{ y, opacity }}>{children}</motion.div>
    </motion.div>
  );
}

export default function ParallaxHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.3 });
  const k = reduce ? 0 : 1;

  return (
    <section ref={ref} className="flex min-h-[82vh] flex-col items-center justify-center pt-16 text-center">
      <Layer progress={progress} distance={-40 * k} delay={0} fade={!reduce}>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.05] px-4 py-1.5 text-xs text-goldsoft">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Open source · Built by Mobile Dev Connect
        </p>
      </Layer>

      <Layer progress={progress} distance={-110 * k} delay={0.1} fade={!reduce}>
        <h1 className="mx-auto mt-8 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-7xl">
          A developer portfolio that comes with <span className="gold-text italic">proof.</span>
        </h1>
      </Layer>

      <Layer progress={progress} distance={-190 * k} delay={0.2} fade={!reduce}>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-soft">
          Dev Passport turns your real contributions into a shareable page. Hiring teams do not have to take
          your word for it: every stamp links to evidence.
        </p>
      </Layer>

      <Layer progress={progress} distance={-250 * k} delay={0.3} fade={!reduce}>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/create" className="btn-gold">Create your passport</Link>
          <Link href="/demo" className="btn-ghost">See an example</Link>
        </div>
      </Layer>
    </section>
  );
}

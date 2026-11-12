"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Passport } from "@/lib/types";
import PassportCard from "../PassportCard";

/** The real passport, updating as you type, with a gentle 3D tilt that follows the cursor. */
export default function LivePreview({ passport }: { passport: Passport }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const rotateY = useTransform(sx, [-1, 1], [-4, 4]);
  const rotateX = useTransform(sy, [-1, 1], [3, -3]);

  return (
    <div
      className="lg:sticky lg:top-24"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold/80">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Live preview
      </p>
      <motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }}>
        <PassportCard passport={passport} compact />
      </motion.div>
      <p className="mt-3 text-center text-xs text-muted">This is exactly what people will see.</p>
    </div>
  );
}

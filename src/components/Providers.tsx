"use client";

import { MotionConfig } from "framer-motion";
import AuthProvider from "./nav/AuthProvider";

/** Respects the visitor's "reduce motion" setting for every animation in the app. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}

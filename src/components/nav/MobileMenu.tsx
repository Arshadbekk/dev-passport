"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Crest from "../assets/Crest";
import Ornament from "../assets/Ornament";
import { ACCOUNT_LINKS, LINKS, MAIN_LINKS, PRODUCT_LINKS } from "@/lib/site";
import { useAuth } from "./AuthProvider";
import { CloseIcon, GitHubIcon, LinkedInIcon } from "./icons";

const list = { show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } } };

const BIG =
  "block rounded-lg py-2.5 font-serif text-[1.75rem] leading-tight text-white/90 transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";
const SMALL =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-soft transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";

/**
 * Full-screen mobile menu. Rendered as a sibling of <header> (not inside it) because the header uses
 * transforms/backdrop-filter, which would otherwise trap a fixed-position child.
 */
export default function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const { status } = useAuth();

  // Focus the close button, lock page scroll, close on Escape, and keep Tab inside the menu
  useEffect(() => {
    closeBtn.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !root.current) return;
      const f = Array.from(
        root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    // Close if the window grows into the desktop layout
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && onClose();

    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [onClose]);

  const current = (href: string) => (pathname === href ? ("page" as const) : undefined);

  return (
    <motion.div
      ref={root}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className="no-print fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_380px_at_50%_-5%,rgba(154,34,64,0.35),transparent_70%)]" aria-hidden />

      <div className="relative flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70" aria-label="Dev Passport home">
          <Crest className="h-8 w-8" simple />
          <span className="font-serif text-lg tracking-wide">Dev Passport</span>
        </Link>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-soft transition hover:border-gold/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <CloseIcon />
        </button>
      </div>

      <motion.nav aria-label="Mobile" className="relative flex-1 px-6 pb-6 pt-4" variants={list} initial="hidden" animate="show">
        <motion.p variants={item} className="text-sm text-muted">Product</motion.p>
        <ul>
          {PRODUCT_LINKS.map((l) => (
            <motion.li key={l.title} variants={item}>
              <Link href={l.href} onClick={onClose} className={BIG}>{l.title}</Link>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={item} className="my-4"><Ornament /></motion.div>

        <ul>
          {MAIN_LINKS.map((l) => (
            <motion.li key={l.href} variants={item}>
              <Link href={l.href} onClick={onClose} aria-current={current(l.href)} className={`${BIG} ${pathname === l.href ? "!text-gold" : ""}`}>
                {l.label}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      <div className="relative shrink-0 border-t border-gold/15 bg-ink/80 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
        <Link href="/create" onClick={onClose} className="btn-gold w-full !py-3.5 text-base">Create passport</Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-1">
          {status === "in" ? (
            <div className="flex items-center gap-1">
              <Link href={ACCOUNT_LINKS.dashboard} onClick={onClose} className={SMALL}>Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className={SMALL}>Sign out</button>
              </form>
            </div>
          ) : status === "out" ? (
            <Link href="/login" onClick={onClose} className={SMALL}>Sign in</Link>
          ) : (
            <span className="h-9 w-20" aria-hidden />
          )}
          <div className="flex items-center gap-1">
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className={SMALL} aria-label="GitHub (opens in new tab)"><GitHubIcon className="h-5 w-5" /></a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={SMALL} aria-label="LinkedIn group (opens in new tab)"><LinkedInIcon className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

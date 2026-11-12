"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import Crest from "../assets/Crest";
import { LINKS, MAIN_LINKS } from "@/lib/site";
import { formatCount } from "@/lib/github";
import { useAuth } from "./AuthProvider";
import AvatarMenu from "./AvatarMenu";
import MobileMenu from "./MobileMenu";
import ProductMenu from "./ProductMenu";
import { GitHubIcon, MenuIcon, SearchIcon, StarIcon } from "./icons";

// Loaded on first use, so it costs nothing on first paint
const loadPalette = () => import("./CommandPalette");
const CommandPalette = dynamic(loadPalette, { ssr: false });

const BAR = 64; // px, keep in sync with the spacer in Nav.tsx
const SHRINK = 0.86; // the glass layer scales to 86% of its height once you scroll
const RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";

type MenuId = "product" | "account" | null;

function NavLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative block rounded-full px-3 py-2 text-sm transition-colors ${RING} ${active ? "text-white" : "text-soft hover:text-white"}`}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
    </Link>
  );
}

export default function NavBar({ stars }: { stars: number | null }) {
  const pathname = usePathname();
  const { status } = useAuth();
  const reduce = useReducedMotion();

  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [kbdFocus, setKbdFocus] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const last = useRef(0);
  const toggle = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);

  // Scroll behaviour: shrink after a few px, hide when scrolling down, show when scrolling up
  const { scrollY, scrollYProgress } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - last.current;
    last.current = y;
    setScrolled(y > 8);
    if (y < 80) return setHidden(false);
    if (Math.abs(delta) < 6) return; // ignore tiny jitters
    setHidden(delta > 0);
  });
  const springProgress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.001 });
  const progress = reduce ? scrollYProgress : springProgress;

  // Close menus after navigating
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Return focus to the hamburger when the mobile menu closes
  useEffect(() => {
    if (wasMobileOpen.current && !mobileOpen) toggle.current?.focus();
    wasMobileOpen.current = mobileOpen;
  }, [mobileOpen]);

  // Ctrl/Cmd + K
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteMounted(true);
        setPaletteOpen((o) => !o);
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openPalette = () => {
    setPaletteMounted(true);
    setPaletteOpen(true);
    setOpenMenu(null);
  };
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const setProduct = useCallback((o: boolean) => setOpenMenu(o ? "product" : null), []);
  const setAccount = useCallback((o: boolean) => setOpenMenu(o ? "account" : null), []);

  // Never hide the bar while a menu is open or a keyboard user is focused inside it
  const hide = hidden && !openMenu && !mobileOpen && !kbdFocus;

  return (
    <>
      <motion.header
        className="no-print fixed inset-x-0 top-0 z-40"
        animate={{ y: hide ? "-100%" : "0%" }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        onFocusCapture={(e) => setKbdFocus((e.target as HTMLElement).matches(":focus-visible"))}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKbdFocus(false);
        }}
      >
        {/* Glass layer: only its transform changes, so scrolling never causes layout shift */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-ink/70 backdrop-blur-md"
          style={{ originY: 0 }}
          animate={{ scaleY: scrolled ? SHRINK : 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
        {/* Hairline + scroll progress ride along with the shrinking edge */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
          animate={{ y: scrolled ? -BAR * (1 - SHRINK) : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gold/20" />
          <motion.div className="absolute inset-0 origin-left bg-gradient-to-r from-gold/60 to-goldsoft" style={{ scaleX: progress }} />
        </motion.div>

        <motion.nav
          aria-label="Main"
          className="relative mx-auto grid h-16 max-w-6xl grid-cols-[auto_1fr] items-center px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]"
          animate={{ y: scrolled ? (-BAR * (1 - SHRINK)) / 2 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Left: crest + wordmark */}
          <Link href="/" aria-label="Dev Passport home" className={`flex w-fit items-center gap-2.5 rounded-lg ${RING}`}>
            <Crest className="h-8 w-8" simple />
            <span className="font-serif text-lg tracking-wide">Dev Passport</span>
          </Link>

          {/* Center links (desktop) */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            <li><ProductMenu open={openMenu === "product"} onOpenChange={setProduct} /></li>
            {MAIN_LINKS.map((l) => (
              <li key={l.href}><NavLink href={l.href} label={l.label} active={pathname === l.href} /></li>
            ))}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center justify-self-end gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Star Dev Passport on GitHub${stars != null ? `, ${stars} stars` : ""} (opens in new tab)`}
                className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-soft transition hover:border-gold/40 hover:text-white ${RING}`}
              >
                <GitHubIcon className="h-4 w-4" />
                <span className="hidden xl:inline">Star</span>
                {stars != null && (
                  <span className="hidden items-center gap-1 text-muted xl:inline-flex">
                    <StarIcon className="h-3.5 w-3.5 text-gold" />
                    {formatCount(stars)}
                  </span>
                )}
              </a>

              <button
                type="button"
                onClick={openPalette}
                onPointerEnter={loadPalette}
                onFocus={loadPalette}
                aria-label="Search pages and actions"
                aria-keyshortcuts="Control+K Meta+K"
                className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:border-gold/40 hover:text-white ${RING}`}
              >
                <SearchIcon />
                <kbd className="hidden whitespace-nowrap font-sans text-xs xl:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>              </button>

              {/* Fixed-width slot: the skeleton, "Sign in" and the avatar all fit, so nothing jumps */}
              <div className="flex h-9 min-w-[4.5rem] items-center justify-end">
                {status === "loading" ? (
                  <span aria-hidden className="block h-8 w-16 animate-pulse rounded-full bg-white/[0.06] motion-reduce:animate-none" />
                ) : status === "in" ? (
                  <AvatarMenu open={openMenu === "account"} onOpenChange={setAccount} />
                ) : (
                  <Link href="/login" className={`rounded-full px-3 py-2 text-sm text-soft transition-colors hover:text-white ${RING}`}>
                    Sign in
                  </Link>
                )}
              </div>

              <Link href="/create" className={`btn-gold whitespace-nowrap !px-5 !py-2 ${RING}`}>Create passport</Link>
            </div>

            {/* Hamburger (below lg) */}
            <button
              ref={toggle}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={`grid h-10 w-10 place-items-center rounded-full border border-line text-soft transition hover:border-gold/50 hover:text-white lg:hidden ${RING}`}
            >
              <MenuIcon />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>{mobileOpen && <MobileMenu pathname={pathname} onClose={closeMobile} />}</AnimatePresence>
      {paletteMounted && <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />}
    </>
  );
}

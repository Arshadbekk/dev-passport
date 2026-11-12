"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InkStamp from "../assets/InkStamp";
import Seal from "../assets/Seal";
import { PRODUCT_LINKS, type ProductLink } from "@/lib/site";
import { ChevronIcon } from "./icons";
import { useDismiss } from "./useDismiss";

function Steps() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="7" cy="24" r="2.5" />
      <circle cx="16" cy="16" r="2.5" />
      <circle cx="25" cy="8" r="2.5" />
      <path d="M9 22.2l5-4M18 14l5-4" strokeDasharray="1.5 3" />
    </svg>
  );
}

function Art({ kind }: { kind: ProductLink["art"] }) {
  if (kind === "seal") return <Seal className="h-8 w-8" />;
  if (kind === "stamp") return <InkStamp category="Contribution" verified className="h-9 w-9" />;
  return <Steps />;
}

/**
 * "Product" mega menu. Uses the disclosure pattern (a button that shows a list of normal links),
 * which is the recommended ARIA approach for site navigation. Opens on hover for mouse users,
 * and on click / Enter / Space / ArrowDown for everyone else. Escape closes and returns focus.
 */
export default function ProductMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const openedBy = useRef<"hover" | "click">("click");
  const wantFocus = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useDismiss(wrap, open, (reason) => {
    onOpenChange(false);
    if (reason === "escape") trigger.current?.focus();
  });

  useEffect(() => {
    if (open && wantFocus.current) {
      wantFocus.current = false;
      firstLink.current?.focus();
    }
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
      ref={wrap}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer.current);
        if (!open) {
          timer.current = setTimeout(() => {
            openedBy.current = "hover";
            onOpenChange(true);
          }, 90);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer.current);
        if (open && openedBy.current === "hover") timer.current = setTimeout(close, 160);
      }}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && next && !wrap.current?.contains(next)) close();
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          // A click on a menu that hover opened pins it open instead of closing it
          if (open && openedBy.current === "hover") {
            openedBy.current = "click";
            return;
          }
          openedBy.current = "click";
          onOpenChange(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openedBy.current = "click";
            wantFocus.current = true;
            if (open) firstLink.current?.focus();
            else onOpenChange(true);
          }
        }}
        className="group inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-soft transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 aria-expanded:text-white"
      >
        Product
        <ChevronIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            className="absolute left-0 top-full z-10 pt-5"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <ul className="w-[22.5rem] rounded-2xl border border-gold/20 bg-ink/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {PRODUCT_LINKS.map((item, i) => (
                <li key={item.title}>
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={item.href}
                    onClick={close}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/20 bg-wine/25">
                      <Art kind={item.art} />
                    </span>
                    <span>
                      <span className="block font-serif text-base text-white">{item.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">{item.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

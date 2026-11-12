"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCOUNT_LINKS } from "@/lib/site";
import { useAuth } from "./AuthProvider";
import { useDismiss } from "./useDismiss";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({ className = "h-9 w-9" }: { className?: string }) {
  const { user } = useAuth();
  if (!user) return null;
  return user.avatarUrl ? (
    // Plain <img>: avoids needing a next/image remote-pattern for GitHub avatars
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatarUrl}
      alt=""
      width={36}
      height={36}
      referrerPolicy="no-referrer"
      className={`${className} rounded-full object-cover`}
    />
  ) : (
    <span className={`${className} grid place-items-center rounded-full bg-wine text-xs font-medium text-cream`}>
      {initials(user.name)}
    </span>
  );
}

const ITEM =
  "block w-full rounded-lg px-3 py-2 text-left text-sm text-soft transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:bg-white/[0.05] focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";

/** Signed-in account menu. Menu-button pattern: arrow keys move, Home/End jump, Escape closes and returns focus. */
export default function AvatarMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const pending = useRef<"first" | "last" | null>(null);

  useDismiss(wrap, open, (reason) => {
    onOpenChange(false);
    if (reason === "escape") trigger.current?.focus();
  });

  useEffect(() => {
    if (!open || !pending.current) return;
    const list = items.current.filter(Boolean) as HTMLElement[];
    (pending.current === "first" ? list[0] : list[list.length - 1])?.focus();
    pending.current = null;
  }, [open]);

  if (!user) return null;

  const move = (dir: 1 | -1 | "first" | "last") => {
    const list = items.current.filter(Boolean) as HTMLElement[];
    const i = list.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (dir === "first") next = 0;
    else if (dir === "last") next = list.length - 1;
    else next = (i + dir + list.length) % list.length;
    list[next]?.focus();
  };

  return (
    <div ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            pending.current = e.key === "ArrowDown" ? "first" : "last";
            if (open) move(e.key === "ArrowDown" ? "first" : "last");
            else onOpenChange(true);
          }
        }}
        className="rounded-full p-0.5 ring-1 ring-gold/30 transition hover:ring-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <Avatar />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full z-10 pt-4"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div className="w-60 rounded-2xl border border-gold/20 bg-ink/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="px-3 pb-2 pt-2">
                <p className="truncate font-serif text-base text-white">{user.name}</p>
                {user.login && <p className="truncate text-xs text-muted">@{user.login}</p>}
              </div>
              <div
                id={id}
                role="menu"
                aria-label="Account"
                className="border-t border-line pt-2"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
                  else if (e.key === "Home") { e.preventDefault(); move("first"); }
                  else if (e.key === "End") { e.preventDefault(); move("last"); }
                  else if (e.key === "Tab") onOpenChange(false);
                }}
              >
                {[
                  { href: ACCOUNT_LINKS.dashboard, label: "Dashboard" },
                  { href: ACCOUNT_LINKS.passport, label: "My passport" },
                  { href: ACCOUNT_LINKS.settings, label: "Settings" },
                ].map((l, i) => (
                  <Link
                    key={l.label}
                    ref={(el) => { items.current[i] = el; }}
                    href={l.href}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => onOpenChange(false)}
                    className={ITEM}
                  >
                    {l.label}
                  </Link>
                ))}
                <form action="/auth/signout" method="post" role="none" className="mt-1 border-t border-line pt-1">
                  <button
                    ref={(el) => { items.current[3] = el; }}
                    type="submit"
                    role="menuitem"
                    tabIndex={-1}
                    className={ITEM}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

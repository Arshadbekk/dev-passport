"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNT_LINKS, LINKS, MAIN_LINKS, PRODUCT_LINKS } from "@/lib/site";
import { postSignOut, useAuth } from "./AuthProvider";
import { SearchIcon } from "./icons";

type Cmd = {
  id: string;
  group: "Pages" | "Actions" | "Community";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

/**
 * Command palette (Ctrl/Cmd+K). Built on the native <dialog>, so the browser provides the focus trap,
 * inert background, Escape handling and focus restore. Search field follows the ARIA combobox/listbox pattern.
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { status } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => router.push(href);
    const ext = (href: string) => () => window.open(href, "_blank", "noopener,noreferrer");
    const out: Cmd[] = [
      { id: "create", group: "Actions", label: "Create passport", hint: "Start the builder", keywords: "new start build issue", run: go("/create") },
      ...(status === "in"
        ? [
            { id: "dash", group: "Actions" as const, label: "Open dashboard", keywords: "account home", run: go(ACCOUNT_LINKS.dashboard) },
            { id: "mine", group: "Actions" as const, label: "My passport", keywords: "edit profile", run: go(ACCOUNT_LINKS.passport) },
            { id: "out", group: "Actions" as const, label: "Sign out", keywords: "log out logout", run: postSignOut },
          ]
        : status === "out"
          ? [{ id: "in", group: "Actions" as const, label: "Sign in with GitHub", keywords: "log in login", run: go("/login") }]
          : []),
      { id: "home", group: "Pages", label: "Home", run: go("/") },
      ...PRODUCT_LINKS.map((p) => ({ id: p.title, group: "Pages" as const, label: p.title, hint: "Product", run: go(p.href) })),
      ...MAIN_LINKS.map((l) => ({ id: l.href, group: "Pages" as const, label: l.label, run: go(l.href) })),
      { id: "privacy", group: "Pages", label: "Privacy", keywords: "data policy", run: go("/privacy") },
      { id: "terms", group: "Pages", label: "Terms", keywords: "legal conditions", run: go("/terms") },
      { id: "gh", group: "Community", label: "Star on GitHub", hint: "Opens in a new tab", keywords: "repository source code open source", run: ext(LINKS.github) },
      { id: "li", group: "Community", label: "Join the LinkedIn group", hint: "Opens in a new tab", keywords: "social", run: ext(LINKS.linkedin) },
      { id: "wa", group: "Community", label: "Join the WhatsApp group", hint: "Opens in a new tab", keywords: "chat", run: ext(LINKS.whatsapp) },
    ];
    return out;
  }, [router, status]);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return commands;
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [commands, query]);

  // Open / close the native dialog in sync with the `open` prop
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      setQuery("");
      setActive(0);
      d.showModal();
      input.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (c: Cmd) => {
    onClose();
    c.run();
  };

  const groups = (["Actions", "Pages", "Community"] as const)
    .map((g) => ({ g, items: results.filter((r) => r.group === g) }))
    .filter((x) => x.items.length);
  // Flat order must match what is rendered (grouped), so keyboard indices line up
  const flat = groups.flatMap((x) => x.items);
  const optionId = (i: number) => `${uid}-opt-${i}`;

  return (
    <dialog
      ref={dialog}
      aria-label="Command palette"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="palette m-0 mx-auto mb-auto mt-[12vh] w-[min(92vw,34rem)] max-w-none overflow-hidden rounded-2xl border border-gold/25 bg-ink p-0 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-activedescendant={flat.length ? optionId(active) : undefined}
          aria-label="Search pages and actions"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!flat.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % flat.length); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + flat.length) % flat.length); }
            else if (e.key === "Home") { e.preventDefault(); setActive(0); }
            else if (e.key === "End") { e.preventDefault(); setActive(flat.length - 1); }
            else if (e.key === "Enter") { e.preventDefault(); run(flat[active]); }
          }}
          placeholder="Search pages and actions"
          className="h-14 w-full bg-transparent text-base text-white placeholder:text-muted focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted sm:block">Esc</kbd>
      </div>

      <ul id={`${uid}-list`} ref={listRef} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
        {groups.map(({ g, items }) => (
          <li key={g} role="presentation">
            <ul role="group" aria-labelledby={`${uid}-g-${g}`}>
              <li role="presentation" id={`${uid}-g-${g}`} className="px-3 pb-1 pt-3 text-xs text-muted">{g}</li>
              {items.map((c) => {
                const i = flat.indexOf(c);
                const on = i === active;
                return (
                  <li
                    key={c.id}
                    id={optionId(i)}
                    data-index={i}
                    role="option"
                    aria-selected={on}
                    onPointerMove={() => setActive(i)}
                    onClick={() => run(c)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${on ? "bg-gold/[0.12] text-white" : "text-soft"}`}
                  >
                    <span>{c.label}</span>
                    {c.hint && <span className="text-xs text-muted">{c.hint}</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {/* Announces the result count to screen readers; empty state is a prompt, not a dead end */}
      <p role="status" className={flat.length ? "sr-only" : "px-5 pb-6 pt-4 text-sm text-muted"}>
        {flat.length ? `${flat.length} results` : `Nothing matches “${query}”. Try “roadmap”, “create” or “community”.`}
      </p>
    </dialog>
  );
}

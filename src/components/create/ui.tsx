"use client";

import type { SaveState } from "./usePassportEditor";

export const inputCls =
  "w-full rounded-xl border border-gold/20 bg-ink/70 px-4 py-3 text-sm text-cream placeholder:text-muted/70 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function Field({
  id,
  label,
  hint,
  error,
  right,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11px] uppercase tracking-[0.22em] text-gold/80">
          {label}
        </label>
        {right && <span className="text-xs text-muted">{right}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1.5 text-xs text-rose-300">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function StepIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 id="step-heading" tabIndex={-1} className="font-serif text-3xl focus:outline-none sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-xl leading-relaxed text-soft">{children}</p>
    </div>
  );
}

export function SaveStatus({ state, error, onRetry }: { state: SaveState; error: string | null; onRetry: () => void }) {
  const view: Record<SaveState, { dot: string; text: string }> = {
    idle: { dot: "bg-muted", text: "Autosave is on" },
    saving: { dot: "bg-gold animate-pulse", text: "Saving…" },
    saved: { dot: "bg-emerald-400", text: "All changes saved" },
    error: { dot: "bg-rose-400", text: error || "Couldn't save" },
    offline: { dot: "bg-amber-400", text: "Offline: changes will sync" },
  };
  const v = view[state];
  return (
    <p role="status" aria-live="polite" className="flex items-center gap-2 text-xs text-soft">
      <span className={`h-2 w-2 shrink-0 rounded-full ${v.dot}`} />
      <span>{v.text}</span>
      {state === "error" && (
        <button type="button" onClick={onRetry} className="underline underline-offset-4 hover:text-white">
          Retry
        </button>
      )}
    </p>
  );
}

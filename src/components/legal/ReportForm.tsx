"use client";

import { useState } from "react";
import Link from "next/link";
import { REPORT_REASONS } from "@/lib/reports";

const field =
  "w-full rounded-xl border border-gold/20 bg-ink/70 px-4 py-3 text-sm text-cream placeholder:text-muted/70 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export default function ReportForm({ initialUsername }: { initialUsername: string }) {
  const [username, setUsername] = useState(initialUsername);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, reason, details, website }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Couldn't send the report.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="mt-10 rounded-2xl border border-gold/30 bg-gold/[0.05] p-6">
        <p className="font-serif text-2xl text-goldsoft">Thank you.</p>
        <p className="mt-2 text-sm text-soft">Your report was sent to the maintainers. We review every report.</p>
        <Link href="/" className="btn-ghost mt-5 inline-flex">Back to home</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-6" noValidate>
      <div>
        <label htmlFor="r-user" className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-gold/80">Handle of the passport</label>
        <div className="flex items-center rounded-xl border border-gold/20 bg-ink/70 pl-4 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
          <span className="text-muted" aria-hidden>@</span>
          <input id="r-user" required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} maxLength={30} autoCapitalize="none" spellCheck={false} className="w-full bg-transparent px-2 py-3 text-sm text-cream focus:outline-none" />
        </div>
      </div>

      <div>
        <label htmlFor="r-reason" className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-gold/80">Reason</label>
        <select id="r-reason" required value={reason} onChange={(e) => setReason(e.target.value)} className={field}>
          <option value="">Choose a reason…</option>
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="r-details" className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-gold/80">Details (optional)</label>
        <textarea id="r-details" rows={5} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What should we look at? Links help." className={field} />
        <p className="mt-1 text-right text-xs text-muted">{details.length}/1000</p>
      </div>

      {/* Honeypot: hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

      <button type="submit" disabled={state === "sending" || !reason || username.length < 3} className="btn-gold disabled:opacity-50">
        {state === "sending" ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}

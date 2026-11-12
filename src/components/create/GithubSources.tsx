"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/format";
import Seal from "../assets/Seal";
import { MAX_PICK_UI } from "./model";

interface Repo {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushed_at: string | null;
  added: boolean;
}

type Msg = { ok: boolean; text: string } | null;

async function call(url: string, init?: RequestInit): Promise<{ ok: boolean; body: Record<string, unknown> }> {
  try {
    const res = await fetch(url, init);
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, body };
  } catch {
    return { ok: false, body: { error: "Couldn't reach the server. Please try again." } };
  }
}

/** Two more ways to get verified stamps: your own public projects, and counts of private (company) work. */
export default function GithubSources({ canUse, onChanged }: { canUse: boolean; onChanged: () => Promise<void> }) {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"add" | "private" | null>(null);
  const [repoMsg, setRepoMsg] = useState<Msg>(null);
  const [privMsg, setPrivMsg] = useState<Msg>(null);

  async function openPicker() {
    setOpen(true);
    if (repos) return;
    setLoading(true);
    setRepoMsg(null);
    const { ok, body } = await call("/api/github/projects");
    if (ok) setRepos((body.repos as Repo[]) ?? []);
    else {
      setRepoMsg({ ok: false, text: String(body.error ?? "Couldn't load your repositories.") });
      setOpen(false);
    }
    setLoading(false);
  }

  function toggle(name: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else if (next.size < MAX_PICK_UI) next.add(name);
      return next;
    });
  }

  async function addSelected() {
    setBusy("add");
    setRepoMsg(null);
    const { ok, body } = await call("/api/github/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repos: [...picked] }),
    });
    if (ok) {
      await onChanged();
      const skipped = (body.skipped as string[] | undefined) ?? [];
      setRepoMsg({ ok: true, text: [String(body.message ?? "Added."), ...skipped].join(" ") });
      setRepos((list) => list && list.map((r) => (picked.has(r.full_name) ? { ...r, added: true } : r)));
      setPicked(new Set());
    } else {
      setRepoMsg({ ok: false, text: String(body.error ?? "Couldn't add those repositories.") });
    }
    setBusy(null);
  }

  async function addPrivate() {
    setBusy("private");
    setPrivMsg(null);
    const { ok, body } = await call("/api/github/private", { method: "POST" });
    if (ok) {
      const created = Number(body.created ?? 0) + Number(body.updated ?? 0) > 0;
      if (created) await onChanged();
      setPrivMsg({ ok: created, text: String(body.message ?? "Done.") });
    } else {
      setPrivMsg({ ok: false, text: String(body.error ?? "Couldn't check your private contributions.") });
    }
    setBusy(null);
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Own public projects */}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-wine/30 to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <p className="flex items-center gap-2 font-medium">
              <Seal className="h-5 w-5" /> Your projects
            </p>
            <p className="mt-1 text-sm text-muted">
              Pick public repositories you created, such as demo and side projects. We check with GitHub that each one is public, not a
              fork, and owned by your account, then add a <span className="text-goldsoft">verified</span> Project stamp.
            </p>
          </div>
          {!open && (
            <button type="button" onClick={openPicker} disabled={!canUse || loading} className="btn-ghost !py-2.5 whitespace-nowrap disabled:opacity-50">
              {loading ? "Loading…" : "Choose repositories"}
            </button>
          )}
        </div>

        {open && repos && (
          <div className="mt-4">
            {repos.length === 0 ? (
              <p className="text-sm text-muted">No public repositories of your own were found.</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto pr-1" aria-label="Your public repositories">
                {repos.map((r) => {
                  const on = picked.has(r.full_name);
                  return (
                    <li key={r.full_name}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-gold/40 ${
                          r.added ? "border-line opacity-60" : on ? "border-gold bg-gold/[0.08]" : "border-line hover:border-gold/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-[#C9A45C]"
                          checked={on}
                          disabled={r.added || (!on && picked.size >= MAX_PICK_UI)}
                          onChange={() => toggle(r.full_name)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 text-sm">
                            <span className="font-medium text-cream [overflow-wrap:anywhere]">{r.name}</span>
                            {r.language && <span className="text-xs text-muted">{r.language}</span>}
                            <span className="text-xs text-muted">★ {r.stars}</span>
                            {r.pushed_at && <span className="text-xs text-muted">updated {fmtDate(r.pushed_at.slice(0, 10))}</span>}
                            {r.added && <span className="text-xs text-goldsoft">Added</span>}
                          </span>
                          {r.description && <span className="mt-0.5 line-clamp-2 block text-xs text-soft">{r.description}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={addSelected} disabled={picked.size === 0 || busy === "add"} className="btn-gold !py-2.5 disabled:opacity-50">
                {busy === "add" ? "Verifying…" : `Add ${picked.size || ""} selected`.replace("  ", " ")}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2.5">Close</button>
              <span className="text-xs text-muted">Up to {MAX_PICK_UI} at a time</span>
            </div>
          </div>
        )}
        {!canUse && <p className="mt-3 text-xs text-amber-300">Sign in with GitHub to use this.</p>}
        {repoMsg && (
          <p role={repoMsg.ok ? "status" : "alert"} className={`mt-3 text-sm ${repoMsg.ok ? "text-emerald-300" : "text-rose-300"}`}>
            {repoMsg.text}
          </p>
        )}
      </div>

      {/* Private / company work */}
      <div className="rounded-2xl border border-gold/20 bg-panel/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <p className="font-medium">Private or company work</p>
            <p className="mt-1 text-sm text-muted">
              Private repositories can&apos;t be shown or verified one by one. Instead, GitHub can report <em>how many</em> contributions you made
              to private repositories in the last 12 months. We show only that number, never repository names or code.
            </p>
            <p className="mt-2 text-xs text-muted">
              Needs “Private contributions” turned on in your GitHub profile settings. For a specific company project, add a
              self-reported stamp below with a public proof, like the app&apos;s store page.
            </p>
          </div>
          <button type="button" onClick={addPrivate} disabled={!canUse || busy === "private"} className="btn-ghost !py-2.5 whitespace-nowrap disabled:opacity-50">
            {busy === "private" ? "Checking…" : "Add private contributions"}
          </button>
        </div>
        {privMsg && (
          <p role={privMsg.ok ? "status" : "alert"} className={`mt-3 text-sm ${privMsg.ok ? "text-emerald-300" : "text-amber-300"}`}>
            {privMsg.text}
          </p>
        )}
      </div>
    </div>
  );
}

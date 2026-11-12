"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type StampCategory } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import InkStamp from "../assets/InkStamp";
import Seal from "../assets/Seal";
import StampIcon from "../StampIcon";
import GithubSources from "./GithubSources";
import { Field, StepIntro, inputCls } from "./ui";
import { LIMITS, normalizeUrl, type StampRow } from "./model";
import type { StampInput } from "./usePassportEditor";

const IDEAS: { title: string; category: StampCategory }[] = [
  { title: "Merged a pull request in an open-source project", category: "Contribution" },
  { title: "Published an app on the Play Store", category: "Project" },
  { title: "Completed a course or certification", category: "Learning" },
  { title: "Reviewed pull requests or mentored a developer", category: "Community" },
  { title: "Shipped a production app at my company", category: "Career" },
  { title: "Started a new role", category: "Career" },
];

const CATEGORY_HINT: Record<StampCategory, string> = {
  Contribution: "Pull requests, fixes",
  Project: "Apps and tools you built",
  Learning: "Courses, certificates",
  Community: "Reviews, mentoring, talks",
  Career: "Roles, interviews",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

type Draft = { title: string; category: StampCategory; earned_on: string; proof: string; is_public: boolean };
const blank = (): Draft => ({ title: "", category: "Contribution", earned_on: "", proof: "", is_public: true });

export default function StepStamps({
  stamps, add, update, remove, onImport, canImport, onGithubChanged,
}: {
  stamps: StampRow[];
  add: (input: StampInput) => void;
  update: (id: string, patch: Partial<StampInput>) => void;
  remove: (id: string) => void;
  onImport: () => Promise<{ ok: boolean; message: string }>;
  canImport: boolean;
  onGithubChanged: () => Promise<void>;
}) {
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; message: string } | null>(null);

  async function runImport() {
    setImporting(true);
    setImportMsg(null);
    setImportMsg(await onImport());
    setImporting(false);
  }

  const [draft, setDraft] = useState<Draft>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Default the date after mount so server and browser markup always match
  useEffect(() => {
    setDraft((d) => (d.earned_on ? d : { ...d, earned_on: todayStr() }));
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const manualCount = stamps.filter((s) => s.source === "manual").length;
  const atLimit = !editingId && manualCount >= 200;

  function reset() {
    setDraft({ ...blank(), earned_on: todayStr() });
    setEditingId(null);
    setErr(null);
  }

  function submit() {
    const title = draft.title.trim();
    if (!title) return setErr("Describe what you achieved.");
    if (title.length > LIMITS.stampTitle) return setErr(`Keep the title under ${LIMITS.stampTitle} characters.`);
    if (!draft.earned_on) return setErr("Choose a date.");
    if (draft.earned_on > todayStr()) return setErr("The date can't be in the future.");
    let proof: string | null = null;
    if (draft.proof.trim()) {
      proof = normalizeUrl(draft.proof);
      if (!proof) return setErr("The proof link must be a valid web address.");
    }
    setErr(null);
    const input: StampInput = { title, category: draft.category, earned_on: draft.earned_on, proof_url: proof, is_public: draft.is_public };
    if (editingId) update(editingId, input);
    else add(input);
    reset();
  }

  function startEdit(s: StampRow) {
    setEditingId(s.id);
    setDraft({ title: s.title, category: s.category, earned_on: s.earned_on, proof: s.proof_url ?? "", is_public: s.is_public });
    setErr(null);
    document.getElementById("stamp-title")?.focus();
  }

  return (
    <div>
      <StepIntro title="Collect your stamps">
        Each stamp is one thing you&apos;ve done, ideally with a link that proves it. Stamps you add are marked
        <span className="text-goldsoft"> self-reported</span>; only the platform can verify them.
      </StepIntro>

      {/* Form */}
      <div className="rounded-2xl border border-gold/20 bg-panel/70 p-5">
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Category</legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CATEGORIES.map((c) => {
              const on = draft.category === c;
              return (
                <label
                  key={c}
                  className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition focus-within:ring-2 focus-within:ring-gold/40 ${
                    on ? "border-gold bg-gold/[0.1] text-goldsoft" : "border-line text-soft hover:border-gold/40"
                  }`}
                >
                  <input type="radio" name="category" value={c} checked={on} onChange={() => set("category", c)} className="sr-only" />
                  <StampIcon category={c} className="h-6 w-6" />
                  <span className="text-xs font-medium">{c}</span>
                  <span className="hidden text-[10px] leading-tight text-muted sm:block">{CATEGORY_HINT[c]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!editingId && !draft.title && (
          <div className="mt-5">
            <p className="text-xs text-muted">Need ideas? Tap one to start:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {IDEAS.map((i) => (
                <button
                  key={i.title}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, title: i.title, category: i.category }))}
                  className="rounded-full border border-line px-3 py-1 text-xs text-soft transition hover:border-gold/60 hover:text-cream"
                >
                  {i.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="stamp-title" label="What did you achieve?" right={`${draft.title.length}/${LIMITS.stampTitle}`}>
              <input id="stamp-title" className={inputCls} value={draft.title} maxLength={LIMITS.stampTitle} placeholder="Merged PR: offline caching for notes app" onChange={(e) => set("title", e.target.value)} />
            </Field>
          </div>
          <Field id="stamp-date" label="Date">
            <input id="stamp-date" type="date" className={inputCls} value={draft.earned_on} max={todayStr()} onChange={(e) => set("earned_on", e.target.value)} />
          </Field>
          <Field id="stamp-proof" label="Proof link" hint="A pull request, store page or certificate. Optional, but stamps with proof count more.">
            <input id="stamp-proof" className={inputCls} value={draft.proof} maxLength={500} placeholder="github.com/org/repo/pull/42" onChange={(e) => set("proof", e.target.value)} />
          </Field>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-soft">
          <input type="checkbox" checked={draft.is_public} onChange={(e) => set("is_public", e.target.checked)} className="h-4 w-4 accent-[#C9A45C]" />
          Show this stamp on my public passport
        </label>

        {err && <p role="alert" className="mt-4 text-sm text-rose-300">{err}</p>}
        {atLimit && <p className="mt-4 text-sm text-amber-300">You&apos;ve reached the limit of 200 manual stamps.</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={submit} disabled={atLimit} className="btn-gold !py-2.5 disabled:opacity-40">
            {editingId ? "Save changes" : "Add stamp"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-ghost !py-2.5">Cancel</button>
          )}
        </div>
      </div>

      {/* GitHub import */}
      <div className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-wine/30 to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <p className="flex items-center gap-2 font-medium">
              <Seal className="h-5 w-5" /> Import verified stamps from GitHub
            </p>
            <p className="mt-1 text-sm text-muted">
              We find merged pull requests you wrote in public repositories owned by other people. Each repository becomes one
              <span className="text-goldsoft"> verified</span> stamp.
            </p>
          </div>
          <button type="button" onClick={runImport} disabled={importing || !canImport} className="btn-gold !py-2.5 whitespace-nowrap disabled:opacity-50">
            {importing ? "Importing…" : "Import from GitHub"}
          </button>
        </div>
        {!canImport && <p className="mt-3 text-xs text-amber-300">Sign in with GitHub to use the importer.</p>}
        {importMsg && (
          <p role={importMsg.ok ? "status" : "alert"} className={`mt-3 text-sm ${importMsg.ok ? "text-emerald-300" : "text-rose-300"}`}>
            {importMsg.message}
          </p>
        )}
      </div>

      <GithubSources canUse={canImport} onChanged={onGithubChanged} />

      {/* List */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Your stamps</h3>
          <span className="text-xs text-muted">{stamps.length} total</span>
        </div>

        {stamps.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-gold/25 p-10 text-center">
            <div className="opacity-40">
              <InkStamp category="Contribution" verified={false} className="h-28 w-28" />
            </div>
            <p className="mt-4 font-serif text-xl">Your passport is empty</p>
            <p className="mt-1 max-w-xs text-sm text-muted">Add your first stamp above. Even one with a proof link makes your passport stand out.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {stamps.map((s) => (
              <li key={s.id} className={`flex items-center gap-4 rounded-2xl border bg-panel/70 p-3 ${editingId === s.id ? "border-gold" : "border-gold/15"} ${s.is_public ? "" : "opacity-70"}`}>
                <InkStamp category={s.category} verified={s.verified} date={s.earned_on} className="h-16 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cream">{s.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span>{s.category}</span>
                    <span aria-hidden>·</span>
                    <span>{fmtDate(s.earned_on)}</span>
                    {s.verified && (
                      <span className="flex items-center gap-1 text-goldsoft"><Seal className="h-4 w-4" /> Verified</span>
                    )}
                    {!s.is_public && <span className="text-amber-300">Hidden</span>}
                  </p>
                </div>

                {confirmId === s.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-soft">Delete?</span>
                    <button type="button" onClick={() => { remove(s.id); setConfirmId(null); }} className="rounded-lg border border-rose-300/60 px-2 py-1 text-rose-300">Yes</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg border border-line px-2 py-1 text-soft">No</button>
                  </div>
                ) : (
                  <div className="flex shrink-0 gap-1.5 text-xs">
                    {s.verified ? (
                      <span className="hidden self-center text-muted sm:inline" title="Verified stamps are locked">Locked</span>
                    ) : (
                      <button type="button" onClick={() => startEdit(s)} className="rounded-lg border border-line px-2.5 py-1.5 text-soft hover:border-gold/50">Edit</button>
                    )}
                    <button type="button" onClick={() => update(s.id, { is_public: !s.is_public })} className="rounded-lg border border-line px-2.5 py-1.5 text-soft hover:border-gold/50">
                      {s.is_public ? "Hide" : "Show"}
                    </button>
                    <button type="button" onClick={() => setConfirmId(s.id)} aria-label={`Delete ${s.title}`} className="rounded-lg border border-line px-2.5 py-1.5 text-soft hover:border-rose-300/60 hover:text-rose-300">Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

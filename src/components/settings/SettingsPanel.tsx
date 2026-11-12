"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${checked ? "border-gold bg-gold/30" : "border-line bg-ink"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-goldsoft transition-all ${checked ? "left-[1.5rem]" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPanel({
  userId, username, email, initial,
}: {
  userId: string;
  username: string;
  email: string | null;
  initial: { isPublic: boolean; listed: boolean; issued: boolean };
}) {
  const [isPublic, setIsPublic] = useState(initial.isPublic);
  const [listed, setListed] = useState(initial.listed);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);

  async function save(patch: { is_public?: boolean; listed?: boolean }, rollback: () => void) {
    setMsg(null);
    const { error } = await createClient().from("profiles").update(patch).eq("id", userId);
    if (error) {
      rollback();
      setMsg({ ok: false, text: "Couldn't save that change. Please try again." });
    } else {
      setMsg({ ok: true, text: "Saved." });
    }
  }

  function changePublic(v: boolean) {
    const prevListed = listed;
    setIsPublic(v);
    // A private passport can never be listed
    if (!v) setListed(false);
    void save(v ? { is_public: true } : { is_public: false, listed: false }, () => {
      setIsPublic(!v);
      setListed(prevListed);
    });
  }

  function changeListed(v: boolean) {
    setListed(v);
    void save({ listed: v }, () => setListed(!v));
  }

  async function deleteAccount() {
    setDeleting(true);
    setDelErr(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDelErr(body.error ?? "Couldn't delete the account.");
        setDeleting(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setDelErr("Couldn't reach the server. Please try again.");
      setDeleting(false);
    }
  }

  const card = "mt-8 rounded-2xl border border-gold/20 bg-panel/70 p-6";

  return (
    <div>
      {/* Visibility */}
      <section className={card} aria-labelledby="vis-h">
        <h2 id="vis-h" className="font-serif text-2xl">Visibility</h2>

        <div className="mt-5 flex items-center justify-between gap-6">
          <div>
            <p className="font-medium">Public passport</p>
            <p className="mt-0.5 text-sm text-muted">
              {isPublic ? "Anyone with your link can see it, and search engines may index it." : "Only you can see it."}
              {!initial.issued && " (It only goes live once you issue it.)"}
            </p>
          </div>
          <Switch checked={isPublic} onChange={changePublic} label="Public passport" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-6 border-t border-line pt-6">
          <div>
            <p className="font-medium">List me in Explore</p>
            <p className="mt-0.5 text-sm text-muted">
              Show your passport in the public directory so people can discover it. Off by default.
              {!isPublic && " Requires a public passport."}
            </p>
          </div>
          <Switch checked={listed} onChange={changeListed} disabled={!isPublic || !initial.issued} label="List me in Explore" />
        </div>

        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={`mt-4 text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</p>
        )}
      </section>

      {/* Your data */}
      <section className={card} aria-labelledby="data-h">
        <h2 id="data-h" className="font-serif text-2xl">Your data</h2>
        <p className="mt-2 text-sm text-soft">
          Signed in as {email ?? "your GitHub account"}. Download a copy of everything stored about you: profile, links and stamps.
        </p>
        <a href="/api/account/export" download className="btn-ghost mt-5 inline-flex">Download my data (JSON)</a>
        <p className="mt-4 text-xs text-muted">
          See the <Link href="/privacy" className="underline underline-offset-4 hover:text-white">Privacy Policy</Link> for how your data is used.
        </p>
      </section>

      {/* Danger zone */}
      <section className="mt-8 rounded-2xl border border-rose-400/30 bg-rose-950/10 p-6" aria-labelledby="del-h">
        <h2 id="del-h" className="font-serif text-2xl text-rose-200">Delete my account</h2>
        <p className="mt-2 text-sm text-soft">
          This permanently deletes your passport, stamps, links and account. It can&apos;t be undone, and your <span className="text-cream">/u/{username}</span> link will stop working.
        </p>
        <label htmlFor="confirm" className="mt-5 block text-xs text-muted">
          Type your handle <span className="font-mono text-cream">{username}</span> to confirm
        </label>
        <input
          id="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-rose-400/30 bg-ink/70 px-4 py-3 text-sm text-cream focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300/30"
        />
        {delErr && <p role="alert" className="mt-3 text-sm text-rose-300">{delErr}</p>}
        <button
          type="button"
          onClick={deleteAccount}
          disabled={deleting || confirm.trim().toLowerCase() !== username.toLowerCase()}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-rose-500/90 px-7 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete my account forever"}
        </button>
      </section>
    </div>
  );
}

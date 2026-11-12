"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StampCategory } from "@/lib/types";
import type { LinkRow, ProfileRow, StampRow } from "./model";

export type SaveState = "idle" | "saving" | "saved" | "error" | "offline";

type ErrLike = { code?: string; message?: string } | null;

const uuid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

function friendly(err: ErrLike): string {
  if (!err) return "";
  if (err.code === "23505") return "That value is already taken.";
  if (err.code === "23514") return "One of the values is not allowed. Please check your input.";
  if (err.code === "42501") return "You do not have permission to do that.";
  return err.message || "Something went wrong. Please try again.";
}

export interface StampInput {
  title: string;
  category: StampCategory;
  earned_on: string;
  proof_url: string | null;
  is_public: boolean;
}

/**
 * Loads nothing itself: the server page passes the initial rows.
 * Every change is applied to the screen immediately (optimistic) and saved to Supabase.
 * If a save fails, the change is rolled back and an error is shown.
 */
export function usePassportEditor(initial: { profile: ProfileRow; links: LinkRow[]; stamps: StampRow[] }) {
  const supabase = useMemo(() => createClient(), []);
  const userId = initial.profile.id;

  const [profile, setProfile] = useState<ProfileRow>(initial.profile);
  const [links, setLinks] = useState<LinkRow[]>(initial.links);
  const [stamps, setStamps] = useState<StampRow[]>(initial.stamps);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const linksRef = useRef(links);
  linksRef.current = links;
  const stampsRef = useRef(stamps);
  stampsRef.current = stamps;

  const inflight = useRef(0);
  const failed = useRef(false);
  const pending = useRef<Partial<ProfileRow>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Runs one save and keeps the status indicator correct, even with several saves at once. */
  const run = useCallback(async (op: () => PromiseLike<{ error: ErrLike }>): Promise<boolean> => {
    if (inflight.current === 0) failed.current = false;
    inflight.current += 1;
    setSaveState("saving");
    let ok = true;
    try {
      const { error: e } = await op();
      if (e) {
        ok = false;
        setError(friendly(e));
      }
    } catch {
      ok = false;
      setError(navigator.onLine ? "Couldn't reach the server. Please try again." : "You're offline. Changes will sync when you're back.");
    }
    inflight.current -= 1;
    if (!ok) {
      failed.current = true;
      setSaveState(navigator.onLine ? "error" : "offline");
    } else if (inflight.current === 0 && !failed.current) {
      setError(null);
      setSaveState("saved");
    }
    return ok;
  }, []);

  /* ---------- Profile (debounced) ---------- */
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return;
    pending.current = {};
    const ok = await run(() => supabase.from("profiles").update(patch).eq("id", userId));
    if (!ok) pending.current = { ...patch, ...pending.current };
  }, [run, supabase, userId]);

  const updateProfile = useCallback(
    (patch: Partial<ProfileRow>) => {
      setProfile((p) => ({ ...p, ...patch }));
      pending.current = { ...pending.current, ...patch };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 700);
    },
    [flush],
  );

  const retry = useCallback(() => {
    setError(null);
    void flush();
  }, [flush]);

  /* Warn before leaving with unsaved work, sync again when back online, save on unmount */
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (inflight.current > 0 || Object.keys(pending.current).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const goOnline = () => {
      setSaveState("idle");
      void flush();
    };
    const goOffline = () => setSaveState("offline");
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      void flush();
    };
  }, [flush]);

  const checkUsername = useCallback(
    async (candidate: string): Promise<boolean | null> => {
      try {
        const { data, error: e } = await supabase.rpc("username_available", { candidate });
        return e ? null : Boolean(data);
      } catch {
        return null;
      }
    },
    [supabase],
  );

  /* ---------- Links ---------- */
  const addLink = useCallback(
    (label: string, url: string) => {
      const row: LinkRow = { id: uuid(), label, url, position: linksRef.current.length };
      setLinks((l) => [...l, row]);
      void run(() => supabase.from("links").insert({ id: row.id, user_id: userId, label, url, position: row.position })).then(
        (ok) => {
          if (!ok) setLinks((l) => l.filter((x) => x.id !== row.id));
        },
      );
    },
    [run, supabase, userId],
  );

  const updateLink = useCallback(
    (id: string, patch: Partial<Pick<LinkRow, "label" | "url">>) => {
      const before = linksRef.current.find((l) => l.id === id);
      if (!before) return;
      setLinks((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      void run(() => supabase.from("links").update(patch).eq("id", id)).then((ok) => {
        if (!ok) setLinks((l) => l.map((x) => (x.id === id ? before : x)));
      });
    },
    [run, supabase],
  );

  const removeLink = useCallback(
    (id: string) => {
      const snapshot = linksRef.current;
      const next = snapshot.filter((l) => l.id !== id).map((l, i) => ({ ...l, position: i }));
      setLinks(next);
      void (async () => {
        const ok = await run(() => supabase.from("links").delete().eq("id", id));
        if (!ok) {
          setLinks(snapshot);
          return;
        }
        // Keep positions contiguous
        const changed = next.filter((l, i) => snapshot.filter((s) => s.id !== id)[i]?.position !== l.position);
        await Promise.all(changed.map((l) => run(() => supabase.from("links").update({ position: l.position }).eq("id", l.id))));
      })();
    },
    [run, supabase],
  );

  const reorderLinks = useCallback(
    (order: LinkRow[]) => {
      const snapshot = linksRef.current;
      const next = order.map((l, i) => ({ ...l, position: i }));
      setLinks(next);
      const changed = next.filter((l) => snapshot.find((s) => s.id === l.id)?.position !== l.position);
      if (changed.length === 0) return;
      void (async () => {
        const results = await Promise.all(
          changed.map((l) => run(() => supabase.from("links").update({ position: l.position }).eq("id", l.id))),
        );
        if (results.some((ok) => !ok)) setLinks(snapshot);
      })();
    },
    [run, supabase],
  );

  /* ---------- Stamps (always created as unverified manual stamps) ---------- */
  const addStamp = useCallback(
    (input: StampInput) => {
      const row: StampRow = { id: uuid(), verified: false, source: "manual", ...input };
      setStamps((s) => [row, ...s]);
      void run(() =>
        supabase.from("stamps").insert({
          id: row.id,
          user_id: userId,
          title: input.title,
          category: input.category,
          earned_on: input.earned_on,
          proof_url: input.proof_url,
          is_public: input.is_public,
        }),
      ).then((ok) => {
        if (!ok) setStamps((s) => s.filter((x) => x.id !== row.id));
      });
    },
    [run, supabase, userId],
  );

  const updateStamp = useCallback(
    (id: string, patch: Partial<StampInput>) => {
      const before = stampsRef.current.find((s) => s.id === id);
      if (!before) return;
      setStamps((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      void run(() => supabase.from("stamps").update(patch).eq("id", id)).then((ok) => {
        if (!ok) setStamps((s) => s.map((x) => (x.id === id ? before : x)));
      });
    },
    [run, supabase],
  );

  const removeStamp = useCallback(
    (id: string) => {
      const snapshot = stampsRef.current;
      setStamps(snapshot.filter((s) => s.id !== id));
      void run(() => supabase.from("stamps").delete().eq("id", id)).then((ok) => {
        if (!ok) setStamps(snapshot);
      });
    },
    [run, supabase],
  );

  /** Reloads stamps from the database (used after the GitHub import adds verified stamps). */
  const refreshStamps = useCallback(async () => {
    const { data } = await supabase
      .from("stamps")
      .select("id, title, category, earned_on, proof_url, verified, source, is_public")
      .eq("user_id", userId)
      .order("earned_on", { ascending: false });
    if (Array.isArray(data)) setStamps(data as StampRow[]);
  }, [supabase, userId]);

  /* ---------- Issue: the server generates the passport number ---------- */
  const issue = useCallback(async (): Promise<{ no: string | null; error: string | null }> => {
    await flush();
    try {
      const { data, error: e } = await supabase.rpc("issue_passport");
      if (e || typeof data !== "string") return { no: null, error: friendly(e) || "Could not issue the passport." };
      setProfile((p) => ({ ...p, passport_no: data, issued_at: p.issued_at ?? new Date().toISOString() }));
      return { no: data, error: null };
    } catch {
      return { no: null, error: "Couldn't reach the server. Please try again." };
    }
  }, [flush, supabase]);

  return {
    profile, links, stamps, saveState, error,
    updateProfile, flush, retry, checkUsername,
    addLink, updateLink, removeLink, reorderLinks,
    addStamp, updateStamp, removeStamp, refreshStamps, issue,
  };
}

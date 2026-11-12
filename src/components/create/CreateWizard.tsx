"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import PassportCard from "../PassportCard";
import ShareBox from "../ShareBox";
import IssueCeremony, { type CeremonyPhase } from "./IssueCeremony";
import LivePreview from "./LivePreview";
import Stepper from "./Stepper";
import StepIdentity from "./StepIdentity";
import StepLinks from "./StepLinks";
import StepReview from "./StepReview";
import StepStack from "./StepStack";
import StepStamps from "./StepStamps";
import { SaveStatus } from "./ui";
import { STEPS, computeStrength, toPassport, type LinkRow, type ProfileRow, type StampRow, type StepId } from "./model";
import { usePassportEditor } from "./usePassportEditor";

const variants: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -28 }),
};

type Ceremony = { open: boolean; phase: CeremonyPhase; no: string | null; error: string | null };

export default function CreateWizard({ initial }: { initial: { profile: ProfileRow; links: LinkRow[]; stamps: StampRow[] } }) {
  const ed = usePassportEditor(initial);
  const [step, setStep] = useState(0);
  const dir = useRef(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [ceremony, setCeremony] = useState<Ceremony>({ open: false, phase: "issuing", no: null, error: null });
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const passport = useMemo(() => toPassport(ed.profile, ed.links, ed.stamps), [ed.profile, ed.links, ed.stamps]);
  const strength = useMemo(() => computeStrength(ed.profile, ed.links, ed.stamps), [ed.profile, ed.links, ed.stamps]);
  const issued = Boolean(ed.profile.passport_no);
  const canIssue = ed.profile.display_name.trim().length >= 2;
  const last = STEPS.length - 1;

  const go = useCallback(
    (i: number) => {
      if (i === step || i < 0 || i > last) return;
      dir.current = i > step ? 1 : -1;
      void ed.flush();
      setStep(i);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, last, ed.flush],
  );
  const goToId = (id: StepId) => go(STEPS.findIndex((s) => s.id === id));

  // Move focus to the new step's heading and bring the wizard into view
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById("step-heading")?.focus({ preventScroll: true });
    document.getElementById("wizard-top")?.scrollIntoView({ block: "start" });
  }, [step]);

  // Close the mobile preview with Escape
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  async function handleIssue() {
    setCeremony({ open: true, phase: "issuing", no: null, error: null });
    const res = await ed.issue();
    if (res.error || !res.no) {
      setCeremony({ open: true, phase: "error", no: null, error: res.error });
      return;
    }
    setCeremony({ open: true, phase: "stamped", no: res.no, error: null });
    doneTimer.current = setTimeout(() => setCeremony((c) => ({ ...c, phase: "done" })), 2600);
  }

  const firstName = ed.profile.display_name.trim().split(/\s+/)[0] ?? "";

  async function handleImport(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch("/api/github/import", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) return { ok: false, message: body.error ?? "The import failed. Please try again." };
      await ed.refreshStamps();
      return { ok: true, message: body.message ?? "Imported." };
    } catch {
      return { ok: false, message: "Couldn't reach the server. Please try again." };
    }
  }

  // Permanent link, available once the passport is issued and public
  const publicPath = ed.profile.passport_no && ed.profile.is_public ? `/u/${ed.profile.username}` : undefined;

  const content = (() => {
    switch (STEPS[step].id) {
      case "identity":
        return <StepIdentity profile={ed.profile} update={ed.updateProfile} checkUsername={ed.checkUsername} />;
      case "stack":
        return <StepStack stack={ed.profile.stack} update={(next) => ed.updateProfile({ stack: next })} />;
      case "links":
        return <StepLinks links={ed.links} add={ed.addLink} update={ed.updateLink} remove={ed.removeLink} reorder={ed.reorderLinks} />;
      case "stamps":
        return <StepStamps stamps={ed.stamps} add={ed.addStamp} update={ed.updateStamp} remove={ed.removeStamp} onImport={handleImport} canImport={Boolean(ed.profile.github_login)} onGithubChanged={ed.refreshStamps} />;
      case "review":
        return (
          <StepReview
            passport={passport}
            score={strength.score}
            label={strength.label}
            tips={strength.tips}
            goTo={goToId}
            isPublic={ed.profile.is_public}
            setPublic={(v) => ed.updateProfile({ is_public: v })}
            issued={issued}
            canIssue={canIssue}
            onIssue={handleIssue}
            publicPath={publicPath}
          />
        );
    }
  })();

  return (
    <div id="wizard-top" className="scroll-mt-20 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-gold/80">{issued ? "Your passport" : "Passport office"}</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{issued ? "Edit your passport" : "Issue your passport"}</h1>
        </div>
        <SaveStatus state={ed.saveState} error={ed.error} onRetry={ed.retry} />
      </header>

      <Stepper current={step} onGo={go} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <section aria-label={STEPS[step].label}>
          <AnimatePresence mode="wait" initial={false} custom={dir.current}>
            <motion.div key={step} custom={dir.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }}>
              {content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between border-t border-gold/15 pt-6">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn-ghost !py-2.5 disabled:invisible">
              ← Back
            </button>
            {step < last ? (
              <button type="button" onClick={() => go(step + 1)} className="btn-gold !py-2.5">
                Continue →
              </button>
            ) : (
              <Link href="/dashboard" className="text-sm text-muted underline underline-offset-4 hover:text-cream">
                Go to dashboard
              </Link>
            )}
          </div>
        </section>

        <aside className="hidden lg:block" aria-label="Passport preview">
          <LivePreview passport={passport} />
        </aside>
      </div>

      {/* Mobile preview */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="no-print fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-gold/50 bg-ink/90 px-6 py-3 text-sm text-goldsoft shadow-lg backdrop-blur lg:hidden"
      >
        Preview passport
      </button>
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Passport preview"
            className="fixed inset-0 z-[60] overflow-y-auto bg-ink/95 backdrop-blur lg:hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mx-auto max-w-md px-4 py-6">
              <button type="button" onClick={() => setPreviewOpen(false)} className="btn-ghost mb-4 !py-2" autoFocus>
                Close preview
              </button>
              <PassportCard passport={passport} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IssueCeremony
        open={ceremony.open}
        phase={ceremony.phase}
        passportNo={ceremony.no}
        firstName={firstName}
        error={ceremony.error}
        onClose={() => {
          setCeremony((c) => ({ ...c, open: false }));
          if (ceremony.phase === "done") go(last);
        }}
      >
        <ShareBox passport={passport} path={publicPath} />
      </IssueCeremony>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Field, StepIntro, inputCls } from "./ui";
import { LIMITS, USERNAME_RE, type ProfileRow } from "./model";

type Check = "same" | "invalid" | "checking" | "available" | "taken" | "unknown";

export default function StepIdentity({
  profile,
  update,
  checkUsername,
}: {
  profile: ProfileRow;
  update: (patch: Partial<ProfileRow>) => void;
  checkUsername: (u: string) => Promise<boolean | null>;
}) {
  const [handle, setHandle] = useState(profile.username);
  const [check, setCheck] = useState<Check>("same");

  // Live availability check (debounced)
  useEffect(() => {
    const v = handle.trim().toLowerCase();
    if (v === profile.username) return setCheck("same");
    if (!USERNAME_RE.test(v)) return setCheck("invalid");
    setCheck("checking");
    let cancelled = false;
    const t = setTimeout(async () => {
      const ok = await checkUsername(v);
      if (!cancelled) setCheck(ok === null ? "unknown" : ok ? "available" : "taken");
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [handle, profile.username, checkUsername]);

  function claim() {
    const v = handle.trim().toLowerCase();
    if (check !== "available") return;
    update({ username: v });
    setHandle(v);
  }

  const handleMsg: Record<Check, { text: string; tone: string }> = {
    same: { text: "This is your current handle.", tone: "text-muted" },
    invalid: { text: "Use 3-30 characters: letters, numbers, _ or -. Start with a letter or number.", tone: "text-rose-300" },
    checking: { text: "Checking availability…", tone: "text-muted" },
    available: { text: "Available. Press Use this handle to claim it.", tone: "text-emerald-300" },
    taken: { text: "That handle is taken or reserved. Try another.", tone: "text-rose-300" },
    unknown: { text: "Couldn't check right now. Try again in a moment.", tone: "text-amber-300" },
  };

  return (
    <div>
      <StepIntro title="Who are you?">
        This appears on the data page of your passport. Hiring teams read it first, so keep it clear and professional.
      </StepIntro>

      <div className="space-y-6">
        {/* Portrait */}
        <div className="flex items-center gap-5 rounded-2xl border border-gold/20 bg-panel/70 p-4">
          <div className="rounded-xl bg-gradient-to-br from-goldsoft via-gold to-golddeep p-[2px]">
            <div className="flex h-20 w-16 items-center justify-center overflow-hidden rounded-[10px] bg-ink font-serif text-2xl text-goldsoft">
              {profile.avatar_url && profile.avatar_url.startsWith("https://") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (profile.display_name || "?").trim().charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div>
            <p className="font-medium">Portrait</p>
            <p className="mt-0.5 text-sm text-muted">
              Taken from your GitHub account{profile.github_login ? ` (@${profile.github_login})` : ""}. Change your GitHub photo to change this.
            </p>
          </div>
        </div>

        <Field id="name" label="Full name" right={`${profile.display_name.length}/${LIMITS.name}`}>
          <input
            id="name"
            className={inputCls}
            value={profile.display_name}
            maxLength={LIMITS.name}
            autoComplete="name"
            placeholder="Aisha Khan"
            onChange={(e) => update({ display_name: e.target.value })}
          />
        </Field>

        <Field id="headline" label="Headline" hint="Your role in a few words." right={`${profile.headline.length}/${LIMITS.headline}`}>
          <input
            id="headline"
            className={inputCls}
            value={profile.headline}
            maxLength={LIMITS.headline}
            placeholder="Flutter Developer · Open-source contributor"
            onChange={(e) => update({ headline: e.target.value })}
          />
        </Field>

        <Field id="location" label="Base" hint="City and country." right={`${profile.location.length}/${LIMITS.location}`}>
          <input
            id="location"
            className={inputCls}
            value={profile.location}
            maxLength={LIMITS.location}
            autoComplete="address-level2"
            placeholder="Muscat, Oman"
            onChange={(e) => update({ location: e.target.value })}
          />
        </Field>

        <Field id="bio" label="Bio" hint="What you build and what you care about. Aim for 40+ characters." right={`${profile.bio.length}/${LIMITS.bio}`}>
          <textarea
            id="bio"
            rows={4}
            className={inputCls}
            value={profile.bio}
            maxLength={LIMITS.bio}
            placeholder="Mobile developer focused on clean architecture and performance…"
            onChange={(e) => update({ bio: e.target.value })}
          />
        </Field>

        <div>
          <label htmlFor="handle" className="mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-gold/80">
            Handle
          </label>
          <div className="flex gap-3">
            <div className="flex flex-1 items-center rounded-xl border border-gold/20 bg-ink/70 pl-4 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
              <span className="text-muted" aria-hidden>@</span>
              <input
                id="handle"
                className="w-full bg-transparent px-2 py-3 text-sm text-cream placeholder:text-muted/70 focus:outline-none"
                value={handle}
                maxLength={30}
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby="handle-msg"
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && claim()}
              />
            </div>
            <button type="button" onClick={claim} disabled={check !== "available"} className="btn-ghost !px-5 !py-2 disabled:opacity-40">
              Use this handle
            </button>
          </div>
          <p id="handle-msg" role={check === "invalid" || check === "taken" ? "alert" : "status"} className={`mt-1.5 text-xs ${handleMsg[check].tone}`}>
            {handleMsg[check].text}
          </p>
        </div>
      </div>
    </div>
  );
}

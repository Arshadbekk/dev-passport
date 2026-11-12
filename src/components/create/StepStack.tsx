"use client";

import { useState } from "react";
import { StepIntro, inputCls } from "./ui";
import { LIMITS, STACK_GROUPS } from "./model";

export default function StepStack({ stack, update }: { stack: string[]; update: (next: string[]) => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const has = (s: string) => stack.some((x) => x.toLowerCase() === s.toLowerCase());
  const full = stack.length >= LIMITS.stack;

  function add(skill: string) {
    const s = skill.trim().slice(0, LIMITS.skill);
    if (!s || has(s) || full) return;
    update([...stack, s]);
  }
  function remove(skill: string) {
    update(stack.filter((x) => x !== skill));
  }

  const groups = STACK_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !has(i) && (!q || i.toLowerCase().includes(q))),
  })).filter((g) => g.items.length > 0);

  const exact = STACK_GROUPS.some((g) => g.items.some((i) => i.toLowerCase() === q));

  return (
    <div>
      <StepIntro title="What do you build with?">
        Pick the skills you want people to see. Search the list or add your own.
      </StepIntro>

      <div className="rounded-2xl border border-gold/20 bg-panel/70 p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span id="stack-label" className="uppercase tracking-[0.22em] text-gold/80">Your skills</span>
          <span aria-live="polite">{stack.length}/{LIMITS.stack}</span>
        </div>
        <ul aria-labelledby="stack-label" className="mt-3 flex min-h-[2.5rem] flex-wrap gap-2">
          {stack.length === 0 && <li className="text-sm text-muted">Nothing selected yet.</li>}
          {stack.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => remove(s)}
                aria-label={`Remove ${s}`}
                className="group flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.08] px-3 py-1 text-sm text-goldsoft transition hover:border-rose-300/60"
              >
                {s}
                <span aria-hidden className="text-gold/60 group-hover:text-rose-300">×</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <label htmlFor="skill-search" className="sr-only">Search or add a skill</label>
        <input
          id="skill-search"
          className={inputCls}
          value={query}
          placeholder={full ? "You've reached the limit" : "Search or type your own, then press Enter"}
          disabled={full}
          maxLength={LIMITS.skill}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(query);
              setQuery("");
            }
          }}
        />
        {q && !exact && !has(query) && !full && (
          <button
            type="button"
            onClick={() => {
              add(query);
              setQuery("");
            }}
            className="mt-2 text-sm text-goldsoft underline underline-offset-4"
          >
            Add “{query.trim()}” as a custom skill
          </button>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {groups.map((g) => (
          <div key={g.name}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{g.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.items.map((i) => (
                <button
                  key={i}
                  type="button"
                  disabled={full}
                  onClick={() => add(i)}
                  className="rounded-full border border-line px-3 py-1 text-sm text-soft transition hover:border-gold/60 hover:text-cream disabled:opacity-40"
                >
                  + {i}
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && q && <p className="text-sm text-muted">No suggestions match. Press Enter to add it yourself.</p>}
      </div>
    </div>
  );
}

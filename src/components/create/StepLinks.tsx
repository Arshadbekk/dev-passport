"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { StepIntro, inputCls } from "./ui";
import { LIMITS, PLATFORM_META, detectPlatform, normalizeUrl, type LinkRow } from "./model";

const PRESETS = [
  { label: "GitHub", placeholder: "github.com/username" },
  { label: "LinkedIn", placeholder: "linkedin.com/in/username" },
  { label: "Portfolio", placeholder: "yourname.dev" },
  { label: "Play Store", placeholder: "play.google.com/store/apps/details?id=…" },
  { label: "App Store", placeholder: "apps.apple.com/app/…" },
];

function Badge({ url }: { url: string }) {
  return (
    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/[0.06] text-[10px] font-semibold uppercase tracking-wider text-goldsoft">
      {PLATFORM_META[detectPlatform(url)].badge}
    </span>
  );
}

function Row({
  link, index, total, update, remove, move, onDragEnd,
}: {
  link: LinkRow;
  index: number;
  total: number;
  update: (id: string, patch: { label?: string; url?: string }) => void;
  remove: (id: string) => void;
  move: (from: number, to: number) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLabel(link.label);
    setUrl(link.url);
  }, [link.label, link.url]);

  function commit() {
    const n = normalizeUrl(url);
    if (!label.trim() || label.trim().length > 30) return setErr("Label must be 1-30 characters.");
    if (!n) return setErr("Enter a valid web address.");
    setErr(null);
    if (label.trim() !== link.label || n !== link.url) update(link.id, { label: label.trim(), url: n });
  }

  return (
    <Reorder.Item
      value={link}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="rounded-2xl border border-gold/20 bg-panel/80 p-3"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Drag to reorder ${link.label}`}
          onPointerDown={(e) => controls.start(e)}
          className="mt-2 hidden h-8 w-6 cursor-grab touch-none select-none items-center justify-center text-muted hover:text-goldsoft active:cursor-grabbing sm:flex"
        >
          ⋮⋮
        </button>
        <Badge url={link.url} />
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[140px_1fr]">
          <input aria-label="Link label" className={`${inputCls} !py-2`} value={label} maxLength={30} onChange={(e) => setLabel(e.target.value)} onBlur={commit} />
          <input aria-label="Link address" className={`${inputCls} !py-2`} value={url} maxLength={500} onChange={(e) => setUrl(e.target.value)} onBlur={commit} />
        </div>
        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
          <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)} className="h-8 w-8 rounded-lg border border-line text-soft hover:border-gold/50 disabled:opacity-30">↑</button>
          <button type="button" aria-label="Move down" disabled={index === total - 1} onClick={() => move(index, index + 1)} className="h-8 w-8 rounded-lg border border-line text-soft hover:border-gold/50 disabled:opacity-30">↓</button>
          <button type="button" aria-label={`Remove ${link.label}`} onClick={() => remove(link.id)} className="h-8 w-8 rounded-lg border border-line text-soft hover:border-rose-300/60 hover:text-rose-300">×</button>
        </div>
      </div>
      {err && <p role="alert" className="mt-2 pl-12 text-xs text-rose-300">{err}</p>}
    </Reorder.Item>
  );
}

export default function StepLinks({
  links, add, update, remove, reorder,
}: {
  links: LinkRow[];
  add: (label: string, url: string) => void;
  update: (id: string, patch: { label?: string; url?: string }) => void;
  remove: (id: string) => void;
  reorder: (order: LinkRow[]) => void;
}) {
  const sorted = [...links].sort((a, b) => a.position - b.position);
  const [order, setOrder] = useState(sorted);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [placeholder, setPlaceholder] = useState("https://");
  const [err, setErr] = useState<string | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const full = links.length >= LIMITS.links;

  // Keep the local drag order in sync with saved data
  useEffect(() => {
    setOrder([...links].sort((a, b) => a.position - b.position));
  }, [links]);

  function submit() {
    const n = normalizeUrl(url);
    if (!label.trim()) return setErr("Give the link a short label.");
    if (label.trim().length > 30) return setErr("Label must be 30 characters or fewer.");
    if (!n) return setErr("Enter a valid web address.");
    setErr(null);
    add(label.trim(), n);
    setLabel("");
    setUrl("");
    setPlaceholder("https://");
  }

  function move(from: number, to: number) {
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
    reorder(next);
  }

  return (
    <div>
      <StepIntro title="Where can people find you?">
        Add up to {LIMITS.links} links. Drag the handle, or use the arrows, to change the order they appear in.
      </StepIntro>

      <Reorder.Group axis="y" values={order} onReorder={setOrder} className="space-y-3">
        {order.map((l, i) => (
          <Row
            key={l.id}
            link={l}
            index={i}
            total={order.length}
            update={update}
            remove={remove}
            move={move}
            onDragEnd={() => reorder(order)}
          />
        ))}
      </Reorder.Group>
      {order.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gold/25 p-6 text-center text-sm text-muted">
          No links yet. Start with GitHub and LinkedIn.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-gold/20 bg-panel/70 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Add a link</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={full}
              onClick={() => {
                setLabel(p.label);
                setPlaceholder(p.placeholder);
                urlRef.current?.focus();
              }}
              className="rounded-full border border-line px-3 py-1 text-sm text-soft transition hover:border-gold/60 hover:text-cream disabled:opacity-40"
            >
              + {p.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
          <input aria-label="Label" className={inputCls} placeholder="Label" value={label} maxLength={30} disabled={full} onChange={(e) => setLabel(e.target.value)} />
          <input
            ref={urlRef}
            aria-label="Web address"
            className={inputCls}
            placeholder={placeholder}
            value={url}
            maxLength={500}
            disabled={full}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button type="button" onClick={submit} disabled={full} className="btn-gold !py-2.5 disabled:opacity-40">Add</button>
        </div>
        {err && <p role="alert" className="mt-2 text-xs text-rose-300">{err}</p>}
        {full && <p className="mt-2 text-xs text-muted">You&apos;ve reached the limit of {LIMITS.links} links.</p>}
      </div>
    </div>
  );
}

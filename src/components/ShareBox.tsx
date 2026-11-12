"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Passport } from "@/lib/types";
import { encodePassport } from "@/lib/share";

export default function ShareBox({ passport, path }: { passport: Passport; path?: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // A permanent /u/username link when available, otherwise a self-contained snapshot link
    setUrl(path ? `${window.location.origin}${path}` : `${window.location.origin}/view?d=${encodePassport(passport)}`);
  }, [passport, path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="no-print rounded-2xl border border-line bg-panel p-6">
      <h3 className="font-semibold">Share your passport</h3>
      <p className="mt-1 text-sm text-muted">
        {path
          ? "This is your permanent passport link. It always shows your latest stamps, and anyone can open it without an account."
          : "The link contains your passport data, so no account is needed. Anyone with the link can view it."}
      </p>
      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row">
        <div className="rounded-lg bg-white p-2">
          {url ? <QRCodeSVG value={url} size={112} /> : <div className="h-28 w-28" />}
        </div>
        <div className="min-w-0 flex-1">
          <input readOnly value={url} className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-soft" />
          <div className="mt-3 flex gap-3">
            <button onClick={copy} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink hover:opacity-90">
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button onClick={() => window.print()} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-ink">
              Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

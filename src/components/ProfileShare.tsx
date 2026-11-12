"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

/** Share actions under a public passport: copy link, QR code, save as PDF. */
export default function ProfileShare({ path, name }: { path: string; name: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

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
    <div className="no-print mt-8 flex flex-col items-center gap-6 rounded-2xl border border-gold/20 bg-panel/70 p-6 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="rounded-lg bg-white p-2">{url ? <QRCodeSVG value={url} size={88} /> : <div className="h-[88px] w-[88px]" />}</div>
        <div>
          <p className="font-medium">Share {name}&apos;s passport</p>
          <p className="mt-1 break-all text-xs text-muted">{url || "…"}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={copy} className="btn-gold !py-2.5 whitespace-nowrap">
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button type="button" onClick={() => window.print()} className="btn-ghost !py-2.5 whitespace-nowrap">
          Save as PDF
        </button>
      </div>
    </div>
  );
}

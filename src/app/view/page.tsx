"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PassportCard from "@/components/PassportCard";
import { decodePassport } from "@/lib/share";

function ViewInner() {
  const params = useSearchParams();
  const token = params.get("d");
  const passport = token ? decodePassport(token) : null;

  if (!passport) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Passport not found</h1>
        <p className="mt-2 text-soft">This link is missing or damaged.</p>
        <Link href="/create" className="mt-6 inline-block text-accent underline">Create a passport</Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <PassportCard passport={passport} snapshot />
      <p className="no-print mt-4 text-xs text-muted">
        Stamps in shared links are self-reported. Check each proof link before relying on it.
      </p>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-muted">Loading…</p>}>
      <ViewInner />
    </Suspense>
  );
}

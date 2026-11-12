"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Crest from "@/components/assets/Crest";
import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? "Sign-in failed. Please try again." : null);

  async function signIn() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    // On success the browser leaves for GitHub, so we only handle the failure case here
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <Crest className="mx-auto h-20 w-20" />
      <h1 className="mt-6 font-serif text-4xl">Sign in</h1>
      <p className="mt-3 text-soft">
        Use your GitHub account to create your passport. We only read your public profile.
      </p>

      {!isSupabaseConfigured ? (
        <p className="mt-8 rounded-xl border border-gold/30 bg-gold/[0.05] p-4 text-sm text-goldsoft">
          The backend is not configured yet. Follow <code>docs/BACKEND_SETUP.md</code> and restart the dev server.
        </p>
      ) : (
        <button onClick={signIn} disabled={loading} className="btn-gold mt-8 gap-3 disabled:opacity-60">
          <GitHubMark />
          {loading ? "Redirecting…" : "Continue with GitHub"}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ImportError, resolveLogin } from "./githubImport";

const asString = (v: unknown): string | null => (typeof v === "string" || typeof v === "number" ? String(v) : null);

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Wrap the generic Supabase factory so its concrete inferred client type is
 * preserved. ReturnType<typeof createAdminClient> loses this inference and can
 * make table upsert() payloads incorrectly resolve to never[].
 */
function createGithubAdmin(url: string, serviceKey: string) {
  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface GithubContext {
  userId: string;
  login: string;
  token?: string;
  supabase: ReturnType<typeof createClient>;
  admin: () => ReturnType<typeof createGithubAdmin>;
}

/**
 * Shared checks for the GitHub routes:
 *  - the caller is signed in (validated with Supabase, not trusted from the browser)
 *  - their GitHub identity comes from their login, never from request input
 *  - writes use the service-role client, which is the only way to create verified stamps
 */
export async function githubContext(
  request: Request,
  opts: { needsAdmin: boolean },
): Promise<{ ctx: GithubContext } | { error: NextResponse }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (opts.needsAdmin && (!url || !serviceKey)) return { error: fail(503, "The GitHub importer is not set up on this server yet.") };

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return { error: fail(403, "Request blocked.") };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: fail(401, "Please sign in first.") };

  const gh = user.identities?.find((i) => i.provider === "github");
  if (!gh) return { error: fail(400, "Sign in with GitHub to use this feature.") };
  const data = (gh.identity_data ?? {}) as Record<string, unknown>;

  const token = process.env.GITHUB_TOKEN || undefined;
  let login: string;
  try {
    login = await resolveLogin(
      asString(data.provider_id) ?? asString(data.sub),
      asString(data.user_name) ?? asString(data.preferred_username),
      { token },
    );
  } catch (e) {
    return { error: e instanceof ImportError ? fail(e.status, e.message) : fail(500, "Something went wrong.") };
  }

  return {
    ctx: {
      userId: user.id,
      login,
      token,
      supabase,
      admin: () => createGithubAdmin(url!, serviceKey!),
    },
  };
}

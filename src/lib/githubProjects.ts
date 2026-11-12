/**
 * Two more verified sources, for work the pull-request importer cannot see.
 *
 * 1. Your own PUBLIC projects. The user picks repositories; the server re-checks each one with GitHub
 *    (public, not a fork, owned by this exact GitHub account) before creating a verified "Project" stamp.
 *    What is verified: ownership and public existence. It says nothing about code quality.
 *
 * 2. Private contributions (company work). GitHub reports a COUNT of contributions made to private
 *    repositories, if the user turned on "Private contributions" in their GitHub profile settings.
 *    No repository names or code are ever read.
 */
import { ImportError, failFor, headers, type FetchLike, type Options } from "./githubImport";

export const MAX_PICK = 10;
export const MAX_OWN_STAMPS = 20;
// GitHub owners: letters, digits and hyphens (max 39, no leading hyphen). Repositories also allow "_" and ".".
const FULL_NAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/;

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string | null;
  created_at: string | null;
  html_url: string;
  fork: boolean;
  private: boolean;
  archived?: boolean;
  owner?: { login?: string | null } | null;
}

export interface ProjectStamp {
  external_id: string;
  title: string;
  category: "Project";
  earned_on: string;
  proof_url: string;
}

export function isFullName(v: string): boolean {
  if (!FULL_NAME_RE.test(v)) return false;
  const repo = v.split("/")[1];
  return repo !== "." && repo !== ".."; // block path tricks like "owner/.."
}

function day(iso: string | null | undefined): string {
  const t = iso ? Date.parse(iso) : NaN;
  return new Date(Number.isNaN(t) ? Date.now() : t).toISOString().slice(0, 10);
}

/** A repository the user could add: public, owned by them, not a fork. */
export function isPickable(r: RepoInfo, login: string): boolean {
  return !r.private && !r.fork && (r.owner?.login ?? "").toLowerCase() === login.toLowerCase();
}

/** Re-checks a repository on the SERVER and builds the verified stamp. Throws if anything is off. */
export function verifiedRepoStamp(r: RepoInfo, login: string): ProjectStamp {
  if (r.private) throw new ImportError(422, `${r.full_name} is private, so it can't be verified.`);
  if (r.fork) throw new ImportError(422, `${r.full_name} is a fork. Only repositories you created can be verified as yours.`);
  if ((r.owner?.login ?? "").toLowerCase() !== login.toLowerCase()) {
    throw new ImportError(403, `${r.full_name} is not owned by your GitHub account.`);
  }
  if (!r.html_url.startsWith("https://github.com/")) throw new ImportError(502, "Unexpected response from GitHub.");

  const lang = r.language ? ` (${r.language})` : "";
  return {
    external_id: `github:own:${r.full_name.toLowerCase()}`,
    title: `Built ${r.name}${lang}`.slice(0, 120),
    category: "Project",
    earned_on: day(r.pushed_at ?? r.created_at),
    proof_url: r.html_url,
  };
}

const f = (o: Options): FetchLike => o.fetchImpl ?? (fetch as unknown as FetchLike);

/** The user's public, non-fork repositories, most recently pushed first (up to 100). */
export async function listOwnRepos(login: string, opts: Options = {}): Promise<RepoInfo[]> {
  const url = `https://api.github.com/users/${encodeURIComponent(login)}/repos?type=owner&sort=pushed&direction=desc&per_page=100`;
  let res;
  try {
    res = await f(opts)(url, { headers: headers(opts.token) });
  } catch {
    throw new ImportError(502, "Couldn't reach GitHub. Please try again.");
  }
  if (!res.ok) throw failFor(res.status);
  const body = (await res.json()) as RepoInfo[];
  return (Array.isArray(body) ? body : []).filter((r) => isPickable(r, login));
}

export async function fetchRepo(fullName: string, opts: Options = {}): Promise<RepoInfo> {
  if (!isFullName(fullName)) throw new ImportError(400, "Invalid repository name.");
  let res;
  try {
    res = await f(opts)(`https://api.github.com/repos/${fullName}`, { headers: headers(opts.token) });
  } catch {
    throw new ImportError(502, "Couldn't reach GitHub. Please try again.");
  }
  if (!res.ok) throw failFor(res.status);
  const r = (await res.json()) as RepoInfo;
  if ((r.full_name ?? "").toLowerCase() !== fullName.toLowerCase()) throw new ImportError(422, "Repository mismatch.");
  return r;
}

/* ---------- Private contributions (counts only) ---------- */

export interface PrivateStamp {
  external_id: string;
  title: string;
  category: "Contribution";
  earned_on: string;
  proof_url: string;
  count: number;
}

const GQL = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){ contributionsCollection(from:$from,to:$to){ restrictedContributionsCount } }
}`;

/** Number of contributions to private repositories in the last 12 months, as reported by GitHub. */
export async function fetchPrivateContributions(login: string, opts: Options = {}, now = new Date()): Promise<number> {
  if (!opts.token) {
    throw new ImportError(503, "This feature needs a GitHub token on the server (GITHUB_TOKEN). Ask the site owner to add it.");
  }
  // GitHub allows at most a one-year window
  const from = new Date(now.getTime() - 364 * 86_400_000).toISOString();
  let res;
  try {
    res = await f(opts)("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers(opts.token), "Content-Type": "application/json" },
      body: JSON.stringify({ query: GQL, variables: { login, from, to: now.toISOString() } }),
    });
  } catch {
    throw new ImportError(502, "Couldn't reach GitHub. Please try again.");
  }
  if (!res.ok) throw failFor(res.status === 401 ? 503 : res.status);
  const body = (await res.json()) as {
    data?: { user?: { contributionsCollection?: { restrictedContributionsCount?: number } } | null };
    errors?: unknown[];
  };
  const n = body.data?.user?.contributionsCollection?.restrictedContributionsCount;
  if (body.errors || typeof n !== "number") throw new ImportError(502, "GitHub didn't return contribution data. Please try again later.");
  return n;
}

export function privateStamp(count: number, login: string, now = new Date()): PrivateStamp | null {
  if (count <= 0) return null;
  return {
    external_id: "github:private:12m",
    title: `${count} contribution${count === 1 ? "" : "s"} to private repositories in the last 12 months`.slice(0, 120),
    category: "Contribution",
    earned_on: now.toISOString().slice(0, 10),
    proof_url: `https://github.com/${login}`,
    count,
  };
}

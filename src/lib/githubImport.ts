/**
 * GitHub importer: turns merged pull requests into verified "Contribution" stamps.
 *
 * Rules (deliberately strict so verified means something):
 *  - Only pull requests that are MERGED and authored by the user.
 *  - Only PUBLIC repositories owned by SOMEONE ELSE (self-owned repos are too easy to farm).
 *  - One stamp per repository, e.g. "Merged 3 pull requests in owner/repo".
 *  - At most 20 repositories, most recently merged first.
 */

export interface ImportedStamp {
  external_id: string;
  title: string;
  category: "Contribution";
  earned_on: string; // YYYY-MM-DD
  proof_url: string;
  pulls: number;
}

export interface SearchItem {
  html_url?: string;
  repository_url?: string;
  closed_at?: string | null;
  user?: { login?: string | null } | null;
  pull_request?: { merged_at?: string | null } | null;
}

export class ImportError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const MAX_REPOS = 20;
const LOGIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_URL_RE = /^https:\/\/api\.github\.com\/repos\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;

export function isValidLogin(login: string): boolean {
  return LOGIN_RE.test(login);
}

export function buildQuery(login: string): string {
  if (!isValidLogin(login)) throw new ImportError(400, "That GitHub username is not valid.");
  return `type:pr author:${login} is:merged is:public -user:${login}`;
}

/** Groups merged pull requests by repository and builds one stamp per repository. */
export function groupPulls(items: SearchItem[], login: string): ImportedStamp[] {
  const me = login.toLowerCase();
  const groups = new Map<string, { owner: string; name: string; count: number; latest: string }>();

  for (const it of items) {
    const m = REPO_URL_RE.exec(it.repository_url ?? "");
    if (!m) continue;
    const [, owner, name] = m;
    if (owner.toLowerCase() === me) continue; // own repositories do not count
    if ((it.user?.login ?? "").toLowerCase() !== me) continue; // must be authored by the user

    const mergedAt = it.pull_request?.merged_at ?? null;
    if (!mergedAt) continue; // closed without merging
    const time = Date.parse(mergedAt);
    if (Number.isNaN(time)) continue;
    const day = new Date(time).toISOString().slice(0, 10);

    const key = `${owner}/${name}`.toLowerCase();
    const g = groups.get(key);
    if (g) {
      g.count += 1;
      if (day > g.latest) g.latest = day;
    } else {
      groups.set(key, { owner, name, count: 1, latest: day });
    }
  }

  return [...groups.entries()]
    .sort((a, b) => b[1].latest.localeCompare(a[1].latest))
    .slice(0, MAX_REPOS)
    .map(([key, g]) => {
      const query = encodeURIComponent(`is:pr is:merged author:${login}`);
      return {
        external_id: `github:repo:${key}`,
        title: `Merged ${g.count} pull request${g.count === 1 ? "" : "s"} in ${g.owner}/${g.name}`.slice(0, 120),
        category: "Contribution" as const,
        earned_on: g.latest,
        proof_url: `https://github.com/${g.owner}/${g.name}/pulls?q=${query}`,
        pulls: g.count,
      };
    });
}

export type FetchLike = (url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export interface Options {
  token?: string;
  fetchImpl?: FetchLike;
}

export function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dev-passport-importer",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function failFor(status: number): ImportError {
  if (status === 403 || status === 429) {
    return new ImportError(429, "GitHub is limiting requests right now. Please try again in a minute.");
  }
  if (status === 404 || status === 422) {
    return new ImportError(422, "We couldn't find that GitHub account.");
  }
  return new ImportError(502, "GitHub didn't respond as expected. Please try again later.");
}

/** Looks up the CURRENT login for a GitHub account id, so renamed accounts keep working. */
export async function resolveLogin(providerId: string | null, fallback: string | null, opts: Options = {}): Promise<string> {
  const f = (opts.fetchImpl ?? (fetch as unknown as FetchLike));
  if (providerId && /^\d+$/.test(providerId)) {
    try {
      const res = await f(`https://api.github.com/user/${providerId}`, { headers: headers(opts.token) });
      if (res.ok) {
        const body = (await res.json()) as { login?: string; id?: number };
        if (body.login && isValidLogin(body.login) && String(body.id) === providerId) return body.login;
      }
    } catch {
      /* fall back to the stored login */
    }
  }
  if (fallback && isValidLogin(fallback)) return fallback;
  throw new ImportError(400, "We couldn't determine your GitHub username.");
}

/** Fetches up to 200 merged pull requests (2 pages) for the user. */
export async function fetchMergedPulls(login: string, opts: Options = {}): Promise<SearchItem[]> {
  const f = (opts.fetchImpl ?? (fetch as unknown as FetchLike));
  const q = encodeURIComponent(buildQuery(login));
  const all: SearchItem[] = [];

  for (let page = 1; page <= 2; page++) {
    const url = `https://api.github.com/search/issues?q=${q}&sort=updated&order=desc&per_page=100&page=${page}`;
    let res;
    try {
      res = await f(url, { headers: headers(opts.token) });
    } catch {
      throw new ImportError(502, "Couldn't reach GitHub. Please try again.");
    }
    if (!res.ok) throw failFor(res.status);
    const body = (await res.json()) as { items?: SearchItem[] };
    const items = Array.isArray(body.items) ? body.items : [];
    all.push(...items);
    if (items.length < 100) break;
  }
  return all;
}

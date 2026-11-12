import { LINKS, githubConfigured } from "./site";

/**
 * Star count for the nav, fetched on the server and cached for an hour so pages stay static.
 * Returns null on any failure (no network, rate limit, placeholder URL), and the nav just hides the count.
 */
export async function getStarCount(): Promise<number | null> {
  if (!githubConfigured) return null;
  const m = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(LINKS.github);
  if (!m) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { stargazers_count?: unknown };
    return typeof json.stargazers_count === "number" ? json.stargazers_count : null;
  } catch {
    return null;
  }
}

export function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n);
}

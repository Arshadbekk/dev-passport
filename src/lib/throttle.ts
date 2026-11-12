/** Best-effort per-key throttle (memory only; on serverless it resets between cold starts). */
const last = new Map<string, number>();

export function tooSoon(key: string, ms: number): boolean {
  const now = Date.now();
  const prev = last.get(key);
  if (prev !== undefined && now - prev < ms) return true;
  last.set(key, now);
  if (last.size > 2000) {
    for (const [k, t] of last) if (now - t > 60_000) last.delete(k);
  }
  return false;
}

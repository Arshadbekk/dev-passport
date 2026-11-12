/** "2026-03-02" -> "2 Mar 2026". Fixed locale and UTC so server and browser render the same text. */
export function fmtDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

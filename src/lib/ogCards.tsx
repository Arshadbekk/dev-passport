/**
 * Social preview cards (1200x630) rendered by next/og (Satori).
 * Satori only supports a subset of CSS: every element with more than one child needs display:flex.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const GOLD = "#C9A45C";
const GOLD_SOFT = "#EBD9A8";
const CREAM = "#F6EDDA";
const MUTED = "#A18B88";
const SOFT = "#CDBDB3";

export const clip = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Downloads a GitHub avatar and returns it as a data URI. Returns null on any problem. */
export async function avatarDataUri(url: string | null | undefined): Promise<string | null> {
  if (!url || !/^https:\/\/avatars\.githubusercontent\.com\//.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}s=300`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    if (type !== "image/png" && type !== "image/jpeg") return null;
    // Open Graph image routes run in the Edge runtime, where Node Buffer
    // is not available. Encode the avatar using Web-standard APIs instead.
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > 1_500_000) return null;
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function Emblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="95" stroke={GOLD} strokeWidth="3" />
      <circle cx="100" cy="100" r="86" stroke={GOLD} strokeWidth="1.2" />
      <circle cx="100" cy="100" r="46" stroke={GOLD} strokeWidth="2.4" />
      <ellipse cx="100" cy="100" rx="18" ry="46" stroke={GOLD} strokeWidth="2" />
      <ellipse cx="100" cy="100" rx="46" ry="16" stroke={GOLD} strokeWidth="2" />
      <path d="M54 100h92M100 54v92" stroke={GOLD} strokeWidth="2" />
    </svg>
  );
}

export interface ProfileCardData {
  name: string;
  username: string;
  headline: string;
  location: string;
  stack: string[];
  passportNo: string;
  stamps: number;
  verified: number;
  avatar: string | null;
}

export function profileCard(d: ProfileCardData) {
  const name = clip(d.name || d.username, 36);
  const nameSize = name.length > 26 ? 54 : name.length > 18 ? 66 : 78;
  const initial = (d.name || d.username || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 36,
        background: "linear-gradient(135deg, #2B0E18 0%, #15060C 60%, #12050A 100%)",
        color: CREAM,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          border: `2px solid ${GOLD}`,
          borderRadius: 28,
          padding: "44px 52px",
          justifyContent: "space-between",
        }}
      >
        {/* Left: details */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Emblem size={44} />
              <div style={{ display: "flex", marginLeft: 16, fontSize: 20, letterSpacing: 6, color: GOLD }}>DEVELOPER PASSPORT</div>
            </div>

            <div style={{ display: "flex", marginTop: 38, fontSize: nameSize, fontWeight: 700, lineHeight: 1.05, color: CREAM }}>{name}</div>
            {d.headline ? (
              <div style={{ display: "flex", marginTop: 16, fontSize: 30, color: SOFT }}>{clip(d.headline, 60)}</div>
            ) : null}
            {d.location ? (
              <div style={{ display: "flex", marginTop: 8, fontSize: 24, color: MUTED }}>{clip(d.location, 50)}</div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 28 }}>
              {d.stack.slice(0, 5).map((s) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    marginRight: 12,
                    marginBottom: 10,
                    padding: "6px 16px",
                    fontSize: 22,
                    color: SOFT,
                    border: `1px solid ${GOLD}`,
                    borderRadius: 999,
                  }}
                >
                  {clip(s, 18)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 16, letterSpacing: 5, color: MUTED }}>PASSPORT NO.</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: 30, letterSpacing: 3, color: GOLD_SOFT }}>{d.passportNo}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 16, letterSpacing: 5, color: MUTED }}>STAMPS</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: 30, color: GOLD_SOFT }}>
                {d.stamps} · {d.verified} verified
              </div>
            </div>
          </div>
        </div>

        {/* Right: portrait */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 290 }}>
          <div style={{ display: "flex", padding: 5, borderRadius: 24, background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD}, #8F6D2E)` }}>
            {d.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.avatar} width={260} height={320} style={{ objectFit: "cover", borderRadius: 20 }} alt="" />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 260,
                  height: 320,
                  borderRadius: 20,
                  background: "#12050A",
                  fontSize: 120,
                  color: GOLD_SOFT,
                }}
              >
                {initial}
              </div>
            )}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 24, color: GOLD }}>@{clip(d.username, 18)}</div>
        </div>
      </div>
    </div>
  );
}

export function brandCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 36,
        background: "linear-gradient(135deg, #2B0E18 0%, #15060C 60%, #12050A 100%)",
        color: CREAM,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${GOLD}`,
          borderRadius: 28,
        }}
      >
        <Emblem size={150} />
        <div style={{ display: "flex", marginTop: 28, fontSize: 84, fontWeight: 700 }}>Dev Passport</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 32, color: SOFT }}>A developer portfolio that comes with proof.</div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 20, letterSpacing: 6, color: GOLD }}>OPEN SOURCE · MOBILE DEV CONNECT</div>
      </div>
    </div>
  );
}

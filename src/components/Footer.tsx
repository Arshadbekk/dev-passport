import Link from "next/link";
import Crest from "./assets/Crest";
import Ornament from "./assets/Ornament";
import { LINKS, PRODUCT_LINKS } from "@/lib/site";

type Item = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; items: Item[] }[] = [
  {
    title: "Product",
    items: [
      ...PRODUCT_LINKS.map((p) => ({ label: p.title, href: p.href })),
      { label: "Example passport", href: "/demo" },
      { label: "Explore", href: "/explore" },
      { label: "Create passport", href: "/create" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Join the community", href: "/community" },
      { label: "LinkedIn group", href: LINKS.linkedin, external: true },
      { label: "WhatsApp group", href: LINKS.whatsapp, external: true },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Open source",
    items: [
      { label: "Repository", href: LINKS.github, external: true },
      { label: "Report an issue", href: `${LINKS.github}/issues`, external: true },
      { label: "Contribute", href: "/community#contribute" },
      { label: "MIT license", href: `${LINKS.github}/blob/main/LICENSE`, external: true },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const LINK =
  "rounded text-sm text-muted transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";

/** Machine-readable-zone strip, like the two lines at the bottom of a real passport page. Decorative. */
function Mrz({ year }: { year: number }) {
  const pad = (s: string, n = 44) => (s + "<".repeat(n)).slice(0, n);
  return (
    <div
      aria-hidden
      className="select-none overflow-hidden whitespace-nowrap font-mono text-[11px] leading-5 tracking-[0.18em] text-gold/35 [mask-image:linear-gradient(to_right,black_70%,transparent)]"
    >
      <div>{pad("P<DVP<<OPEN<SOURCE<<MOBILE<DEV<CONNECT")}</div>
      <div>{pad(`DP${year}<<MIT<<PROOF<NOT<CLAIMS`)}</div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-28" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="mx-auto max-w-5xl px-6">
        <Ornament />

        <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70" aria-label="Dev Passport home">
              <Crest className="h-12 w-12" />
              <span className="font-serif text-xl">Dev Passport</span>
            </Link>
            <p className="mt-4 max-w-[17rem] font-serif text-lg leading-snug text-soft">Proof, not claims.</p>
            <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-muted">
              A free, open-source passport for developers, built by the Mobile Dev Connect community.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-serif text-base text-white">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      {it.external ? (
                        <a href={it.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                          {it.label}
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                      ) : (
                        <Link href={it.href} className={LINK}>{it.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Dev Passport. Released under the MIT license.</span>
          <span>Free and open source. No newsletter.</span>
        </div>

        <div className="pb-10">
          <Mrz year={year} />
        </div>
      </div>
    </footer>
  );
}

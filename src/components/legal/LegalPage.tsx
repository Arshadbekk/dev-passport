import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

export default function LegalPage({ title, intro, sections }: { title: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Legal</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {LEGAL.updated}</p>
      <div className="mt-6 text-lg leading-relaxed text-soft">{intro}</div>

      <nav aria-label="On this page" className="mt-10 rounded-2xl border border-gold/20 bg-panel/70 p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">On this page</p>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-soft underline-offset-4 hover:text-white hover:underline">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl">
              <span className="gold-text mr-2">{i + 1}.</span>
              {s.title}
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-soft [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-cream [&_a]:text-goldsoft [&_a]:underline [&_a]:underline-offset-4">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-16 border-t border-line pt-6 text-sm text-muted">
        Questions?{" "}
        {LEGAL.contactEmail ? (
          <a className="underline underline-offset-4 hover:text-white" href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
        ) : (
          <>open an issue on the project repository</>
        )}
        . See also our <Link href="/privacy" className="underline underline-offset-4 hover:text-white">Privacy Policy</Link> and{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-white">Terms</Link>.
      </p>
    </div>
  );
}

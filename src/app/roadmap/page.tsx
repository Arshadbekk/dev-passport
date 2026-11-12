import Link from "next/link";
import Ornament from "@/components/assets/Ornament";
import { LINKS, githubConfigured } from "@/lib/site";

export const metadata = { title: "Roadmap · Dev Passport", description: "What Dev Passport has shipped, what we're building, and what comes next." };

type Status = "done" | "next" | "planned";
interface Item { title: string; desc: string; status: Status }

const PHASES: { name: string; blurb: string; items: Item[] }[] = [
  {
    name: "Foundation",
    blurb: "The core passport experience.",
    items: [
      { title: "GitHub sign-in", desc: "Sign in with GitHub. No passwords, no access to your code.", status: "done" },
      { title: "Passport builder", desc: "A guided flow with live preview, autosave and a passport strength score.", status: "done" },
      { title: "Public passport page", desc: "A permanent /u/handle link with privacy controls and rich share previews.", status: "done" },
      { title: "Verified stamps", desc: "GitHub import for merged pull requests, owned projects and private-contribution counts.", status: "done" },
    ],
  },
  {
    name: "Trust and safety",
    blurb: "Be a service people can rely on.",
    items: [
      { title: "Privacy, terms and account deletion", desc: "Export your data and delete your account any time.", status: "done" },
      { title: "Reporting", desc: "Report fake or abusive passports to the maintainers.", status: "done" },
      { title: "Explore directory", desc: "Opt-in directory to discover developers by name and skill.", status: "done" },
      { title: "Tests and CI", desc: "Automated checks on every pull request.", status: "done" },
    ],
  },
  {
    name: "Next",
    blurb: "What we're working on now.",
    items: [
      { title: "Endorsements", desc: "Let maintainers and peers vouch for a stamp.", status: "next" },
      { title: "More verified sources", desc: "Store listings, certificates and talks.", status: "next" },
      { title: "Embeddable badge", desc: "Show your passport on your README and LinkedIn.", status: "next" },
    ],
  },
  {
    name: "Later",
    blurb: "Ideas we want to explore with the community.",
    items: [
      { title: "Recruiter view", desc: "Search by skill and level, and keep shortlists.", status: "planned" },
      { title: "Ranks and seasonal stamps", desc: "Explorer, Builder, Mentor and event stamps.", status: "planned" },
      { title: "Mobile app", desc: "Flutter or React Native, on the same backend.", status: "planned" },
      { title: "Self-hosting guide", desc: "Run your own Dev Passport.", status: "planned" },
    ],
  },
];

const BADGE: Record<Status, { label: string; cls: string }> = {
  done: { label: "Shipped", cls: "border-emerald-400/40 text-emerald-300" },
  next: { label: "In progress", cls: "border-gold/60 text-goldsoft" },
  planned: { label: "Planned", cls: "border-line text-muted" },
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Roadmap</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Built in the open.</h1>
      <p className="mt-4 text-lg leading-relaxed text-soft">
        Dev Passport is open source, so you can see exactly what we&apos;re building and help shape it.
        {githubConfigured && (
          <>
            {" "}Have an idea? <a className="text-goldsoft underline underline-offset-4" href={`${LINKS.github}/issues`} target="_blank" rel="noopener noreferrer">Open an issue</a>.
          </>
        )}
      </p>

      <div className="mt-14 space-y-14">
        {PHASES.map((p) => (
          <section key={p.name} aria-labelledby={`ph-${p.name}`}>
            <h2 id={`ph-${p.name}`} className="font-serif text-2xl sm:text-3xl">{p.name}</h2>
            <p className="mt-1 text-sm text-muted">{p.blurb}</p>
            <ul className="mt-6 space-y-3">
              {p.items.map((i) => (
                <li key={i.title} className="flex items-start justify-between gap-4 rounded-2xl border border-gold/15 bg-panel/60 p-4">
                  <div>
                    <p className="font-medium text-cream">{i.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{i.desc}</p>
                  </div>
                  <span className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${BADGE[i.status].cls}`}>
                    {BADGE[i.status].label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Ornament className="mt-16" />
      <p className="mt-8 text-center text-sm text-muted">
        Want to help? See <Link href="/community#contribute" className="text-goldsoft underline underline-offset-4">how to contribute</Link>.
      </p>
    </div>
  );
}

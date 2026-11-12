import Link from "next/link";
import Ornament from "@/components/assets/Ornament";
import { LINKS, githubConfigured } from "@/lib/site";

export const metadata = { title: "Community · Dev Passport", description: "Join the Mobile Dev Connect community and help build Dev Passport." };

function Card({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl border border-gold/20 bg-panel/70 p-6 transition hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
    >
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{desc}</p>
      <span className="mt-5 text-sm text-goldsoft">
        {cta} <span aria-hidden className="inline-block transition group-hover:translate-x-0.5">→</span>
        <span className="sr-only"> (opens in new tab)</span>
      </span>
    </a>
  );
}

const STEPS = [
  { t: "Pick an issue", d: "Browse issues labeled “good first issue”, or propose your own idea." },
  { t: "Fork and build", d: "Fork the repository, follow the README to run it locally, and make your change." },
  { t: "Open a pull request", d: "Keep it small and focused. A maintainer reviews it, usually within 48 hours." },
  { t: "Earn a stamp", d: "Your merged pull request is public proof of your work, on your own passport." },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Community</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Built by mobile developers, for developers.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-soft">
        Dev Passport comes from the Mobile Dev Connect community: Flutter, Android, iOS and React Native developers from around the
        world. Beginners and experts are welcome.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        <Card title="LinkedIn group" desc="Discussions, jobs, referrals and interview experiences." href={LINKS.linkedin} cta="Join the group" />
        <Card title="WhatsApp group" desc="Quick questions and daily conversation with the community." href={LINKS.whatsapp} cta="Join the chat" />
        <Card title="GitHub" desc="The source code, issues and discussions. Stars are appreciated." href={LINKS.github} cta="View the repository" />
      </div>

      <Ornament className="my-16" />

      <section id="contribute" className="scroll-mt-24">
        <h2 className="font-serif text-3xl sm:text-4xl">Contribute to Dev Passport</h2>
        <p className="mt-3 max-w-2xl text-soft">
          You don&apos;t need to be an expert. We need developers, designers, writers and testers. Contributing here is real,
          reviewable, portfolio-ready work.
        </p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-gold/15 bg-panel/60 p-5">
              <p className="gold-text font-serif text-3xl italic">{["I", "II", "III", "IV"][i]}</p>
              <p className="mt-2 font-medium">{s.t}</p>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>

        {githubConfigured ? (
          <div className="mt-10 flex flex-wrap gap-4">
            <a className="btn-gold" href={`${LINKS.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`} target="_blank" rel="noopener noreferrer">
              Good first issues
            </a>
            <a className="btn-ghost" href={`${LINKS.github}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">
              Contributing guide
            </a>
          </div>
        ) : null}

        <p className="mt-8 text-sm text-muted">
          Everyone is expected to follow our code of conduct. Be respectful, be patient with beginners, and give credit.
          See the <Link href="/roadmap" className="text-goldsoft underline underline-offset-4">roadmap</Link> for what&apos;s planned.
        </p>
      </section>
    </div>
  );
}

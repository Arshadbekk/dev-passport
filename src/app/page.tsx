import Link from "next/link";
import ParallaxHero from "@/components/ParallaxHero";
import PassportHero from "@/components/PassportHero";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import StampBadge from "@/components/StampBadge";
import { Stamp } from "@/lib/types";

const steps = [
  { n: "01", t: "Create your passport", d: "Add your profile, tech stack and links. It takes two minutes.", speed: 28 },
  { n: "02", t: "Collect stamps", d: "Every merged PR, shipped app, course or review becomes a stamp with a proof link.", speed: -6 },
  { n: "03", t: "Share with hiring teams", d: "Send one link or QR code. Recruiters see your work and can check the proof.", speed: -40 },
];

const verifiedExample: Stamp = {
  id: "ex1",
  title: "Merged PR: offline caching for notes app",
  category: "Contribution",
  date: "2026-03-02",
  proofUrl: "https://github.com",
  verified: true,
};
const selfExample: Stamp = {
  id: "ex2",
  title: "Published Habit Tracker on Google Play",
  category: "Project",
  date: "2026-04-18",
  proofUrl: "https://play.google.com/store",
  verified: false,
};

export default function Home() {
  return (
    <>
      {/* 1. Hero text: each line drifts at its own speed */}
      <ParallaxHero />

      {/* 2. Passport opens as you scroll */}
      <PassportHero />

      {/* 3. How it works: columns at different depths */}
      <section id="how-it-works" className="mt-16 scroll-mt-24 sm:mt-24">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-xl font-serif text-3xl sm:text-4xl">Three steps from commits to credibility.</h2>
        </Reveal>
        <div className="mt-12 grid gap-10 pb-16 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <Parallax speed={s.speed}>
                <div className="border-t border-line pt-6">
                  <p className="gold-text font-serif text-4xl">{s.n}</p>
                  <h3 className="mt-4 text-lg font-medium">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">{s.d}</p>
                </div>
              </Parallax>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. Trust model: the two stamps float in opposite directions */}
      <section id="trust" className="mt-24 grid scroll-mt-24 items-center gap-12 lg:grid-cols-2">
        <Parallax speed={-18}>
          <Reveal>
            <p className="eyebrow">The trust model</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Anyone can write a CV. <span className="gold-text italic">Not everyone can show receipts.</span>
            </h2>
            <p className="mt-5 leading-relaxed text-soft">
              Dev Passport marks every stamp clearly. Self-reported stamps are labeled as such. Verified stamps
              carry a gold seal and are confirmed by the platform, for example through GitHub or a maintainer.
              This starter supports self-reported stamps; verification is on the roadmap and a great place to contribute.
            </p>
          </Reveal>
        </Parallax>

        <div className="space-y-6">
          <Parallax speed={46}>
            <StampBadge stamp={verifiedExample} />
          </Parallax>
          <Parallax speed={-46}>
            <StampBadge stamp={selfExample} />
          </Parallax>
        </div>
      </section>

      {/* 5. Closing call to action with a drifting glow */}
      <section className="relative mt-32 overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-panel to-ink px-8 py-20 text-center">
        <Parallax speed={-60} className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(201,164,92,0.22),transparent_65%)]" />
        </Parallax>
        <div className="relative">
          <Parallax speed={18}>
            <Reveal>
              <h2 className="font-serif text-4xl sm:text-5xl">Start your passport.</h2>
              <p className="mx-auto mt-4 max-w-md text-soft">Free, open source and built by developers like you.</p>
              <Link href="/create" className="btn-gold mt-8">Create your passport</Link>
            </Reveal>
          </Parallax>
        </div>
      </section>
    </>
  );
}

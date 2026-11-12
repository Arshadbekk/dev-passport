import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PassportCard from "@/components/PassportCard";
import ProfileShare from "@/components/ProfileShare";
import { loadPublicPassport } from "@/lib/publicPassport";

export const dynamic = "force-dynamic";

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadPublicPassport(params.username);
  if (!data) return { title: "Passport not found", robots: { index: false, follow: false } };

  const p = data.passport;
  const title = `${p.name || p.username} · Developer Passport`;
  const description =
    [p.headline, p.stack.slice(0, 5).join(", ")].filter(Boolean).join(" · ") ||
    "A developer passport with verified proof of work, built on Dev Passport.";
  const path = `/u/${p.username}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: data.isPublic ? undefined : { index: false, follow: false },
    openGraph: { title, description, type: "profile", url: path, siteName: "Dev Passport" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicPassportPage({ params }: Props) {
  const data = await loadPublicPassport(params.username);
  if (!data) notFound();

  const { passport, isOwner, isPublic } = data;
  const issued = Boolean(passport.passportNo);

  return (
    <div className="py-10 sm:py-14">
      {isOwner && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[0.05] px-5 py-3 text-sm">
          <p className="text-goldsoft">
            {!issued
              ? "You haven't issued this passport yet, so only you can see this page."
              : isPublic
                ? "This is your public passport, exactly as others see it."
                : "Your passport is private. Only you can see this page."}
          </p>
          <Link href="/create" className="btn-ghost !px-4 !py-1.5">Edit passport</Link>
        </div>
      )}

      <PassportCard passport={passport} />

      {issued && isPublic && <ProfileShare path={`/u/${passport.username}`} name={passport.name || passport.username} />}

      <p className="no-print mt-8 text-center text-xs text-muted">
        Stamps marked <span className="text-goldsoft">Verified</span> are confirmed by Dev Passport. Self-reported stamps are
        entered by the owner. Always check the proof link.{" "}
        {!isOwner && (
          <Link href={`/report?u=${passport.username}`} className="underline underline-offset-4 hover:text-white">
            Report this passport
          </Link>
        )}
      </p>
    </div>
  );
}

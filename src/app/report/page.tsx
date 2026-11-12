import ReportForm from "@/components/legal/ReportForm";

export const metadata = { title: "Report a passport · Dev Passport", robots: { index: false, follow: true } };

export default function ReportPage({ searchParams }: { searchParams: { u?: string } }) {
  const username = (searchParams.u ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
  return (
    <div className="mx-auto max-w-xl py-14 sm:py-20">
      <p className="eyebrow !text-gold/80">Trust and safety</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Report a passport</h1>
      <p className="mt-3 text-soft">
        Dev Passport only works if people can trust it. If a passport is fake, misleading or abusive, tell us. Reports go
        to the maintainers and are never shown publicly.
      </p>
      <ReportForm initialUsername={username} />
    </div>
  );
}

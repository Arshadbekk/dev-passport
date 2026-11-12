import Link from "next/link";
import PassportCard from "@/components/PassportCard";
import { samplePassport } from "@/lib/sample";

export default function DemoPage() {
  return (
    <div className="py-10">
      <p className="no-print mb-4 text-sm text-muted">
        This is a sample passport with made-up data.{" "}
        <Link href="/create" className="text-accent underline">Create your own</Link>.
      </p>
      <PassportCard passport={samplePassport} />
    </div>
  );
}

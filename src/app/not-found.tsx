import Link from "next/link";
import Crest from "@/components/assets/Crest";
import InkStamp from "@/components/assets/InkStamp";

export const metadata = { title: "Page not found · Dev Passport" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <Crest className="mx-auto h-16 w-16 opacity-80" />
      <div className="mx-auto mt-8 w-fit -rotate-6 opacity-90">
        <InkStamp category="Career" verified={false} className="h-28 w-28" />
      </div>
      <h1 className="mt-6 font-serif text-4xl">Visa denied</h1>
      <p className="mt-3 text-soft">We couldn&apos;t find that page. It may have moved, or the link may be wrong.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-gold">Go home</Link>
        <Link href="/explore" className="btn-ghost">Explore passports</Link>
      </div>
    </div>
  );
}

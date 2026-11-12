import Link from "next/link";
import Crest from "@/components/assets/Crest";
import InkStamp from "@/components/assets/InkStamp";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <Crest className="mx-auto h-16 w-16 opacity-80" />
      <div className="mx-auto mt-8 w-fit -rotate-6 opacity-90">
        <InkStamp category="Career" verified={false} className="h-28 w-28" />
      </div>
      <h1 className="mt-6 font-serif text-4xl">No passport here</h1>
      <p className="mt-3 text-soft">
        We couldn&apos;t find a public passport with that handle. It may not exist, may not be issued yet, or may be private.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-ghost">Go home</Link>
        <Link href="/create" className="btn-gold">Create your passport</Link>
      </div>
    </div>
  );
}

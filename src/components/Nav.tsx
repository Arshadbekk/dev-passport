import NavBar from "./nav/NavBar";
import { getStarCount } from "@/lib/github";

/**
 * Server wrapper: fetches the GitHub star count (cached for an hour, so pages stay static)
 * and reserves the bar's height so content never jumps. The bar itself is position: fixed.
 */
export default async function Nav() {
  const stars = await getStarCount();
  return (
    <>
      <a
        href="#main"
        className="no-print fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cream"
      >
        Skip to content
      </a>
      <div aria-hidden className="no-print h-16" />
      <NavBar stars={stars} />
    </>
  );
}

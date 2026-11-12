import { StampCategory } from "@/lib/types";

/** Just the shapes, so they can be reused inside other SVGs (e.g. ink stamps). */
export function StampGlyph({ category }: { category: StampCategory }) {
  switch (category) {
    case "Contribution":
      return (
        <>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M6 7v10M8 5h4a4 4 0 0 1 4 4v1" />
        </>
      );
    case "Project":
      return (
        <>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </>
      );
    case "Learning":
      return (
        <>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
          <path d="M8 7h7" />
        </>
      );
    case "Community":
      return (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.2c2.9.4 5 2.7 5 5.8" />
        </>
      );
    case "Career":
      return (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
        </>
      );
  }
}

export default function StampIcon({ category, className = "h-4 w-4" }: { category: StampCategory; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <StampGlyph category={category} />
    </svg>
  );
}

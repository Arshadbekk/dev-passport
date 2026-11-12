/** Thin gold divider with a diamond in the middle. */
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
      <svg viewBox="0 0 24 12" className="h-3 w-6 text-gold" fill="currentColor">
        <path d="M12 0l4 6-4 6-4-6z" />
        <circle cx="2" cy="6" r="1.2" />
        <circle cx="22" cy="6" r="1.2" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Inline SVG brand mark — "aK" monogram.
 *
 * Two glyphs side-by-side, drawn as stroke so the mark scales cleanly and stays
 * legible at favicon sizes. Inherits color via `currentColor` so the parent
 * controls the tone; the same path is rendered as a PNG for favicon / apple-
 * touch-icon / logo.png via sharp.
 */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={26}
      height={26}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="9" cy="16" r="5.5" />
      <line x1="14.5" y1="10.5" x2="14.5" y2="21.5" />
      <line x1="19" y1="7" x2="19" y2="25" />
      <line x1="19" y1="16" x2="28" y2="7" />
      <line x1="19" y1="16" x2="28" y2="25" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  const body = (
    <span
      className={cn(
        "inline-flex items-center gap-2 group/logo transition-colors",
        className,
      )}
    >
      <Mark className="text-foreground" />
      {showText && (
        <span className="font-serif text-[20px] font-bold leading-none tracking-[-0.02em] text-foreground">
          aiknows
        </span>
      )}
    </span>
  );

  return <Link href={href}>{body}</Link>;
}

export function LogoMark({
  className,
}: {
  className?: string;
}) {
  return <Mark className={cn("text-foreground", className)} />;
}

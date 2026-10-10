import Link from "next/link";
import { cn } from "@/lib/utils";

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("shrink-0", className)}>
      <circle cx="9" cy="16" r="5.5" />
      <line x1="14.5" y1="10.5" x2="14.5" y2="21.5" />
      <line x1="19" y1="7" x2="19" y2="25" />
      <line x1="19" y1="16" x2="28" y2="7" />
      <line x1="19" y1="16" x2="28" y2="25" />
    </svg>
  );
}

export function Logo({ className, href = "/", showText = true }: { className?: string; href?: string; showText?: boolean }) {
  return <Link href={href} aria-label="aiknows.tools home" className={cn("inline-flex shrink-0 items-center gap-2.5 rounded-lg", className)}>
    <Mark className="text-accent" />
    {showText && <span className="text-[20px] font-semibold leading-none tracking-[-0.055em] text-foreground">aiknows<span className="font-normal text-muted-foreground">.tools</span></span>}
  </Link>;
}
export function LogoMark({ className }: { className?: string }) { return <Mark className={cn("text-accent", className)} />; }

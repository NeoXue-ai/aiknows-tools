"use client";

import { usePathname } from "next/navigation";

/** Wraps page content with a keyed div so route changes restart the CSS fade-in. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}

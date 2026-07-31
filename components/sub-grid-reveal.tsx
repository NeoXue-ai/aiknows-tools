"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// One IntersectionObserver per sub-category grid, not one per row. When the
// grid scrolls into view it gains `.atlas-reveal`, which lets the CSS
// keyframes stagger each child row. Reduced-motion users get everything
// immediately without waiting on an observer.
export function SubGridReveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn(className, shown ? "atlas-reveal" : "opacity-0")}>
      {children}
    </div>
  );
}

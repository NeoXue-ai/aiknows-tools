"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before animation starts (applied per-instance). */
  delay?: number;
  as?: "div" | "section";
};

export function ScrollReveal({ children, className, delay = 0, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(visible ? "animate-page-enter" : "opacity-0", className)}
      style={{
        animationDuration: "500ms",
        animationFillMode: "both",
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

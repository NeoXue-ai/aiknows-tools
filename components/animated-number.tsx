"use client";

import * as React from "react";
import { useCountUp, useAfter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Animated number with the same monospace look as the surrounding label.
 * Starts counting once the element enters view.
 */
export function AnimatedNumber({
  value,
  className,
  padStart = 0,
  duration = 800,
  delay = 120,
}: {
  value: number;
  className?: string;
  padStart?: number;
  duration?: number;
  delay?: number;
}) {
  const shown = useAfter(delay);
  const current = useCountUp(value, { duration, enabled: shown });
  const display =
    padStart > 0 ? String(current).padStart(padStart, "0") : String(current);
  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {display}
    </span>
  );
}
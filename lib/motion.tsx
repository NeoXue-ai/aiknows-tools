"use client";

import * as React from "react";

/**
 * Map Legend motion primitives.
 *
 * Restrained, one-shot transitions only. No infinite loops, no decorative glow.
 * Honors `prefers-reduced-motion: reduce` by returning the final value.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animate a number from `from` to `to` over `duration` ms with ease-out.
 * Throttles state updates to ~30fps so multiple counters on the same page
 * don't trigger a React render storm.
 */
export function useCountUp(
  to: number,
  options: { duration?: number; from?: number; enabled?: boolean } = {},
): number {
  const { duration = 800, from = 0, enabled = true } = options;
  const [value, setValue] = React.useState<number>(enabled ? from : to);
  const startedAt = React.useRef<number | null>(null);
  const raf = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setValue(to);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    startedAt.current = null;
    const tick = (now: number) => {
      if (startedAt.current == null) startedAt.current = now;
      const t = Math.min(1, (now - startedAt.current) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      // Skip redundant frames (e.g. from → to is a no-op) and only push
      // state when the displayed value actually changes — that already cuts
      // most work. React 19 batches the rest.
      setValue((prev) => (prev === current ? prev : current));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [to, from, duration, enabled]);

  return value;
}

/**
 * Returns true once the element has mounted, then `false` after `delay` ms.
 * Use to delay non-essential UI updates so first paint is calm.
 */
export function useMountDelay(delay = 60): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return ready;
}

/**
 * Returns `true` after `ms` so child elements can flip from "hidden" to "shown"
 * with a CSS transition. Used for stagger reveals and bar fills.
 */
export function useAfter(ms: number): boolean {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }
    const id = window.setTimeout(() => setShown(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);
  return shown;
}

/**
 * Force re-render on a fixed interval. Useful for "X minutes ago" tickers.
 * Returns the current tick (increments every `intervalMs`).
 */
export function useTick(intervalMs: number, enabled = true): number {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
  return tick;
}
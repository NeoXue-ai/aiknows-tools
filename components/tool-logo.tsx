"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-base",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const SIZE_PX: Record<LogoSize, number> = {
  sm: 32,
  md: 44,
  lg: 56,
  xl: 80,
};

// Sits on the public R2 bucket. next/image routes through
// /_next/image?url=…&w=… so the optimizer resizes the 800x800 originals
// to the actual display size (driving ~594 KiB off mobile PSI).
const R2_HOST = "pub-459c6f6553344cc393826444731f5707.r2.dev";

export function ToolLogo({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  logoUrl?: string | null;
  size?: LogoSize;
  className?: string;
}) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const [imgError, setImgError] = React.useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (logoUrl && !imgError) {
    // Only optimise images we actually own — third-party logos would
    // burn Vercel image-optimization bandwidth on redirect chains.
    const isR2 = logoUrl.includes(R2_HOST);
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg border border-border bg-white",
          sizeClass,
          className,
        )}
      >
        {isR2 ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            fill
            sizes={`${SIZE_PX[size]}px`}
            className="object-contain p-1.5"
            onError={() => setImgError(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-full w-full object-contain p-1.5"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary",
        sizeClass,
        className,
      )}
    >
      {letter}
    </div>
  );
}

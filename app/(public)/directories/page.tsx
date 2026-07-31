import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicDirectories } from "@/lib/public-catalog";
import { DirectoryTable } from "@/components/DirectoryTable";
import { AnimatedNumber } from "@/components/animated-number";
import {
  directoryItemListJsonLd,
  directoryPageMetadata,
} from "@/lib/seo/directory-schema";

export const dynamic = "force-static";

export const metadata: Metadata = directoryPageMetadata();

export default async function DirectoriesPage() {
  const directories = await getPublicDirectories();
  const total = directories.length;
  const drValues = directories
    .map((d) => d.dr)
    .filter((v): v is number => typeof v === "number");
  const drRecorded = drValues.length;
  const dofollowCount = directories.filter(
    (d) => d.link_type === "dofollow",
  ).length;
  const freeCount = directories.filter((d) => d.submission_type === "free")
    .length;
  const withLastChecked = directories.filter(
    (d) => Boolean(d.last_checked),
  ).length;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = directoryItemListJsonLd(directories, siteUrl);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Directories / <AnimatedNumber value={total} padStart={4} className="text-accent" /> records
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Submitted directory records
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Each row is the recorded submission fact set: domain rating, submission type and price, link type,
          listing speed, niche, submit URL, and the recorded check date. Comparison is by column, not by
          editorial ranking.
        </p>
      </header>

      <dl className="mb-10 grid w-full grid-cols-2 gap-x-8 gap-y-4 border-y border-border py-6 text-sm sm:grid-cols-4">
        <CoverageStat label="Records" value={total} />
        <CoverageStat label="DR recorded" value={`${drRecorded} / ${total}`} />
        <CoverageStat
          label="Submission = free"
          value={`${freeCount} / ${total}`}
        />
        <CoverageStat
          label="Last check recorded"
          value={`${withLastChecked} / ${total}`}
        />
      </dl>

      <DirectoryTable directories={directories} />

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Link type and listing speed are recorded values; they are not promises about approval time or ranking on
        the destination site. When a recorded check date is absent, the row renders
        <span className="font-mono"> NOT RECORDED </span>
        rather than a default timestamp.
      </p>

      <p className="mt-4">
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
        >
          Suggest a directory
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </div>
  );
}

function CoverageStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono tabular-nums text-foreground">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </dd>
    </div>
  );
}

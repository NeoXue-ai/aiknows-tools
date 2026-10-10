// Version-controlled taxonomy routes. Each route derives a reproducible
// record selection from the public catalog and links to a shareable
// /tools query. They do not make recommendations; they organize recorded
// taxonomy into useful entry points.

import type { PrimaryCategory } from "@/features/catalog/taxonomy";

export const TAG_SETS = [
  "automation",
  "ai",
  "open-source",
  "api",
  "real-time",
  "mobile",
  "startup",
  "design",
] as const;

export type TagSet = (typeof TAG_SETS)[number];

export type RouteStep = {
  index: number;
  title: string;
  description: string;
  filters: {
    category?: PrimaryCategory;
    tags?: TagSet[];
  };
  /** Pre-built, shareable /tools URL. */
  href: string;
};

export type Route = {
  slug: string;
  title: string;
  short: string;
  steps: RouteStep[];
};

export const ROUTES: Route[] = [
  {
    slug: "research-a-market",
    title: "Research a market",
    short: "Research and synthesis records grouped for orientation work.",
    steps: [
      {
        index: 1,
        title: "Map the field",
        description:
          "Recorded research and data tools. Open the linked view to see the same record set after refresh.",
        filters: { category: "research-data" },
        href: "/tools?category=research-data&view=list",
      },
      {
        index: 2,
        title: "Audit the ledgers",
        description:
          "Read the Evidence Ledger sidebar on each record to confirm what is filed versus missing.",
        filters: {},
        href: "/tools?view=list",
      },
    ],
  },
  {
    slug: "build-a-first-version",
    title: "Build a first version",
    short: "Code, dev-tooling, and infrastructure records grouped by where you are in the stack.",
    steps: [
      {
        index: 1,
        title: "Start in the index",
        description:
          "Recorded code and development tools, by primary category.",
        filters: { category: "code-development" },
        href: "/tools?category=code-development&view=list",
      },
      {
        index: 2,
        title: "Confirm source and evidence",
        description:
          "Open each record and read the Evidence Ledger to verify source and recorded fields.",
        filters: { category: "code-development" },
        href: "/tools?category=code-development&view=list",
      },
      {
        index: 3,
        title: "Cross-check same-category records",
        description:
          "Open a record and read the Evidence Ledger sidebar before adopting any tool into a stack.",
        filters: {},
        href: "/tools?view=list",
      },
    ],
  },
  {
    slug: "explain-the-product",
    title: "Explain the product",
    short: "Writing, content, and explanation records grouped for product-facing work.",
    steps: [
      {
        index: 1,
        title: "Open writing & content",
        description:
          "Recorded writing and content tools, ordered alphabetically.",
        filters: { category: "writing-content" },
        href: "/tools?category=writing-content&view=list&sort=name",
      },
      {
        index: 2,
        title: "Cross-check SEO & marketing",
        description:
          "Same methodology applied to records filed under seo-marketing.",
        filters: { category: "seo-marketing" },
        href: "/tools?category=seo-marketing&view=list",
      },
      {
        index: 3,
        title: "Read the ledger",
        description:
          "Evidence sidebar tells you whether source and recorded verification are on file.",
        filters: {},
        href: "/tools?view=list",
      },
    ],
  },
  {
    slug: "shape-the-interface",
    title: "Shape the interface",
    short: "Image, video, and design records grouped for interface and visual work.",
    steps: [
      {
        index: 1,
        title: "Image and video records",
        description:
          "Recorded image and video tools, ordered alphabetically.",
        filters: { category: "image-video" },
        href: "/tools?category=image-video&view=list&sort=name",
      },
      {
        index: 2,
        title: "Cross-check productivity",
        description:
          "Same methodology applied to records filed under productivity & automation.",
        filters: { category: "productivity" },
        href: "/tools?category=productivity&view=list",
      },
      {
        index: 3,
        title: "Audit the ledger",
        description:
          "Each record page surfaces the Evidence Ledger; nothing else is editorial signal.",
        filters: {},
        href: "/tools?view=list",
      },
    ],
  },
  {
    slug: "plan-distribution",
    title: "Plan distribution",
    short: "SEO and marketing records grouped for distribution and growth work.",
    steps: [
      {
        index: 1,
        title: "SEO and marketing",
        description:
          "Recorded SEO and marketing records, ordered alphabetically.",
        filters: { category: "seo-marketing" },
        href: "/tools?category=seo-marketing&view=list&sort=name",
      },
      {
        index: 2,
        title: "Productivity cross-check",
        description:
          "Some distribution work borrows from productivity records.",
        filters: { category: "productivity" },
        href: "/tools?category=productivity&view=list",
      },
      {
        index: 3,
        title: "Read the ledger",
        description:
          "Each record's Evidence Ledger tells you what is recorded. No more, no less.",
        filters: {},
        href: "/tools?view=list",
      },
    ],
  },
];

export function findRouteBySlug(slug: string): Route | undefined {
  return ROUTES.find((r) => r.slug === slug);
}

export const ROUTE_VERSION = "2026-09-04";

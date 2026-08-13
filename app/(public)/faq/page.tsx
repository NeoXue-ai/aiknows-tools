import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { faqJsonLd } from "@/lib/seo/tool-schema";

type Faq = { question: string; answer: string };
type Group = { title: string; items: Faq[] };

const GROUPS: Group[] = [
  {
    title: "About the index",
    items: [
      {
        question: "What is aiknows.tools?",
        answer:
          "An independent public catalogue of recorded AI tools and directory submission facts. Each entry lists what is captured, what is missing, and what is not measured.",
      },
      {
        question: "Is this a ranking or a directory?",
        answer:
          "A reference catalogue. The site does not rank tools by traffic, popularity, or paid placement. Listings on /tools default to record time, which is closer to a changelog than a leaderboard.",
      },
      {
        question: "Why are there no star ratings or upvotes?",
        answer:
          "Because star ratings and upvote counts measure sentiment, not the substance of a tool record. The index records what a tool publishes about itself and shows that publication as-is.",
      },
      {
        question: "Is aiknows.tools affiliated with any of the listed tools?",
        answer:
          "No. Listed tools do not pay to appear. Verification is an editorial step, not a paid promotion. Submissions are reviewed on the same criteria regardless of source.",
      },
    ],
  },
  {
    title: "Submitting and editing records",
    items: [
      {
        question: "How do I submit a tool or directory?",
        answer:
          "Use the submission form at /submit. The minimum viable record is a name, URL, and primary category. Submissions enter a review queue and are published once they pass basic validity checks.",
      },
      {
        question: "How long does review take?",
        answer:
          "Most public submissions are reviewed within a few days. Editor-imported batches run on a separate cadence. There is no paid fast-track.",
      },
      {
        question: "Can I edit my tool's record after submission?",
        answer:
          "Yes — file a correction through /contact and include the dossier URL. Corrections are credited on the record when filed. We do not hand out self-serve edit access.",
      },
      {
        question: "What is the \"Verified record\" plan?",
        answer:
          "An editorial review that adds a verification field to your dossier. Verification is recorded as a field on the same Evidence Ledger as every other entry — it does not promote, boost, or relabel the tool. Full plan details at /pricing.",
      },
    ],
  },
  {
    title: "Data and methodology",
    items: [
      {
        question: "Where does the data come from?",
        answer:
          "Two paths: public submissions via /submit, and editor imports from public sources (Product Hunt launches, changelogs, public lists). Imports populate the same fields as a submission and carry a recorded source when one is available.",
      },
      {
        question: "How often is data refreshed?",
        answer:
          "Recheck cadence varies by tool. A \"recorded\" field is a snapshot at the time of recheck, not a guarantee that the underlying product still operates the same way.",
      },
      {
        question: "Why are some fields missing for some tools?",
        answer:
          "Because sparse data is shown as sparse. The dossier labels missing fields rather than padding or inferring them. This is a feature, not a bug.",
      },
      {
        question: "What does the \"Evidence Ledger\" mean?",
        answer:
          "The dossier section that lists what fields a tool record actually carries — name, category, tagline, pricing state, recorded source, and any editor notes — without scoring or ranking them.",
      },
      {
        question: "How is the domain rating (DR) used?",
        answer:
          "Shown as a field on the dossier and as a sort key in /tools. It is a third-party domain metric, not an editorial quality claim. It is never used to boost or hide a tool.",
      },
    ],
  },
];

const ALL_FAQS: Faq[] = GROUPS.flatMap((g) => g.items);

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Common questions about the aiknows.tools index — what it is, how submissions work, and how the data is recorded.",
  path: "/faq",
});

export default function FaqPage() {
  const jsonLd = faqJsonLd(ALL_FAQS);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          FAQ / common questions
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Questions about the index.
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Quick answers to what the index is, how submissions work, and how
          the data is recorded. If your question is not here, write to{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-accent">
            the maintainers
          </Link>
          .
        </p>
      </header>

      <div className="space-y-12">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
              {group.title}
            </p>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {group.items.map((item) => (
                <details
                  key={item.question}
                  className="group/item py-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
                    <h2 className="text-[15px] font-medium text-foreground">
                      {item.question}
                    </h2>
                    <span
                      aria-hidden
                      className="font-mono text-sm tabular-nums text-muted-foreground transition-transform group-open/item:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-border pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          Still have a question?
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
          Write to the maintainers.
        </h2>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          The fastest path for corrections and submission status is{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-accent">
            /contact
          </Link>
          . Most emails get a reply within a few days.
        </p>
      </section>
    </div>
  );
}
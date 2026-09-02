import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

type Faq = { question: string; answer: string };

const FAQS: Faq[] = [
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
    question: "How do I submit a tool or directory?",
    answer:
      "Use the submission form at /submit. The minimum viable record is a name, URL, and primary category. Submissions enter a review queue and are published once they pass basic validity checks.",
  },
  {
    question: "Is aiknows.tools free to use?",
    answer:
      "Reading the index is free. Submission is free. Verification is an editorial step that does not require payment — see /pricing for what verification adds.",
  },
  {
    question: "How are tools curated?",
    answer:
      "Each record passes a basic validity check (working URL, non-placeholder content, matching category). Submissions are not auto-published; editor imports go through the same review queue as public submissions.",
  },
  {
    question: "How often is the directory updated?",
    answer:
      "Recheck cadence varies by tool. New submissions are reviewed within a few days. Editor-imported batches run on a separate cadence. Each dossier shows the most recent recheck.",
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
  {
    question: "Where does the data come from?",
    answer:
      "Two paths: public submissions via /submit, and editor imports from public sources (Product Hunt launches, changelogs, public lists). Imports populate the same fields as a submission and carry a recorded source when one is available.",
  },
  {
    question: "Why are some fields missing for some tools?",
    answer:
      "Because sparse data is shown as sparse. The dossier labels missing fields rather than padding or inferring them. This is a feature, not a bug.",
  },
  {
    question: "How is the domain rating (DR) used?",
    answer:
      "Shown as a field on the dossier and as a sort key in /tools. It is a third-party domain metric, not an editorial quality claim. It is never used to boost or hide a tool.",
  },
];

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Common questions about the aiknows.tools index — what it is, how submissions work, and how the data is recorded.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {/* Audit P5: Google retired FAQPage rich snippets in 2026 — emitting
          FAQPage JSON-LD is now wasted signal. The on-page Q&A list stays
          for users; we just stop marking it up. */}
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Frequently asked questions
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Everything you want to know about aiknows.tools before you dive in.
        </p>
      </header>

      <ol className="border-y border-border">
        {FAQS.map((item, i) => (
          <li key={item.question} className="border-b border-border last:border-b-0">
            <details className="group/item [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-6 py-5">
                <span className="w-8 shrink-0 font-serif text-[18px] italic leading-none tabular-nums text-muted-foreground transition-colors group-hover/item:text-foreground group-open/item:text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-medium text-foreground transition-colors group-hover/item:text-accent">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-lg leading-none text-muted-foreground transition-transform group-open/item:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pl-14 pr-10 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          </li>
        ))}
      </ol>

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
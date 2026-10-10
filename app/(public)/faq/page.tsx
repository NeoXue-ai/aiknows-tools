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
      "Visit /submit for the current submission channel. Include a name, official URL, category, and product description. Editors review the details before publishing.",
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
      "Review cadence varies by tool. Suggest a correction through /submit if a record has changed. Publication dates and verification flags appear only when they are recorded; an empty field does not imply a recent review.",
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
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-16">
      {/* Audit P5: Google retired FAQPage rich snippets in 2026 — emitting
          FAQPage JSON-LD is now wasted signal. The on-page Q&A list stays
          for users; we just stop marking it up. */}
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">
          Frequently asked questions
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Everything you want to know about aiknows.tools before you dive in.
        </p>
      </header>

      <ol className="overflow-hidden rounded-2xl border border-border bg-card px-5 sm:px-7">
        {FAQS.map((item, i) => (
          <li key={item.question} className="border-b border-border last:border-b-0">
            <details className="group/item [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-4 py-5">
                <span className="w-6 shrink-0 text-xs leading-none tabular-nums text-muted-foreground transition-colors group-hover/item:text-foreground group-open/item:text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-medium text-foreground transition-colors group-hover/item:text-accent">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="text-lg leading-none text-muted-foreground transition-transform group-open/item:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pl-10 pr-5 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          </li>
        ))}
      </ol>

      <section className="mt-12 border-t border-border pt-8">
        <p className="text-sm font-medium text-accent">
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

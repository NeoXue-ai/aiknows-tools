import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

type Faq = { question: string; answer: string };

const FAQS: Faq[] = [
  {
    question: "What is AIKnows?",
    answer:
      "AIKnows is an AI tools directory for writing, design, coding, research and everyday work. Browse by task, compare product information and follow official website links to explore a tool.",
  },
  {
    question: "How do I find an AI tool for my task?",
    answer:
      "Start with a category or search for a product name, feature or task. Open a listing to read its description, pricing information and related tools. Selected listings include source-based guides with features, use cases and limitations.",
  },
  {
    question: "Are the tool guides based on hands-on testing?",
    answer:
      "The current guides are based on cited product information and official documentation. They describe capabilities and limitations, but do not claim that we have personally tested every tool. Use the linked sources to check details for your needs.",
  },
  {
    question: "How do I submit a tool or directory?",
    answer:
      "Open the Submit page and follow its submission link. Include your product name, official website, category and a clear description. Suggestions enter a public review queue; submission does not guarantee inclusion.",
  },
  {
    question: "Is AIKnows free to use?",
    answer:
      "Browsing the directory and submitting a tool are free. The tools listed here have their own plans and access rules, so check each product's official website for current pricing.",
  },
  {
    question: "How are tools curated?",
    answer:
      "We review submitted product details and category fit before adding a listing. A working official website and a clear explanation of what the tool does help us assess a suggestion. Directory order is not a product quality ranking.",
  },
  {
    question: "How often is the directory updated?",
    answer:
      "Updates are published after review. Guides show a check date where available, and the schedule varies by tool. For current prices, features and availability, follow the official website link.",
  },
  {
    question: "How do I correct an existing listing?",
    answer:
      "Use Suggest a correction on the Submit page or contact the team. Include the AIKnows listing URL, the detail that needs changing and an official source supporting the update. The team reviews corrections before publishing them.",
  },
  {
    question: "What does a Verified label mean?",
    answer:
      "It marks an editorial verification recorded for a listing. It is not a performance rating or a guarantee that every feature remains current. Check the guide's date and official sources when evaluating a product.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "The directory uses public product information and community submissions. Guides link to supporting official pages and documentation. Coverage and available details vary by product.",
  },
  {
    question: "Why are some fields missing for some tools?",
    answer:
      "Some listings have less information than others. We leave unknown details empty rather than guess them. If you have an official source for a missing detail, suggest an update.",
  },
  {
    question: "How is the domain rating (DR) used?",
    answer:
      "DR is a third-party metric about a website's domain. It is shown where available and can be used to sort search results. It does not measure a tool's output quality, suitability or reliability.",
  },
];

export const metadata = pageMetadata({
  title: "AI Tools Directory FAQ: Browsing & Submissions",
  description:
    "Find answers about using AIKnows, comparing AI tools, reading source-based guides, submitting a product and correcting an existing listing.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">
          Frequently asked questions
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          How to find a tool, understand its listing and contribute to AIKnows.
        </p>
      </header>

      <ol className="overflow-hidden rounded-2xl border border-border bg-card px-5 sm:px-7">
        {FAQS.map((item, i) => (
          <li
            key={item.question}
            className="border-b border-border last:border-b-0"
          >
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
          Get in touch with the team.
        </h2>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Visit our{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-accent"
          >
            contact page
          </Link>{" "}
          for questions, or use the submission channel to suggest a tool or
          correction. Include the listing or submission link so we can find it.
        </p>
      </section>
    </div>
  );
}

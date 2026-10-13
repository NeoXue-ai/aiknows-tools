export interface CategoryGuide {
  title: string;
  description: string;
  introduction: string;
  criteria: { label: string; text: string }[];
  faqs: { question: string; answer: string }[];
  related: { slug: string; label: string }[];
}
export const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  "ai-image-generator": {
    title: "AI Image Generators: Features, Pricing & Use Cases",
    description:
      "Compare AI image generators for prompt-based artwork, marketing visuals and image edits. Check reference controls, free limits, output rights and workflow fit.",
    introduction:
      "AI image generators create images from prompts or visual references. The useful choice depends on the work you need to deliver: an illustration, a consistent product image or an editable marketing asset.",
    criteria: [
      {
        label: "Control over the result",
        text: "Check support for reference images, aspect ratios and local edits. Try the same brief rather than judging only the examples on a homepage.",
      },
      {
        label: "Workflow and output",
        text: "Compare export size, editing options and the effort needed to produce a usable result. A generator and a photo editor solve different parts of the job.",
      },
      {
        label: "Cost and rights",
        text: "Read credit costs, free limits and commercial-use terms for your plan. Free access does not automatically mean unrestricted use.",
      },
    ],
    faqs: [
      {
        question: "Which AI image generator should I choose?",
        answer:
          "Start with a repeatable task and compare the tools on that task. Choose based on control, usable output, editing effort and cost rather than a generic ranking.",
      },
      {
        question: "Can I use AI images commercially?",
        answer:
          "Check the provider’s terms for your plan and the rights to any reference material. Permission to use the service is different from clearing rights to a particular output.",
      },
    ],
    related: [
      { slug: "ai-art-generator", label: "AI art generators" },
      { slug: "ai-photo-editor", label: "AI photo editors" },
      { slug: "ai-product-photography", label: "Product photography tools" },
    ],
  },
  "ai-video-generator": {
    title: "AI Video Generators: Compare Workflows & Limits",
    description:
      "Explore AI video tools for text-to-video, image animation and creative production. Compare motion control, clip limits, credits and editing workflows.",
    introduction:
      "AI video generators turn prompts or reference images into clips. A useful comparison considers the whole production workflow, including iteration, editing and export, rather than one impressive sample.",
    criteria: [
      {
        label: "Inputs and control",
        text: "Decide whether you need text-to-video, image animation or reference-guided motion. Check how much control you have over framing and consistency.",
      },
      {
        label: "Usable clips",
        text: "Look at duration, resolution, audio options and export requirements. Review the generated clip for visual errors before sharing it.",
      },
      {
        label: "Iteration budget",
        text: "Count the attempts needed to obtain a usable clip. Credit cost per attempt and retry policies matter as much as a monthly subscription label.",
      },
    ],
    faqs: [
      {
        question: "Is an AI video generator also a video editor?",
        answer:
          "Generation creates footage; editing assembles and refines it. Some products cover both, while others need a separate editor for captions, pacing or final delivery.",
      },
      {
        question: "Does a free account include a finished video?",
        answer:
          "Not necessarily. Check the minimum generation cost, welcome credits, watermarks and export restrictions before treating a free registration as a free video.",
      },
    ],
    related: [
      { slug: "image-to-video-ai", label: "Image-to-video tools" },
      { slug: "ai-video-editor", label: "Video editors" },
      { slug: "ai-image-generator", label: "Image generators" },
    ],
  },
  "developer-tools": {
    title: "AI Developer Tools: Coding, Agents & Workflow",
    description:
      "Compare AI developer tools for code editing, debugging, testing and automation. Check repository access, integrations, review controls and usage limits.",
    introduction:
      "AI developer tools can assist with suggestions or carry out multi-step coding tasks. Choose for the environment you work in and the amount of change you can reliably review.",
    criteria: [
      {
        label: "Where you work",
        text: "Compare editor, terminal and repository integrations. A separate AI editor may add a migration step; an extension may fit the tools your team already uses.",
      },
      {
        label: "Scope of changes",
        text: "Check whether the tool suggests individual edits or can execute commands and change multiple files. Understand approval controls before giving it broad access.",
      },
      {
        label: "Review and data handling",
        text: "Use tests and code review to assess results. Check the provider’s data policy, permissions and plan limits against your project’s requirements.",
      },
    ],
    faqs: [
      {
        question: "Can an AI coding tool replace code review?",
        answer:
          "Generated changes still need review. Check correctness, dependencies and security implications, and run meaningful tests before merging.",
      },
      {
        question: "Should I use an editor extension or a coding agent?",
        answer:
          "An extension can suit interactive assistance within your existing editor. An agent can suit a larger task, provided you can inspect its actions and validate its changes.",
      },
    ],
    related: [
      { slug: "ai-code-generator", label: "Code generators" },
      { slug: "ai-agent", label: "AI agents" },
      { slug: "no-code", label: "No-code and low-code tools" },
    ],
  },
  "ai-chatbot": {
    title: "AI Chatbots: Compare Tasks, Access & Features",
    description:
      "Explore AI chatbots for writing, research and everyday work. Compare file support, source checking, connected tools, privacy settings and access limits.",
    introduction:
      "AI chatbots provide a conversational way to draft, explain and explore information. Features vary by product and plan, so compare the tasks you need rather than treating every chat interface as equivalent.",
    criteria: [
      {
        label: "Your inputs",
        text: "Check which file types, images and other inputs are supported. Test with a representative task that does not contain sensitive information.",
      },
      {
        label: "Reliable answers",
        text: "For research, look for a clear source trail and inspect the cited pages. A confident answer can still contain errors or misunderstand your request.",
      },
      {
        label: "Connected tools and access",
        text: "Compare integrations, usage limits and data settings. Confirm which capabilities are available on the plan you would actually use.",
      },
    ],
    faqs: [
      {
        question: "Can I trust every answer from an AI chatbot?",
        answer:
          "Verify important factual claims against reliable sources. Ask for clarification when the response makes assumptions, and inspect citations rather than trusting their presence alone.",
      },
      {
        question: "How should I compare free chatbots?",
        answer:
          "Use the same task and assess the result, required inputs and access limits. Free plans can differ substantially in available features and capacity.",
      },
    ],
    related: [
      { slug: "ai-assistant", label: "AI assistants" },
      { slug: "ai-summarizer", label: "Summarization tools" },
      { slug: "ai-search-engine", label: "AI search tools" },
    ],
  },
  "research-data": {
    title: "AI Research & Data Tools: Sources, Analysis & Workflows",
    description:
      "Compare AI research and data tools for source discovery, document analysis and evidence-based workflows. Check citations, coverage, exports and limitations.",
    introduction:
      "Research tools help discover material, organize sources or analyze data. A useful workflow keeps the source trail visible so that a generated summary can be checked against the original evidence.",
    criteria: [
      {
        label: "Evidence and coverage",
        text: "Check what sources the tool searches or accepts and whether it exposes citations. Missing coverage can matter more than fluent summaries.",
      },
      {
        label: "Documents and data",
        text: "Compare supported file types, context limits, tables and export formats. Try a task with a known answer to assess whether information is preserved.",
      },
      {
        label: "Verification workflow",
        text: "Look for a way to trace claims back to passages or datasets. Record retrieval dates and recheck figures before publishing a report.",
      },
    ],
    faqs: [
      {
        question: "Is an AI-generated citation enough to support a claim?",
        answer:
          "No. Open the original source and verify that it supports the claim, uses the relevant date and covers the population or context you need.",
      },
      {
        question: "Should I use web search or an uploaded-source workspace?",
        answer:
          "Web search can help discover sources. An uploaded-source workspace can help analyze a bounded collection. You may need both when assembling and reviewing evidence.",
      },
    ],
    related: [
      { slug: "ai-search-engine", label: "Search tools" },
      { slug: "ai-summarizer", label: "Summarization tools" },
      { slug: "ai-analytics", label: "Data analysis tools" },
    ],
  },
};

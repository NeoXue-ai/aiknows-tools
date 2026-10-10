export const CATEGORIES = [
  {
    slug: "writing-content",
    name: "Writing & Content",
    description:
      "AI writing assistants, copy generators, and content editors for marketers and creators.",
  },
  {
    slug: "seo-marketing",
    name: "SEO & Marketing",
    description: "SEO tools, growth marketing, analytics, and ad optimization.",
  },
  {
    slug: "image-video",
    name: "Image & Video",
    description: "AI image generation, video editing, and creative tools.",
  },
  {
    slug: "code-development",
    name: "Code & Development",
    description: "AI code assistants, dev tools, and code review.",
  },
  {
    slug: "productivity",
    name: "Productivity & Automation",
    description: "Workflow automation, task managers, and AI agents.",
  },
  {
    slug: "business-analytics",
    name: "Business & Analytics",
    description: "Business intelligence, dashboards, and AI for ops.",
  },
  {
    slug: "ecommerce-sales",
    name: "E-commerce & Sales",
    description:
      "AI sales tools, e-commerce platforms, and conversion optimization.",
  },
  {
    slug: "research-data",
    name: "Research & Data",
    description:
      "AI research assistants, data analysis, and knowledge management.",
  },
] as const;

export type PrimaryCategory = (typeof CATEGORIES)[number]["slug"];

const CATEGORY_NAME_BY_SLUG = new Map<string, string>(
  CATEGORIES.map((c) => [c.slug, c.name]),
);

export function categoryName(slug: string): string {
  return CATEGORY_NAME_BY_SLUG.get(slug) ?? slug;
}

export type Subcategory = {
  slug: string;
  name: string;
  legacySlug: string;
  /** Some facets, such as transcription, span more than one primary category. */
  parents?: string[];
  description: string;
};

export function slugifySub(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SUBCATEGORIES: Subcategory[] = [
  {
    slug: "ai-translator",
    name: "AI Translator",
    legacySlug: "writing-content",
    description:
      "Machine translation tools that convert text between languages.",
  },
  {
    slug: "ai-summarizer",
    name: "AI Summarizer",
    legacySlug: "writing-content",
    description: "Tools that condense long text into short summaries.",
    parents: ["writing-content", "research-data"],
  },
  {
    slug: "ai-writer",
    name: "AI Writer",
    legacySlug: "writing-content",
    description: "Writing assistants for drafts, long-form copy, and revision.",
    parents: ["writing-content", "seo-marketing"],
  },
  {
    slug: "ai-content-creator",
    name: "AI Content Creator",
    legacySlug: "writing-content",
    description:
      "Content production tools for blogs, posts, and recurring publishing.",
    parents: ["writing-content", "seo-marketing"],
  },
  {
    slug: "ai-seo-tools",
    name: "AI SEO Tools",
    legacySlug: "seo-marketing",
    description: "SEO auditing, ranking, and optimization tools.",
    parents: ["seo-marketing", "writing-content"],
  },
  {
    slug: "ai-marketing",
    name: "AI Marketing",
    legacySlug: "seo-marketing",
    description: "Marketing strategy, campaign, and growth tools.",
    parents: ["seo-marketing", "writing-content"],
  },
  {
    slug: "ai-ad-creative",
    name: "AI Ad Creative",
    legacySlug: "seo-marketing",
    description: "Ad copy and creative generation tools.",
    parents: ["seo-marketing", "business-analytics"],
  },
  {
    slug: "ai-analytics",
    name: "AI Analytics",
    legacySlug: "seo-marketing",
    description: "Marketing analytics and insight tools.",
    parents: ["seo-marketing", "business-analytics"],
  },
  {
    slug: "social-media",
    name: "Social Media",
    legacySlug: "seo-marketing",
    description: "Social media management, scheduling, and content tools.",
  },
  {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    legacySlug: "image-video",
    description: "Text-prompt tools that generate images from descriptions.",
  },
  {
    slug: "ai-photo-editor",
    name: "AI Photo Editor",
    legacySlug: "image-video",
    description:
      "Photo editing and enhancement tools that work on existing images.",
  },
  {
    slug: "ai-logo-generator",
    name: "AI Logo Generator",
    legacySlug: "image-video",
    description: "Logo design tools that produce brand marks from prompts.",
  },
  {
    slug: "ai-image-enhancer",
    name: "AI Image Enhancer",
    legacySlug: "image-video",
    description: "Tools that upscale, sharpen, and restore image quality.",
  },
  {
    slug: "ai-background-remover",
    name: "AI Background Remover",
    legacySlug: "image-video",
    description: "Tools that separate subjects from photo backgrounds.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-art-generator",
    name: "AI Art Generator",
    legacySlug: "image-video",
    description:
      "Art-generation tools for illustrations, anime, and stylized artwork.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-3d-model-generator",
    name: "AI 3D Model Generator",
    legacySlug: "image-video",
    description: "Tools that create 3D models and assets from text or images.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-headshot-generator",
    name: "AI Headshot Generator",
    legacySlug: "image-video",
    description: "Portrait and headshot tools for professional profile photos.",
  },
  {
    slug: "ai-interior-design",
    name: "AI Interior Design",
    legacySlug: "image-video",
    description: "Room, floor-plan, and home-design tools.",
  },
  {
    slug: "ai-avatar-generator",
    name: "AI Avatar Generator",
    legacySlug: "image-video",
    description:
      "Avatar and character makers for profile pictures and personas.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-ocr",
    name: "AI OCR",
    legacySlug: "image-video",
    description: "Text extraction from images, scans, and documents.",
  },
  {
    slug: "ai-graphic-design",
    name: "AI Graphic Design",
    legacySlug: "image-video",
    description: "Banner, poster, icon, and general graphic-design tools.",
  },
  {
    slug: "ai-product-photography",
    name: "AI Product Photography",
    legacySlug: "image-video",
    description: "Product-shoot tools for e-commerce imagery.",
  },
  {
    slug: "image-to-3d-model",
    name: "Image to 3D Model",
    legacySlug: "image-video",
    description: "Tools that convert photos into 3D models.",
  },
  {
    slug: "ai-video-generator",
    name: "AI Video Generator",
    legacySlug: "image-video",
    description: "Text-prompt tools that generate video clips.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-video-editor",
    name: "AI Video Editor",
    legacySlug: "image-video",
    description: "Video editing and cutting tools.",
    parents: ["image-video", "ecommerce-sales"],
  },
  {
    slug: "image-to-video-ai",
    name: "Image to Video AI",
    legacySlug: "image-video",
    description: "Tools that animate still images into video.",
  },
  {
    slug: "text-to-video-ai",
    name: "Text to Video AI",
    legacySlug: "image-video",
    description: "Video generators that work from text prompts.",
  },
  {
    slug: "ai-lip-sync",
    name: "AI Lip Sync",
    legacySlug: "image-video",
    description: "Tools that sync lips and dialogue to video.",
  },
  {
    slug: "ai-voice-generator",
    name: "AI Voice Generator",
    legacySlug: "image-video",
    description: "Voice-over and narration tools from text.",
  },
  {
    slug: "ai-music-generator",
    name: "AI Music Generator",
    legacySlug: "image-video",
    description: "Music and song generation tools.",
  },
  {
    slug: "text-to-speech-ai",
    name: "Text to Speech AI",
    legacySlug: "image-video",
    description: "Speech synthesis from written text.",
  },
  {
    slug: "ai-voice-cloning",
    name: "AI Voice Cloning",
    legacySlug: "image-video",
    description: "Tools that replicate or mimic existing voices.",
  },
  {
    slug: "speech-to-text-ai",
    name: "Speech to Text AI",
    legacySlug: "image-video",
    description: "Transcription tools that convert audio to text.",
    parents: ["image-video", "productivity"],
  },
  {
    slug: "ai-website-builder",
    name: "AI Website Builder",
    legacySlug: "code-development",
    description: "Website builders that generate sites from prompts.",
    parents: ["code-development", "ecommerce-sales"],
  },
  {
    slug: "ai-app-builder",
    name: "AI App Builder",
    legacySlug: "code-development",
    description: "Application builders and app scaffolds.",
    parents: ["code-development", "research-data"],
  },
  {
    slug: "ai-code-generator",
    name: "AI Code Generator",
    legacySlug: "code-development",
    description: "Code generation and completion tools.",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    legacySlug: "code-development",
    description: "Utilities and tooling for developers.",
  },
  {
    slug: "ai-image-api",
    name: "AI Image API",
    legacySlug: "code-development",
    description: "Image-generation APIs for developers.",
  },
  {
    slug: "ai-video-api",
    name: "AI Video API",
    legacySlug: "code-development",
    description: "Video-generation APIs for developers.",
  },
  {
    slug: "ai-music-api",
    name: "AI Music API",
    legacySlug: "code-development",
    description: "Music and audio APIs for developers.",
  },
  {
    slug: "ai-text-api",
    name: "AI Text API",
    legacySlug: "code-development",
    description: "Text and LLM APIs for developers.",
  },
  {
    slug: "coding-proxy",
    name: "Coding Proxy",
    legacySlug: "code-development",
    description: "API proxies for coding and model access.",
  },
  {
    slug: "developer-apis",
    name: "Developer APIs",
    legacySlug: "code-development",
    description: "General developer APIs and platform tools.",
  },
  {
    slug: "ai-agent",
    name: "AI Agent",
    legacySlug: "productivity",
    description: "Autonomous agents that plan and execute multi-step tasks.",
    parents: ["productivity", "code-development"],
  },
  {
    slug: "ai-chatbot",
    name: "AI Chatbot",
    legacySlug: "productivity",
    description: "Conversational chat assistants and support bots.",
  },
  {
    slug: "ai-presentation-maker",
    name: "AI Presentation Maker",
    legacySlug: "productivity",
    description: "Slide and deck generation tools.",
    parents: ["productivity", "writing-content"],
  },
  {
    slug: "ai-search-engine",
    name: "AI Search Engine",
    legacySlug: "productivity",
    description: "AI-powered search and answer engines.",
    parents: ["productivity", "seo-marketing", "research-data"],
  },
  {
    slug: "ai-note-taker",
    name: "AI Note Taker",
    legacySlug: "productivity",
    description: "Meeting notes and transcription assistants.",
  },
  {
    slug: "ai-assistant",
    name: "AI Assistant",
    legacySlug: "productivity",
    description: "General-purpose personal AI assistants.",
  },
  {
    slug: "ai-pdf",
    name: "AI PDF",
    legacySlug: "productivity",
    description: "PDF reading, extraction, and chat tools.",
  },
  {
    slug: "ai-workflow",
    name: "AI Workflow",
    legacySlug: "productivity",
    description: "Workflow automation and pipeline builders.",
    parents: ["productivity", "writing-content"],
  },
  {
    slug: "ai-document-generator",
    name: "AI Document Generator",
    legacySlug: "productivity",
    description: "Document, contract, and file generation tools.",
  },
  {
    slug: "ai-spreadsheet",
    name: "AI Spreadsheet",
    legacySlug: "productivity",
    description: "Spreadsheet helpers and data-table assistants.",
    parents: ["productivity", "business-analytics"],
  },
  {
    slug: "ai-resume-builder",
    name: "AI Resume Builder",
    legacySlug: "productivity",
    description: "Resume and CV builders.",
  },
  {
    slug: "productivity-tools",
    name: "Productivity Tools",
    legacySlug: "productivity",
    description: "General productivity apps and task tools.",
  },
  {
    slug: "automation",
    name: "Automation",
    legacySlug: "productivity",
    description: "Automation and integration platforms.",
  },
  {
    slug: "monitoring",
    name: "Monitoring",
    legacySlug: "productivity",
    description: "Monitoring, uptime, and observability tools.",
  },
  {
    slug: "project-management",
    name: "Project Management",
    legacySlug: "productivity",
    description: "Project and task management tools.",
  },
  {
    slug: "email",
    name: "Email",
    legacySlug: "productivity",
    description: "Email management and cold-outreach tools.",
    parents: ["productivity", "seo-marketing", "ecommerce-sales"],
  },
  {
    slug: "customer-support",
    name: "Customer Support",
    legacySlug: "productivity",
    description: "Support desks, helpdesk, and ticketing tools.",
    parents: ["productivity", "seo-marketing"],
  },
  {
    slug: "chatbots",
    name: "Chatbots",
    legacySlug: "productivity",
    description: "Chatbot builders and conversational platforms.",
  },
  {
    slug: "community",
    name: "Community",
    legacySlug: "productivity",
    description: "Community platforms and engagement tools.",
  },
  {
    slug: "freelancer-tools",
    name: "Freelancer Tools",
    legacySlug: "productivity",
    description: "Tools for freelancers and independent workers.",
    parents: ["productivity", "seo-marketing"],
  },
  {
    slug: "blogging",
    name: "Blogging",
    legacySlug: "productivity",
    description: "Blogging platforms and publishing tools.",
    parents: ["productivity", "writing-content"],
  },
  {
    slug: "remote-work",
    name: "Remote Work",
    legacySlug: "productivity",
    description: "Remote collaboration and work tools.",
  },
  {
    slug: "building-products",
    name: "Building Products",
    legacySlug: "productivity",
    description: "Tools for building and shipping products.",
  },
  {
    slug: "ios",
    name: "Ios",
    legacySlug: "productivity",
    description: "iOS and Apple-platform tools.",
  },
  {
    slug: "education",
    name: "Education",
    legacySlug: "productivity",
    description: "Learning platforms and course tools.",
  },
  {
    slug: "fintech",
    name: "Fintech",
    legacySlug: "productivity",
    description: "Finance, banking, and payment tools.",
  },
  {
    slug: "ai-detector",
    name: "AI Detector",
    legacySlug: "productivity",
    description: "Tools that detect AI-generated content.",
  },
  {
    slug: "ai-humanizer",
    name: "AI Humanizer",
    legacySlug: "productivity",
    description: "Tools that rewrite AI text to read as human-written.",
  },
  {
    slug: "ai-grammar-checker",
    name: "AI Grammar Checker",
    legacySlug: "productivity",
    description: "Grammar and style-checking tools.",
    parents: ["productivity", "writing-content"],
  },
  {
    slug: "ai-models",
    name: "AI Models",
    legacySlug: "productivity",
    description: "Open-weight and multimodal models.",
  },
  {
    slug: "ai-entertainment",
    name: "AI Entertainment",
    legacySlug: "productivity",
    description: "Entertainment and personality tools.",
  },
  {
    slug: "ai-dating",
    name: "AI Dating",
    legacySlug: "productivity",
    description: "Dating and relationship tools.",
    parents: ["productivity", "image-video"],
  },
  {
    slug: "ai-travel",
    name: "AI Travel",
    legacySlug: "productivity",
    description: "Travel planning and trip tools.",
  },
  {
    slug: "ai-food-nutrition",
    name: "AI Food & Nutrition",
    legacySlug: "productivity",
    description: "Nutrition, recipe, and meal tools.",
  },
  {
    slug: "ai-research",
    name: "AI Research",
    legacySlug: "business-analytics",
    description: "Business and market research assistants.",
    parents: ["business-analytics", "productivity", "research-data"],
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    legacySlug: "ecommerce-sales",
    description: "E-commerce store and storefront tools.",
  },
  {
    slug: "sales",
    name: "Sales",
    legacySlug: "ecommerce-sales",
    description: "Sales enablement and CRM tools.",
    parents: ["ecommerce-sales", "seo-marketing"],
  },
  {
    slug: "ai-tutor",
    name: "AI Tutor",
    legacySlug: "research-data",
    description: "Tutoring and personalized learning tools.",
  },
  {
    slug: "ai-education",
    name: "AI Education",
    legacySlug: "research-data",
    description: "Educational content and classroom tools.",
  },
  {
    slug: "ai-answer",
    name: "AI Answer",
    legacySlug: "research-data",
    description: "Question-answering and homework tools.",
  },
  {
    slug: "directories",
    name: "Directories",
    legacySlug: "research-data",
    description: "Directories of tools, prompts, and resources.",
    parents: ["research-data", "ecommerce-sales"],
  },
  {
    slug: "productized-services",
    name: "Productized Services",
    legacySlug: "research-data",
    description: "Productized agencies and service marketplaces.",
  },
  {
    slug: "boilerplates",
    name: "Boilerplates",
    legacySlug: "research-data",
    description: "Boilerplate code and starter templates.",
  },
  {
    slug: "chrome-extensions",
    name: "Chrome Extensions",
    legacySlug: "research-data",
    description: "Browser extensions and productivity add-ons.",
    parents: ["research-data", "seo-marketing", "productivity"],
  },
  {
    slug: "website-builders",
    name: "Website Builders",
    legacySlug: "research-data",
    description: "No-code website and landing-page builders.",
  },
  {
    slug: "no-code",
    name: "No Code",
    legacySlug: "research-data",
    description: "No-code and low-code creation platforms.",
    parents: ["research-data", "business-analytics"],
  },
];

const SUB_BY_SLUG = new Map(SUBCATEGORIES.map((s) => [s.slug, s]));

export function subsForLegacy(legacySlug: string): Subcategory[] {
  return SUBCATEGORIES.filter((s) =>
    (s.parents ?? [s.legacySlug]).includes(legacySlug),
  );
}

export function subBySlug(slug: string): Subcategory | undefined {
  return SUB_BY_SLUG.get(slug);
}

export function subName(slug: string): string {
  return SUB_BY_SLUG.get(slug)?.name ?? slug;
}

export function legacySlugForSub(slug: string): string | null {
  return SUB_BY_SLUG.get(slug)?.legacySlug ?? null;
}

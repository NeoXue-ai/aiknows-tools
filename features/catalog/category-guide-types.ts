export interface CategoryGuide {
  title: string;
  description: string;
  introduction: string;
  capabilities: string[];
  audiences: { label: string; text: string }[];
  criteria: { label: string; text: string }[];
  workflow: string[];
  faqs: { question: string; answer: string }[];
  related: { slug: string; label: string }[];
}

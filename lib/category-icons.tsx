import {
  BarChart3,
  Code,
  Database,
  Folder,
  Image,
  PenLine,
  ShoppingCart,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "writing-content": PenLine,
  "seo-marketing": TrendingUp,
  "image-video": Image,
  "code-development": Code,
  productivity: Workflow,
  "business-analytics": BarChart3,
  "ecommerce-sales": ShoppingCart,
  "research-data": Database,
};

export function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Folder;
}

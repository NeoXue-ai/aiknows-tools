import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-card";
import { getPublicToolBySlug } from "@/features/catalog/server";
import { categoryName } from "@/lib/seo/tool-schema";
import { deriveMetaDescription } from "@/features/catalog/seo";
import { siteName, siteDescription } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const alt = "AI tool features and pricing on AIKnows";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-dynamic";

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);

  return new ImageResponse(
    OgCard({
      kicker: tool
        ? `${categoryName(tool.primary_category)} · ${siteName}`
        : siteName,
      title: tool?.name ?? "Find your next AI tool",
      subtitle: tool ? deriveMetaDescription(tool) : siteDescription,
    }),
    { ...OG_SIZE },
  );
}

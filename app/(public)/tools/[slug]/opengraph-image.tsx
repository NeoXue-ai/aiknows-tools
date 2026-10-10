import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-card";
import { getPublicToolBySlug } from "@/features/catalog/server";
import { categoryName } from "@/lib/seo/tool-schema";

type Props = { params: Promise<{ slug: string }> };

export const alt = "AI tool record";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamic = "force-dynamic";

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);

  return new ImageResponse(
    OgCard({
      kicker: tool ? categoryName(tool.primary_category) : "aiknows.tools",
      title: tool?.name ?? "AI tool record",
      subtitle: tool?.tagline ?? tool?.description ?? "Recorded AI tool facts and evidence fields.",
    }),
    { ...OG_SIZE },
  );
}

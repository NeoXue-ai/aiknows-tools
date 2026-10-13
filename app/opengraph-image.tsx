import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-card";
import { siteName, siteDescription } from "@/lib/site";

export const alt = "AIKnows — AI tools for work and creativity";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    OgCard({
      kicker: siteName,
      title: "Find your next AI tool",
      subtitle: siteDescription,
    }),
    { ...OG_SIZE },
  );
}

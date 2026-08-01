import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/seo/og-card";

export const alt = "aiknows.tools — recorded AI tool and directory index";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    OgCard({
      kicker: "aiknows.tools",
      title: "AI tool discovery index",
      subtitle: "An evidence-led index of recorded AI tools and directory submission facts. Inspect what is recorded — no popularity ranking, no star ratings.",
    }),
    { ...OG_SIZE },
  );
}

import type { MetadataRoute } from "next";
import { siteName, siteDescription } from "@/lib/site";

/**
 * PWA web app manifest. Next.js will serve this at /manifest.webmanifest
 * when linked from metadata.icons or metadata.manifest. The icons here are
 * the forest-green tiled PNGs — home-screen tiles can't adapt to color scheme,
 * so a solid background is the only way to stay readable on every wallpaper.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — AI Tools Directory`,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

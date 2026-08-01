import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence "multiple lockfiles" warning — this project is a single package, not a workspace.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      // Tool logos and screenshots are served from a public R2 bucket.
      // Routing them through next/image lets the optimizer resize them
      // to the actual display size (down from 800x800 originals) and
      // cache the response at Vercel's edge.
      {
        protocol: "https",
        hostname: "pub-459c6f6553344cc393826444731f5707.r2.dev",
        pathname: "/**",
      },
    ],
  },
  // Cloudflare Pages compatibility
  experimental: {
    serverActions: {
      allowedOrigins: ["aiknows-tools.pages.dev", "aiknows.tools"],
    },
  },
};

export default nextConfig;

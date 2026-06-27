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

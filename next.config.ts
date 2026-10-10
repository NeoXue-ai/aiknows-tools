import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingIncludes: { "/*": ["./.catalog/catalog.json"] },
  async redirects() {
    return [
      { source: "/login", destination: "/submit", permanent: true },
      { source: "/admin/:path*", destination: "/submit", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/catalog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
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
};

export default nextConfig;

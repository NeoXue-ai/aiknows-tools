import { ImageResponse } from "next/og";

export const alt = "aiknows.tools — AI Tools & Directories for SaaS Builders";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1f1f23 60%, #3b0764 100%)",
          color: "#fafafa",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "#a1a1aa",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
          </svg>
          <span style={{ fontWeight: 500 }}>aiknows.tools</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              background:
                "linear-gradient(90deg, #ffffff 0%, #c4b5fd 60%, #a78bfa 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            aiknows.tools
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: "#e4e4e7",
              maxWidth: 900,
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            AI Tools &amp; Directories for SaaS Builders
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            display: "flex",
            gap: 12,
            fontSize: 22,
            color: "#a1a1aa",
          }}
        >
          <span>Tools</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Directories</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Latest</span>
        </div>
      </div>
    ),
    { ...size },
  );
}

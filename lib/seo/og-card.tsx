import { type ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export function OgCard({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#FAF9F6",
        color: "#202722",
        fontFamily: "system-ui, sans-serif",
        padding: "80px 90px",
        position: "relative",
      }}
    >
      {/* Hairline frame — lighter inner ring */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          border: "1px solid #E3E6DF",
          borderRadius: 16,
        }}
      />

      {/* Kicker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 26,
          fontWeight: 500,
          color: "#2E5846",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            border: "2px solid #2E5846",
            borderRadius: 6,
            fontSize: 18,
            fontWeight: 700,
            color: "#2E5846",
            letterSpacing: "-0.04em",
          }}
        >
          ak
        </div>
        {kicker}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          color: "#202722",
          maxWidth: 920,
          display: "flex",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle ? (
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "#6B736C",
            maxWidth: 820,
            lineHeight: 1.35,
            marginTop: 28,
            display: "flex",
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {/* Bottom hairline label */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 90,
          display: "flex",
          gap: 14,
          fontSize: 22,
          fontWeight: 400,
          color: "#667085",
        }}
      >
        <span>Discover</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Compare</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Create</span>
      </div>
    </div>
  );
}

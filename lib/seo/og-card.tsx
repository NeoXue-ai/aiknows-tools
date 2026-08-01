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
        background: "#0B1018",
        color: "#EDF2F7",
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
          border: "1px solid rgba(237, 242, 247, 0.10)",
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
          color: "#2578F8",
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
            border: "2px solid #2578F8",
            borderRadius: 6,
            fontSize: 18,
            fontWeight: 700,
            color: "#2578F8",
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
          color: "#EDF2F7",
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
            color: "#8B96A7",
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
        <span>Tools</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Directories</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Categories</span>
      </div>
    </div>
  );
}

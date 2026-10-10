"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#faf9f6",
          color: "#202722",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e3e6df",
            borderRadius: "1rem",
            padding: "2.5rem 1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#2e5846",
              marginBottom: "0.5rem",
            }}
          >
            aiknows.tools
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            Something went very wrong
          </h1>
          <p
            style={{
              color: "#6b736c",
              marginBottom: "2rem",
              lineHeight: 1.7,
            }}
          >
            The application failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#2e5846",
              color: "#ffffff",
              border: 0,
              borderRadius: "999px",
              minHeight: "44px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

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
          background: "#000",
          color: "#fff",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              opacity: 0.7,
              marginBottom: "0.5rem",
            }}
          >
            aiknows.tools
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            Something went very wrong
          </h1>
          <p
            style={{
              opacity: 0.8,
              marginBottom: "2rem",
              lineHeight: 1.5,
            }}
          >
            The application failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#fff",
              color: "#000",
              border: 0,
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
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

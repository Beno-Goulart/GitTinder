"use client";

import { useEffect } from "react";

// Last-resort boundary: a throw in the root layout itself escapes app/error.tsx,
// so this replaces the entire document (it must render its own <html>/<body>).
// It can't rely on the layout's fonts, globals.css tokens or <Background>, so it's
// intentionally self-contained with inline styles in the brand palette
// (bg #0d0717, Tinder pink #ff3d7f).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[gittinder] global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0717",
          color: "#f2ecf6",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3em", color: "#ff3d7f" }}>GITTINDER</div>
          <h1 style={{ margin: "14px 0 0", fontSize: 34, fontWeight: 800, lineHeight: 1.05 }}>Ghosted</h1>
          <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.5, color: "#b3a7c0" }}>
            Something went badly wrong on the date. Reload to start over.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 28,
              height: 46,
              padding: "0 24px",
              border: 0,
              borderRadius: 12,
              background: "#ff3d7f",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            RELOAD
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: 22,
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "#7a6f85",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}

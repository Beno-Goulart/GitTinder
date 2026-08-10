"use client";

import { useEffect } from "react";
import Image from "next/image";

// Last-resort boundary: a throw in the root layout itself escapes app/error.tsx,
// so this replaces the entire document (it must render its own <html>/<body>).
// It can't rely on the layout's fonts, globals.css tokens or <Background>, so it's
// intentionally self-contained with inline styles in the paper & ink palette
// (bg #f6f1e7, ink #191521, flame #ff4655).
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
          background: "#f6f1e7",
          color: "#191521",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <Image
            src="/logo.png"
            alt="GitTinder"
            width={1162}
            height={1354}
            priority
            style={{ height: 36, width: "auto", display: "block", margin: "0 auto" }}
          />
          <h1 style={{ margin: "14px 0 0", fontSize: 34, fontWeight: 800, lineHeight: 1.05 }}>Ghosted</h1>
          <p style={{ margin: "14px 0 0", fontSize: 15.5, lineHeight: 1.5, color: "#5d5468" }}>
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
              background: "#ff4655",
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
                color: "#948a9c",
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

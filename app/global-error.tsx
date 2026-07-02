"use client";

import { useEffect } from "react";

// Only fires if the root layout itself throws — must render its own
// <html>/<body> since it replaces the whole tree, no shared styles/providers.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0C0C0C",
          color: "#FFFFFF",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong.</h1>
        <p style={{ color: "#A3A3A3", maxWidth: 400 }}>
          The app failed to load. Try reloading the page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#FF4F00",
            color: "#fff",
            padding: "0.5rem 1.25rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

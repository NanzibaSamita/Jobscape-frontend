"use client" // Error boundaries must be Client Components

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error)
  }, [error])

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              padding: "2rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Application Error</h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              A critical error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  marginBottom: "1rem",
                  textAlign: "left",
                }}
              >
                <p style={{ fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Error Details:</p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", wordBreak: "break-all" }}>{error.message}</p>
                {error.digest && (
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={reset}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

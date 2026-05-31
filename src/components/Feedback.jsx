import { COLORS } from "../styles";

// Centered loading spinner.
export function Loader({ label = "טוען…" }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" }}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" />
      <span style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted }}>{label}</span>
    </div>
  );
}

// Inline message banner (error / info).
export function Banner({ kind = "error", children }) {
  return (
    <div className={`banner ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

// Full error state with a retry action.
export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <Banner kind="error">{message}</Banner>
      {onRetry && (
        <button className="ghost-btn" style={{ marginTop: 14 }} onClick={onRetry}>
          נסה שוב
        </button>
      )}
    </div>
  );
}

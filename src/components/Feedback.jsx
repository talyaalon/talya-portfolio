import { COLORS } from "../styles";
import { useI18n } from "../i18n";

// Centered loading spinner.
export function Loader({ label }) {
  const { t } = useI18n();
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" }}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" />
      <span style={{ color: COLORS.inkSoft }}>{label || t("loading")}</span>
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
  const { t } = useI18n();
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <Banner kind="error">{message}</Banner>
      {onRetry && (
        <button className="ghost-btn" style={{ marginTop: 14 }} onClick={onRetry}>
          {t("retry")}
        </button>
      )}
    </div>
  );
}

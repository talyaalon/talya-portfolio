import { useEffect } from "react";
import { useI18n } from "../i18n";

// Accessible modal: closes on overlay click and on Escape, locks body scroll.
export default function Modal({ children, onClose, wide }) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: wide ? 680 : 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label={t("close")}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

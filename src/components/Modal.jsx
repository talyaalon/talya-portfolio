import { useCallback, useEffect, useRef } from "react";
import { useI18n } from "../i18n";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog: Escape to close, focus moved in on open, focus trapped
// while open, focus restored to the trigger on close, body scroll locked
// without the sideways jump a plain `overflow:hidden` causes on Windows.
//
// `confirmClose` guards long forms — Escape or a stray overlay click used to
// discard a half-written bilingual project with no warning.
export default function Modal({ children, onClose, wide, labelledBy, confirmClose }) {
  const { t } = useI18n();
  const sheetRef = useRef(null);
  const restoreTo = useRef(null);

  const requestClose = useCallback(() => {
    if (confirmClose && !window.confirm(typeof confirmClose === "string" ? confirmClose : t("close"))) return;
    onClose();
  }, [confirmClose, onClose, t]);

  useEffect(() => {
    restoreTo.current = document.activeElement;

    // Compensate for the scrollbar so locking the body does not shift the
    // page horizontally.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingInlineEnd;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingInlineEnd = `${gap}px`;

    // Move focus into the dialog so the keyboard does not stay behind it.
    const first = sheetRef.current?.querySelector(FOCUSABLE);
    (first || sheetRef.current)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = Array.from(sheetRef.current?.querySelectorAll(FOCUSABLE) || []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingInlineEnd = prevPadding;
      restoreTo.current?.focus?.();
    };
  }, [requestClose]);

  // Close only when the press STARTED on the overlay; otherwise selecting text
  // inside the dialog and releasing outside would close it.
  const downOnOverlay = useRef(false);

  return (
    <div
      className="overlay"
      onPointerDown={(e) => {
        downOnOverlay.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && downOnOverlay.current) requestClose();
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={sheetRef}
        style={{ maxWidth: wide ? 680 : 560 }}
      >
        <button className="close" onClick={requestClose} aria-label={t("close")}>
          <span aria-hidden="true">✕</span>
        </button>
        {children}
      </div>
    </div>
  );
}

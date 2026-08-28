import { useEffect, useRef } from "react";
import { useI18n } from "../i18n";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog: Escape to close, focus moved in on open, focus trapped
// while open, focus restored to the trigger on close, body scroll locked
// without the sideways jump a plain `overflow:hidden` causes on Windows.
//
// `confirmClose` takes the confirmation MESSAGE (not a boolean) and guards long
// forms — Escape or a stray overlay click would otherwise discard a half-written
// bilingual project with no warning.
export default function Modal({ children, onClose, wide, labelledBy, confirmClose }) {
  const { t } = useI18n();
  const sheetRef = useRef(null);
  const restoreTo = useRef(null);

  // Callers pass inline arrows, so these props are a new identity on every
  // parent render. Holding them in refs keeps the setup effect below mount-only:
  // when it depended on them, any parent re-render (a Supabase token refresh, a
  // save completing) tore the effect down — restoring focus to the trigger
  // behind the dialog — and set it up again on the ✕ button, yanking the caret
  // out of whatever field was being typed into.
  const onCloseRef = useRef(onClose);
  const confirmRef = useRef(confirmClose);
  useEffect(() => {
    onCloseRef.current = onClose;
    confirmRef.current = confirmClose;
  });

  useEffect(() => {
    const requestClose = () => {
      const message = confirmRef.current;
      if (message && !window.confirm(message)) return;
      onCloseRef.current();
    };

    restoreTo.current = document.activeElement;

    // Compensate for the scrollbar so locking the body does not shift the
    // page horizontally.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingInlineEnd;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingInlineEnd = `${gap}px`;

    // Hide the rest of the page from assistive tech while the dialog is open,
    // so a virtual cursor cannot browse the page behind it.
    const siblings = [...document.body.children].filter((el) => !el.contains(sheetRef.current));
    const restoreInert = siblings.map((el) => [el, el.getAttribute("aria-hidden"), el.inert]);
    for (const el of siblings) {
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
    }

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

      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = [...sheet.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      // If focus has escaped the sheet entirely — e.g. a cancelled overlay
      // click left it on <body> — pull it back rather than letting Tab walk
      // into the page behind the dialog.
      if (!sheet.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? lastItem : firstItem).focus();
        return;
      }
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
      for (const [el, prevAria, prevInert] of restoreInert) {
        if (prevAria === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", prevAria);
        el.inert = prevInert;
      }
      restoreTo.current?.focus?.();
    };
  }, []);

  const requestClose = () => {
    if (confirmClose && !window.confirm(confirmClose)) return;
    onClose();
  };

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

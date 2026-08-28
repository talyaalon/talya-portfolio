import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

// Appears once the visitor is well down the page. The site is one long scroll,
// and the nav is the only way back to the top on a phone.
export default function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    document.querySelector(".skip-link")?.focus?.();
  };

  return (
    <button className={"to-top" + (show ? " show" : "")} onClick={toTop} aria-label={t("backToTop")} hidden={!show}>
      <span aria-hidden="true">↑</span>
    </button>
  );
}

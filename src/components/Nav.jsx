import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n";

const LINKS = [
  ["#about", "navAbout"],
  ["#work", "navProjects"],
  ["#skills", "navSkills"],
  ["#contact", "navContact"],
];

// Public navigation. There is no admin control here by design — the admin app
// lives at /admin as a separate build.
//
// Below 720px the links used to be display:none with nothing replacing them,
// which left phone visitors with no way to reach Projects or Contact. They now
// collapse into a disclosure menu.
export default function Nav() {
  const { t, toggle } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  // Above 720px the toggle is display:none, so an open menu would be stranded
  // with aria-expanded="true" and no way to close it.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => {
      if (!mq.matches) setOpen(false);
    };
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e) => {
      if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <nav className="nav" aria-label={t("navLabel")}>
      <div className="wrap">
        <a className="brand" href="#main">
          {t("brandFirst")} <b>{t("brandLast")}</b>
        </a>

        <div className="navlinks">
          {LINKS.map(([href, key]) => (
            <a className="nl" key={href} href={href}>
              {t(key)}
            </a>
          ))}
          <button className="pill" onClick={toggle}>
            {t("langSwitch")}
          </button>

          <button
            ref={buttonRef}
            className="pill menu-btn"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? t("menuClose") : t("menuOpen")}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <div id={panelId} ref={panelRef} className={"menu-panel" + (open ? " open" : "")} hidden={!open}>
        {LINKS.map(([href, key]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {t(key)}
          </a>
        ))}
      </div>
    </nav>
  );
}

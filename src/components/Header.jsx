import { COLORS } from "../styles";
import { useI18n } from "../i18n";

// Top banner + masthead. Shows the language toggle and the admin login / logout.
export default function Header({ isAdmin, onLoginClick, onLogout }) {
  const { t, toggle, lang } = useI18n();
  return (
    <header style={{ position: "relative", overflow: "hidden" }}>
      <div className="grain" />
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          padding: "40px clamp(18px,4vw,40px) 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Assistant',sans-serif",
            fontWeight: 700,
            letterSpacing: ".5px",
            color: COLORS.accentDeep,
          }}
        >
          ● {t("brand")}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="ghost-btn"
            onClick={toggle}
            aria-label={lang === "en" ? "Switch to Hebrew" : "החלפה לאנגלית"}
          >
            {t("langSwitch")}
          </button>
          {!isAdmin ? (
            <button className="ghost-btn" onClick={onLoginClick}>
              {t("adminLogin")}
            </button>
          ) : (
            <>
              <span className="admin-pill">{t("adminMode")}</span>
              <button className="ghost-btn" onClick={onLogout}>
                {t("logout")}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "8px clamp(18px,4vw,40px) 34px" }}>
        <h1
          className="display reveal"
          dir="auto"
          style={{ fontSize: "clamp(54px,8.5vw,128px)", lineHeight: 1, margin: "10px 0 0" }}
        >
          {t("siteName")}
        </h1>
        <p
          className="reveal"
          style={{
            animationDelay: ".12s",
            fontFamily: "'Assistant',sans-serif",
            fontSize: "clamp(18px,2.4vw,25px)",
            color: COLORS.muted,
            maxWidth: 720,
            marginTop: 20,
          }}
        >
          {t("heroSubtitle")}
        </p>
        <div className="rule reveal" style={{ animationDelay: ".2s" }} />
      </div>
    </header>
  );
}

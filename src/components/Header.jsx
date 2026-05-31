import { COLORS } from "../styles";

// Top banner + masthead. Shows the admin login / logout control.
export default function Header({ isAdmin, onLoginClick, onLogout }) {
  return (
    <header style={{ position: "relative", overflow: "hidden" }}>
      <div className="grain" />
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "34px 28px 8px",
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
          ● PORTFOLIO
        </div>
        {!isAdmin ? (
          <button className="ghost-btn" onClick={onLoginClick}>
            כניסת מנהל
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="admin-pill">מצב מנהל</span>
            <button className="ghost-btn" onClick={onLogout}>
              יציאה
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 28px 30px" }}>
        <h1
          className="display reveal"
          style={{ fontSize: "clamp(48px,8vw,104px)", lineHeight: 1, margin: "10px 0 0" }}
        >
          Talya Israel
        </h1>
        <p
          className="reveal"
          style={{
            animationDelay: ".12s",
            fontFamily: "'Assistant',sans-serif",
            fontSize: "clamp(16px,2.2vw,21px)",
            color: COLORS.muted,
            maxWidth: 620,
            marginTop: 18,
          }}
        >
          הבית הדיגיטלי שמרכז את כל הפרויקטים האמיתיים שיצרתי לאחרונה — לחיצה על כל כרטיסייה חושפת את
          הסיפור המלא מאחורי הפרויקט.
        </p>
        <div className="rule reveal" style={{ animationDelay: ".2s" }} />
      </div>
    </header>
  );
}

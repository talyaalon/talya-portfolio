import React from "react";
import { CONTACT } from "../i18n";

// Without this, any render-time throw leaves a recruiter looking at a blank
// white page. React has no hook equivalent, so this stays a class component.
//
// It does not use useI18n(): if the i18n context is what broke, a hook here
// would throw again inside the boundary. The copy is therefore duplicated in
// both languages and picked from <html lang>.
const COPY = {
  en: {
    title: "Something went wrong on this page.",
    body: "Please reload. If it keeps happening, email me and I will fix it.",
    reload: "Reload the page",
    email: "Email me",
  },
  he: {
    title: "משהו השתבש בעמוד הזה.",
    body: "אפשר לרענן. אם זה חוזר, שלחו לי מייל ואתקן.",
    reload: "רענון העמוד",
    email: "שליחת מייל",
  },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const lang = typeof document !== "undefined" && document.documentElement.lang === "he" ? "he" : "en";
    const c = COPY[lang];

    return (
      <div
        dir={lang === "he" ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "#f7f3ec",
          color: "#262a2a",
          fontFamily: "'Heebo', system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "38em" }}>
          <h1 style={{ fontSize: 28, marginBottom: 12, fontWeight: 800 }}>{c.title}</h1>
          <p style={{ color: "#4a4644", marginBottom: 24, lineHeight: 1.7 }}>{c.body}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                font: "inherit", fontWeight: 600, cursor: "pointer",
                background: "#262a2a", color: "#fff", border: "none",
                padding: "11px 22px", borderRadius: 999,
              }}
            >
              {c.reload}
            </button>
            <a
              href={`mailto:${CONTACT.email}`}
              style={{
                font: "inherit", fontWeight: 600, textDecoration: "none",
                background: "#fffdfa", color: "#262a2a", border: "1px solid #e3dcd3",
                padding: "11px 22px", borderRadius: 999,
              }}
            >
              {c.email}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

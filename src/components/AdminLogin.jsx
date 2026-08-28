import { useState } from "react";
import { COLORS } from "../styles";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Admin sign-in: username + password.
//
// Supabase Auth has no native username login, so the username is combined
// with a fixed domain (VITE_ADMIN_EMAIL_DOMAIN) to form the account's email.
// That mapping lives in useAuth.signIn.
//
// The failure message is deliberately identical for "no such user" and "wrong
// password", so the form never confirms whether an account exists.
export default function AdminLogin({ signIn, configError, notOwner, onSignOut }) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (busy || configError) return;
    setErr("");
    setBusy(true);
    try {
      const error = await signIn(username, password);
      if (error) setErr(t("loginWrong"));
    } catch {
      setErr(t("loginWrong"));
    } finally {
      setBusy(false);
    }
  };

  // Misconfiguration is not a login failure — say so plainly instead of
  // rejecting correct credentials with "wrong username or password".
  if (configError) {
    return (
      <div>
        <h1 className="h-display" style={{ fontSize: 28, marginTop: 0 }}>
          {t("loginTitle")}
        </h1>
        <Banner kind="error">{t("loginMisconfigured")}</Banner>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 10 }} dir="ltr">
          {configError}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="h-display" style={{ fontSize: 28, marginTop: 0 }}>
        {t("loginTitle")}
      </h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 14, marginTop: -4 }}>{t("loginSubtitle")}</p>

      {notOwner && (
        <div style={{ margin: "14px 0" }}>
          <Banner kind="error">{t("loginNotOwner")}</Banner>
          <button type="button" className="ghost-btn" style={{ marginTop: 10 }} onClick={onSignOut}>
            {t("logout")}
          </button>
        </div>
      )}

      <label className="lbl" htmlFor="login-username">
        {t("loginUsername")}
      </label>
      <input
        id="login-username"
        className="inp"
        type="text"
        dir="ltr"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="lbl" htmlFor="login-pass">
        {t("loginPassword")}
      </label>
      <input
        id="login-pass"
        className="inp"
        type="password"
        dir="ltr"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {err && (
        <div style={{ marginTop: 14 }}>
          <Banner kind="error">{err}</Banner>
        </div>
      )}

      <button className="primary-btn" style={{ marginTop: 16, width: "100%" }} type="submit" disabled={busy}>
        {busy ? t("loginSigningIn") : t("loginEnter")}
      </button>
    </form>
  );
}

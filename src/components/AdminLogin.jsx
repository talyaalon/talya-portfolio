import { useState } from "react";
import { COLORS } from "../styles";
import { Banner } from "./Feedback";
import { Eye, EyeOff } from "./Icons";
import { useI18n } from "../i18n";
import { toAdminEmail } from "../lib/adminEmail";

// Admin sign-in: username + password.
//
// Supabase Auth has no native username login, so the username is combined
// with a fixed domain (VITE_ADMIN_EMAIL_DOMAIN) to form the account's email.
// That mapping lives in toAdminEmail; useAuth.signIn applies it.
//
// The form shows the address it is about to use. Without it the composition is
// invisible, and an autofilled "talya@gmail.com" silently became
// "talya@gmail.com@gmail.com" — reported back as a wrong password.
//
// The failure message is deliberately identical for "no such user" and "wrong
// password", so the form never confirms whether an account exists. Everything
// the form CAN establish on its own it says precisely, before asking at all.
export default function AdminLogin({ signIn, configError, notOwner, onSignOut, emailDomain }) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const previewEmail = toAdminEmail(username, emailDomain);

  const submit = async (e) => {
    e?.preventDefault();
    if (busy || configError) return;
    setErr("");

    // An empty field is not a credential the server needs to judge, and
    // relaying its one-size-fits-all rejection would blame the wrong thing.
    if (!username.trim()) {
      setErr(t("loginNoUsername"));
      return;
    }
    if (!password) {
      setErr(t("loginNoPassword"));
      return;
    }

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

      {/* One element, not a label wrapping a nested span: the address has to
          read as a single string so it cannot be split across the bidi
          boundary between a Hebrew label and a left-to-right address. */}
      {previewEmail && (
        <p className="field-hint" dir="auto">
          {t("loginSignsInAs")} {previewEmail}
        </p>
      )}

      <label className="lbl" htmlFor="login-pass">
        {t("loginPassword")}
      </label>
      <div className="pw-wrap">
        <input
          id="login-pass"
          className="inp"
          type={showPassword ? "text" : "password"}
          dir="ltr"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* type="button" is load-bearing: a bare <button> inside a <form>
            submits it, so every peek at the password would fire a sign-in. */}
        <button
          type="button"
          className="eye-btn"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? t("loginHidePassword") : t("loginShowPassword")}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff width="18" height="18" /> : <Eye width="18" height="18" />}
        </button>
      </div>

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

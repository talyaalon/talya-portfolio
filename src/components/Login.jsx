import { useState } from "react";
import { COLORS } from "../styles";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Admin login via Supabase email + password.
export default function Login({ signIn, onSuccess }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setErr("");
    setBusy(true);
    const error = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setErr(t("loginWrong"));
    } else {
      onSuccess();
    }
  };

  return (
    <div>
      <h2 className="display" style={{ fontSize: 28, marginTop: 0 }}>
        {t("loginTitle")}
      </h2>
      <p style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, fontSize: 14, marginTop: -4 }}>
        {t("loginSubtitle")}
      </p>

      <label className="lbl" htmlFor="login-email">
        {t("loginEmail")}
      </label>
      <input
        id="login-email"
        className="inp"
        type="email"
        dir="ltr"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />

      {err && (
        <div style={{ marginTop: 14 }}>
          <Banner kind="error">{err}</Banner>
        </div>
      )}

      <button
        className="primary-btn"
        style={{ marginTop: 16, width: "100%" }}
        onClick={submit}
        disabled={busy}
      >
        {busy ? t("loginSigningIn") : t("loginEnter")}
      </button>
    </div>
  );
}

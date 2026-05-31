import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS } from "../styles";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Admin account settings — change the login password (Supabase Auth).
export default function Settings({ email }) {
  const { t } = useI18n();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { kind, text }

  const save = async () => {
    if (busy) return;
    if (pass.length < 6) return setMsg({ kind: "error", text: t("setTooShort") });
    if (pass !== confirm) return setMsg({ kind: "error", text: t("setNoMatch") });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) setMsg({ kind: "error", text: t("setUpdateFailed") + error.message });
    else {
      setMsg({ kind: "info", text: t("setUpdated") });
      setPass("");
      setConfirm("");
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <h2 className="display" style={{ fontSize: 30, marginTop: 0 }}>
        {t("setTitle")}
      </h2>
      <p style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, fontSize: 14 }}>
        {t("setLoggedInAs")}
        <span dir="ltr">{email}</span>
      </p>

      <label className="lbl">{t("setNewPassword")}</label>
      <input className="inp" type="password" dir="ltr" value={pass} onChange={(e) => setPass(e.target.value)} />

      <label className="lbl">{t("setConfirmPassword")}</label>
      <input className="inp" type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

      {msg && (
        <div style={{ marginTop: 14 }}>
          <Banner kind={msg.kind}>{msg.text}</Banner>
        </div>
      )}

      <button className="primary-btn" style={{ marginTop: 16 }} onClick={save} disabled={busy}>
        {busy ? t("setSaving") : t("setUpdate")}
      </button>
    </div>
  );
}

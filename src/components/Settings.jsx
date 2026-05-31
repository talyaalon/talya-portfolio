import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS } from "../styles";
import { Banner } from "./Feedback";

// Admin account settings — change the login password (Supabase Auth).
export default function Settings({ email }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { kind, text }

  const save = async () => {
    if (busy) return;
    if (pass.length < 6) return setMsg({ kind: "error", text: "הסיסמה חייבת להיות לפחות 6 תווים." });
    if (pass !== confirm) return setMsg({ kind: "error", text: "הסיסמאות אינן תואמות." });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) setMsg({ kind: "error", text: "העדכון נכשל: " + error.message });
    else {
      setMsg({ kind: "info", text: "הסיסמה עודכנה ✓" });
      setPass("");
      setConfirm("");
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <h2 className="display" style={{ fontSize: 30, marginTop: 0 }}>
        הגדרות מנהל
      </h2>
      <p style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, fontSize: 14 }}>
        מחוברת כ־<span dir="ltr">{email}</span>
      </p>

      <label className="lbl">סיסמה חדשה</label>
      <input className="inp" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />

      <label className="lbl">אימות סיסמה</label>
      <input className="inp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

      {msg && (
        <div style={{ marginTop: 14 }}>
          <Banner kind={msg.kind}>{msg.text}</Banner>
        </div>
      )}

      <button className="primary-btn" style={{ marginTop: 16 }} onClick={save} disabled={busy}>
        {busy ? "שומר…" : "עדכון סיסמה"}
      </button>
    </div>
  );
}

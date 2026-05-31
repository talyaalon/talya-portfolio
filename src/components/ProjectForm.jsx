import { useRef, useState } from "react";
import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { fileToSmallBlob } from "../utils/image";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Add / edit a project. Logo is uploaded to Supabase Storage on save.
export default function ProjectForm({ project, onCancel, onSave, uploadLogo }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ ...project, tools: project.tools || [] });
  const [toolInput, setToolInput] = useState("");
  const [pendingBlob, setPendingBlob] = useState(null); // chosen logo, not yet uploaded
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addTool = () => {
    const t = toolInput.trim();
    if (t && !form.tools.includes(t)) set("tools", [...form.tools, t]);
    setToolInput("");
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await fileToSmallBlob(file);
      setPendingBlob(blob);
      set("logo", URL.createObjectURL(blob)); // local preview only
    } catch {
      setErr(t("formImageError"));
    }
  };

  const valid = form.name.trim() && form.short.trim();

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setErr("");
    try {
      let proj = { ...form };
      if (pendingBlob) {
        const idForPath = proj.id || `new-${Math.abs(hash(proj.name))}`;
        proj.logo = await uploadLogo(pendingBlob, idForPath);
      }
      await onSave(proj);
    } catch (e) {
      setErr(t("formSaveFailed") + (e?.message || ""));
      setBusy(false);
    }
  };

  const previewLogo = form.logo || letterLogo("?", COLORS.accent);

  return (
    <div>
      <h2 className="display" style={{ fontSize: 28, marginTop: 0 }}>
        {project._isNew ? t("formNew") : t("formEdit")}
      </h2>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 6 }}>
        <div className="card-logo" style={{ width: 64, height: 64, margin: 0 }}>
          <img src={previewLogo} alt="" />
        </div>
        <div>
          <button className="ghost-btn" type="button" onClick={() => fileRef.current.click()}>
            {t("formUploadLogo")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <p style={{ fontFamily: "'Assistant',sans-serif", fontSize: 12, color: COLORS.muted, margin: "6px 0 0" }}>
            {t("formLogoHint")}
          </p>
        </div>
      </div>

      <label className="lbl">{t("formName")}</label>
      <input className="inp" dir="auto" value={form.name} onChange={(e) => set("name", e.target.value)} />

      <label className="lbl">{t("formShort")}</label>
      <input className="inp" dir="auto" value={form.short} onChange={(e) => set("short", e.target.value)} />

      <label className="lbl">{t("formLink")}</label>
      <input
        className="inp"
        dir="ltr"
        placeholder="https://…"
        value={form.link}
        onChange={(e) => set("link", e.target.value)}
      />

      <label className="lbl">{t("formTools")}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="inp"
          style={{ flex: 1 }}
          placeholder={t("formToolsPlaceholder")}
          value={toolInput}
          onChange={(e) => setToolInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTool())}
        />
        <button className="ghost-btn" type="button" onClick={addTool}>
          {t("formAdd")}
        </button>
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {form.tools.map((tool) => (
          <span
            className="chip"
            key={tool}
            style={{ cursor: "pointer" }}
            onClick={() => set("tools", form.tools.filter((x) => x !== tool))}
          >
            {tool} ✕
          </span>
        ))}
      </div>

      <label className="lbl">{t("formReadme")}</label>
      <textarea
        className="inp"
        dir="auto"
        rows={7}
        style={{ resize: "vertical", fontFamily: "'Assistant',sans-serif" }}
        placeholder={t("formReadmePlaceholder")}
        value={form.readme}
        onChange={(e) => set("readme", e.target.value)}
      />

      {err && (
        <div style={{ marginTop: 14 }}>
          <Banner kind="error">{err}</Banner>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          className="primary-btn"
          disabled={!valid || busy}
          style={{ opacity: valid && !busy ? 1 : 0.5 }}
          onClick={submit}
        >
          {busy ? t("formSaving") : t("formSave")}
        </button>
        <button className="ghost-btn" type="button" onClick={onCancel} disabled={busy}>
          {t("formCancel")}
        </button>
      </div>
    </div>
  );
}

// Tiny deterministic hash for a storage path when the project has no id yet.
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

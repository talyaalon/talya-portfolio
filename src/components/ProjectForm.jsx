import { useRef, useState } from "react";
import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { fileToSmallBlob } from "../utils/image";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Add / edit a project. Text content is bilingual (English + Hebrew); the logo
// is uploaded to Supabase Storage on save.
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
    const tool = toolInput.trim();
    if (tool && !form.tools.includes(tool)) set("tools", [...form.tools, tool]);
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

  const has = (s) => Boolean((s || "").trim());
  const valid = (has(form.nameEn) || has(form.nameHe)) && (has(form.shortEn) || has(form.shortHe));

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setErr("");
    try {
      let proj = { ...form };
      if (pendingBlob) {
        const idForPath = proj.id || `new-${Math.abs(hash(proj.nameEn || proj.nameHe || "x"))}`;
        proj.logo = await uploadLogo(pendingBlob, idForPath);
      }
      await onSave(proj);
    } catch (e) {
      setErr(t("formSaveFailed") + (e?.message || ""));
      setBusy(false);
    }
  };

  const previewLogo = form.logo || letterLogo("?", COLORS.accent);

  // A pair of inputs (English + Hebrew) for one logical field. This is a plain
  // helper that is CALLED inline (not rendered as <Component/>), so the inputs
  // are part of the form's own element tree and never remount on keystroke.
  const oneField = (fieldKey, dir, textarea) =>
    textarea ? (
      <textarea
        className="inp"
        dir={dir}
        rows={6}
        style={{ resize: "vertical", fontFamily: "'Assistant',sans-serif" }}
        value={form[fieldKey] || ""}
        onChange={(e) => set(fieldKey, e.target.value)}
      />
    ) : (
      <input className="inp" dir={dir} value={form[fieldKey] || ""} onChange={(e) => set(fieldKey, e.target.value)} />
    );

  const bilingualField = (label, fieldEn, fieldHe, textarea) => (
    <>
      <label className="lbl">
        {label} <span style={{ color: COLORS.muted }}>{t("suffixEn")}</span>
      </label>
      {oneField(fieldEn, "ltr", textarea)}
      <label className="lbl">
        {label} <span style={{ color: COLORS.muted }}>{t("suffixHe")}</span>
      </label>
      {oneField(fieldHe, "rtl", textarea)}
    </>
  );

  return (
    <div>
      <h2 className="display" style={{ fontSize: 28, marginTop: 0 }}>
        {project._isNew ? t("formNew") : t("formEdit")}
      </h2>

      <Banner kind="info">{t("formBilingualHint")}</Banner>

      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "14px 0 6px" }}>
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

      {bilingualField(t("formName"), "nameEn", "nameHe")}
      {bilingualField(t("formShort"), "shortEn", "shortHe")}

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

      {bilingualField(t("formReadme"), "readmeEn", "readmeHe", true)}

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

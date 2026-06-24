import { useRef, useState } from "react";
import { COLORS } from "../styles";
import { fileToSmallBlob } from "../utils/image";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";

// Add / edit a project. Text content is bilingual (English + Hebrew).
export default function ProjectForm({ project, onCancel, onSave, uploadLogo }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ ...project, tools: project.tools || [] });
  const [toolInput, setToolInput] = useState("");
  const [pendingBlob, setPendingBlob] = useState(null);
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
      set("logo", URL.createObjectURL(blob));
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
      const proj = { ...form };
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

  const oneField = (fieldKey, dir, textarea) =>
    textarea ? (
      <textarea className="inp" dir={dir} rows={6} style={{ resize: "vertical" }}
        value={form[fieldKey] || ""} onChange={(e) => set(fieldKey, e.target.value)} />
    ) : (
      <input className="inp" dir={dir} value={form[fieldKey] || ""} onChange={(e) => set(fieldKey, e.target.value)} />
    );

  const bilingual = (label, en, he, textarea) => (
    <>
      <label className="lbl">{label} <span style={{ color: COLORS.inkSoft }}>{t("suffixEn")}</span></label>
      {oneField(en, "ltr", textarea)}
      <label className="lbl">{label} <span style={{ color: COLORS.inkSoft }}>{t("suffixHe")}</span></label>
      {oneField(he, "rtl", textarea)}
    </>
  );

  const single = (label, key, placeholder) => (
    <>
      <label className="lbl">{label}</label>
      <input className="inp" dir="ltr" placeholder={placeholder} value={form[key] || ""} onChange={(e) => set(key, e.target.value)} />
    </>
  );

  return (
    <div>
      <h2 style={{ fontSize: 26, marginTop: 0, color: COLORS.ink }}>
        {project._isNew ? t("formNew") : t("formEdit")}
      </h2>
      <Banner kind="info">{t("formBilingualHint")}</Banner>

      {bilingual(t("formName"), "nameEn", "nameHe")}
      {bilingual(t("formMeta"), "metaEn", "metaHe")}
      {bilingual(t("formShort"), "shortEn", "shortHe")}
      {bilingual(t("formResult"), "resultEn", "resultHe")}

      {single(t("formLink"), "link", "https://…")}
      {single(t("formRepo"), "repo", "https://github.com/…")}
      {single(t("formDemo"), "demo", "https://…")}

      <label className="lbl">{t("formTools")}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="inp" style={{ flex: 1 }} placeholder={t("formToolsPlaceholder")}
          value={toolInput} onChange={(e) => setToolInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTool())} />
        <button className="ghost-btn" type="button" onClick={addTool}>{t("formAdd")}</button>
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {form.tools.map((tool) => (
          <span className="chip" key={tool} style={{ cursor: "pointer" }}
            onClick={() => set("tools", form.tools.filter((x) => x !== tool))}>
            {tool} ✕
          </span>
        ))}
      </div>

      {bilingual(t("formReadme"), "readmeEn", "readmeHe", true)}

      {err && <div style={{ marginTop: 14 }}><Banner kind="error">{err}</Banner></div>}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="primary-btn" disabled={!valid || busy} onClick={submit}>
          {busy ? t("formSaving") : t("formSave")}
        </button>
        <button className="ghost-btn" type="button" onClick={onCancel} disabled={busy}>{t("formCancel")}</button>
      </div>
    </div>
  );
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

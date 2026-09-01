import { useId, useRef, useState } from "react";
import { COLORS } from "../styles";
import { fileToSmallBlob } from "../utils/image";
import { Banner } from "./Feedback";
import { useI18n } from "../i18n";
import { STATUSES, invalidUrlFields } from "../lib/projectRow";

// Add / edit a project. Text content is bilingual (English + Hebrew).
//
// Every control has an id and its label an htmlFor: without that pairing a
// screen reader announces "edit text, blank" for the whole form.
export default function ProjectForm({ project, onCancel, onSave, uploadLogo }) {
  const { t } = useI18n();
  const uid = useId();
  const [form, setForm] = useState({ ...project, tools: project.tools || [] });
  const [toolInput, setToolInput] = useState("");
  const [pendingBlob, setPendingBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fieldId = (key) => `${uid}-${key}`;

  const addTool = () => {
    const tool = toolInput.trim();
    if (tool && !form.tools.includes(tool)) set("tools", [...form.tools, tool]);
    setToolInput("");
  };

  // The file input this handler needs simply did not exist in the JSX, so the
  // whole logo pipeline — this function, fileToSmallBlob, uploadLogo and the
  // storage bucket — was unreachable code.
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await fileToSmallBlob(file);
      setPendingBlob(blob);
      set("logo", URL.createObjectURL(blob));
      setErr("");
    } catch {
      setErr(t("formImageError"));
    }
  };

  const has = (s) => Boolean((s || "").trim());
  const valid = (has(form.nameEn) || has(form.nameHe)) && (has(form.shortEn) || has(form.shortHe));

  const submit = async (e) => {
    e?.preventDefault();
    if (!valid || busy) return;

    const badUrls = invalidUrlFields(form);
    if (badUrls.length) {
      setErr(t("formBadUrl"));
      return;
    }

    setBusy(true);
    setErr("");
    try {
      const proj = { ...form };
      if (pendingBlob) {
        const idForPath = proj.id || `new-${Math.abs(hash(proj.nameEn || proj.nameHe || "x"))}`;
        proj.logo = await uploadLogo(pendingBlob, idForPath);
      }
      await onSave(proj);
    } catch (e2) {
      setErr(t("formSaveFailed") + (e2?.message || ""));
      setBusy(false);
    }
  };

  const oneField = (key, dir, textarea) =>
    textarea ? (
      <textarea
        id={fieldId(key)}
        className="inp"
        dir={dir}
        rows={6}
        style={{ resize: "vertical" }}
        value={form[key] || ""}
        onChange={(e) => set(key, e.target.value)}
      />
    ) : (
      <input
        id={fieldId(key)}
        className="inp"
        dir={dir}
        value={form[key] || ""}
        onChange={(e) => set(key, e.target.value)}
      />
    );

  const bilingual = (label, en, he, textarea) => (
    <>
      <label className="lbl" htmlFor={fieldId(en)}>
        {label} <span style={{ color: COLORS.inkSoft }}>{t("suffixEn")}</span>
      </label>
      {oneField(en, "ltr", textarea)}
      <label className="lbl" htmlFor={fieldId(he)}>
        {label} <span style={{ color: COLORS.inkSoft }}>{t("suffixHe")}</span>
      </label>
      {oneField(he, "rtl", textarea)}
    </>
  );

  const single = (label, key, placeholder, type = "text") => (
    <>
      <label className="lbl" htmlFor={fieldId(key)}>
        {label}
      </label>
      <input
        id={fieldId(key)}
        className="inp"
        dir="ltr"
        type={type}
        placeholder={placeholder}
        value={form[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </>
  );

  return (
    <form onSubmit={submit}>
      <h2 id="project-form-title" style={{ fontSize: 26, marginTop: 0, color: COLORS.ink }}>
        {project._isNew ? t("formNew") : t("formEdit")}
      </h2>
      <Banner kind="info">{t("formBilingualHint")}</Banner>

      {bilingual(t("formName"), "nameEn", "nameHe")}
      {bilingual(t("formMeta"), "metaEn", "metaHe")}
      {bilingual(t("formRole"), "roleEn", "roleHe")}
      {bilingual(t("formShort"), "shortEn", "shortHe")}
      {bilingual(t("formResult"), "resultEn", "resultHe")}
      {bilingual(t("formImpact"), "impactEn", "impactHe")}

      <label className="lbl" htmlFor={fieldId("status")}>
        {t("formStatus")}
      </label>
      <select
        id={fieldId("status")}
        className="inp"
        value={form.status || ""}
        onChange={(e) => set("status", e.target.value)}
      >
        <option value="">{t("formStatusNone")}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(statusOptionKey(s))}
          </option>
        ))}
      </select>

      {single(t("formLink"), "link", "https://…")}
      {single(t("formRepo"), "repo", "https://github.com/…")}
      {/* A company repo has a URL that is useful to keep and useless to
          publish, so it is stored and marked private rather than deleted. */}
      <label
        className="lbl"
        htmlFor={fieldId("repoPrivate")}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <input
          id={fieldId("repoPrivate")}
          type="checkbox"
          checked={Boolean(form.repoPrivate)}
          onChange={(e) => set("repoPrivate", e.target.checked)}
        />
        {t("formRepoPrivate")}
      </label>
      <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "6px 0 0" }}>
        {t("formRepoPrivateHint")}
      </p>
      {single(`${t("formDemo")} ${t("suffixEn")}`, "demoEn", "https://…")}
      {single(`${t("formDemo")} ${t("suffixHe")}`, "demoHe", "https://…")}
      {single(t("formEmbed"), "embedUrl", "https://www.canva.com/design/…/view")}
      <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "6px 0 0" }}>
        {t("formEmbedHint")}
      </p>
      {single(t("formScreenshot"), "screenshot", "https://…")}
      {single(t("formPosition"), "position", "0", "number")}

      <label className="lbl" htmlFor={fieldId("logo")}>
        {t("formUploadLogo")}
      </label>
      <input
        id={fieldId("logo")}
        ref={fileRef}
        className="inp"
        type="file"
        accept="image/*"
        onChange={onFile}
      />
      <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "6px 0 0" }}>{t("formLogoHint")}</p>
      {form.logo && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <img
            src={form.logo}
            alt=""
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
          />
          {pendingBlob && <span style={{ fontSize: 13, color: COLORS.inkSoft }}>{t("formLogoChosen")}</span>}
        </div>
      )}

      <label className="lbl" htmlFor={fieldId("tools")}>
        {t("formTools")}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id={fieldId("tools")}
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
          <button
            type="button"
            className="chip chip-removable"
            key={tool}
            onClick={() => set("tools", form.tools.filter((x) => x !== tool))}
            aria-label={`${t("formRemoveTool")} ${tool}`}
          >
            {tool} <span aria-hidden="true">✕</span>
          </button>
        ))}
      </div>

      {bilingual(t("formReadme"), "readmeEn", "readmeHe", true)}

      {err && (
        <div style={{ marginTop: 14 }}>
          <Banner kind="error">{err}</Banner>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="primary-btn" type="submit" disabled={!valid || busy}>
          {busy ? t("formSaving") : t("formSave")}
        </button>
        <button className="ghost-btn" type="button" onClick={onCancel} disabled={busy}>
          {t("formCancel")}
        </button>
      </div>
    </form>
  );
}

function statusOptionKey(status) {
  if (status === "production") return "formStatusProduction";
  if (status === "prototype") return "formStatusPrototype";
  if (status === "award") return "formStatusAward";
  return "formStatusArchived";
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

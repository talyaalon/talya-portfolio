import { useId, useState } from "react";
import { COLORS } from "../styles";
import { useI18n } from "../i18n";
import { Banner, Loader } from "./Feedback";
import { FileText } from "./Icons";
import { MAX_CV_BYTES } from "../hooks/useSiteSettingsAdmin";

// The CV, one file per language.
//
// The file is checked HERE rather than on the way back from Storage: a .docx
// or a 30 MB scan fails server-side with a message written for developers,
// after the upload has already been sent.
export default function CvPanel({ settings, needsMigration, error, onUpload, onRemove }) {
  const { t } = useI18n();
  // Which language is uploading, and the one message on screen. Keyed by
  // language so a failure on one file cannot look like a failure on the other.
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null); // { lang, kind, text }

  // Nowhere to record the URL: uploading would put a file in Storage that no
  // visitor could ever reach, so the form is not offered at all.
  if (needsMigration) {
    return <Banner kind="error">{t("cvNeedsMigration")}</Banner>;
  }

  if (settings === null) return <Loader />;

  const reject = (file) => {
    // Both checks, because the two disagree in practice: some systems hand
    // over an empty type for a .pdf, and a renamed .docx keeps its own.
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) return t("cvNotPdf");
    if (file.size > MAX_CV_BYTES) return t("cvTooBig");
    return null;
  };

  const choose = (lang) => async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const bad = reject(file);
    if (bad) {
      input.value = ""; // let the same file be chosen again after a fix
      setMsg({ lang, kind: "error", text: bad });
      return;
    }

    setBusy(lang);
    setMsg(null);
    try {
      await onUpload(file, lang);
      setMsg({ lang, kind: "info", text: t("cvUploaded") });
    } catch (err) {
      setMsg({ lang, kind: "error", text: t("cvUploadFailed") + (err?.message || "") });
    } finally {
      input.value = "";
      setBusy("");
    }
  };

  const remove = (lang) => async () => {
    if (!window.confirm(t("cvRemoveConfirm"))) return;
    setBusy(lang);
    setMsg(null);
    try {
      await onRemove(lang);
      setMsg({ lang, kind: "info", text: t("cvRemoved") });
    } catch (err) {
      setMsg({ lang, kind: "error", text: t("cvRemoveFailed") + (err?.message || "") });
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, marginTop: 0, color: COLORS.ink }}>{t("cvTitle")}</h2>
      <p style={{ maxWidth: 620, marginTop: 0 }}>{t("cvIntro")}</p>

      {error && <Banner kind="error">{t("cvLoadFailed") + error}</Banner>}

      <Slot
        lang="en"
        label={t("cvLabelEn")}
        url={settings.cvEn}
        busy={busy === "en"}
        disabled={Boolean(busy)}
        msg={msg?.lang === "en" ? msg : null}
        onChoose={choose("en")}
        onRemove={remove("en")}
      />
      <Slot
        lang="he"
        label={t("cvLabelHe")}
        url={settings.cvHe}
        busy={busy === "he"}
        disabled={Boolean(busy)}
        msg={msg?.lang === "he" ? msg : null}
        onChoose={choose("he")}
        onRemove={remove("he")}
      />
    </div>
  );
}

function Slot({ lang, label, url, busy, disabled, msg, onChoose, onRemove }) {
  const { t } = useI18n();
  const uid = useId();
  const inputId = `${uid}-cv-${lang}`;

  return (
    <section style={{ marginTop: 26 }}>
      <label className="lbl" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="inp"
        type="file"
        accept="application/pdf,.pdf"
        disabled={disabled}
        onChange={onChoose}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        {busy ? (
          <span style={{ fontSize: 14, color: COLORS.inkSoft }}>{t("cvUploading")}</span>
        ) : url ? (
          <>
            <span style={{ fontSize: 14, color: COLORS.inkSoft }}>{t("cvOnSite")}</span>
            {/* The stored URL is opened as-is. It carries a ?v= stamp from the
                upload, so this is the file a visitor gets right now — not a
                cached earlier one. */}
            <a className="ghost-btn" href={url} target="_blank" rel="noopener noreferrer">
              <FileText aria-hidden="true" /> <span>{t("cvView")}</span>
            </a>
            <button type="button" className="mini danger" onClick={onRemove} disabled={disabled}>
              {t("cvRemove")}
            </button>
          </>
        ) : (
          <span style={{ fontSize: 14, color: COLORS.inkSoft }}>{t("cvNone")}</span>
        )}
      </div>

      {msg && (
        <div style={{ marginTop: 12 }}>
          <Banner kind={msg.kind}>{msg.text}</Banner>
        </div>
      )}
    </section>
  );
}

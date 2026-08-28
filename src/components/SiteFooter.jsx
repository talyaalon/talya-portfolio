import { useI18n, CONTACT } from "../i18n";

// Rendered as a SIBLING of <main>, not inside it.
//
// <footer> only maps to the contentinfo landmark when it is scoped to <body>.
// Nested inside main/section it is exposed as a plain generic container, so the
// contact details in it would be unreachable by landmark navigation — which is
// exactly where this markup used to live.
export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span dir="auto">{t("contactLocation")}</span>
        <span aria-hidden="true"> · </span>
        <a className="ltr" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
        <span aria-hidden="true"> · </span>
        <a className="ltr" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        <span aria-hidden="true"> · </span>
        <span>© {year} {t("siteName")}</span>
      </div>
    </footer>
  );
}

import { useI18n } from "../i18n";
import { pick } from "../utils/localized";
import { preferWebp } from "../utils/screenshot";
import { Image } from "./Icons";

// ============================================================
//  One screenshot slot on a case study page.
//
//  ############################################################
//  ##  REDACT BEFORE COMMITTING AN IMAGE INTO THIS SLOT.     ##
//  ############################################################
//
//  The screenshots that go here are of a LIVE PRODUCTION admin area. The
//  customer list, the order detail views and the courier views show REAL
//  NAMES, EMAIL ADDRESSES AND PHONE NUMBERS belonging to the chain's
//  customers.
//
//  Redaction has to happen in the image file itself - paint the pixels out.
//  Not a CSS blur (the original bytes are still downloaded), not a crop done
//  with object-fit (the rest of the image is still in the file), and not a
//  small export (the text is often still legible, and the full-size version
//  is what the lightbox opens).
//
//  A committed image cannot be withdrawn. It stays in the git history, in
//  every clone of the repository and in the CDN cache long after a later
//  commit deletes it.
//
//  The slot renders an empty frame until `src` is set, so the page is
//  complete and correctly laid out with no image in it at all. There is no
//  deadline pressure to paste one in unredacted.
// ============================================================
export default function CaseStudyShot({ shot }) {
  const { t, lang } = useI18n();
  const alt = pick(shot.alt, lang);
  const caption = pick(shot.caption, lang);

  return (
    <figure className="cs-shot">
      {/* aspectRatio is set on the frame whether or not there is an image, so
          dropping a file in later does not push the rest of the page down. */}
      <div className="cs-shot-frame" style={{ aspectRatio: shot.aspect }}>
        {shot.src ? (
          <img {...preferWebp(shot.src)} alt={alt} loading="lazy" decoding="async" />
        ) : (
          <div className="cs-shot-empty">
            <Image aria-hidden="true" />
            <span>{t("csShotPending")}</span>
          </div>
        )}
      </div>
      <figcaption dir="auto">{caption}</figcaption>
    </figure>
  );
}

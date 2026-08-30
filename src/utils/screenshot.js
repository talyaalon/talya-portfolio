// Screenshot URLs are stored in the database and point at the original
// PNG/JPG files. Two directories are in play: /shots/ (what the database
// actually references — desktop and mobile captures of each project) and
// /screenshots/ (a newer set that no row currently points at).
//
// Rather than rewrite database rows (and break any URL that has no converted
// sibling), the UI asks for the .webp version first and falls back to the
// stored URL if that 404s. Result: ~440 KB transferred, nothing can break.
//
// Once every row is confirmed to have a .webp sibling, the originals can be
// deleted from public/ and this helper simplified away.

const LOCAL_IMAGE = /^\/(shots|screenshots)\/[^?#]+\.(png|jpe?g)$/i;

export function webpVariant(url) {
  if (typeof url !== "string") return null;
  if (!LOCAL_IMAGE.test(url)) return null;
  return url.replace(/\.(png|jpe?g)$/i, ".webp");
}

// Returns the URL to try first, plus an onError handler that reverts to the
// original exactly once (guarding against an infinite error loop).
export function preferWebp(url) {
  const webp = webpVariant(url);
  if (!webp) return { src: url, onError: undefined };
  return {
    src: webp,
    onError: (e) => {
      if (e.currentTarget.dataset.fellBack === "1") return;
      e.currentTarget.dataset.fellBack = "1";
      e.currentTarget.src = url;
    },
  };
}

// Which phone capture belongs to a desktop capture.
//
// The convention is <name>-desktop.png beside <name>-mobile.png. Air Manage's
// row predates it and stores a bare "/shots/airmanage.png", so deriving the
// phone capture by looking for "-desktop." alone left that card showing a
// laptop on its own while /shots/airmanage-mobile.png sat in the same
// directory, unused. Both spellings therefore resolve to the same sibling.
//
// This only names a candidate; it cannot know the file exists. The caller must
// treat a capture that fails to load as "this project has no phone capture"
// rather than rendering an empty phone.
export function mobileVariant(url) {
  if (typeof url !== "string") return null;
  if (!LOCAL_IMAGE.test(url)) return null;
  if (/-mobile\.[a-z0-9]+$/i.test(url)) return null;
  if (url.includes("-desktop.")) return url.replace("-desktop.", "-mobile.");
  return url.replace(/(\.[a-z0-9]+)$/i, "-mobile$1");
}

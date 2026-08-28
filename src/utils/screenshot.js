// Screenshot URLs are stored in the database, so they still point at the
// original PNG/JPG files in public/screenshots/. Those were 4.4 MB in total
// and rendered into a ~550px box.
//
// Rather than rewrite database rows (and break any URL that has no converted
// sibling), the UI asks for the .webp version first and falls back to the
// stored URL if that 404s. Result: ~440 KB transferred, nothing can break.
//
// Once every row is confirmed to have a .webp sibling, the originals can be
// deleted from public/ and this helper simplified away.

const LOCAL_IMAGE = /^\/screenshots\/[^?#]+\.(png|jpe?g)$/i;

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

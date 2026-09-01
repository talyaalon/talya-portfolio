// ============================================================
//  Canva share links -> embeddable frame URLs.
//
//  A share link looks like
//    https://www.canva.com/design/<designId>/<token>/view?utm_content=...
//  and Canva serves the same design inside a frame when the query is exactly
//  `embed`. The utm tail is dropped: it is share-tracking, not addressing.
//
//  /view and /watch are NOT interchangeable. /view is the deck, /watch is a
//  recording with its player, so the mode is preserved rather than normalised
//  — rewriting one into the other silently shows the visitor a different thing
//  than the owner linked.
//
//  Anything unrecognised returns null and the caller renders an ordinary link
//  instead. That is the whole point of returning null rather than a best
//  guess: a wrong embed URL is a frame that stays blank forever, with nothing
//  on screen to explain why.
// ============================================================

const HOSTS = new Set(["canva.com", "www.canva.com"]);

// /edit is deliberately absent. It is a real Canva URL shape, and framing it
// would hand a visitor the editor for the owner's design.
const EMBEDDABLE_MODES = new Set(["view", "watch"]);

export function canvaEmbed(url) {
  const raw = String(url ?? "").trim();
  if (!raw) return null;

  let u;
  try {
    u = new URL(raw);
  } catch {
    return null; // not a URL at all
  }

  // https only. An http frame inside an https page is blocked as mixed
  // content, so an http link is not embeddable whatever Canva would serve.
  if (u.protocol !== "https:") return null;
  if (!HOSTS.has(u.hostname)) return null;

  const parts = u.pathname.split("/").filter(Boolean); // design/<id>/<token>/<mode>
  if (parts.length !== 4 || parts[0] !== "design") return null;

  const [, id, token, mode] = parts;
  if (!EMBEDDABLE_MODES.has(mode)) return null;

  return `${u.origin}/design/${id}/${token}/${mode}?embed`;
}

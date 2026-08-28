// ============================================================
//  Server-side analytics collector (Netlify Function v2).
//
//  The browser sends only: event_type, project_id, referrer.
//  Everything sensitive/useful is derived HERE, server-side:
//   - country / city  → from Netlify's geo lookup on the visitor IP
//   - device type     → parsed from the User-Agent header
//   - timestamp       → server clock
//
//  We never receive or store any personal identity. A visitor's email
//  address is not exposed to any website in the browser, so it is never
//  collected. We only persist anonymous, aggregate-friendly fields.
//
//  Writes use the SECRET service_role key, which exists ONLY in Netlify's
//  environment — never in the client bundle or the git repo. Because that key
//  bypasses RLS, this endpoint is the one place where an unauthenticated
//  caller can cause a database write, so it validates aggressively.
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Very small in-memory limiter.
//
// Scope, stated plainly: this Map lives in one warm function instance. Netlify
// runs many, so the real ceiling is MAX_PER_WINDOW * instances, not
// MAX_PER_WINDOW. It blunts casual flooding from a single client; it is not a
// guarantee and must not be described as one. A real cap needs shared state
// (Netlify Blobs, or a counter table in Postgres).
const HITS = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function rateLimited(key) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now - rec.start > WINDOW_MS) {
    HITS.set(key, { start: now, count: 1 });
    if (HITS.size > 5000) HITS.clear(); // bound memory
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response("Server not configured", { status: 500 });
  }

  // Only accept events that originate from this site. Without this, anyone can
  // curl the endpoint and pollute the stats. If ALLOWED_ORIGINS is unset the
  // check is skipped, so an existing deploy keeps working until it is set.
  const allowed = allowedOrigins();
  if (allowed.length) {
    const origin = req.headers.get("origin");
    // Per Fetch, an Origin header is attached to every request whose method is
    // not GET/HEAD — same-origin included, sendBeacon included. So a POST that
    // arrives WITHOUT one did not come from a browser page, and tolerating that
    // case (as an earlier version did) removed the control entirely: `curl -X
    // POST .../api/track` sent no Origin and sailed through.
    if (origin === null || !allowed.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Deliberately NOT falling back to an x-nf-client-connection-ip header: that
  // header is client-supplied, so a caller could mint a fresh bucket per
  // request and defeat the limiter entirely. context.ip is set by Netlify.
  if (rateLimited(context.ip || "unknown")) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let payload = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const type = payload.event_type;
  if (!["view", "open", "click"].includes(type)) {
    return new Response("Bad event", { status: 400 });
  }

  // An unvalidated project_id reached Postgres and produced a 400 with the raw
  // database error echoed back to the caller.
  const projectId = typeof payload.project_id === "string" && UUID_RE.test(payload.project_id)
    ? payload.project_id
    : null;

  const geo = context.geo || {};
  const ua = req.headers.get("user-agent") || "";

  const row = {
    event_type: type,
    project_id: projectId,
    // Trim referrer to a hostname-ish string; keep it short and harmless.
    referrer: cleanReferrer(payload.referrer),
    country: geo.country?.name || geo.country?.code || null,
    city: geo.city || null,
    device: deviceFromUA(ua),
    // created_at is filled by the DB default (now()).
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      // Log the detail; do not hand database internals to an anonymous caller.
      console.error("analytics insert failed:", res.status, await res.text());
      return new Response("Upstream error", { status: 502 });
    }
  } catch (e) {
    console.error("analytics upstream error:", e);
    return new Response("Upstream error", { status: 502 });
  }

  // 204: nothing to return; keeps sendBeacon happy.
  return new Response(null, { status: 204 });
};

export const config = {
  path: "/api/track",
};

const MAX_REFERRER = 300;

export function cleanReferrer(ref) {
  if (!ref || typeof ref !== "string") return null;
  // The cap has to apply to the parsed branch too. A 200 KB string that happens
  // to be a valid URL parses fine, and only the catch branch used to truncate —
  // so an attacker-controlled referrer went into the database at full length.
  try {
    const u = new URL(ref);
    return (u.origin + u.pathname).slice(0, MAX_REFERRER);
  } catch {
    return ref.slice(0, MAX_REFERRER);
  }
}

// Language-neutral tokens. This used to store Hebrew words directly in the
// database, which baked one language into the data and made the column
// unusable from the English UI.
export function deviceFromUA(ua) {
  const s = String(ua || "").toLowerCase();
  if (!s) return null;
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|iphone|android/.test(s)) return "mobile";
  return "desktop";
}

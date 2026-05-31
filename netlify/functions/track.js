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
//  environment — never in the client bundle or the git repo.
// ============================================================

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response("Server not configured", { status: 500 });
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

  const geo = context.geo || {};
  const ua = req.headers.get("user-agent") || "";

  const row = {
    event_type: type,
    project_id: payload.project_id || null,
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
      const text = await res.text();
      return new Response("DB error: " + text, { status: 502 });
    }
  } catch (e) {
    return new Response("Upstream error", { status: 502 });
  }

  // 204: nothing to return; keeps sendBeacon happy.
  return new Response(null, { status: 204 });
};

export const config = {
  path: "/api/track",
};

function cleanReferrer(ref) {
  if (!ref || typeof ref !== "string") return null;
  try {
    return new URL(ref).origin + new URL(ref).pathname;
  } catch {
    return ref.slice(0, 300);
  }
}

function deviceFromUA(ua) {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "טאבלט";
  if (/mobi|iphone|android/.test(s)) return "מובייל";
  if (!s) return "לא ידוע";
  return "מחשב";
}

// ============================================================
//  Read-only data access for the PUBLIC site — plain REST, no SDK.
//
//  The public site needs exactly one thing from Supabase: a SELECT on
//  `projects`, which RLS exposes to anonymous callers. Pulling in
//  @supabase/supabase-js for that would drag its whole auth module into the
//  visitor bundle — including signInWithPassword and the rest of the password
//  vocabulary — which is precisely what the public/admin split exists to
//  prevent. (scripts/verify-bundle.mjs enforces this.)
//
//  It is also a lot smaller: PostgREST is just a URL.
//
//  The admin app still uses the real SDK (src/lib/supabaseClient.js), because
//  it genuinely needs sessions, storage uploads and writes.
// ============================================================

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

// Ordered the same way the app has always ordered them: manual position
// first, newest first within a position.
const QUERY = "select=*&order=position.asc,created_at.desc";

export async function fetchProjects({ signal } = {}) {
  if (!isConfigured) throw new Error("missing-config");

  const res = await fetch(`${url}/rest/v1/projects?${QUERY}`, {
    method: "GET",
    signal,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    // Log the detail for the owner; the caller shows a neutral message.
    const detail = await res.text().catch(() => "");
    console.error("projects fetch failed:", res.status, detail);
    throw new Error(`projects-fetch-failed-${res.status}`);
  }

  return res.json();
}

// ============================================================
//  Site settings (today: the CV).
//
//  A separate, tiny request rather than something folded into the projects
//  call: they are different tables, and a settings table that is not there yet
//  must not take the project list down with it.
// ============================================================

export async function fetchSiteSettings({ signal } = {}) {
  if (!isConfigured) throw new Error("missing-config");

  const res = await fetch(`${url}/rest/v1/site_settings?select=key,value`, {
    method: "GET",
    signal,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });

  // The table arrives with supabase/migrations/004-site-settings.sql. Until it
  // has been run, PostgREST answers 404 for the whole relation. That is a
  // known, temporary state -- "no CV uploaded yet" looks the same to a visitor
  // -- so it degrades to no settings instead of an error, and says so in the
  // console for the owner. Any OTHER status is a real failure and throws.
  if (res.status === 404) {
    console.warn(
      "site_settings table not found — run supabase/migrations/004-site-settings.sql"
    );
    return [];
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("site settings fetch failed:", res.status, detail);
    throw new Error(`site-settings-fetch-failed-${res.status}`);
  }

  return res.json();
}

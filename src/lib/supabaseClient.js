import { createClient } from "@supabase/supabase-js";

// These two values are PUBLIC by design:
//  - the URL is just your project address
//  - the publishable key is a public client key, protected by Row Level Security.
// The secret service_role key is NEVER used here — it lives only in the
// Netlify Function environment.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Surfaced clearly so a missing .env produces a friendly error, not a crash.
export const isConfigured = Boolean(url && anonKey);

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Supabase's /auth/v1/recover and /auth/v1/otp endpoints are live on
        // the project host no matter what this app calls. With the default
        // `detectSessionInUrl: true`, any recovery or magic-link fragment that
        // landed on the site would be silently exchanged for a live admin
        // session — a leaked link becomes a login. There is no in-app recovery
        // flow, so the app should never consume a token from the URL.
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  : null;

export const STORAGE_BUCKET = "logos";

// The Supabase user id of the site owner. Every other account — including one
// a stranger self-registered — is treated as an ordinary visitor.
// Not a secret: it is already inside any JWT the owner holds.
export const OWNER_USER_ID = import.meta.env.VITE_ADMIN_USER_ID;

// Supabase Auth is email-based and has no native username login. The admin
// login takes a username and appends this domain to form the account's email.
export const ADMIN_EMAIL_DOMAIN = import.meta.env.VITE_ADMIN_EMAIL_DOMAIN;

// No hard fallbacks here on purpose: a missing value must fail loudly rather
// than quietly granting or denying access on a default.
export const adminConfigError = (() => {
  const missing = [];
  // Supabase itself must be configured too, or `supabase` is null and the
  // login form would render, accept a submission, and throw on a null deref.
  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!anonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  if (!OWNER_USER_ID) missing.push("VITE_ADMIN_USER_ID");
  if (!ADMIN_EMAIL_DOMAIN) missing.push("VITE_ADMIN_EMAIL_DOMAIN");
  return missing.length ? `Missing environment variables: ${missing.join(", ")}` : null;
})();

import { createClient } from "@supabase/supabase-js";

// These two values are PUBLIC by design:
//  - the URL is just your project address
//  - the anon key is a public client key, protected by Row Level Security.
// The secret service_role key is NEVER used here — it lives only in the
// Netlify Function environment.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Surfaced clearly so a missing .env produces a friendly error, not a crash.
export const isConfigured = Boolean(url && anonKey);

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const STORAGE_BUCKET = "logos";

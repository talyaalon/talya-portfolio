import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  isConfigured,
  OWNER_USER_ID,
  ADMIN_EMAIL_DOMAIN,
  adminConfigError,
} from "../lib/supabaseClient";

// Tracks the Supabase auth session for the admin app.
//
// Only imported by the admin entry — the public site has no auth code at all.
//
// "Admin" means the session belongs to the OWNER, not merely that a session
// exists. Any Supabase account is `authenticated`; only one is the owner.
// The database enforces the same rule (see supabase/policies-owner-only.sql);
// this check governs the UI.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let active = true;

    // `finally` matters: without it any auth/network failure leaves the app
    // on a spinner forever, because loading was only cleared on success.
    supabase.auth
      .getSession()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else setSession(data.session);
      })
      .catch((e) => {
        if (active) setError(e?.message || String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // onAuthStateChange is the authority once it starts firing; it also
    // resolves the race with the getSession() call above.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (username, password) => {
    if (adminConfigError) return new Error(adminConfigError);
    const clean = String(username || "").trim().toLowerCase();
    if (!clean || !password) return new Error("empty-credentials");
    const email = `${clean}@${ADMIN_EMAIL_DOMAIN}`;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    return err;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const userId = session?.user?.id;
  const isAdmin = Boolean(userId) && Boolean(OWNER_USER_ID) && userId === OWNER_USER_ID;

  // Signed in, but as somebody who is not the owner. Worth showing plainly
  // rather than silently rendering an empty admin screen.
  const isImpostor = Boolean(userId) && !isAdmin;

  return { session, isAdmin, isImpostor, loading, error, signIn, signOut };
}

// Supabase Auth is email-based and has no username login, so the admin form
// composes an address out of what the owner types.
//
// The original rule was "always append the domain". That held only while the
// owner typed a bare username. The moment a browser autofilled the saved
// address, "talya@gmail.com" became "talya@gmail.com@gmail.com" — an address
// belonging to nobody — and the form answered "Wrong username or password",
// blaming the password for what was really a malformed address.
//
// Pure and total on purpose: the sign-in form calls this on every keystroke to
// show which address it is about to use, so it must never throw mid-render.
//
// This decides nothing about access. Who may sign in is settled by Supabase
// Auth, and who may write by RLS plus OWNER_USER_ID — so accepting an address
// on some other domain costs nothing and spares the owner a guessing game.
export function toAdminEmail(username, domain) {
  const clean = String(username || "")
    .trim()
    .toLowerCase();
  if (!clean) return "";

  const at = clean.indexOf("@");

  // A complete address already: something before the @, a domain after it.
  if (at > 0 && at < clean.length - 1) return clean;

  // Otherwise every @ present is noise — a half-typed "talya@", a stray
  // leading "@" — and what survives is the username the domain attaches to.
  const local = clean.replace(/@+/g, "");
  if (!local) return "";

  // No fallback domain. A missing one is a configuration failure that
  // adminConfigError already reports; inventing one here would hide it and
  // send a wrong address to the server instead.
  if (!domain) return "";

  return `${local}@${domain}`;
}

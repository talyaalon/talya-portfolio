import { describe, expect, it } from "vitest";
import { toAdminEmail } from "./adminEmail";

// Supabase Auth has no username login, so the admin form builds an email from
// what the owner types. The original rule was "always append the domain",
// which broke the moment a browser autofilled the full address: typing
// "talyaisrael12@gmail.com" produced "talyaisrael12@gmail.com@gmail.com" and
// the form answered "Wrong username or password" — blaming the password for
// what was really a malformed address.
describe("toAdminEmail", () => {
  it("appends the domain to a bare username", () => {
    expect(toAdminEmail("talyaisrael12", "gmail.com")).toBe("talyaisrael12@gmail.com");
  });

  it("leaves an address that already has a domain alone", () => {
    // The regression this whole change exists for.
    expect(toAdminEmail("talyaisrael12@gmail.com", "gmail.com")).toBe("talyaisrael12@gmail.com");
  });

  it("accepts an address on a different domain than the configured one", () => {
    // The owner has a second account (shlomoisrael435@gmail.com). Nothing here
    // decides who may sign in — RLS and OWNER_USER_ID do — so this must not
    // silently rewrite the address it was given.
    expect(toAdminEmail("someone@example.org", "gmail.com")).toBe("someone@example.org");
  });

  it("trims surrounding whitespace and lowercases", () => {
    expect(toAdminEmail("  TalyaIsrael12  ", "gmail.com")).toBe("talyaisrael12@gmail.com");
    expect(toAdminEmail("  Talya@GMAIL.com ", "gmail.com")).toBe("talya@gmail.com");
  });

  it("treats a trailing @ as an unfinished username, not as a domain", () => {
    // "talya@" contains an @ but names no domain; appending nothing would send
    // an address Supabase can only reject.
    expect(toAdminEmail("talya@", "gmail.com")).toBe("talya@gmail.com");
  });

  it("returns an empty string for empty input rather than a bare domain", () => {
    // Guard: "@gmail.com" is a real-looking address that belongs to nobody.
    expect(toAdminEmail("", "gmail.com")).toBe("");
    expect(toAdminEmail("   ", "gmail.com")).toBe("");
  });
});

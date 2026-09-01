import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLogin from "./AdminLogin";
import { I18nProvider } from "../i18n";
import { ADMIN_TRANSLATIONS } from "../i18n.admin";

function renderLogin(props = {}) {
  const signIn = props.signIn || vi.fn().mockResolvedValue(null);
  const utils = render(
    <I18nProvider extra={ADMIN_TRANSLATIONS}>
      <AdminLogin
        signIn={signIn}
        configError={props.configError ?? null}
        notOwner={props.notOwner ?? false}
        onSignOut={props.onSignOut || vi.fn()}
        emailDomain={props.emailDomain ?? "gmail.com"}
      />
    </I18nProvider>
  );
  return { ...utils, signIn };
}

describe("AdminLogin — showing the password", () => {
  it("hides the password by default", () => {
    renderLogin();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
  });

  it("reveals the password when the toggle is pressed, and hides it again", async () => {
    const user = userEvent.setup();
    renderLogin();
    const field = screen.getByLabelText(/^password$/i);
    const toggle = screen.getByRole("button", { name: /show password/i });

    await user.click(toggle);
    expect(field).toHaveAttribute("type", "text");

    // The same control must turn it back off, and say so.
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(field).toHaveAttribute("type", "password");
  });

  it("does not submit the form when the toggle is pressed", async () => {
    // A <button> inside a <form> defaults to type="submit"; without an explicit
    // type this would fire a sign-in attempt on every peek at the password.
    const user = userEvent.setup();
    const { signIn } = renderLogin();
    await user.type(screen.getByLabelText(/username/i), "talyaisrael12");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(signIn).not.toHaveBeenCalled();
  });
});

describe("AdminLogin — saying what is actually wrong", () => {
  it("shows which address it will sign in as, and updates while typing", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username/i), "talyaisrael12");
    expect(screen.getByText(/talyaisrael12@gmail\.com/)).toBeInTheDocument();
  });

  it("does not double the domain when the full address is typed or autofilled", async () => {
    // What the owner actually hit: the browser autofilled the whole address and
    // the form built "talyaisrael12@gmail.com@gmail.com".
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username/i), "talyaisrael12@gmail.com");
    expect(screen.getByText(/talyaisrael12@gmail\.com/)).toBeInTheDocument();
    expect(screen.queryByText(/gmail\.com@gmail\.com/)).not.toBeInTheDocument();
  });

  it("names the username when it is the empty field, and does not call Supabase", async () => {
    const user = userEvent.setup();
    const { signIn } = renderLogin();
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/enter your username/i)).toBeInTheDocument();
    // Blaming the password for a missing username is exactly the confusion
    // this change removes — and there is nothing to ask the server here.
    expect(signIn).not.toHaveBeenCalled();
  });

  it("names the password when it is the empty field, and does not call Supabase", async () => {
    const user = userEvent.setup();
    const { signIn } = renderLogin();
    await user.type(screen.getByLabelText(/username/i), "talyaisrael12");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("stays deliberately vague when the server rejects the credentials", async () => {
    // A guard, not a feature. signInWithPassword returns one identical error for
    // "no such user" and "wrong password", and splitting them would confirm
    // which accounts exist. This test fails if someone later "improves" it.
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue(new Error("Invalid login credentials"));
    renderLogin({ signIn });

    await user.type(screen.getByLabelText(/username/i), "talyaisrael12");
    await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/wrong username or password/i)).toBeInTheDocument();
    expect(screen.queryByText(/no such user/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enter your password/i)).not.toBeInTheDocument();
  });

  it("passes the username through untouched — composing the address is not its job", async () => {
    const user = userEvent.setup();
    const { signIn } = renderLogin();
    await user.type(screen.getByLabelText(/username/i), "talyaisrael12");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(signIn).toHaveBeenCalledWith("talyaisrael12", "secret123");
  });
});

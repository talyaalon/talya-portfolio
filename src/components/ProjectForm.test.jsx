import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectForm from "./ProjectForm";
import { I18nProvider } from "../i18n";
import { ADMIN_TRANSLATIONS } from "../i18n.admin";
import { blankProject } from "../lib/projectRow";

function renderForm(project = blankProject(), props = {}) {
  const onSave = props.onSave || vi.fn();
  const onCancel = props.onCancel || vi.fn();
  const uploadLogo = props.uploadLogo || vi.fn().mockResolvedValue("https://cdn.test/logo.jpg");
  const utils = render(
    <I18nProvider extra={ADMIN_TRANSLATIONS}>
      <ProjectForm project={project} onSave={onSave} onCancel={onCancel} uploadLogo={uploadLogo} />
    </I18nProvider>
  );
  return { ...utils, onSave, onCancel, uploadLogo };
}

describe("ProjectForm", () => {
  it("renders a file input for the logo", () => {
    // The regression: fileRef, onFile, fileToSmallBlob and uploadLogo all
    // existed, but no <input type="file"> was ever rendered, so the entire
    // logo pipeline was unreachable while the README advertised it.
    const { container } = renderForm();
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  it("gives every control an accessible name", () => {
    renderForm();
    // Would fail with labels that have no htmlFor and inputs that have no id.
    expect(screen.getByLabelText(/project name.*english/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/my role.*english/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/live link/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/screenshot url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project logo/i)).toBeInTheDocument();
  });

  it("refuses to save a link with no scheme and explains why", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm();

    await user.type(screen.getByLabelText(/project name.*english/i), "Air Manage");
    await user.type(screen.getByLabelText(/short description.*english/i), "Ops platform");
    await user.type(screen.getByLabelText(/live link/i), "example.com");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/must start with http/i)).toBeInTheDocument();
  });

  it("saves the screenshot and position that used to be dropped", async () => {
    const user = userEvent.setup();
    const { onSave } = renderForm();

    await user.type(screen.getByLabelText(/project name.*english/i), "Air Manage");
    await user.type(screen.getByLabelText(/short description.*english/i), "Ops platform");
    await user.type(screen.getByLabelText(/screenshot url/i), "https://cdn.test/s.png");
    await user.clear(screen.getByLabelText(/sort position/i));
    await user.type(screen.getByLabelText(/sort position/i), "4");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0];
    expect(saved.screenshot).toBe("https://cdn.test/s.png");
    expect(String(saved.position)).toBe("4");
  });

  it("offers the status options instead of guessing an award from prose", async () => {
    renderForm();
    const select = screen.getByLabelText(/^status$/i);
    const options = within(select).getAllByRole("option").map((o) => o.value);
    expect(options).toEqual(["", "production", "prototype", "archived", "award"]);
  });
});

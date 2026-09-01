import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CvPanel from "./CvPanel";
import { I18nProvider } from "../i18n";
import { ADMIN_TRANSLATIONS } from "../i18n.admin";
import { MAX_CV_BYTES } from "../hooks/useSiteSettingsAdmin";

// The CV upload. What matters here is what reaches the site: a file that is
// not a PDF, or one too big for Storage, must be refused HERE with a reason —
// not sent and rejected by the server with a message written for developers.
function renderPanel(props = {}) {
  const onUpload = props.onUpload || vi.fn().mockResolvedValue("https://cdn.test/cv-en.pdf");
  const onRemove = props.onRemove || vi.fn().mockResolvedValue(undefined);
  const utils = render(
    <I18nProvider extra={ADMIN_TRANSLATIONS}>
      <CvPanel
        settings={props.settings ?? { cvEn: "", cvHe: "" }}
        needsMigration={props.needsMigration ?? false}
        error={props.error ?? null}
        onUpload={onUpload}
        onRemove={onRemove}
      />
    </I18nProvider>
  );
  return { ...utils, onUpload, onRemove };
}

const pdf = (name = "cv.pdf", bytes = 1024) =>
  new File([new Uint8Array(bytes)], name, { type: "application/pdf" });

const englishInput = () => screen.getByLabelText(/english/i);

describe("CvPanel", () => {
  it("offers an upload for each language", () => {
    renderPanel();
    expect(englishInput()).toBeInTheDocument();
    expect(screen.getByLabelText(/hebrew/i)).toBeInTheDocument();
  });

  it("uploads a PDF and says which language it belongs to", async () => {
    const user = userEvent.setup();
    const { onUpload } = renderPanel();
    const file = pdf();

    await user.upload(englishInput(), file);

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUpload).toHaveBeenCalledWith(file, "en");
  });

  it("refuses a file that is not a PDF, and does not upload it", async () => {
    // applyAccept:false is the real browser: the accept attribute filters the
    // file dialog, it does not stop anyone choosing "All files" — or a drop.
    const user = userEvent.setup({ applyAccept: false });
    const { onUpload } = renderPanel();

    await user.upload(englishInput(), new File(["x"], "cv.docx", { type: "application/msword" }));

    expect(onUpload).not.toHaveBeenCalled();
    // The alert, not any text mentioning PDF — the field labels say "(PDF)" too.
    expect(screen.getByRole("alert")).toHaveTextContent(/not a PDF/i);
  });

  it("refuses a file over the size limit, and does not upload it", async () => {
    const user = userEvent.setup();
    const { onUpload } = renderPanel();

    await user.upload(englishInput(), pdf("huge.pdf", MAX_CV_BYTES + 1));

    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/over 8 MB/i);
  });

  it("links to the file that is on the site now", () => {
    renderPanel({ settings: { cvEn: "https://cdn.test/cv-en.pdf?v=1", cvHe: "" } });
    const link = screen.getByRole("link", { name: /open the file/i });
    expect(link).toHaveAttribute("href", "https://cdn.test/cv-en.pdf?v=1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  // Without the table there is nowhere to record the URL. Saying so beats a
  // Postgres error the owner has to decode.
  it("says the migration has not been run instead of offering an upload", () => {
    renderPanel({ needsMigration: true });
    expect(screen.getByText(/004-site-settings\.sql/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/english/i)).toBeNull();
  });
});

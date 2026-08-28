// ============================================================
//  Mapping between a `projects` database row and the shape the UI uses.
//
//  Kept pure and dependency-free so it can be unit-tested without a browser
//  or a database — see src/lib/projectRow.test.js.
//
//  Content is bilingual: every text field has an English (*_en) and a Hebrew
//  (*_he) value; the UI picks one via utils/localized.js.
// ============================================================

// Every column fromRow() reads. If the database is missing one of these, the
// old code turned it into "" and the project silently lost a field — which is
// how the demo_url / demo_url_en schema drift went unnoticed. Now it throws.
export const REQUIRED_COLUMNS = [
  "id",
  "name_en",
  "name_he",
  "meta_en",
  "meta_he",
  "role_en",
  "role_he",
  "short_en",
  "short_he",
  "readme_en",
  "readme_he",
  "result_en",
  "result_he",
  "impact_en",
  "impact_he",
  "status",
  "tools",
  "link",
  "repo_url",
  "demo_url_en",
  "demo_url_he",
  "screenshot_url",
  "logo_url",
  "position",
];

export const STATUSES = ["production", "prototype", "archived", "award"];

export class SchemaMismatchError extends Error {
  constructor(missing) {
    super(
      `The projects table is missing ${missing.length} expected column(s): ${missing.join(", ")}. ` +
        `Run supabase/schema.sql and supabase/migrations/ to bring the database up to date.`
    );
    this.name = "SchemaMismatchError";
    this.missing = missing;
  }
}

// Null and empty string both mean "not filled in" for an optional text field,
// so normalising them to "" is a display convenience, not a masked value.
// A column that does not EXIST is a different thing entirely, and throws.
export function fromRow(row) {
  const missing = REQUIRED_COLUMNS.filter((col) => !(col in row));
  if (missing.length) throw new SchemaMismatchError(missing);

  return {
    id: row.id,
    nameEn: row.name_en ?? "",
    nameHe: row.name_he ?? "",
    metaEn: row.meta_en ?? "",
    metaHe: row.meta_he ?? "",
    roleEn: row.role_en ?? "",
    roleHe: row.role_he ?? "",
    shortEn: row.short_en ?? "",
    shortHe: row.short_he ?? "",
    readmeEn: row.readme_en ?? "",
    readmeHe: row.readme_he ?? "",
    resultEn: row.result_en ?? "",
    resultHe: row.result_he ?? "",
    impactEn: row.impact_en ?? "",
    impactHe: row.impact_he ?? "",
    status: row.status ?? "",
    tools: row.tools ?? [],
    link: row.link ?? "",
    repo: row.repo_url ?? "",
    demoEn: row.demo_url_en ?? "",
    demoHe: row.demo_url_he ?? "",
    screenshot: row.screenshot_url ?? "",
    logo: row.logo_url ?? "",
    position: row.position ?? 0,
  };
}

const clean = (s) => String(s ?? "").trim();
const orNull = (s) => clean(s) || null;

export function toRow(proj) {
  return {
    name_en: orNull(proj.nameEn),
    name_he: orNull(proj.nameHe),
    meta_en: orNull(proj.metaEn),
    meta_he: orNull(proj.metaHe),
    role_en: orNull(proj.roleEn),
    role_he: orNull(proj.roleHe),
    short_en: orNull(proj.shortEn),
    short_he: orNull(proj.shortHe),
    readme_en: proj.readmeEn || null,
    readme_he: proj.readmeHe || null,
    result_en: orNull(proj.resultEn),
    result_he: orNull(proj.resultHe),
    impact_en: orNull(proj.impactEn),
    impact_he: orNull(proj.impactHe),
    status: STATUSES.includes(proj.status) ? proj.status : null,
    tools: proj.tools ?? [],
    link: orNull(proj.link),
    repo_url: orNull(proj.repo),
    demo_url_en: orNull(proj.demoEn),
    demo_url_he: orNull(proj.demoHe),
    // Both of these used to be dropped on save, so a screenshot or an ordering
    // could only be set by hand in SQL.
    screenshot_url: orNull(proj.screenshot),
    logo_url: orNull(proj.logo),
    position: Number.isFinite(Number(proj.position)) ? Number(proj.position) : 0,
  };
}

export function blankProject() {
  return {
    _isNew: true,
    id: null,
    nameEn: "", nameHe: "",
    metaEn: "", metaHe: "",
    roleEn: "", roleHe: "",
    shortEn: "", shortHe: "",
    readmeEn: "", readmeHe: "",
    resultEn: "", resultHe: "",
    impactEn: "", impactHe: "",
    status: "",
    tools: [],
    link: "", repo: "", demoEn: "", demoHe: "",
    logo: "", screenshot: "",
    position: 0,
  };
}

// A link typed without a scheme ("example.com") resolves as a relative path
// and quietly breaks the card's call-to-action, so it is rejected on save.
export function isValidUrl(value) {
  const v = clean(value);
  if (!v) return true; // empty is allowed; these fields are optional
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const URL_FIELDS = ["link", "repo", "demoEn", "demoHe", "screenshot"];

export function invalidUrlFields(proj) {
  return URL_FIELDS.filter((f) => !isValidUrl(proj[f]));
}

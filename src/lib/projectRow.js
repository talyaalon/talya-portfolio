// ============================================================
//  Mapping between a `projects` database row and the shape the UI uses.
//
//  Kept pure and dependency-free so it can be unit-tested without a browser
//  or a database — see src/lib/projectRow.test.js.
//
//  Content is bilingual: every text field has an English (*_en) and a Hebrew
//  (*_he) value; the UI picks one via utils/localized.js.
// ============================================================

// Columns that have always existed. If one of these is missing the row is not
// something this code understands, and turning it into "" would hide a real
// problem — so it throws.
export const CORE_COLUMNS = [
  "id",
  "name_en",
  "name_he",
  "meta_en",
  "meta_he",
  "short_en",
  "short_he",
  "readme_en",
  "readme_he",
  "result_en",
  "result_he",
  "tools",
  "link",
  "repo_url",
  "screenshot_url",
  "logo_url",
  "position",
];

// Columns added by supabase/migrations/001-project-fields.sql.
//
// These are treated differently on purpose. Their absence does not mean "a
// value went missing", it means "this database has not been migrated yet" —
// a known, temporary state that must NOT take the public site down. So they
// degrade to empty, and `pendingMigration` reports it so the admin can say so
// out loud rather than the owner discovering it by accident.
export const MIGRATION_001_COLUMNS = [
  "role_en",
  "role_he",
  "impact_en",
  "impact_he",
  "status",
  "demo_url_en",
  "demo_url_he",
];

// Columns added by supabase/migrations/002-repo-private.sql. Same contract as
// migration 001: absent means "not migrated yet", which must not take the site
// down, so it degrades to `false` (= a public repo, the state before the
// column existed) rather than to a maybe-private guess.
export const MIGRATION_002_COLUMNS = ["repo_private"];

export const MIGRATION_COLUMNS = [...MIGRATION_001_COLUMNS, ...MIGRATION_002_COLUMNS];

export const REQUIRED_COLUMNS = [...CORE_COLUMNS, ...MIGRATION_COLUMNS];

export const STATUSES = ["production", "prototype", "archived", "award"];

export class SchemaMismatchError extends Error {
  constructor(missing) {
    super(
      `The projects table is missing ${missing.length} core column(s): ${missing.join(", ")}. ` +
        `Run supabase/schema.sql to bring the database up to date.`
    );
    this.name = "SchemaMismatchError";
    this.missing = missing;
  }
}

// Which migration columns this row is missing. Empty array = fully migrated.
export function pendingMigration(row) {
  return MIGRATION_COLUMNS.filter((col) => !(col in row));
}

// Null and empty string both mean "not filled in" for an optional text field,
// so normalising them to "" is a display convenience, not a masked value.
// A CORE column that does not EXIST is a different thing entirely, and throws.
export function fromRow(row) {
  const missing = CORE_COLUMNS.filter((col) => !(col in row));
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
    // A company repository: it exists on GitHub, but nobody outside can open
    // it. The card says so instead of offering a link into a 404.
    repoPrivate: row.repo_private ?? false,
    // Before migration 001 there was a single `demo_url`. Fall back to it so
    // an unmigrated database keeps showing the demo links it already has.
    demoEn: row.demo_url_en ?? row.demo_url ?? "",
    demoHe: row.demo_url_he ?? "",
    screenshot: row.screenshot_url ?? "",
    logo: row.logo_url ?? "",
    position: row.position ?? 0,
  };
}

const clean = (s) => String(s ?? "").trim();
const orNull = (s) => clean(s) || null;

// `columns` limits the write to what the database actually has, so saving
// against an unmigrated database updates the old fields instead of failing
// wholesale on an unknown column.
export function toRow(proj, columns = null) {
  const row = {
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
    repo_private: Boolean(proj.repoPrivate),
    demo_url_en: orNull(proj.demoEn),
    demo_url_he: orNull(proj.demoHe),
    // Both of these used to be dropped on save, so a screenshot or an ordering
    // could only be set by hand in SQL.
    screenshot_url: orNull(proj.screenshot),
    logo_url: orNull(proj.logo),
    position: Number.isFinite(Number(proj.position)) ? Number(proj.position) : 0,
  };

  if (!columns) return row;
  const allowed = new Set(columns);
  return Object.fromEntries(Object.entries(row).filter(([k]) => allowed.has(k)));
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
    link: "", repo: "", repoPrivate: false, demoEn: "", demoHe: "",
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

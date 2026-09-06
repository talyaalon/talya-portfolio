// Pick a project's field in the current language, falling back to the other
// language when one side is empty (e.g. content entered only in Hebrew).
//   loc(project, "name", "en")  ->  project.nameEn || project.nameHe || ""
export function loc(project, field, lang) {
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const cur = field + cap(lang); // nameEn / nameHe
  const other = field + cap(lang === "he" ? "en" : "he");
  return project[cur] || project[other] || "";
}

// The same idea for content kept as a { en, he } pair rather than as two
// flat fields - which is how src/content/ stores it, because there one fact
// is one object in two languages instead of two strings that can drift.
//   pick({ en: "Context", he: "רקע" }, "he")  ->  "רקע"
//
// A pair that is missing the current language falls back to the other, for
// the same reason loc() does: one language is worth more to a reader than an
// empty space. A pair that is missing BOTH is a content bug, not a display
// state, so it throws rather than rendering nothing and looking fine.
export function pick(pair, lang) {
  const value = pair?.[lang] || pair?.[lang === "he" ? "en" : "he"];
  if (!value) {
    throw new Error(`localized: no "${lang}" text and no fallback in ${JSON.stringify(pair)}`);
  }
  return value;
}

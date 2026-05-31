// Pick a project's field in the current language, falling back to the other
// language when one side is empty (e.g. content entered only in Hebrew).
//   loc(project, "name", "en")  ->  project.nameEn || project.nameHe || ""
export function loc(project, field, lang) {
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const cur = field + cap(lang); // nameEn / nameHe
  const other = field + cap(lang === "he" ? "en" : "he");
  return project[cur] || project[other] || "";
}

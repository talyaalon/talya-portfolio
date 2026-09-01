import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ============================================================
//  i18n for the PUBLIC site. Default English; a toggle switches to Hebrew + RTL.
//
//  Admin-only strings deliberately do NOT live here — see src/i18n.admin.js.
//  Everything in this file ships to every visitor, so keep it to public copy.
//
//  Project content is not here either: it is user data stored bilingually in
//  the database and rendered through utils/localized.js.
// ============================================================

const STORAGE_KEY = "talya:lang";

export const TRANSLATIONS = {
  en: {
    // document head (kept in sync with the chosen language)
    docTitle: "Talya Israel — Full Stack Developer",
    docDescription:
      "Portfolio of Talya Israel, Full Stack Developer (B.Sc. Software Engineering). Production systems in React, Next.js, Node.js and PostgreSQL.",

    // nav
    siteName: "Talya Israel",
    brandFirst: "Talya",
    brandLast: "Israel",
    navAbout: "About",
    navProjects: "Projects",
    navSkills: "Skills",
    navContact: "Contact",
    navLabel: "Main",
    langSwitch: "עברית",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    skipToContent: "Skip to content",
    backToTop: "Back to top",

    // hero
    heroEyebrow: "Open to opportunities",
    heroRole: "Full Stack Developer · B.Sc. Software Engineering",
    heroLede:
      "I build production systems end-to-end — from multi-branch e-commerce to operational platforms teams depend on every day.",
    btnEmail: "Email me",
    btnCv: "Download CV",

    // about
    secAbout: "About",
    aboutText:
      "Full Stack Developer with a B.Sc. in Software Engineering, experienced in designing and building production-grade systems. Creator of Air Manage — a maintenance and asset platform in daily use at a logistics company. Strong in React, Next.js, Node.js and PostgreSQL, with a focus on system design, workflow automation and solving complex operational problems.",

    // projects
    secProjects: "Selected Projects",
    cardViewLive: "View live",
    cardWatchDemo: "Watch the video",
    cardPresentation: "View the deck",
    cardInternal: "Internal system",
    cardRepoPrivate: "GitHub · Private repo",
    cardRepoPrivateHint: "The code lives on GitHub in a private repository — internal company code, not open to the public.",
    cardScreenshot: "No screenshot",
    cardReadme: "Read more",
    cardOpenAria: "Open details for ",
    statusProduction: "In production",
    statusPrototype: "Prototype",
    statusArchived: "Archived",
    statusAward: "Award",
    roleLabel: "Role",

    // skills
    secSkills: "Skills",
    skillFrontend: "Frontend",
    skillBackend: "Backend & Data",
    skillTools: "Tools & Platforms",
    skillAI: "AI Engineering",
    skillAIChip: "LLM integration",

    // contact
    secContact: "Let us talk",
    contactText:
      "Looking for my next role building production systems end-to-end. Happy to hear about positions, collaborations, or an interesting problem.",
    contactLocation: "Bangkok, Thailand",

    // states
    loading: "Loading…",
    retry: "Try again",
    emptyClient: "Projects are being updated — check back shortly.",
    projLoadFailed: "Projects could not be loaded right now.",
    siteUnavailable: "The projects list is temporarily unavailable.",
    errorTitle: "Something went wrong on this page.",
    errorBody: "Please reload. If it keeps happening, email me and I will fix it.",
    errorReload: "Reload the page",
    close: "Close",

    // project modal
    modalReadme: "About the project",
    modalScreenshot: "Screenshot of ",
  },

  he: {
    docTitle: "טליה ישראל — מפתחת Full Stack",
    docDescription:
      "תיק העבודות של טליה ישראל, מפתחת Full Stack (B.Sc. הנדסת תוכנה). מערכות Production ב-React, ‏Next.js, ‏Node.js ו-PostgreSQL.",

    siteName: "טליה ישראל",
    brandFirst: "טליה",
    brandLast: "ישראל",
    navAbout: "אודות",
    navProjects: "פרויקטים",
    navSkills: "מיומנויות",
    navContact: "יצירת קשר",
    navLabel: "ראשי",
    langSwitch: "English",
    menuOpen: "פתיחת תפריט",
    menuClose: "סגירת תפריט",
    skipToContent: "דילוג לתוכן",
    backToTop: "חזרה למעלה",

    heroEyebrow: "פתוחה להזדמנויות",
    heroRole: "מפתחת Full Stack · B.Sc. הנדסת תוכנה",
    heroLede:
      "אני בונה מערכות Production מקצה לקצה — מ-E-commerce רב-סניפי ועד פלטפורמות תפעוליות שצוותים מסתמכים עליהן כל יום.",
    btnEmail: "שליחת מייל",
    btnCv: "הורדת קורות חיים",

    secAbout: "אודות",
    aboutText:
      "מפתחת Full Stack עם תואר ראשון בהנדסת תוכנה, מנוסה בעיצוב ובבניית מערכות ברמת Production. יצרתי את Air Manage — פלטפורמת ניהול תחזוקה ונכסים בשימוש יומיומי בחברת לוגיסטיקה. שולטת ב-React, ‏Next.js, ‏Node.js ו-PostgreSQL, עם דגש על עיצוב מערכות, אוטומציה של תהליכים ופתרון בעיות תפעוליות מורכבות.",

    secProjects: "פרויקטים נבחרים",
    cardViewLive: "צפייה באתר",
    cardWatchDemo: "לצפייה בסרטון",
    cardPresentation: "למצגת",
    cardInternal: "מערכת פנימית",
    cardRepoPrivate: "GitHub · ריפו פרטי",
    cardRepoPrivateHint: "הקוד יושב בגיטהאב במאגר פרטי — קוד פנימי של החברה, לא פתוח לציבור.",
    cardScreenshot: "אין צילום מסך",
    cardReadme: "קריאה נוספת",
    cardOpenAria: "פתיחת פרטים על ",
    statusProduction: "בפרודקשן",
    statusPrototype: "אב-טיפוס",
    statusArchived: "בארכיון",
    statusAward: "פרס",
    roleLabel: "תפקיד",

    secSkills: "מיומנויות",
    skillFrontend: "צד לקוח",
    skillBackend: "צד שרת ובסיסי נתונים",
    skillTools: "כלים ופלטפורמות",
    skillAI: "הנדסת AI",
    skillAIChip: "אינטגרציית מודלים",

    secContact: "בואו נדבר",
    contactText:
      "מחפשת את התפקיד הבא שלי בבניית מערכות Production מקצה לקצה. אשמח לשמוע על משרות, שיתופי פעולה או בעיה מעניינת.",
    contactLocation: "בנגקוק, תאילנד",

    loading: "טוען…",
    retry: "לניסיון נוסף",
    emptyClient: "רשימת הפרויקטים מתעדכנת — נסו שוב בקרוב.",
    projLoadFailed: "לא הצלחנו לטעון את הפרויקטים כרגע.",
    siteUnavailable: "רשימת הפרויקטים אינה זמינה זמנית.",
    errorTitle: "משהו השתבש בעמוד הזה.",
    errorBody: "אפשר לרענן. אם זה חוזר, שלחו לי מייל ואתקן.",
    errorReload: "רענון העמוד",
    close: "סגירה",

    modalReadme: "על הפרויקט",
    modalScreenshot: "צילום מסך של ",
  },
};

// Shared contact / link constants (not language-specific).
export const CONTACT = {
  email: "Talyaisrael12@gmail.com",
  whatsapp: "972505154143",
  phone: "+66 65 850 6606",
  linkedin: "https://www.linkedin.com/in/talya-israel12",
  github: "https://github.com/talyaalon",
};

// Downloadable CV, per language. A recruiter who likes the page needs
// something to forward, and this is the highest-value link on the site.
//
// Set each value to a path under public/ once the PDF exists, e.g.
//   en: "/docs/talya-israel-cv-en.pdf"
// While a value is null the button is not rendered at all — better no button
// than a button that 404s in front of a hiring manager.
export const CV = {
  en: null,
  he: null,
};

export const LANGS = ["en", "he"];

const I18nContext = createContext(null);

// `extra` merges an additional translation table (see src/i18n.admin.js).
// The public entry passes nothing, which is what keeps admin copy out of the
// visitor bundle.
export function I18nProvider({ children, extra }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGS.includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });
  const dir = lang === "he" ? "rtl" : "ltr";

  const tables = useMemo(() => {
    if (!extra) return TRANSLATIONS;
    return {
      en: { ...TRANSLATIONS.en, ...extra.en },
      he: { ...TRANSLATIONS.he, ...extra.he },
    };
  }, [extra]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;

    // The static <head> can only carry one language; keep it matching the
    // language actually on screen so crawlers and screen readers agree.
    const title = tables[lang]?.docTitle;
    if (title) document.title = title;
    const desc = tables[lang]?.docDescription;
    const descTag = document.querySelector('meta[name="description"]');
    if (desc && descTag) descTag.setAttribute("content", desc);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable (private mode) — language just will not persist */
    }
  }, [lang, dir, tables]);

  const toggle = () => setLang((l) => (l === "en" ? "he" : "en"));

  // A missing key is a bug, not a display value. It fails loudly in
  // development and in tests; in production it degrades to English rather
  // than rendering a raw identifier at a recruiter.
  const t = useCallback((key) => {
    const hit = tables[lang]?.[key];
    if (hit !== undefined) return hit;

    const english = tables.en?.[key];
    if (english !== undefined) {
      if (import.meta.env.DEV) {
        throw new Error(`i18n: key "${key}" is missing for language "${lang}"`);
      }
      return english;
    }

    if (import.meta.env.DEV) {
      throw new Error(`i18n: key "${key}" does not exist in any language`);
    }
    console.error(`i18n: missing key "${key}"`);
    return "";
  }, [tables, lang]);

  const value = useMemo(() => ({ lang, dir, setLang, toggle, t, tables }), [lang, dir, t, tables]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

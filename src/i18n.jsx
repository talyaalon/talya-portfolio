import { createContext, useContext, useEffect, useState } from "react";

// ============================================================
//  i18n. Default English; a toggle switches to Hebrew + RTL.
//  UI chrome is translated here; project content is user data
//  stored bilingually in the database.
// ============================================================

const STORAGE_KEY = "talya:lang";

export const TRANSLATIONS = {
  en: {
    // nav
    siteName: "Talya Israel",
    brandFirst: "Talya",
    brandLast: "Israel",
    navAbout: "About",
    navProjects: "Projects",
    navSkills: "Skills",
    navContact: "Contact",
    langSwitch: "עברית",
    adminLogin: "Admin login",
    adminMode: "Admin mode",
    logout: "Log out",
    // hero
    heroEyebrow: "Open to opportunities",
    heroRole: "Full Stack Developer · B.Sc. Software Engineering",
    heroLede:
      "I build production systems end-to-end — from multi-branch e-commerce to operational platforms that real teams rely on every day.",
    btnEmail: "Email me",
    // about
    secAbout: "About",
    aboutText:
      "Full Stack Developer with a B.Sc. in Software Engineering, experienced in designing and building production-grade systems. Creator of Air Manage — a maintenance & asset platform in daily use at a real company. Strong in React, Next.js, Node.js and PostgreSQL, with a focus on system design, workflow automation and solving complex operational challenges.",
    // projects
    secProjects: "Selected Projects",
    cardViewLive: "View live",
    cardWatchDemo: "Watch demo",
    cardInternal: "Internal system",
    cardScreenshot: "Screenshot",
    cardReadme: "Read more",
    // skills
    secSkills: "Skills",
    skillFrontend: "Frontend",
    skillBackend: "Backend & Data",
    skillTools: "Tools & Platforms",
    skillAI: "AI-Assisted Development",
    skillAIChip: "Prompt-driven dev",
    // contact
    secContact: "Let's talk",
    contactText:
      "Looking for my next opportunity to build top-tier projects and systems. Happy to hear about roles, collaborations or any interesting idea.",
    contactLocation: "Bangkok, Thailand",
    // states / admin
    loading: "Loading…",
    loadingData: "Loading data…",
    retry: "Try again",
    emptyAdmin: "No projects yet. Click “+ Add project” to start.",
    emptyClient: "No projects yet. Check back soon!",
    notConnectedTitle: "The site isn't connected to Supabase yet.",
    notConnectedBody:
      "Create a .env file from .env.example with your project URL and public key, then restart the server.",
    projLoadFailed: "Failed to load projects: ",
    deleteConfirm: "Delete this project?",
    deleteFailed: "Delete failed: ",
    tabProjects: "Projects",
    tabAnalytics: "Analytics",
    tabSettings: "Settings",
    addProject: "+ Add project",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    // project modal
    modalReadme: "About the project",
    modalOpen: "Open project ↗",
    // form
    formNew: "New project",
    formEdit: "Edit project",
    formUploadLogo: "Upload logo",
    formLogoHint: "Optional — a small logo for the project",
    formName: "Project name",
    formMeta: "Context (company · year)",
    formShort: "Short description (one line)",
    formResult: "Highlight / result",
    formLink: "Live link",
    formRepo: "GitHub / repo link",
    formDemo: "Demo / video link",
    formTools: "Technologies",
    formToolsPlaceholder: "JavaScript, React…",
    formAdd: "Add",
    formReadme: "Detailed description",
    formReadmePlaceholder: "What the project does, the tools used, challenges solved…",
    formSave: "Save",
    formSaving: "Saving…",
    formCancel: "Cancel",
    formImageError: "Couldn't process the image. Try another file.",
    formSaveFailed: "Save failed: ",
    suffixEn: "(English)",
    suffixHe: "(Hebrew)",
    formBilingualHint: "Fill each field in both languages. If you leave one empty, the other language is shown instead.",
    // login
    loginTitle: "Admin login",
    loginSubtitle: "Only you see the edit buttons and the analytics here.",
    loginEmail: "Email",
    loginPassword: "Password",
    loginWrong: "Wrong email or password",
    loginSigningIn: "Signing in…",
    loginEnter: "Sign in",
    // settings
    setTitle: "Admin settings",
    setLoggedInAs: "Signed in as ",
    setNewPassword: "New password",
    setConfirmPassword: "Confirm password",
    setTooShort: "Password must be at least 6 characters.",
    setNoMatch: "Passwords don't match.",
    setUpdateFailed: "Update failed: ",
    setUpdated: "Password updated ✓",
    setUpdate: "Update password",
    setSaving: "Saving…",
    // analytics
    anMonthSummary: "Summary for the current month.",
    anViewsMonth: "Site views this month",
    anOpens: "Card opens",
    anClicks: "Link clicks",
    anByProject: "By project",
    anColProject: "Project",
    anColOpens: "Opens",
    anColClicks: "Link clicks",
    anNoProjects: "No projects yet",
    anSources: "Where they came from (Referrer)",
    anCountries: "Countries (estimated by IP)",
    anDirect: "Direct visit",
    anUnknown: "Unknown",
    anNoData: "No data yet",
    anLoadFailed: "Failed to load data: ",
    anInfoNote:
      "About data collection: the data here is real and collected server-side. We collect what's possible anonymously — referrer, estimated country/city by IP, device type, and the date. An anonymous visitor's email address is not exposed to any website in the browser — so it is never collected and never shown.",
  },
  he: {
    siteName: "טליה ישראל",
    brandFirst: "טליה",
    brandLast: "ישראל",
    navAbout: "אודות",
    navProjects: "פרויקטים",
    navSkills: "מיומנויות",
    navContact: "צור קשר",
    langSwitch: "English",
    adminLogin: "כניסת מנהל",
    adminMode: "מצב מנהל",
    logout: "יציאה",
    heroEyebrow: "פתוחה להזדמנויות",
    heroRole: "מפתחת Full Stack · B.Sc. הנדסת תוכנה",
    heroLede:
      "אני בונה מערכות Production מקצה לקצה — מ-E-commerce רב-סניפי ועד פלטפורמות תפעוליות שצוותים אמיתיים מסתמכים עליהן כל יום.",
    btnEmail: "שלחו לי מייל",
    secAbout: "אודות",
    aboutText:
      "מפתחת Full Stack עם תואר ראשון בהנדסת תוכנה, מנוסה בעיצוב ובניית מערכות ברמת Production. יצרתי את Air Manage — פלטפורמת ניהול תחזוקה ונכסים בשימוש יומיומי בחברה אמיתית. שולטת ב-React, Next.js, Node.js ו-PostgreSQL, עם דגש על עיצוב מערכות, אוטומציה של תהליכים ופתרון אתגרים תפעוליים מורכבים.",
    secProjects: "פרויקטים נבחרים",
    cardViewLive: "צפייה באתר",
    cardWatchDemo: "צפייה בדמו",
    cardInternal: "מערכת פנימית",
    cardScreenshot: "צילום מסך",
    cardReadme: "קראו עוד",
    secSkills: "מיומנויות",
    skillFrontend: "צד לקוח",
    skillBackend: "צד שרת ובסיסי נתונים",
    skillTools: "כלים ופלטפורמות",
    skillAI: "פיתוח בעזרת AI",
    skillAIChip: "פיתוח מבוסס פרומפטים",
    secContact: "בואו נדבר",
    contactText:
      "מחפשת את ההזדמנות הבאה שלי לבנות פרויקטים ומערכות מהטובות ביותר. אשמח לשמוע על משרות, שיתופי פעולה או כל רעיון מעניין.",
    contactLocation: "בנגקוק, תאילנד",
    loading: "טוען…",
    loadingData: "טוען נתונים…",
    retry: "נסה שוב",
    emptyAdmin: "אין עדיין פרויקטים. לחצי על ‘+ הוסף פרויקט’ כדי להתחיל.",
    emptyClient: "אין עדיין פרויקטים. חזרו בקרוב!",
    notConnectedTitle: "האתר עדיין לא מחובר ל-Supabase.",
    notConnectedBody:
      "צרי קובץ .env לפי .env.example עם הכתובת והמפתח הציבורי של הפרויקט, ואז הפעילי מחדש את השרת.",
    projLoadFailed: "טעינת הפרויקטים נכשלה: ",
    deleteConfirm: "למחוק את הפרויקט הזה?",
    deleteFailed: "המחיקה נכשלה: ",
    tabProjects: "פרויקטים",
    tabAnalytics: "נתוני צפייה",
    tabSettings: "הגדרות",
    addProject: "+ הוסף פרויקט",
    edit: "עריכה",
    delete: "מחיקה",
    close: "סגירה",
    modalReadme: "על הפרויקט",
    modalOpen: "פתיחת הפרויקט ↗",
    formNew: "פרויקט חדש",
    formEdit: "עריכת פרויקט",
    formUploadLogo: "העלאת לוגו",
    formLogoHint: "אופציונלי — לוגו קטן לפרויקט",
    formName: "שם הפרויקט",
    formMeta: "הקשר (חברה · שנה)",
    formShort: "תיאור קצר (שורה אחת)",
    formResult: "הישג בולט / תוצאה",
    formLink: "קישור לאתר חי",
    formRepo: "קישור GitHub",
    formDemo: "קישור דמו/וידאו",
    formTools: "טכנולוגיות",
    formToolsPlaceholder: "JavaScript, React…",
    formAdd: "הוסף",
    formReadme: "תיאור מפורט",
    formReadmePlaceholder: "מה הפרויקט עושה, באילו כלים השתמשת, אילו אתגרים פתרת…",
    formSave: "שמירה",
    formSaving: "שומר…",
    formCancel: "ביטול",
    formImageError: "לא הצלחתי לעבד את התמונה. נסי קובץ אחר.",
    formSaveFailed: "השמירה נכשלה: ",
    suffixEn: "(אנגלית)",
    suffixHe: "(עברית)",
    formBilingualHint: "מלאי כל שדה בשתי השפות. אם תשאירי אחד ריק — תוצג השפה השנייה במקומו.",
    loginTitle: "כניסת מנהל",
    loginSubtitle: "רק את רואה כאן את כפתורי העריכה ואת נתוני הצפייה.",
    loginEmail: "אימייל",
    loginPassword: "סיסמה",
    loginWrong: "אימייל או סיסמה שגויים",
    loginSigningIn: "מתחבר…",
    loginEnter: "כניסה",
    setTitle: "הגדרות מנהל",
    setLoggedInAs: "מחוברת כ־",
    setNewPassword: "סיסמה חדשה",
    setConfirmPassword: "אימות סיסמה",
    setTooShort: "הסיסמה חייבת להיות לפחות 6 תווים.",
    setNoMatch: "הסיסמאות אינן תואמות.",
    setUpdateFailed: "העדכון נכשל: ",
    setUpdated: "הסיסמה עודכנה ✓",
    setUpdate: "עדכון סיסמה",
    setSaving: "שומר…",
    anMonthSummary: "סיכום עבור החודש הנוכחי.",
    anViewsMonth: "צפיות באתר החודש",
    anOpens: "פתיחות כרטיסיות",
    anClicks: "קליקים על קישורים",
    anByProject: "לפי פרויקט",
    anColProject: "פרויקט",
    anColOpens: "פתיחות",
    anColClicks: "קליקים לקישור",
    anNoProjects: "אין פרויקטים עדיין",
    anSources: "מאיפה הגיעו (Referrer)",
    anCountries: "מדינות (משוער לפי IP)",
    anDirect: "כניסה ישירה",
    anUnknown: "לא ידוע",
    anNoData: "אין נתונים עדיין",
    anLoadFailed: "טעינת הנתונים נכשלה: ",
    anInfoNote:
      "על איסוף הנתונים: הנתונים כאן אמיתיים ונאספים בצד-שרת. נאסף מה שאפשר באופן אנונימי — referrer, מדינה/עיר משוערת לפי IP, סוג המכשיר, והתאריך. כתובת המייל של מבקר אנונימי אינה חשופה לאף אתר בדפדפן — לכן היא לא נאספת ולא מוצגת.",
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

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });
  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  const toggle = () => setLang((l) => (l === "en" ? "he" : "en"));
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, dir, setLang, toggle, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

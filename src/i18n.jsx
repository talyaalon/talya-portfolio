import { createContext, useContext, useEffect, useState } from "react";

// ============================================================
//  Lightweight i18n. Default language is English; a toggle in the
//  header switches to Hebrew and flips the whole layout to RTL.
//  Only UI chrome is translated — project content (name, description,
//  README) is user data and is shown exactly as entered.
// ============================================================

const STORAGE_KEY = "talya:lang";

export const TRANSLATIONS = {
  en: {
    // header
    brand: "PORTFOLIO",
    langSwitch: "עברית", // label shows the OTHER language
    adminLogin: "Admin login",
    adminMode: "Admin mode",
    logout: "Log out",
    close: "Close",
    heroSubtitle:
      "The digital home that gathers all the real projects I've built recently — click any card to reveal the full story behind the project.",
    // tabs
    tabProjects: "Projects",
    tabAnalytics: "Analytics",
    tabSettings: "Settings",
    addProject: "+ Add project",
    // card
    cardView: "View project →",
    edit: "Edit",
    delete: "Delete",
    // states
    loading: "Loading…",
    loadingData: "Loading data…",
    retry: "Try again",
    emptyAdmin: "No projects yet. Click “+ Add project” to start.",
    emptyClient: "No projects yet. Check back soon!",
    notConnectedTitle: "The site isn't connected to Supabase yet.",
    notConnectedBody:
      "Create a .env file from .env.example with your project URL and public key, then restart the server. Full instructions are in the README.",
    projLoadFailed: "Failed to load projects: ",
    deleteConfirm: "Delete this project?",
    deleteFailed: "Delete failed: ",
    // project modal
    modalReadme: "README — about the project",
    modalOpen: "Open project ↗",
    // form
    formNew: "New project",
    formEdit: "Edit project",
    formUploadLogo: "Upload logo",
    formLogoHint: "The image is auto-resized and stored",
    formName: "Product name",
    formShort: "Short description (one line)",
    formLink: "Project link",
    suffixEn: "(English)",
    suffixHe: "(Hebrew)",
    formBilingualHint: "Fill each field in both languages. If you leave one empty, the other language is shown instead.",
    formTools: "Technologies",
    formToolsPlaceholder: "JavaScript, React…",
    formAdd: "Add",
    formReadme: "README — detailed description",
    formReadmePlaceholder: "What the project does, which tools you used, what challenges you solved…",
    formSave: "Save",
    formSaving: "Saving…",
    formCancel: "Cancel",
    formImageError: "Couldn't process the image. Try another file.",
    formSaveFailed: "Save failed: ",
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
      "About data collection: the data here is real and collected server-side. We collect what's possible anonymously — where the visitor came from (referrer), estimated country/city by IP, device type, and the date. An anonymous visitor's email address is not exposed to any website in the browser — so it is never collected and never shown.",
  },
  he: {
    brand: "PORTFOLIO",
    langSwitch: "English",
    adminLogin: "כניסת מנהל",
    adminMode: "מצב מנהל",
    logout: "יציאה",
    close: "סגירה",
    heroSubtitle:
      "הבית הדיגיטלי שמרכז את כל הפרויקטים האמיתיים שיצרתי לאחרונה — לחיצה על כל כרטיסייה חושפת את הסיפור המלא מאחורי הפרויקט.",
    tabProjects: "פרויקטים",
    tabAnalytics: "נתוני צפייה",
    tabSettings: "הגדרות",
    addProject: "+ הוסף פרויקט",
    cardView: "צפייה בפרויקט ←",
    edit: "עריכה",
    delete: "מחיקה",
    loading: "טוען…",
    loadingData: "טוען נתונים…",
    retry: "נסה שוב",
    emptyAdmin: "אין עדיין פרויקטים. לחצי על ‘+ הוסף פרויקט’ כדי להתחיל.",
    emptyClient: "אין עדיין פרויקטים. חזרו בקרוב!",
    notConnectedTitle: "האתר עדיין לא מחובר ל-Supabase.",
    notConnectedBody:
      "צרי קובץ .env לפי .env.example עם הכתובת והמפתח הציבורי של הפרויקט, ואז הפעילי מחדש את השרת. ההוראות המלאות נמצאות ב-README.",
    projLoadFailed: "טעינת הפרויקטים נכשלה: ",
    deleteConfirm: "למחוק את הפרויקט הזה?",
    deleteFailed: "המחיקה נכשלה: ",
    modalReadme: "README — על הפרויקט",
    modalOpen: "פתיחת הפרויקט ↗",
    formNew: "פרויקט חדש",
    formEdit: "עריכת פרויקט",
    formUploadLogo: "העלאת לוגו",
    formLogoHint: "התמונה תוקטן אוטומטית ותישמר באחסון",
    formName: "שם המוצר",
    formShort: "תיאור קצר (שורה אחת)",
    formLink: "קישור לפרויקט",
    suffixEn: "(אנגלית)",
    suffixHe: "(עברית)",
    formBilingualHint: "מלאי כל שדה בשתי השפות. אם תשאירי אחד ריק — תוצג השפה השנייה במקומו.",
    formTools: "כלים טכנולוגיים",
    formToolsPlaceholder: "JavaScript, React…",
    formAdd: "הוסף",
    formReadme: "README — תיאור מפורט",
    formReadmePlaceholder: "מה הפרויקט עושה, באילו כלים השתמשת, אילו אתגרים פתרת…",
    formSave: "שמירה",
    formSaving: "שומר…",
    formCancel: "ביטול",
    formImageError: "לא הצלחתי לעבד את התמונה. נסי קובץ אחר.",
    formSaveFailed: "השמירה נכשלה: ",
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
      "על איסוף הנתונים: הנתונים כאן אמיתיים ונאספים בצד-שרת. נאסף מה שאפשר באופן אנונימי — מאיפה הגיע המבקר (referrer), מדינה/עיר משוערת לפי כתובת ה-IP, סוג המכשיר, והתאריך. כתובת המייל של מבקר אנונימי אינה חשופה לאף אתר בדפדפן — לכן היא לא נאספת ולא מוצגת.",
  },
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

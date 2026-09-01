// ============================================================
//  Work history, education and recognition.
//
//  Every fact here is taken from the CV in public/docs/ — nothing is inferred
//  or embellished. The Hebrew is a translation of the same content, not a
//  different claim. If the CV changes, change this file with it; the two are
//  handed to the same recruiter and must not disagree.
//
//  Kept as data rather than i18n strings because it is a list that grows, and
//  because a role is one fact expressed in two languages rather than two
//  independent strings that can drift apart.
// ============================================================

export const EXPERIENCE = [
  {
    id: "kosher-place",
    from: "2025-03",
    to: null, // null = current
    company: "The Kosher Place",
    location: { en: "Bangkok, Thailand", he: "בנגקוק, תאילנד" },
    title: {
      en: "Full Stack Developer & Operations Coordinator",
      he: "מפתחת Full Stack ורכזת תפעול",
    },
    stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Vercel Edge", "PostgreSQL"],
    bullets: [
      {
        en: "Built and shipped J-Cafe Online, a production ordering and delivery platform for a 6-branch kosher restaurant and grocery chain: bilingual (Hebrew RTL / English), up to 4 storefronts per branch and 4 role-based interfaces.",
        he: "בניתי והשקתי את J-Cafe Online — פלטפורמת הזמנות ומשלוחים בפרודקשן לרשת מסעדות ומכולת כשרה בת 6 סניפים: דו-לשונית (עברית RTL / אנגלית), עד 4 חזיתות חנות לסניף ו-4 ממשקים לפי תפקיד.",
      },
      {
        en: "Integrated it live with Odoo ERP/POS over JSON-RPC (catalog, stock, pricelists, POS order injection), Stripe (authorize and capture, refunds, webhooks), Shipday courier dispatch and WhatsApp / LINE / SMS messaging.",
        he: "חיברתי אותה בזמן אמת ל-Odoo ERP/POS דרך JSON-RPC (קטלוג, מלאי, מחירונים והזרקת הזמנות לקופה), ל-Stripe (אישור וחיוב, זיכויים, webhooks), לשליחויות Shipday ולהודעות WhatsApp / LINE / SMS.",
      },
      {
        en: "Architected multi-tenancy — per-branch domain routing at the edge, data isolation and branding — with server-enforced RBAC, signed sessions, webhook signature verification and rate limiting.",
        he: "תכננתי ארכיטקטורת ריבוי-דיירים — ניתוב דומיין לכל סניף ב-edge, בידוד נתונים ומיתוג — עם RBAC נאכף בשרת, סשנים חתומים, אימות חתימת webhooks והגבלת קצב.",
      },
      {
        en: "Built custom subsystems: ESC/POS receipt printing, Hebrew PDF generation in headless Chrome, a store-credit ledger, cron jobs and an in-house CX analytics module.",
        he: "בניתי תת-מערכות ייעודיות: הדפסת קבלות ESC/POS, הפקת PDF בעברית ב-Chrome headless, ספר זכויות לקוח, משימות cron ומודול אנליטיקת CX פנימי.",
      },
      {
        en: "Designed and built Air Manage, a maintenance and asset management platform (React, Node.js, PostgreSQL) in daily use by 15+ employees: dynamic task scheduling, RBAC and multi-channel notifications (in-app, email, LINE).",
        he: "עיצבתי ובניתי את Air Manage — פלטפורמת ניהול תחזוקה ונכסים (React, Node.js, PostgreSQL) בשימוש יומיומי של 15+ עובדים: תזמון משימות דינמי, RBAC והתראות רב-ערוציות (באפליקציה, מייל, LINE).",
      },
    ],
  },
];

export const EDUCATION = [
  {
    id: "lev",
    from: "2020",
    to: "2024",
    institution: { en: "Lev Academic Center", he: "המרכז האקדמי לב" },
    degree: { en: "B.Sc. in Software Engineering", he: "תואר ראשון (B.Sc.) בהנדסת תוכנה" },
  },
];

export const AWARDS = [
  {
    id: "nlp-2023",
    year: "2023",
    title: {
      en: "2nd place, Outstanding Projects Competition",
      he: "מקום שני, תחרות הפרויקטים המצטיינים",
    },
    detail: {
      en: "Sensitive Data Detection & Encryption System — a Python system that detects and encrypts sensitive data in documents using Regex and NLP techniques, built in a team. National Digital Agency, Jerusalem.",
      he: "מערכת לזיהוי והצפנה של מידע רגיש — מערכת Python שמזהה ומצפינה מידע רגיש במסמכים באמצעות Regex וטכניקות NLP, שנבנתה בעבודת צוות. מערך הדיגיטל הלאומי, ירושלים.",
    },
  },
];

export const LANGUAGES = [
  { en: "Hebrew — native", he: "עברית — שפת אם" },
  { en: "English — professional working proficiency", he: "אנגלית — רמה מקצועית גבוהה" },
];

// "2025-03" -> "March 2025" / "מרץ 2025". Present roles render as "Present".
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  he: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
};

export function formatPeriod(from, to, lang, presentLabel) {
  const one = (v) => {
    if (!v) return presentLabel;
    const [y, m] = v.split("-");
    if (!m) return y;
    return `${MONTHS[lang][Number(m) - 1]} ${y}`;
  };
  return `${one(from)} – ${one(to)}`;
}

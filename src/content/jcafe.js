// ============================================================
//  J-Cafe Online - the case study content.
//
//  Why this is in the repository and not in the database, unlike every other
//  piece of project copy:
//
//    - It is long-form, structured writing with a fixed shape (five labelled
//      sections per case study), not a free-text field an editor fills in.
//    - The page is prerendered at build time, and content that lives here has
//      no database round-trip to wait for and cannot be missing.
//    - It follows src/content/resume.js, which is here for the same reasons.
//
//  The `projects` row for J-Cafe still owns the CARD on the home page - its
//  name, summary, screenshot and links. This file owns the case study page.
//  The two are joined by `slug` (supabase/migrations/005-project-slug.sql).
//
//  Bilingual like everything else on this site: `en` and `he` are the same
//  claim in two languages, never two different claims. The English is the
//  source; if a fact changes, change both.
//
//  House style, and it is deliberate: plain engineering prose, no marketing
//  vocabulary, and short hyphens rather than em dashes in anything rendered.
// ============================================================

// Numbers a reader can check, each with the scope it was measured over.
//
// `scope` is not decoration and must never be dropped: "483 orders" on its own
// invites the reader to assume it is the whole chain over the whole year. It
// is one branch over one quarter, and saying so is the difference between a
// measurement and a boast.
export const METRICS = [
  {
    id: "orders",
    value: "483",
    label: { en: "orders", he: "הזמנות" },
    scope: { en: "one branch, Jun-Aug 2025", he: "סניף אחד, יוני-אוגוסט 2025" },
  },
  {
    id: "revenue",
    value: "฿917K",
    label: { en: "revenue (~$28K)", he: "מחזור (כ-28 אלף דולר)" },
    scope: { en: "same branch and period", he: "אותו סניף ואותה תקופה" },
  },
  {
    id: "aov",
    value: "฿1,878",
    label: { en: "average order value", he: "ערך הזמנה ממוצע" },
    scope: { en: "same branch and period", he: "אותו סניף ואותה תקופה" },
  },
  {
    id: "mobile",
    value: "87%",
    label: { en: "of sessions on mobile", he: "מהסשנים בנייד" },
    scope: { en: "same branch and period", he: "אותו סניף ואותה תקופה" },
  },
  {
    id: "couriers",
    value: "6",
    label: { en: "couriers dispatched", he: "שליחים בשיגור" },
    scope: { en: "through the platform", he: "דרך הפלטפורמה" },
  },
  {
    id: "interfaces",
    value: "4",
    label: { en: "role-based interfaces", he: "ממשקים לפי תפקיד" },
    scope: { en: "customer, manager, picker, floor", he: "לקוח, מנהל, מלקט, צוות רצפה" },
  },
];

export const STACK = [
  "Next.js 16 (App Router, RSC)",
  "React 19",
  "TypeScript",
  "Tailwind 4",
  "Supabase / PostgreSQL",
  "Vercel Edge Middleware",
  "PWA + Web Push",
  "node:test",
];

export const SUMMARY = {
  en: "A multi-branch bilingual ordering and delivery platform running live in production for a 6-branch kosher restaurant and grocery chain in Thailand.",
  he: "פלטפורמת הזמנות ומשלוחים רב-סניפית ודו-לשונית, שרצה בפרודקשן עבור רשת מסעדות ומכולת כשרה בת 6 סניפים בתאילנד.",
};

export const ROLE = {
  en: "Sole developer - architecture, implementation, integrations and operations.",
  he: "מפתחת יחידה - ארכיטקטורה, מימוש, אינטגרציות ותפעול.",
};

export const OVERVIEW = {
  en: "J-Cafe Online serves six branches across Thailand, each with up to four storefronts (restaurant, deli, grocery, catering) on its own branded domain. The platform is fully bilingual with Hebrew RTL and English, and exposes four distinct interfaces: customer storefront, manager dashboard, order-picker with barcode scanning, and floor staff. It runs live against the company's Odoo ERP/POS, takes real payments through Stripe, and dispatches a courier fleet through Shipday.",
  he: "‏J-Cafe Online משרתת שישה סניפים ברחבי תאילנד, לכל אחד עד ארבע חזיתות חנות (מסעדה, מעדנייה, מכולת וקייטרינג) על דומיין ממותג משלו. הפלטפורמה דו-לשונית לחלוטין, עברית RTL ואנגלית, וחושפת ארבעה ממשקים נפרדים: חנות הלקוח, לוח הבקרה של המנהל, מסך הליקוט עם סריקת ברקוד, וצוות הרצפה. היא רצה בזמן אמת מול מערכת ה-ERP/POS של החברה ב-Odoo, גובה תשלומים אמיתיים דרך Stripe, ומשגרת צי שליחים דרך Shipday.",
};

// The three case studies. One project, one page: they are three problems
// inside the same system, not three portfolio entries, and splitting them
// would misrepresent the work as three smaller things.
//
// Every one has the same five sections in the same order, so the page can be
// skimmed by reading only the labels.
export const CASE_STUDIES = [
  {
    id: "branch-identity",
    number: "01",
    title: {
      en: "Making the server the source of truth for branch identity",
      he: "להפוך את השרת למקור האמת לזהות הסניף",
    },
    context: {
      en: "Six branches share one codebase. Each branch has its own catalog, pricing, stock and storefronts, resolved per request from the domain the customer arrived on.",
      he: "שישה סניפים חולקים בסיס קוד אחד. לכל סניף קטלוג, תמחור, מלאי וחזיתות חנות משלו, שנפתרים לכל בקשה לפי הדומיין שדרכו הגיע הלקוח.",
    },
    problem: {
      en: "Branch identity was being decided on the client and passed around the application. Roughly 38 places in the code fell back to a hardcoded default branch when that value was missing or arrived late. In practice a customer could see products and prices belonging to a different branch than the one they were ordering from - a defect that reaches real money and a real kitchen.",
      he: "זהות הסניף נקבעה בצד הלקוח והועברה הלאה בתוך האפליקציה. בכ-38 מקומות בקוד היה נסיגה לסניף ברירת מחדל קשיח כשהערך הזה היה חסר או הגיע באיחור. בפועל לקוח היה עלול לראות מוצרים ומחירים של סניף אחר מזה שממנו הזמין - תקלה שנוגעת בכסף אמיתי ובמטבח אמיתי.",
    },
    constraints: {
      en: "The system was already live and taking orders, so the fix had to ship without downtime and without invalidating carts that customers had in progress.",
      he: "המערכת כבר הייתה חיה וקלטה הזמנות, ולכן התיקון היה חייב לצאת בלי השבתה ובלי לבטל עגלות שלקוחות היו באמצע.",
    },
    decision: {
      en: "Rather than patching the fallbacks individually, I moved branch resolution to the server and made it authoritative: a single resolveOrderCompany path determines the branch, and an httpOnly cookie carries it as the only source of truth. Cart state was re-keyed per branch so a cart can never travel across branches. Every one of the hardcoded fallbacks was removed rather than made safer - a fallback that silently succeeds is worse than one that fails loudly.",
      he: "במקום לטלא כל נסיגה בנפרד, העברתי את פתרון הסניף לשרת והפכתי אותו לסמכותי: מסלול יחיד בשם resolveOrderCompany קובע את הסניף, ועוגייה מסוג httpOnly נושאת אותו כמקור האמת היחיד. מצב העגלה מומפתח מחדש לפי סניף, כך שעגלה לא יכולה לעבור בין סניפים. כל אחת מנסיגות ברירת המחדל הקשיחות הוסרה במקום להפוך לבטוחה יותר - נסיגה שמצליחה בשקט גרועה מנסיגה שנכשלת בקול.",
    },
    outcome: {
      en: "Cross-branch leakage eliminated. The test suite grew from 7 to 38 passing tests covering branch resolution, cart isolation and the routing edge cases, so the class of bug is now guarded rather than fixed once.",
      he: "דליפה בין סניפים בוטלה. חבילת הבדיקות גדלה מ-7 ל-38 בדיקות עוברות שמכסות את פתרון הסניף, בידוד העגלה ומקרי הקצה של הניתוב, כך שמחלקת הבאגים הזו שמורה כעת ולא רק תוקנה פעם אחת.",
    },
  },
  {
    id: "integrations",
    number: "02",
    title: {
      en: "Integrating with systems I do not control",
      he: "אינטגרציה עם מערכות שאינן בשליטתי",
    },
    context: {
      en: "The chain already ran on Odoo ERP/POS before the platform existed. Kitchen displays, stock and pricing all live there, and the business could not be asked to change how it operates to suit a new website.",
      he: "הרשת כבר פעלה על Odoo ERP/POS עוד לפני שהפלטפורמה נולדה. מסכי המטבח, המלאי והתמחור חיים שם, ואי אפשר היה לבקש מהעסק לשנות את אופן עבודתו כדי להתאים לאתר חדש.",
    },
    problem: {
      en: "The storefront had to reflect Odoo's catalog, stock levels and pricelists in real time, and orders placed online had to appear in the POS exactly as if they had been rung up at the counter. On top of that, payment had to be authorized before the kitchen committed, and delivery had to reach a courier fleet.",
      he: "חזית החנות הייתה חייבת לשקף בזמן אמת את הקטלוג, רמות המלאי והמחירונים של Odoo, והזמנות שנקלטו אונליין היו חייבות להופיע בקופה בדיוק כאילו הוקלדו בדלפק. בנוסף, התשלום היה חייב לקבל אישור לפני שהמטבח מתחייב, והמשלוח היה חייב להגיע לצי שליחים.",
    },
    constraints: {
      en: "Odoo's JSON-RPC API, Stripe's webhook semantics and Shipday's dispatch model were all fixed. Each is a system that can fail independently, at any time, while a customer is mid-checkout.",
      he: "‏API של Odoo מבוסס JSON-RPC, סמנטיקת ה-webhooks של Stripe ומודל השיגור של Shipday - כולם נתונים ואינם ניתנים לשינוי. כל אחד מהם עלול ליפול באופן עצמאי, בכל רגע, בזמן שלקוח נמצא באמצע התשלום.",
    },
    decision: {
      en: "I built a dedicated integration layer per system rather than calling them from feature code: Odoo over JSON-RPC for catalog, stock, pricelists, POS order injection and multi-company handling; Stripe with authorize-and-capture so the customer is only charged once the order is accepted, plus saved cards, partial refunds and signature-verified webhooks; Shipday for courier dispatch; and WhatsApp Cloud API, LINE and Twilio SMS for customer messaging. Every inbound webhook is signature-verified and rate limited, and failures degrade to a state staff can resolve manually rather than silently dropping an order.",
      he: "בניתי שכבת אינטגרציה ייעודית לכל מערכת במקום לקרוא להן מתוך קוד הפיצ'רים: ל-Odoo דרך JSON-RPC עבור קטלוג, מלאי, מחירונים, הזרקת הזמנות לקופה וטיפול בריבוי חברות; ל-Stripe עם אישור-וגבייה כך שהלקוח מחויב רק לאחר שההזמנה התקבלה, לצד כרטיסים שמורים, זיכויים חלקיים ו-webhooks מאומתי חתימה; ל-Shipday עבור שיגור שליחים; ול-WhatsApp Cloud API, ‏LINE ו-Twilio SMS עבור הודעות ללקוח. כל webhook נכנס עובר אימות חתימה והגבלת קצב, וכשלים מתנוונים למצב שהצוות יכול לפתור ידנית במקום להפיל הזמנה בשקט.",
    },
    outcome: {
      en: "Online orders land in the POS alongside walk-in orders with no manual re-entry, and a 6-driver courier fleet is dispatched directly from the platform.",
      he: "הזמנות אונליין נוחתות בקופה לצד הזמנות מהדלפק בלי הקלדה חוזרת, וצי שליחים בן 6 נהגים משוגר ישירות מהפלטפורמה.",
    },
  },
  {
    id: "analytics",
    number: "03",
    title: {
      en: "Measuring the funnel instead of guessing at it",
      he: "למדוד את המשפך במקום לנחש אותו",
    },
    context: {
      en: "Once the platform was live, the questions from the business stopped being about features and became about behaviour: where are people dropping off, how long does it take to order, are customers using Hebrew or English.",
      he: "מרגע שהפלטפורמה עלתה לאוויר, השאלות מצד העסק חדלו לעסוק בפיצ'רים והפכו לשאלות על התנהגות: איפה אנשים נוטשים, כמה זמן לוקח להזמין, והאם לקוחות משתמשים בעברית או באנגלית.",
    },
    problem: {
      en: "Off-the-shelf analytics answered none of this well. The funnel is unusual - branch selection, storefront selection, cart, checkout - and the data needed to stay in our own database rather than a third party's, given that it is tied to customers and orders.",
      he: "כלי אנליטיקה מהמדף לא ענו על אף אחת מהשאלות האלה כמו שצריך. המשפך חריג - בחירת סניף, בחירת חזית חנות, עגלה, תשלום - והנתונים היו צריכים להישאר במסד הנתונים שלנו ולא אצל צד שלישי, מכיוון שהם קשורים ללקוחות ולהזמנות.",
    },
    constraints: {
      en: "It had to be lightweight enough not to affect page performance, and consent-aware.",
      he: "המודול היה חייב להיות קליל מספיק כדי לא לפגוע בביצועי העמוד, ומודע להסכמת המשתמש.",
    },
    decision: {
      en: "I built the CX analytics module in-house: session and funnel tracking across the full ordering path, Web Vitals collection, conversion and abandonment measurement, device and interface-language breakdown, consent handling and CSV export.",
      he: "בניתי את מודול אנליטיקת ה-CX בבית: מעקב סשנים ומשפך לאורך כל מסלול ההזמנה, איסוף Web Vitals, מדידת המרה ונטישה, פילוח לפי מכשיר ולפי שפת ממשק, טיפול בהסכמה וייצוא ל-CSV.",
    },
    outcome: {
      en: "The business now works from measured numbers rather than impressions: average order value, mobile share of traffic, time-to-order, interface language split, and which step of the funnel loses people. Those numbers directly informed which parts of the checkout got rebuilt.",
      he: "העסק עובד כיום לפי מספרים מדודים ולא לפי התרשמות: ערך הזמנה ממוצע, נתח התנועה בנייד, זמן עד להזמנה, פילוח שפת הממשק, ואיזה שלב במשפך מאבד אנשים. המספרים האלה הכתיבו ישירות אילו חלקים בתהליך התשלום נבנו מחדש.",
    },
  },
];

// ============================================================
//  Screenshot slots.
//
//  Deliberately empty. `src: null` renders the placeholder frame with its
//  caption and reserves the right aspect ratio, so adding a file later does
//  not reflow the page.
//
//  !!  BEFORE COMMITTING ANY IMAGE HERE  !!
//  These screenshots are of a live production admin area. The customer list,
//  the order views and the courier views show REAL NAMES, EMAIL ADDRESSES AND
//  PHONE NUMBERS of the chain's customers. Redact them in the image itself -
//  paint over the pixels, do not rely on a CSS blur, a crop that can be
//  scrolled, or a low-resolution export.
//
//  A committed image cannot be un-published: it is in the git history, in
//  every clone, and in the CDN cache, even if the next commit deletes it.
// ============================================================
export const SHOTS = [
  {
    id: "manager-dashboard",
    src: null,
    // 16/10 rather than 16/9: these are browser windows, and the frame should
    // match the shape of what goes in it.
    aspect: "16 / 10",
    alt: {
      en: "The manager dashboard, showing the day's orders for one branch.",
      he: "לוח הבקרה של המנהל, עם הזמנות היום עבור סניף אחד.",
    },
    caption: {
      en: "Manager dashboard - the day's orders for a single branch.",
      he: "לוח הבקרה של המנהל - הזמנות היום עבור סניף בודד.",
    },
  },
  {
    id: "order-picker",
    src: null,
    aspect: "16 / 10",
    alt: {
      en: "The order-picker interface with barcode scanning.",
      he: "ממשק הליקוט עם סריקת ברקוד.",
    },
    caption: {
      en: "Order-picker - barcode scanning against the Odoo catalog.",
      he: "מסך הליקוט - סריקת ברקוד מול הקטלוג ב-Odoo.",
    },
  },
  {
    id: "cx-analytics",
    src: null,
    aspect: "16 / 10",
    alt: {
      en: "The in-house CX analytics module, showing the ordering funnel.",
      he: "מודול אנליטיקת ה-CX הפנימי, עם משפך ההזמנה.",
    },
    caption: {
      en: "CX analytics - the ordering funnel, measured in our own database.",
      he: "אנליטיקת CX - משפך ההזמנה, נמדד במסד הנתונים שלנו.",
    },
  },
];

// The slug that joins this file to its row in `projects`.
export const SLUG = "j-cafe";

// Which metrics the home page card shows. The card has room for four, and
// showing all six there would make it a table rather than a card - the full
// strip is on the case study page. Named explicitly rather than sliced, so
// reordering METRICS cannot silently change what the card leads with.
export const CARD_METRIC_IDS = ["orders", "revenue", "aov", "mobile"];

export const JCAFE = {
  slug: SLUG,
  name: "J-Cafe Online",
  summary: SUMMARY,
  role: ROLE,
  stack: STACK,
  metrics: METRICS,
  cardMetrics: METRICS.filter((m) => CARD_METRIC_IDS.includes(m.id)),
  overview: OVERVIEW,
  caseStudies: CASE_STUDIES,
  shots: SHOTS,
};

// Every case study page, keyed by slug. One today; the shape is what makes a
// second one a content change rather than a new page component.
export const CASE_STUDY_PAGES = { [SLUG]: JCAFE };

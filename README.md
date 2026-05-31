# תיק העבודות של טליה ישראל

דשבורד תיק־עבודות (portfolio) אמיתי ומלא: גלריית כרטיסיות לצופים, מצב מנהל מאובטח להוספה/עריכה/מחיקה,
העלאת לוגואים לאחסון, ואנליטיקה אמיתית בצד־שרת. הכול על שירותים חינמיים.

- **Frontend:** Vite + React (RTL בעברית, פונטים Frank Ruhl Libre + Assistant, פלטה חמה — נשמר מהאב־טיפוס)
- **דאטהבייס + התחברות + אחסון תמונות:** Supabase
- **אירוח + צד־שרת:** Netlify + Netlify Functions

---

## מבנה הפרויקט

```
talya-portfolio/
├─ index.html
├─ package.json
├─ vite.config.js
├─ netlify.toml                 הגדרות בנייה ופונקציות ל-Netlify
├─ .env.example                 תבנית למפתחות (ה-.env האמיתי לא נכנס ל-git)
├─ supabase/
│  └─ schema.sql                כל הטבלאות, האבטחה (RLS), ה-bucket וה-seed
├─ netlify/functions/
│  └─ track.js                  פונקציית צד-שרת שרושמת כל אירוע אנליטיקה
└─ src/
   ├─ main.jsx                  נקודת הכניסה
   ├─ App.jsx                   הרכבה ראשית + ניהול state
   ├─ styles.js                 צבעים + ה-CSS (העיצוב המקורי)
   ├─ lib/
   │  ├─ supabaseClient.js      חיבור ל-Supabase (קורא משתני סביבה)
   │  └─ analytics.js           שולח אירועים ל-/api/track
   ├─ hooks/
   │  ├─ useAuth.js             session של המנהל
   │  └─ useProjects.js         קריאה/הוספה/עריכה/מחיקה + העלאת לוגו
   ├─ utils/  logo.js, image.js
   └─ components/  Header, ProjectCard, ProjectModal, ProjectForm,
                   Login, AdminTabs, Analytics, Settings, Modal, Feedback
```

---

## שני מצבים

- **צופה (ברירת מחדל):** רואה את כל הפרויקטים, בלי סיסמה ובלי כפתורי עריכה.
- **מנהל:** מתחבר עם אימייל + סיסמה (Supabase Auth). רואה כפתורי עריכה, מסך אנליטיקה ומסך הגדרות.

## אבטחה

- **Row Level Security אמיתי** בבסיס הנתונים: קריאת פרויקטים פתוחה לכולם, אבל הוספה/עריכה/מחיקה — רק
  למשתמש מחובר.
- טבלת האנליטיקה נכתבת **רק** מהשרת (Netlify Function) עם מפתח סודי; קריאה ממנה — רק למנהל מחובר.
- **אף מפתח סודי לא נמצא בקוד.** המפתח הציבורי (anon) נמצא ב-`.env` והוא מוגן ב-RLS; המפתח הסודי
  (service_role) קיים רק במשתני הסביבה של Netlify.

## אנליטיקה — מה נאסף ומה לא

לכל אירוע (כניסה לאתר / פתיחת כרטיסייה / קליק על קישור) נאספים בצד־שרת: **referrer** (מאיפה הגיע),
**מדינה/עיר** משוערת לפי IP (דרך ה-geo של Netlify, בלי שירות חיצוני), **סוג מכשיר**, ו**תאריך**.

> **חשוב:** את כתובת המייל של מבקר אנונימי **אי אפשר** לדעת — היא לא חשופה לאף אתר בדפדפן. לכן היא
> לא נאספת ולא מוצגת. נאסף רק מה שניתן לאסוף באופן אנונימי.

---

## הרצה מקומית (קצר)

> דורש שכבר הקמת פרויקט Supabase ויש לך קובץ `.env` — ראי "התקנה מאפס" למטה.

```bash
npm install
npm run dev
```

האתר ייפתח ב-http://localhost:5173. כדי שגם האנליטיקה תעבוד מקומית, הריצי במקום זה `netlify dev`
(ראי שלב 5 למטה).

---

# התקנה מאפס — צעד אחר צעד

כל מקום שבו צריך חשבון או מפתח מסומן ב-🔑. את פקודות הטרמינל אפשר להריץ בעצמך או לבקש ממני.

## שלב 1 — חשבון Supabase ופרויקט 🔑

1. היכנסי ל-https://supabase.com ולחצי **Start your project** → התחברי (הכי קל עם GitHub או Google).
2. **New project** → תני שם (למשל `talya-portfolio`), בחרי **Region** קרוב (Frankfurt),
   והגדירי **Database Password** חזקה — **שמרי אותה בצד**. לחצי **Create new project** והמתיני ~דקה.

## שלב 2 — יצירת הטבלאות והאבטחה

1. בתפריט הצד של Supabase: **SQL Editor** → **New query**.
2. פתחי את הקובץ `supabase/schema.sql` שבפרויקט, העתיקי את **כל** התוכן, הדביקי בעורך, ולחצי **Run**.
3. אמורה להופיע הודעת הצלחה. זה יצר את הטבלאות, את כללי האבטחה, את ה-bucket לתמונות, ואת 3 פרויקטי
   הדוגמה.

## שלב 3 — יצירת משתמש המנהל (זאת את) 🔑

1. בתפריט הצד: **Authentication** → **Users** → **Add user** → **Create new user**.
2. הזיני **אימייל** ו**סיסמה** (אלה פרטי ההתחברות שלך לאתר) → סמני **Auto Confirm User** → **Create user**.
   > אין הרשמה ציבורית — רק המשתמש הזה יכול להתחבר כמנהל.

## שלב 4 — העתקת המפתחות לקובץ ‎.env 🔑

1. בתפריט הצד: **Project Settings** (גלגל שיניים) → **API**.
2. העתיקי:
   - **Project URL** → לשורות `VITE_SUPABASE_URL` וגם `SUPABASE_URL`.
   - **anon public** key → ל-`VITE_SUPABASE_ANON_KEY`.
   - **service_role** key (תחת "Project API keys", לחצי "Reveal") → ל-`SUPABASE_SERVICE_ROLE_KEY`.
     ⚠️ זה מפתח **סודי** — לא לשתף ולא להעלות ל-git.
3. בתיקיית הפרויקט: העתיקי את `.env.example` לקובץ חדש בשם `.env` ומלאי את הערכים.
   (אפשר ב-VS Code: לחיצה ימנית על `.env.example` → Copy → Paste → שינוי שם ל-`.env`.)

## שלב 5 — הרצה מקומית עם פונקציות

כדי שגם האנליטיקה תעבוד מקומית, צריך את הכלי של Netlify:

```bash
npm install -g netlify-cli
netlify dev
```

זה מפעיל גם את ה-Frontend וגם את `track.js`, וטוען את משתני הסביבה מ-`.env`. כתובת מקומית תופיע
בטרמינל (בדרך כלל http://localhost:8888). התחברי דרך "כניסת מנהל" עם האימייל והסיסמה משלב 3.

> רוצה רק לראות את העיצוב בלי אנליטיקה? `npm run dev` מספיק.

---

# העלאה לאוויר — דרך GitHub + Netlify

## שלב 6 — העלאת הקוד ל-GitHub 🔑

1. צרי חשבון ב-https://github.com (אם אין).
2. צרי מאגר חדש: **+** למעלה מימין → **New repository** → שם (`talya-portfolio`) → **Private** או
   **Public** → **Create repository**. אל תוסיפי README/‏.gitignore (כבר יש).
3. בתיקיית הפרויקט הריצי (החליפי `USERNAME`):

```bash
git init
git add .
git commit -m "Talya portfolio — full site"
git branch -M main
git remote add origin https://github.com/USERNAME/talya-portfolio.git
git push -u origin main
```

> ה-`.gitignore` כבר מוודא ש-`.env` ו-`node_modules` **לא** עולים.

## שלב 7 — חיבור Netlify 🔑

1. היכנסי ל-https://netlify.com → **Sign up** / **Log in** (הכי קל עם GitHub).
2. **Add new site** → **Import an existing project** → **Deploy with GitHub** → אשרי גישה → בחרי את
   המאגר `talya-portfolio`.
3. הגדרות הבנייה אמורות להיקרא אוטומטית מ-`netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **לפני** הלחיצה על Deploy — לחצי **Add environment variables** (או אחר כך: Site configuration →
   Environment variables) והוסיפי **ארבעה** משתנים, בדיוק עם השמות האלה:

   | שם המשתנה | הערך |
   |---|---|
   | `VITE_SUPABASE_URL` | ה-Project URL |
   | `VITE_SUPABASE_ANON_KEY` | מפתח anon public |
   | `SUPABASE_URL` | אותו Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | מפתח service_role (הסודי) |

5. לחצי **Deploy site**. אחרי ~דקה יופיע קישור (כמו `random-name.netlify.app`). זהו — האתר באוויר.

## שלב 8 — בדיקה

1. פתחי את הקישור: את אמורה לראות את 3 הפרויקטים.
2. **כניסת מנהל** → התחברי → נסי להוסיף פרויקט עם לוגו, ולמחוק.
3. גלשי קצת, ואז כמנהלת → לשונית **נתוני צפייה** → אמורות להופיע צפיות, מקורות ומדינה.

### אופציונלי — שם וכתובת
- **שם אתר יפה יותר:** Netlify → Site configuration → **Change site name**.
- **דומיין משלך:** Netlify → **Domain management** → Add a domain.

---

## בעיות נפוצות

- **"האתר עדיין לא מחובר ל-Supabase"** — חסר `.env` (מקומי) או חסרים משתני סביבה ב-Netlify. בדקי שמות
  מדויקים. אחרי שינוי משתנים ב-Netlify צריך **Deploys → Trigger deploy → Deploy site**.
- **התחברות מנהל נכשלת** — ודאי שיצרת משתמש (שלב 3) ושסימנת Auto Confirm.
- **לוגו לא נשמר** — ודאי שה-SQL רץ במלואו (יצר את bucket `logos`) ושאת מחוברת כמנהל.
- **האנליטיקה ריקה** — נתונים נאספים רק מביקורים אמיתיים אחרי שהאתר עלה; ה-geo עובד רק בענן, לא ב-localhost.

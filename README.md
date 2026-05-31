# Talya Israel — Portfolio

A real, full portfolio dashboard: a public card gallery for visitors, a secure admin mode for
add/edit/delete, logo uploads to storage, and real server-side analytics. Everything runs on free
services.

- **Frontend:** Vite + React (RTL Hebrew, Frank Ruhl Libre + Assistant fonts, warm editorial palette — kept from the prototype)
- **Database + Auth + image storage:** Supabase
- **Hosting + server-side:** Netlify + Netlify Functions

---

## Project structure

```
talya-portfolio/
├─ index.html
├─ package.json
├─ vite.config.js
├─ netlify.toml                 Netlify build & functions configuration
├─ .env.example                 Template for the keys (the real .env is git-ignored)
├─ supabase/
│  └─ schema.sql                All tables, security (RLS), the bucket, and the seed
├─ netlify/functions/
│  └─ track.js                  Server-side function that records each analytics event
└─ src/
   ├─ main.jsx                  Entry point
   ├─ App.jsx                   Main composition + state
   ├─ styles.js                 Colors + CSS (the original design)
   ├─ lib/
   │  ├─ supabaseClient.js      Supabase connection (reads env vars)
   │  └─ analytics.js           Sends events to /api/track
   ├─ hooks/
   │  ├─ useAuth.js             Admin session
   │  └─ useProjects.js         Read / create / update / delete + logo upload
   ├─ utils/  logo.js, image.js
   └─ components/  Header, ProjectCard, ProjectModal, ProjectForm,
                   Login, AdminTabs, Analytics, Settings, Modal, Feedback
```

---

## Two modes

- **Visitor (default):** sees all projects, no password, no edit buttons.
- **Admin:** logs in with email + password (Supabase Auth). Sees edit buttons, the analytics screen, and the settings screen.

## Security

- **Real Row Level Security** in the database: reading projects is open to everyone, but
  create/update/delete is only allowed for a logged-in user.
- The analytics table is written **only** from the server (Netlify Function) using a secret key;
  reading from it is only allowed for the logged-in admin.
- **No secret key lives in the code.** The public (anon) key is in `.env` and is protected by RLS;
  the secret (service_role) key exists only in Netlify's environment variables.

## Analytics — what is and isn't collected

For each event (site visit / card open / link click) the following is collected server-side:
**referrer** (where the visitor came from), estimated **country/city** from the IP (via Netlify's
geo lookup, no third-party service), **device type**, and **timestamp**.

> **Important:** an anonymous visitor's email address **cannot** be known — it is not exposed to any
> website in the browser. So it is never collected and never shown. Only what can be collected
> anonymously is collected.

---

## Run locally (short)

> Requires that you've already created a Supabase project and have a `.env` file — see "Setup from
> scratch" below.

```bash
npm install
npm run dev
```

The site opens at http://localhost:5173. To make analytics work locally too, run `netlify dev`
instead (see step 5 below).

---

# Setup from scratch — step by step

Every place that needs an account or a key is marked 🔑.

## Step 1 — Supabase account and project 🔑

1. Go to https://supabase.com and click **Start your project** → sign in (easiest with GitHub or Google).
2. **New project** → give it a name (e.g. `talya-portfolio`), choose a nearby **Region** (Frankfurt),
   and set a strong **Database Password** — **save it somewhere**. Click **Create new project** and
   wait ~1 minute.

## Step 2 — Create the tables and security

1. In the Supabase side menu: **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from the project, copy **all** of it, paste it into the editor, and
   click **Run**.
3. A success message should appear. This created the tables, the security rules, the image bucket,
   and the 3 demo projects.

## Step 3 — Create the admin user (you) 🔑

1. Side menu: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter an **email** and **password** (these are your login credentials for the site) → check
   **Auto Confirm User** → **Create user**.
   > There is no public sign-up — only this user can log in as admin.

## Step 4 — Copy the keys into the `.env` file 🔑

1. Side menu: **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** → into both `VITE_SUPABASE_URL` and `SUPABASE_URL`.
   - **anon public** key → into `VITE_SUPABASE_ANON_KEY`.
   - **service_role** key (under "Project API keys", click "Reveal") → into `SUPABASE_SERVICE_ROLE_KEY`.
     ⚠️ This is a **secret** key — never share it and never push it to git.
3. In the project folder: copy `.env.example` to a new file named `.env` and fill in the values.
   (In VS Code: right-click `.env.example` → Copy → Paste → rename to `.env`.)

## Step 5 — Run locally with functions

To make analytics work locally too, you need Netlify's tool:

```bash
npm install -g netlify-cli
netlify dev
```

This runs both the frontend and `track.js`, loading the env vars from `.env`. A local URL will
appear in the terminal (usually http://localhost:8888). Log in via "כניסת מנהל" (Admin login) with
the email and password from step 3.

> Just want to see the design without analytics? `npm run dev` is enough.

---

# Going live — via GitHub + Netlify

## Step 6 — Push the code to GitHub 🔑

1. Create a GitHub account at https://github.com (if you don't have one).
2. Create a new repository: **+** (top right) → **New repository** → name (`talya-portfolio`) →
   **Private** or **Public** → **Create repository**. Do not add a README/.gitignore (already there).
3. In the project folder run (replace `USERNAME`):

```bash
git init
git add .
git commit -m "Talya portfolio — full site"
git branch -M main
git remote add origin https://github.com/USERNAME/talya-portfolio.git
git push -u origin main
```

> The `.gitignore` already makes sure that `.env` and `node_modules` are **not** pushed.

## Step 7 — Connect Netlify 🔑

1. Go to https://netlify.com → **Sign up** / **Log in** (easiest with GitHub).
2. **Add new site** → **Import an existing project** → **Deploy with GitHub** → grant access → pick
   the `talya-portfolio` repo.
3. The build settings should be read automatically from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Before** clicking Deploy — click **Add environment variables** (or later: Site configuration →
   Environment variables) and add **four** variables, with exactly these names:

   | Variable name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | the Project URL |
   | `VITE_SUPABASE_ANON_KEY` | anon public key |
   | `SUPABASE_URL` | the same Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (the secret one) |

5. Click **Deploy site**. After ~1 minute a link appears (like `random-name.netlify.app`). That's it
   — the site is live.

## Step 8 — Verify

1. Open the link: you should see the 3 projects.
2. **Admin login** → log in → try adding a project with a logo, and deleting one.
3. Browse a bit, then as admin → the **נתוני צפייה** (Analytics) tab → views, sources, and country
   should appear.

### Optional — name and domain
- **Nicer site name:** Netlify → Site configuration → **Change site name**.
- **Your own domain:** Netlify → **Domain management** → Add a domain.

---

## Common issues

- **"האתר עדיין לא מחובר ל-Supabase" (Site not connected to Supabase)** — `.env` is missing (locally)
  or env vars are missing on Netlify. Check the exact names. After changing variables on Netlify you
  need **Deploys → Trigger deploy → Deploy site**.
- **Admin login fails** — make sure you created the user (step 3) and checked Auto Confirm.
- **Logo doesn't save** — make sure the SQL ran fully (created the `logos` bucket) and that you're
  logged in as admin.
- **Analytics is empty** — data is only collected from real visits after the site is live; geo only
  works in the cloud, not on localhost.

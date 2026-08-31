# Helios Queue — Handoff Document

**Project:** Amazfit Helio Strap waitlist / queue manager
**Owner:** Lakshay Gupta (GitHub: `LakGupta`)
**Repo:** https://github.com/LakGupta/new
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Postgres

---

## 1. What this is

A web app for running a first-come, first-served waitlist when reselling Amazfit Helio Straps.

- Public waitlist form where buyers submit Reddit username + WhatsApp
- Admin panel to manage the queue (status, search, WhatsApp links, edit/delete)
- A separate **historical queue** for people who messaged before the webapp existed, sorted by the date/time they claim they messaged

---

## 2. Quick start (local dev)

```bash
cd /Users/lakshaygupta/helios-queue
npm install
cp .env.example .env.local
# Edit .env.local: set ADMIN_PASSWORD (required), WHATSAPP_GROUP_URL (optional),
# DATABASE_URL (optional for local; uses JSON fallback if empty)
npm run dev
```

Open:

| Page | URL |
|------|-----|
| Public waitlist | http://localhost:3000 |
| Historical queue form | http://localhost:3000/historical |
| Admin (new queue) | http://localhost:3000/admin |
| Admin (historical queue) | http://localhost:3000/admin/historical |

---

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_PASSWORD` | Yes (prod) | Password for `/admin` and `/admin/historical` |
| `WHATSAPP_GROUP_URL` | No | WhatsApp group invite link. Hardcoded fallback exists in `src/app/page.tsx`; env var overrides it |
| `DATABASE_URL` | Yes (prod) | Postgres connection string. Also accepts `POSTGRES_URL`, `STORAGE_URL`, `POSTGRES_URL_NON_POOLING` |

Without a database, the app uses local JSON files in `.data/` (dev only). In production it throws a clear "Database is not configured" error instead of crashing on a read-only filesystem.

---

## 4. Features

### Public
- Join form: Reddit username (accepts `u/` prefix), WhatsApp (auto-appends `+91` for 10-digit Indian numbers), optional note
- **No queue number shown** after submitting
- Loading bar while submitting
- "Details" accordion: price ₹13,000, PAN India complimentary shipping, F2F Bangalore, COD not available
- "First come, first served" card + "What queue?" explainer with Person A/B example
- WhatsApp group button as a separate section after the form
- Product photos in `public/images/` (pulled from Amazfit/news sources)
- Historical queue form: Reddit username, WhatsApp, **Month → Day → Time dropdowns** for the exact message time; verification note shown; success message mentions verification

### Admin
- New queue admin: search, status filter, stats, WhatsApp deep links, edit/delete/skip/restore, add manually
- Historical queue admin at `/admin/historical`: same tools + editable "messaged at" datetime, sorted ascending by message time
- Password-protected via cookie session (HMAC-signed, 7-day expiry)

---

## 5. Data model

Two tables (auto-created on first use):

### `entries` (new queue)
```sql
id SERIAL PRIMARY KEY
reddit_username TEXT NOT NULL
whatsapp TEXT NOT NULL
note TEXT
status TEXT NOT NULL DEFAULT 'waiting'
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

### `historical_entries` (historical queue)
```sql
id SERIAL PRIMARY KEY
reddit_username TEXT NOT NULL
whatsapp TEXT NOT NULL
messaged_at TIMESTAMPTZ NOT NULL
note TEXT
status TEXT NOT NULL DEFAULT 'waiting'
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Statuses: `waiting`, `contacted`, `sold`, `no-response`, `skipped`

Historical entries are always loaded with `ORDER BY messaged_at ASC, created_at ASC, id ASC`. An index on `messaged_at` is created during setup.

---

## 6. API routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/entries` | Public | Join the new queue |
| GET | `/api/entries` | Admin | List new queue |
| PATCH / DELETE | `/api/entries/[id]` | Admin | Update/delete new queue entry |
| POST | `/api/historical` | Public | Submit historical queue entry |
| GET | `/api/historical` | Admin | List historical queue (ascending) |
| PATCH / DELETE | `/api/historical/[id]` | Admin | Update/delete historical entry |
| POST | `/api/auth/login` | Public | Admin login (sets cookie) |
| POST | `/api/auth/logout` | Admin | Clear session |
| GET | `/api/auth/check` | Admin | Check session |

---

## 7. Project structure

```text
src/
  app/
    page.tsx                    # Public waitlist page
    historical/page.tsx         # Historical queue form page
    admin/page.tsx              # New queue admin
    admin/historical/page.tsx   # Historical queue admin
    api/
      entries/route.ts
      entries/[id]/route.ts
      historical/route.ts
      historical/[id]/route.ts
      auth/login/route.ts
      auth/logout/route.ts
      auth/check/route.ts
  components/
    join-form.tsx               # Public join form
    historical-join-form.tsx    # Historical form (month/day/time dropdowns)
    product-details.tsx         # "Details" accordion
    queue-explainer.tsx         # "What queue?" accordion
    admin-app.tsx               # New queue admin UI
    historical-admin-app.tsx    # Historical queue admin UI
  lib/
    db.ts                       # Postgres + JSON fallback data layer
    auth.ts                     # Password + session cookie helpers
    validation.ts               # Input validation + WhatsApp normalization
    types.ts                    # Shared types/status constants
public/images/                  # Product photos
.env.example                    # Env template
```

---

## 8. Deployment (Vercel)

1. Push to GitHub (`git push origin main`)
2. Import repo at https://vercel.com/new
3. Add a Postgres database (Vercel Storage → Postgres/Neon, or Neon/Supabase) and set `DATABASE_URL`
4. Add env vars: `ADMIN_PASSWORD`, optional `WHATSAPP_GROUP_URL`
5. Deploy. Tables auto-create on first request.

Netlify also works (build `npm run build`, publish `.next`) but Vercel is the smoothest for Next.js.

---

## 9. Known gotchas / decisions

- **`@vercel/postgres` is deprecated** — the app uses `postgres` (postgres.js) with a standard `DATABASE_URL` instead.
- **Do NOT put multiple SQL statements in one postgres.js template** — it causes `cannot insert multiple commands into a prepared statement`. Split into separate queries (see `ensureHistoricalTable` in `src/lib/db.ts`).
- **Production without `DATABASE_URL`** throws a clear error; the `.data/` JSON fallback is dev-only.
- **WhatsApp normalization**: 10-digit Indian numbers get `91` prepended; `0` prefix stripped; numbers that already have `+91` or another country code are kept as-is.
- **Repo name is `new`** (user created it by accident instead of `helios`). The remote is `https://github.com/LakGupta/new.git`.
- **GitHub tokens** used for pushes should be revoked after use (classic tokens with `repo` scope were used).
- **Vercel deployment protection** may hide the site behind login; disable it or open while logged in.
- **Date dropdown range** on the historical form starts at Jan 2026; extend the range in `historical-join-form.tsx` if needed.
- **Product images** are from Amazfit/news sites; replace with own photos for long-term use.

---

## 10. Recent commits (latest first)

- `3b5d617` — Use month then day dropdowns for historical date
- `988aa75` — Fix multi-statement prepared query in historical table setup
- `8b8d5ea` — Use date/time dropdowns and add verification note on historical form
- `c071028` — Add index for ascending historical queue sort
- `32740ac` — Add historical queue for pre-webapp messages
- `d249080` — Auto-append +91 to Indian WhatsApp numbers and simplify placeholder
- `ffc64c1` — Move WhatsApp group button to separate section after form
- `e42527c` — Add WhatsApp group link and submitting progress bar
- `cf3bb0a` — (see git log for full history)

---

## 11. Suggested next steps / backlog

- [ ] Verify live deployment is connected to `DATABASE_URL` and `/admin` works
- [ ] Confirm the WhatsApp group link still works on the deployed site
- [ ] Consider adding: export CSV, queue reorder / move up-down, spam honeypot, rate limiting
- [ ] Consider replacing stock product images with your own photos
- [ ] Consider renaming the GitHub repo from `new` to something meaningful (`helios-queue`)
- [ ] Add a simple "merge historical into new queue" admin action if needed later

---

## 12. Handoff notes for the next developer

- Read `src/lib/db.ts` first — it's the data layer and has both Postgres and JSON fallback paths.
- The admin UI is duplicated between `admin-app.tsx` and `historical-admin-app.tsx`; shared `StatCard`/`QueueCard` are exported from `admin-app.tsx`.
- All styling is Tailwind v4 with CSS variables in `src/app/globals.css`; custom animations live there too.
- Keep the repo pushed to GitHub regularly; Vercel auto-deploys from `main`.

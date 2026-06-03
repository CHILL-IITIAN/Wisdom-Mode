# 🪔 Wisdom Mode

> A library of timeless wisdom for modern struggles.

Wisdom Mode is a **premium digital wisdom library** — a full-stack web app that helps people navigate
emotional, psychological, personal, and life-related struggles through carefully **hand-written** wisdom.
There is **no AI-generated content** at runtime; every entry is authored and managed by administrators.

The experience is designed to feel like entering an ancient library — dark theme, warm lighting, elegant
serif typography, premium card layouts — while remaining a modern, polished, accessible, responsive app.

**Success is not measured by time spent.** It is measured by one outcome:
*"The user arrived confused and left with greater clarity."*

---

## ✨ Features

- **Landing page** — hero, features, category preview, footer.
- **Authentication** — register, login, logout, password reset, *remember me*, protected routes, profile.
  Passwords hashed with bcrypt; sessions via httpOnly JWT cookies.
- **Wisdom Library** — full-text search + category / popular / recent filters.
- **Categories** — Studies & Work, Self Growth, Relationships, Life Challenges (each with its own page).
- **Wisdom entries** — Title, Problem, Wisdom message, Perspective Shift, Practical Action,
  Reflection Questions, Related Struggles, and Save-to-Favorites.
- **Daily Reflection** — one thought, question, and challenge per day; savable to favorites.
- **Personal Journal** — private create / edit / delete / history.
- **Favorites** — save wisdom entries and reflections; dedicated dashboard.
- **User Profile** — name, email, join date, totals; editable.
- **Admin Panel** — manage categories, wisdom (with **draft / publish**), reflections, and users
  (view / suspend / delete).
- **SEO** — per-page metadata, `sitemap.xml`, `robots.txt`.

## 🧱 Tech Stack

- **Next.js 14** (App Router, Server Components, Route Handlers)
- **Prisma** ORM + **SQLite** (zero-config; swap `provider` for Postgres in production)
- **bcryptjs** + **jsonwebtoken** for auth
- **zod** for validation
- Hand-written CSS design system (no UI framework) — fast, themeable, accessible

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env        # then edit JWT_SECRET / admin credentials

# 3. Generate client, create DB, and seed content
npm run setup               # = prisma generate && prisma db push && seed

# 4. Run the dev server
npm run dev                 # http://localhost:3000
```

### Seeded accounts

| Role  | Email                     | Password           |
|-------|---------------------------|--------------------|
| Admin | `admin@wisdommode.app`    | `WisdomAdmin#2026` |
| User  | `seeker@wisdommode.app`   | `password123`      |

> Change these in `.env` before deploying.

## 🏗️ Production

```bash
npm run build
npm start
```

For a real deployment, set a strong `JWT_SECRET`, and consider switching Prisma's datasource to
PostgreSQL (`provider = "postgresql"` + a managed `DATABASE_URL`).

## 👀 Preview.html

`Preview.html` is a **self-contained** static demo of the entire UI (mock data, no backend).
Open it directly in a browser — or in the workspace preview — to explore the look, feel and flows
without installing anything.

## 📁 Project Structure

```
wisdom-mode/
├── Preview.html              # standalone visual demo (no backend)
├── prisma/
│   ├── schema.prisma         # Users, Categories, WisdomEntries, Reflections, JournalEntries, Favorites
│   ├── seed-data.mjs         # hand-written wisdom + reflections
│   └── seed.mjs              # seed script (admin, demo user, content)
└── src/
    ├── app/                  # routes (pages + /api route handlers + /admin)
    ├── components/           # Nav, Footer, Toast, WisdomCard, FavoriteButton
    └── lib/                  # db, auth, data, utils
```

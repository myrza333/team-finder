# TeamFinder

Platform for finding a team or teammates for your project: post a project with its stack and open positions, find people by skills, apply to join, chat with your team.

- `frontend/` — Next.js 16, React 19, SCSS modules, TanStack Query
- `backend/` — NestJS 12, PostgreSQL (Supabase), raw SQL via `pg`, JWT auth in an httpOnly cookie, Google OAuth

## Run locally

**Backend**

```bash
cd backend
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET (and Google keys if needed)
npm install
npm run start:dev      # http://localhost:5000/api/health
```

Database: run the files from `backend/db/` in order (Supabase SQL Editor or `npm run db:run -- db/001_schema.sql`).
`003_seed.sql` adds demo data; every demo user has the password `password123` (e.g. `timur@example.com`).

**Frontend**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

The browser only talks to `/api` on the frontend domain; `next.config.ts` forwards it to the backend (`BACKEND_URL`), so the session cookie works even when the frontend and backend are hosted on different domains.

## Deploy

- **Backend → Render**: New → Blueprint → this repo (`render.yaml`). Set `DATABASE_URL`, `FRONTEND_URL` (the Vercel URL) and optionally the Google keys.
- **Frontend → Vercel**: import this repo, Root Directory `frontend`, env `BACKEND_URL` = the Render URL.
- **Google OAuth**: authorized redirect URI = `https://<vercel-domain>/api/auth/google/callback`.

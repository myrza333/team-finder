# TeamFinder — backend

NestJS 12 API for TeamFinder: users and profiles, projects with open positions, applications, team and direct chats, notifications. PostgreSQL on Supabase, raw SQL through `pg` (no ORM), Socket.IO for realtime.

## Run locally

```bash
cp .env.example .env   # DATABASE_URL, JWT_SECRET, FRONTEND_URL, Google keys (optional)
npm install
npm run start:dev      # http://localhost:5000/api/health
```

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Supabase connection string (Session pooler) |
| `JWT_SECRET` | Secret for session tokens — long and random in production |
| `FRONTEND_URL` | Site address; CORS, WebSocket origin and redirects after Google sign-in |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth (optional; without them the Google button says sign-in is not set up yet) |
| `PORT` | Defaults to 5000 |

## Database

Schema lives in `db/` as numbered SQL files. Apply them in order (each runs in one transaction):

```bash
npm run db:run -- db/001_schema.sql
```

Applied so far: `001`–`016` (there is no `003` and `007` — those were demo data and are deleted; there is no demo data on purpose). Add new changes as the next number, never edit an applied file. `npm run db:copy` copies the whole database to a new Supabase project (`NEW_DATABASE_URL` in `.env`).

## Structure

```
src/
  auth/            email + password (bcrypt) and Google OAuth; JWT in the httpOnly cookie tf_session
  users/           profiles, avatars (stored in the DB), privacy and notification settings
  projects/        projects, positions, team, announcements (launch date) and "Notify me"
  applications/    "Request to join": apply, accept, decline, withdraw
  chat/            team chat (one per project)
  direct/          direct chats with a project owner
  notifications/   in-site notifications
  realtime/        Socket.IO gateway: new messages, notifications, online / last seen, read receipts
  common/          JSON builders for SQL (sql.ts), rate limiting (rate-limit.ts), helpers
  database/        pg pool that keeps a few connections warm
```

- JSON for the frontend is built by Postgres itself (`common/sql.ts`); heavy actions are single SQL statements because every round trip to the database costs time.
- Every request passes `SessionGuard` (who is it) and `RateLimitGuard` (`@RateLimit(...)` on login, register, messages, applications, uploads).
- The browser opens the WebSocket with a short-lived token from `GET /api/auth/socket-token`, because the session cookie belongs to the frontend domain.

## Deploy (Render)

Web service in Frankfurt (next to the Supabase database), root directory `backend`:

- Build: `npm ci --include=dev && npm run build`
- Start: `npm run start:prod`
- Health check: `/api/health`

Auto-deploy is off: after pushing backend changes press **Manual Deploy** in Render. `render.yaml` describes the same service if you create it as a Blueprint.

## Scripts

`npm run build` · `npm run start:dev` · `npm run start:prod` · `npm run lint` · `npm run db:run -- <file>` · `npm run db:copy`

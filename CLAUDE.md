# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Holding of Bags** — a TTRPG loot manager. Players join groups, track a shared item hoard, assign items to characters, and manage a group coin pool (platinum/electrum/gold/silver/copper).

## Commands

All commands run from the repo root unless noted.

```bash
# First-time setup
cp backend/.env.example backend/.env
npm install
npm run db:up                          # start dev + test Postgres containers
npm --workspace backend run prisma:migrate  # apply migrations to dev DB

# Daily development
npm run dev                            # start backend (port 3001) + frontend (port 5173) concurrently
npm run dev:backend                    # backend only
npm run dev:frontend                   # frontend only

# Tests
npm run test                           # run all tests (backend Jest + frontend Vitest)
npm --workspace backend run test       # backend only (Jest, --runInBand)
npm --workspace frontend run test      # frontend only (Vitest)

# Run a single backend test file
cd backend && npx jest tests/items.test.ts

# Database
npm run db:up                          # start containers (both dev :5432 and test :5433)
npm run db:down                        # stop containers
npm --workspace backend run prisma:migrate        # apply new migrations (dev DB)
npm --workspace backend run prisma:migrate:test   # apply migrations to test DB
npm --workspace backend run prisma:generate       # regenerate Prisma client after schema changes
```

The frontend Vite dev server proxies all `/api/*` requests to `http://localhost:3001`, so no CORS configuration is needed during development.

## Architecture

### Monorepo layout

npm workspaces: `backend/` (Express + Prisma) and `frontend/` (React + Vite). The root `package.json` only holds workspace scripts.

### Backend (`backend/src/`)

- **`app.ts`** — factory function `createApp()` that wires Express, CORS, JSON parsing, and all routers. Separated from `index.ts` so tests can import a fresh app instance without binding a port.
- **`routes/`** — one file per resource (`auth`, `groups`, `invites`, `items`, `coins`). Items and coins are nested under `/api/groups/:groupId/…`.
- **`middleware/auth.ts`** — `requireAuth` verifies the `Authorization: Bearer <token>` header and sets `req.userId`.
- **`middleware/membership.ts`** — `requireMembership` resolves `req.userId + :groupId` to a `GroupMember` row and sets `req.member`. Applied after `requireAuth` on group-scoped routes.
- **`lib/`** — `prisma.ts` (singleton client), `jwt.ts` (sign/verify), `password.ts` (bcrypt helpers), `emojis.ts` (allowed character emoji list).

### Database (Prisma / PostgreSQL)

Schema: `User → Group` (founder), `Group ↔ User` via `GroupMember` (holds `characterName` + `characterEmoji`), `Item` (nullable `memberId` — null means in the group hoard), `GroupCoins` (1-to-1 with Group), `Invite` (token-based, with `PENDING/ACCEPTED/EXPIRED` status and `expiresAt`).

Item ownership: `memberId = null` → group hoard; `memberId = <id>` → belongs to that character. The move endpoint splits stacks when `qty < item.amount`.

### Frontend (`frontend/src/`)

- **`lib/auth.tsx`** — `AuthProvider` context. On mount it calls `GET /api/auth/me` to rehydrate a stored JWT. Exposes `{ user, loading, login, logout }` via `useAuth()`.
- **`api/client.ts`** — `apiFetch<T>` reads the JWT from `localStorage` (`hob.token`) and attaches it as a Bearer header. Throws `ApiError` on non-2xx responses.
- **`api/`** — thin wrappers per resource (`auth`, `groups`, `items`, `coins`) that call `apiFetch`.
- **`pages/GroupPage.tsx`** — the main view. Holds all state (`group`, `items`, `coins`, `view`, `search`, `moving`) and owns the `refresh()` pattern: after any mutation it re-fetches from the server rather than patching local state.
- **`components/`** — `BoardView` (kanban columns per member + hoard), `ListView` (flat table), `AddItemForm`, `MoveItemModal`, `CoinsBar`, `InviteButton`, `EmojiPicker`, `RequireAuth`.
- **`types.ts`** — shared TypeScript types mirroring Prisma models.

### Testing

**Backend** — Jest with `ts-jest`, `supertest`, and a real test database (port 5433, `holdingofbags_test`). `globalSetup.ts` overrides `DATABASE_URL` with `TEST_DATABASE_URL`. `setup.ts` truncates all tables in `afterEach` so tests are isolated. Run with `--runInBand` (no parallelism) to avoid inter-test DB races.

**Frontend** — Vitest with jsdom and `@testing-library/react`. Setup file is `src/test/setup.ts`.

Before running backend tests for the first time, make sure the test DB has migrations applied:
```bash
npm --workspace backend run prisma:migrate:test
```
